import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';
import { callGemini } from '../lib/services/gemini';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment variables.');
  process.exit(1);
}

const getOptionLetter = (optionText: string, index: number): string => {
  if (!optionText) return String.fromCharCode(65 + index);
  const match = optionText.match(/^[(\s]*([A-Ja-j1-5क-ङअ-द])[).:\s]/);
  if (match) {
    const char = match[1].toLowerCase();
    if (char === 'a' || char === '1' || char === 'क' || char === 'अ') return 'A';
    if (char === 'b' || char === '2' || char === 'ख' || char === 'ब') return 'B';
    if (char === 'c' || char === '3' || char === 'ग' || char === 'स') return 'C';
    if (char === 'd' || char === '4' || char === 'घ' || char === 'द') return 'D';
    if (char === 'e' || char === '5' || char === 'ङ' || char === 'इ') return 'E';
    return char.toUpperCase();
  }
  const fallbackLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  return fallbackLetters[index] || String.fromCharCode(65 + index);
};

const BATCH_SIZE = 15;

async function processBatchWithGemini(batch: any[]) {
    const prompt = `You are an expert at extracting the correct option from explanations.
For each item in the JSON array below, read the question text, options, and explanation.
Determine which option (A, B, C, D, or E) is explicitly supported by the explanation.
Respond ONLY with a JSON array mapping the question ID to the correct option letter.
Example output format: [{"id": "q1", "correctAnswer": "B"}, {"id": "q2", "correctAnswer": "C"}]

Input JSON Array:
${JSON.stringify(batch.map(q => ({
    id: q.id,
    question: q.text,
    options: q.options,
    explanation: q.explanation
})), null, 2)}`;

    try {
        const raw = await callGemini(prompt);
        let cleaned = raw.trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) cleaned = jsonMatch[0];
        const parsed = JSON.parse(cleaned);
        return parsed;
    } catch (e: any) {
        console.error('Failed to parse Gemini response for batch', e.message);
        return [];
    }
}

async function fixImplicitAnswers() {
  const client = new MongoClient(MONGODB_URI as string);
  await client.connect();
  const db = client.db();
  const testSeriesCol = db.collection('testseries');
  const resultsCol = db.collection('results');

  console.log('🔍 Starting LLM-based database patch for implicit correctAnswer mismatches...');

  const seriesCursor = testSeriesCol.find({});
  const seriesCorrectionsMap = new Map<string, Map<number, string>>();
  
  let questionsToAnalyze: any[] = [];
  const regex = /(?:Correct option(?: is)?|सही विकल्प|Correct Answer).*?(?:option|विकल्प)?\s*\(?\s*\b([A-Ea-e])\b\s*\)?\s*(?:\.|$|है)/i;

  // Gather all questions that lack an explicit conclusion
  for await (const series of seriesCursor) {
      if (series.bilingualQuestions) {
          for (const q of series.bilingualQuestions) {
              const exp = q.english?.explanation || q.hindi?.explanation || "";
              if (exp.length > 10 && !exp.match(regex)) {
                  questionsToAnalyze.push({
                      seriesId: series.id,
                      number: q.number,
                      id: `${series.id}_BQ_${q.number}`,
                      text: q.english?.text || q.hindi?.text,
                      options: q.english?.options || q.hindi?.options,
                      explanation: exp,
                      currentDBAnswer: (q.correctAnswer || '').trim().toUpperCase(),
                      type: 'BQ'
                  });
              }
          }
      }
  }

  console.log(`Found ${questionsToAnalyze.length} questions to analyze via LLM.`);
  
  let totalFixed = 0;

  for (let i = 0; i < questionsToAnalyze.length; i += BATCH_SIZE) {
      const batch = questionsToAnalyze.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(questionsToAnalyze.length/BATCH_SIZE)}...`);
      
      const results = await processBatchWithGemini(batch);
      
      for (const res of results) {
          const original = batch.find(b => b.id === res.id);
          if (original && res.correctAnswer) {
              const trueAns = res.correctAnswer.toUpperCase();
              if (['A','B','C','D','E'].includes(trueAns) && trueAns !== original.currentDBAnswer) {
                  console.log(`[${original.seriesId}] Q${original.number}: Updating DB CA from ${original.currentDBAnswer} to ${trueAns}`);
                  
                  if (!seriesCorrectionsMap.has(original.seriesId)) {
                      seriesCorrectionsMap.set(original.seriesId, new Map());
                  }
                  seriesCorrectionsMap.get(original.seriesId)!.set(original.number, trueAns);
                  totalFixed++;
              }
          }
      }
  }

  if (seriesCorrectionsMap.size > 0) {
      console.log(`\n✅ Identified ${totalFixed} mismatches via LLM. Updating DB...`);
      
      for (const [seriesId, map] of seriesCorrectionsMap.entries()) {
          const series = await testSeriesCol.findOne({ id: seriesId });
          if (series && series.bilingualQuestions) {
              let modified = false;
              for (const q of series.bilingualQuestions) {
                  if (map.has(q.number)) {
                      q.correctAnswer = map.get(q.number);
                      modified = true;
                  }
              }
              if (modified) {
                  await testSeriesCol.updateOne({ id: seriesId }, { $set: { bilingualQuestions: series.bilingualQuestions } });
              }
          }
      }
      
      // Patch Results
      const resultsCursor = resultsCol.find({});
      let totalResultsPatched = 0;
      let totalGradesChanged = 0;

      for await (const res of resultsCursor) {
        if (!seriesCorrectionsMap.has(res.seriesId)) continue;
        
        let resultModified = false;
        let newScore = 0;
        const seriesCorrections = seriesCorrectionsMap.get(res.seriesId)!;
        
        const updatedBreakdown = res.breakdown.map((item: any) => {
          let trueAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
          
          if (seriesCorrections.has(item.questionNumber)) {
            trueAns = seriesCorrections.get(item.questionNumber)!;
            const prevAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
            if (trueAns !== prevAns) {
                resultModified = true;
                totalGradesChanged++;
                item.correctAnswer = trueAns;
            }
          }
          
          const formattedUserAns = item.userAnswer && item.userAnswer !== '—' ? item.userAnswer.trim().toUpperCase() : '';
          let isCorrect = false;

          if (formattedUserAns && formattedUserAns !== '—') {
            if (formattedUserAns === trueAns) {
              isCorrect = true;
            } else {
              const options = item.options || [];
              for (let oidx = 0; oidx < options.length; oidx++) {
                const opt = options[oidx];
                const optLetter = getOptionLetter(opt, oidx);
                if (optLetter === formattedUserAns && optLetter === trueAns) {
                   isCorrect = true;
                }
              }
            }
          }
          
          item.isCorrect = isCorrect;
          
          if (isCorrect) {
            newScore += 1;
          } else if (formattedUserAns && formattedUserAns !== '—') {
            newScore -= 0.25;
          }

          return item;
        });

        if (resultModified) {
          await resultsCol.updateOne(
            { _id: res._id },
            { $set: { breakdown: updatedBreakdown, score: Math.max(0, newScore) } }
          );
          totalResultsPatched++;
        }
      }
      console.log(`✅ Patched ${totalResultsPatched} Results (re-graded ${totalGradesChanged} user answers).`);
  } else {
      console.log('No implicit mismatches found.');
  }

  await client.close();
  console.log('✅ Database Patch Complete.');
}

fixImplicitAnswers().catch(console.error);

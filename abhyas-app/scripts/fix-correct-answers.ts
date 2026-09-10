import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment variables.');
  process.exit(1);
}

// Ensure the option letter extraction aligns with the UI logic
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

async function fixCorrectAnswers() {
  const client = new MongoClient(MONGODB_URI as string);
  await client.connect();
  const db = client.db();
  const testSeriesCol = db.collection('testseries');
  const resultsCol = db.collection('results');

  console.log('🔍 Starting database patch for correctAnswer mismatches...');

  const seriesCursor = testSeriesCol.find({});
  let totalSeriesPatched = 0;
  let totalQuestionsPatched = 0;
  
  // We'll store the corrected mapping for each series to efficiently patch Results
  const seriesCorrectionsMap = new Map<string, Map<number, string>>();

  for await (const series of seriesCursor) {
    let hasModifications = false;
    const correctedAnswers = new Map<number, string>();

    // 1. Process Bilingual Questions
    if (series.bilingualQuestions && series.bilingualQuestions.length > 0) {
      for (const q of series.bilingualQuestions) {
        const exp = q.english?.explanation || q.hindi?.explanation || "";
        const conclusionMatch = exp.match(/(?:Correct option(?: is)?|सही विकल्प|Correct Answer).*?(?:option|विकल्प)?\s*\(?\s*\b([A-Ea-e])\b\s*\)?\s*(?:\.|$|है)/i);
        
        if (conclusionMatch) {
          const expAns = conclusionMatch[1].toUpperCase();
          const dbAns = (q.correctAnswer || '').trim().toUpperCase();
          
          if (dbAns && expAns !== dbAns && ['A','B','C','D','E'].includes(expAns)) {
            console.log(`[${series.title}] BQ${q.number}: Updating DB CA from ${dbAns} to ${expAns}`);
            q.correctAnswer = expAns;
            correctedAnswers.set(q.number, expAns);
            hasModifications = true;
          }
        }
      }
    }

    // 2. Process Manual Questions
    if (series.manualQuestions && series.manualQuestions.length > 0) {
      for (const q of series.manualQuestions) {
        const exp = q.explanation || "";
        const conclusionMatch = exp.match(/(?:Correct option(?: is)?|सही विकल्प|Correct Answer).*?(?:option|विकल्प)?\s*\(?\s*\b([A-Ea-e])\b\s*\)?\s*(?:\.|$|है)/i);
        
        if (conclusionMatch) {
          const expAns = conclusionMatch[1].toUpperCase();
          const dbAns = (q.correctAnswer || '').trim().toUpperCase();
          
          if (dbAns && expAns !== dbAns && ['A','B','C','D','E'].includes(expAns)) {
            console.log(`[${series.title}] MQ${q.number}: Updating DB CA from ${dbAns} to ${expAns}`);
            q.correctAnswer = expAns;
            correctedAnswers.set(q.number, expAns);
            hasModifications = true;
          }
        }
      }
    }

    if (hasModifications) {
      await testSeriesCol.updateOne(
        { id: series.id },
        { 
          $set: { 
            bilingualQuestions: series.bilingualQuestions,
            manualQuestions: series.manualQuestions,
          } 
        }
      );
      totalSeriesPatched++;
      totalQuestionsPatched += correctedAnswers.size;
      seriesCorrectionsMap.set(series.id, correctedAnswers);
    }
  }

  console.log(`\n✅ Patched ${totalQuestionsPatched} questions across ${totalSeriesPatched} test series.\n`);
  console.log('🔍 Now patching existing Results to fix past grades and UI display...');

  const resultsCursor = resultsCol.find({});
  let totalResultsPatched = 0;
  let totalGradesChanged = 0;

  for await (const res of resultsCursor) {
    let resultModified = false;
    let newScore = 0;
    
    // Process results
    const updatedBreakdown = res.breakdown.map((item: any) => {
      let trueAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
      
      // 1. Try to get it from our mapped corrections
      const seriesCorrections = seriesCorrectionsMap.get(res.seriesId);
      if (seriesCorrections && seriesCorrections.has(item.questionNumber)) {
        trueAns = seriesCorrections.get(item.questionNumber)!;
      } else {
        // 2. Or try to extract it from the result explanation itself
        const exp = item.explanation || "";
        const conclusionMatch = exp.match(/(?:Correct option(?: is)?|सही विकल्प|Correct Answer).*?(?:option|विकल्प)?\s*\(?\s*\b([A-Ea-e])\b\s*\)?\s*(?:\.|$|है)/i);
        if (conclusionMatch) {
          trueAns = conclusionMatch[1].toUpperCase();
        }
      }

      const prevAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
      if (trueAns !== prevAns && ['A','B','C','D','E'].includes(trueAns)) {
        resultModified = true;
        totalGradesChanged++;
        item.correctAnswer = trueAns;
      }
      
      // Re-evaluate if it is correct
      const formattedUserAns = item.userAnswer && item.userAnswer !== '—' ? item.userAnswer.trim().toUpperCase() : '';
      let isCorrect = false;

      if (formattedUserAns && formattedUserAns !== '—') {
        if (formattedUserAns === trueAns) {
          isCorrect = true;
        } else {
          // Check option matching as a fallback
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
      
      // Recalculate scoring (+1 for correct, -0.25 for incorrect)
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
        { 
          $set: { 
            breakdown: updatedBreakdown,
            score: Math.max(0, newScore)
          } 
        }
      );
      totalResultsPatched++;
    }
  }

  console.log(`✅ Patched ${totalResultsPatched} Results (re-graded ${totalGradesChanged} user answers).`);
  await client.close();
  console.log('✅ Database Patch Complete.');
}

fixCorrectAnswers().catch(console.error);

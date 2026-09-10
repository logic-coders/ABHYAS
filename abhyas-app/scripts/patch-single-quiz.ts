import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

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

async function patchSingle() {
  const client = new MongoClient(MONGODB_URI as string);
  await client.connect();
  const db = client.db();
  
  const seriesId = "10f8540b-9ad5-4a00-8670-577238c3dc5b";
  
  // The background script identified these mappings for this series:
  const map = new Map<number, string>([
      [1, "B"], [2, "A"], [3, "B"], [4, "B"], 
      [5, "B"], [7, "B"], [10, "B"], [13, "B"], [15, "B"]
  ]);

  const series = await db.collection('testseries').findOne({ id: seriesId });
  if (series && series.bilingualQuestions) {
      let modified = false;
      for (const q of series.bilingualQuestions) {
          if (map.has(q.number)) {
              q.correctAnswer = map.get(q.number);
              modified = true;
          }
      }
      if (modified) {
          await db.collection('testseries').updateOne({ id: seriesId }, { $set: { bilingualQuestions: series.bilingualQuestions } });
          console.log(`Updated test series ${seriesId}`);
      }
  }

  const results = await db.collection('results').find({ seriesId }).toArray();
  for (const res of results) {
      let resultModified = false;
      let newScore = 0;
      
      const updatedBreakdown = res.breakdown.map((item: any) => {
          let trueAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
          
          if (map.has(item.questionNumber)) {
            trueAns = map.get(item.questionNumber)!;
            const prevAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
            if (trueAns !== prevAns) {
                resultModified = true;
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
          await db.collection('results').updateOne(
            { _id: res._id },
            { $set: { breakdown: updatedBreakdown, score: Math.max(0, newScore) } }
          );
          console.log(`Updated result ${res.id}`);
      }
  }

  await client.close();
}
patchSingle().catch(console.error);

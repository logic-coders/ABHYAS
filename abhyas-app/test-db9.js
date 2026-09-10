const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const getOptionLetter = (optionText, index) => {
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

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({ "format": "quiz" }).sort({date: -1}).limit(1).toArray();
  for (const r of results) {
      if (r.breakdown && r.breakdown.length > 0) {
          const q = r.breakdown[0];
          console.log(`Test: ${r.seriesTitle}`);
          console.log(`Q1 Text:`, q.questionText);
          console.log(`Options:`, q.options);
          console.log(`User Answer:`, q.userAnswer);
          console.log(`Correct Answer:`, q.correctAnswer);
          console.log(`Is Correct:`, q.isCorrect);
          
          const formattedUserAns = q.userAnswer && q.userAnswer !== '—' ? q.userAnswer.trim().toUpperCase() : '';
          const formattedCorrectAns = q.correctAnswer ? q.correctAnswer.trim().toUpperCase() : '?';
          
          q.options.forEach((opt, oidx) => {
              const optLetter = getOptionLetter(opt, oidx);
              const isCorrectChoice = Boolean(formattedCorrectAns && formattedCorrectAns !== '?' && (optLetter === formattedCorrectAns || opt.trim().toLowerCase() === formattedCorrectAns.toLowerCase()));
              console.log(` Option ${oidx}: ${opt} -> optLetter=${optLetter}, isCorrectChoice=${isCorrectChoice}`);
          });
      }
  }
  
  await client.close();
}
run().catch(console.error);

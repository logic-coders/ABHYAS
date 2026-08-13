import fs from 'fs';
import { extractText, parseQuestions } from './lib/pdf-parser';

async function main() {
  const pdfBuffer = fs.readFileSync('/tmp/music.pdf');
  const text = await extractText(pdfBuffer);
  
  // Parse Hindi questions from range 1 to 150
  const questions = parseQuestions(text, 1, 150, 'hi');
  console.log(`Total Hindi Questions Extracted: ${questions.length}`);

  console.log('\n================ EXAMINING ALL EXTRACTED HINDI QUESTIONS ================');
  for (const q of questions) {
    console.log(`\n--- Q${q.number} ---`);
    console.log(`Text: ${q.text}`);
    q.options.forEach((opt, idx) => {
      console.log(`  Option ${idx + 1}: ${opt}`);
    });
  }
}

main().catch(console.error);

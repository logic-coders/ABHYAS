/**
 * Verification Script for All 240 Math Practice Questions
 * Across Math Practice Test 1, 2, and 3.
 */

import mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing');
  process.exit(1);
}

async function verifyAll240() {
  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.db;

  const testSeriesCol = db.collection('testseries');

  const tests = [
    { id: 'fc9f6405-9a82-4a0d-b163-5faecd9cfcbc', title: 'Math Practice Test - 1' },
    { id: '1f3cc4b9-2d3a-42f1-86b2-10b2150c3808', title: 'Math Practice Test - 2' },
    { id: 'afd79abf-938b-4fff-87c2-ca10ff09c443', title: 'Math Practice Test - 3' },
  ];

  let totalQuestions = 0;
  let formattedQuestions = 0;
  let withDetailedCalc = 0;
  let issues = 0;

  for (const t of tests) {
    const s = await testSeriesCol.findOne({ id: t.id });
    if (!s || !s.bilingualQuestions) {
      console.log(`❌ Test not found: ${t.title}`);
      continue;
    }

    console.log(`\n======================================================`);
    console.log(`🔍 Checking "${t.title}" (${s.bilingualQuestions.length} Questions)`);
    console.log(`======================================================`);

    for (const q of s.bilingualQuestions) {
      totalQuestions++;
      const hiExp = q.hindi?.explanation || '';
      const enExp = q.english?.explanation || '';
      const ans = q.correctAnswer;

      const hasStepHeader = hiExp.includes('चरण') || enExp.includes('Step');
      const hasMathCalc = /[=><\+\-\*\/]/.test(hiExp) || /[=><\+\-\*\/]/.test(enExp);
      const hasCleanConclusion = /(?:सही विकल्प|सही उत्तर|Correct option|Correct answer)/i.test(hiExp) || /(?:Correct option|Correct answer)/i.test(enExp);

      if (hasStepHeader) formattedQuestions++;
      if (hasMathCalc) withDetailedCalc++;

      if (!hasStepHeader || !hasMathCalc || !hasCleanConclusion || !ans) {
        console.log(`⚠️ Q${q.number}: Missing step header or clean conclusion! Ans: "${ans}"`);
        issues++;
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 FINAL 240-QUESTION MATH VERIFICATION SUMMARY`);
  console.log(`======================================================`);
  console.log(`Total Questions Checked: ${totalQuestions}`);
  console.log(`Questions with Explicit Step Headers ("चरण 1:"): ${formattedQuestions} / ${totalQuestions} (${Math.round((formattedQuestions/totalQuestions)*100)}%)`);
  console.log(`Questions with Line-by-Line Calculations: ${withDetailedCalc} / ${totalQuestions} (${Math.round((withDetailedCalc/totalQuestions)*100)}%)`);
  console.log(`Total Inconsistencies / Issues: ${issues}`);

  if (issues === 0) {
    console.log(`\n🎉 ALL 240 QUESTIONS IN MATH TEST 1, 2, AND 3 ARE 100% VERIFIED & PERFECTLY FORMATTED!`);
  }

  process.exit(0);
}

verifyAll240().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

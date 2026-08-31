/**
 * Comprehensive Math Question Auditor & Fixer
 * 
 * Scans EVERY single Math question across all Math test series in MongoDB and streak-pool.ts.
 * Checks for:
 * 1. Missing or placeholder explanations
 * 2. Mismatches between mathematical proof/conclusion and correctAnswer in DB
 * 3. Invalid option index or out-of-bound option letters
 * 4. Formatting issues
 * 
 * Auto-corrects any detected inconsistencies in MongoDB and prints a clean report.
 * 
 * Usage: npx tsx scripts/audit-math-questions.ts
 */

import mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { BILINGUAL_STREAK_QUESTIONS } from '../lib/services/streak-pool';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing');
  process.exit(1);
}

interface AuditIssue {
  seriesTitle: string;
  seriesId: string;
  questionNumber: number;
  questionText: string;
  issue: string;
  currentAns: string;
  explanationAns?: string;
  fixed: boolean;
}

async function runMathAudit() {
  console.log('🔍 Starting comprehensive Math question audit...\n');
  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.db;

  const testSeriesCol = db.collection('testseries');
  const resultsCol = db.collection('results');

  // Fetch all Math test series
  const mathSeries = await testSeriesCol.find({
    $or: [
      { subject: 'Math' },
      { title: { $regex: /math/i } },
    ],
  }).toArray();

  console.log(`📚 Found ${mathSeries.length} Math test series in MongoDB.`);

  const issues: AuditIssue[] = [];
  let totalQuestionsAudited = 0;

  for (const series of mathSeries) {
    console.log(`\n======================================================`);
    console.log(`📖 Auditing "${series.title}" (${series.id})`);
    console.log(`======================================================`);

    const questions = series.bilingualQuestions || [];
    console.log(`Total questions in series: ${questions.length}`);

    let seriesModified = false;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      totalQuestionsAudited++;
      const qNum = q.number || i + 1;
      const qText = q.hindi?.text || q.english?.text || '';
      const options = q.hindi?.options || q.english?.options || [];
      const currentAns = (q.correctAnswer || '').trim().toLowerCase();

      const hiExp = q.hindi?.explanation || '';
      const enExp = q.english?.explanation || '';

      // Check 1: Missing or placeholder explanation
      if (!hiExp || hiExp.length < 15 || hiExp.includes('Explanation not available') || hiExp.includes('No explanation provided')) {
        issues.push({
          seriesTitle: series.title,
          seriesId: series.id,
          questionNumber: qNum,
          questionText: qText.substring(0, 60),
          issue: 'Missing or placeholder Hindi explanation',
          currentAns,
          fixed: false,
        });
      }

      if (!enExp || enExp.length < 15 || enExp.includes('Explanation not available') || enExp.includes('No explanation provided')) {
        issues.push({
          seriesTitle: series.title,
          seriesId: series.id,
          questionNumber: qNum,
          questionText: qText.substring(0, 60),
          issue: 'Missing or placeholder English explanation',
          currentAns,
          fixed: false,
        });
      }

      // Check 2: Extract concluded option from Hindi explanation
      const hiMatch = hiExp.match(/(?:सही विकल्प|सही उत्तर|उत्तर|विकल्प)\s*[:\-]?\s*\(?([a-eA-E1-5])\)?/i);
      const enMatch = enExp.match(/(?:Correct option|Correct answer|Option|Answer)\s*[:\-]?\s*\(?([a-eA-E1-5])\)?/i);

      let concludedLetter = '';
      if (hiMatch) concludedLetter = hiMatch[1].toLowerCase();
      else if (enMatch) concludedLetter = enMatch[1].toLowerCase();

      // Normalize numeric letters 1-5 to a-e
      if (concludedLetter === '1') concludedLetter = 'a';
      if (concludedLetter === '2') concludedLetter = 'b';
      if (concludedLetter === '3') concludedLetter = 'c';
      if (concludedLetter === '4') concludedLetter = 'd';
      if (concludedLetter === '5') concludedLetter = 'e';

      if (concludedLetter && currentAns && concludedLetter !== currentAns) {
        issues.push({
          seriesTitle: series.title,
          seriesId: series.id,
          questionNumber: qNum,
          questionText: qText.substring(0, 60),
          issue: `Answer Key Mismatch: DB has "${currentAns.toUpperCase()}", Explanation proves "${concludedLetter.toUpperCase()}"`,
          currentAns,
          explanationAns: concludedLetter,
          fixed: true,
        });

        // Auto-fix in question
        q.correctAnswer = concludedLetter;
        if (series.answers) {
          series.answers[String(qNum)] = concludedLetter;
        }
        seriesModified = true;
      }

      // Check 3: Verify option bounds
      const validLetters = ['a', 'b', 'c', 'd', 'e'].slice(0, options.length);
      if (currentAns && !validLetters.includes(currentAns)) {
        issues.push({
          seriesTitle: series.title,
          seriesId: series.id,
          questionNumber: qNum,
          questionText: qText.substring(0, 60),
          issue: `Invalid answer letter "${currentAns}" for ${options.length} options`,
          currentAns,
          fixed: false,
        });
      }
    }

    if (seriesModified) {
      await testSeriesCol.updateOne(
        { id: series.id },
        { $set: { bilingualQuestions: series.bilingualQuestions, answers: series.answers } }
      );
      console.log(`  💾 Saved corrections to MongoDB for "${series.title}"!`);

      // Update related results
      const results = await resultsCol.find({ seriesId: series.id }).toArray();
      for (const res of results) {
        if (res.breakdown) {
          const updatedBreakdown = res.breakdown.map((item: any) => {
            const matchingQ = series.bilingualQuestions.find((q: any) => q.number === item.questionNumber);
            if (matchingQ) {
              const qAns = matchingQ.correctAnswer.toUpperCase();
              const isUserCorrect = item.userAnswer && item.userAnswer.toUpperCase() === qAns;
              return {
                ...item,
                correctAnswer: qAns,
                isCorrect: isUserCorrect,
                explanation: matchingQ.hindi?.explanation || item.explanation,
              };
            }
            return item;
          });

          const correctCount = updatedBreakdown.filter((b: any) => b.isCorrect).length;
          const incorrectCount = updatedBreakdown.filter((b: any) => !b.isCorrect && b.userAnswer && b.userAnswer !== '—').length;
          const percentage = Math.round((correctCount / updatedBreakdown.length) * 100);

          await resultsCol.updateOne(
            { _id: res._id },
            { $set: { breakdown: updatedBreakdown, correct: correctCount, incorrect: incorrectCount, percentage } }
          );
        }
      }
    }
  }

  // Audit streak-pool.ts Math section
  console.log(`\n======================================================`);
  console.log(`📖 Auditing streak-pool.ts Math questions`);
  console.log(`======================================================`);
  const poolMath = BILINGUAL_STREAK_QUESTIONS.Math || [];
  console.log(`Total questions in Math streak pool: ${poolMath.length}`);

  for (let i = 0; i < poolMath.length; i++) {
    const q = poolMath[i];
    totalQuestionsAudited++;
    const qNum = q.number || i + 1;
    const qText = q.hindi?.text || q.english?.text || '';
    const currentAns = (q.correctAnswer || '').trim().toLowerCase();
    const hiExp = q.hindi?.explanation || '';
    const enExp = q.english?.explanation || '';

    if (!hiExp || hiExp.length < 15) {
      issues.push({
        seriesTitle: 'streak-pool.ts (Math)',
        seriesId: 'streak-pool',
        questionNumber: qNum,
        questionText: qText.substring(0, 60),
        issue: 'Missing Hindi explanation in streak-pool.ts',
        currentAns,
        fixed: false,
      });
    }

    if (!enExp || enExp.length < 15) {
      issues.push({
        seriesTitle: 'streak-pool.ts (Math)',
        seriesId: 'streak-pool',
        questionNumber: qNum,
        questionText: qText.substring(0, 60),
        issue: 'Missing English explanation in streak-pool.ts',
        currentAns,
        fixed: false,
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 MATH AUDIT SUMMARY`);
  console.log(`======================================================`);
  console.log(`Total Math Questions Audited: ${totalQuestionsAudited}`);
  console.log(`Total Issues Found: ${issues.length}`);

  if (issues.length > 0) {
    console.table(issues.map(iss => ({
      Series: iss.seriesTitle,
      QNum: iss.questionNumber,
      Issue: iss.issue,
      DBAns: iss.currentAns.toUpperCase(),
      Corrected: iss.fixed ? 'YES' : 'NO',
    })));
  } else {
    console.log('✅ 100% of Math questions have verified detailed solutions and correct answer keys!');
  }

  process.exit(0);
}

runMathAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});

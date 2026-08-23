import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing other modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connect } from 'mongoose';
import { Result } from '../lib/models/Result';
import { TestSeries } from '../lib/models/TestSeries';

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');
  await connect(uri);
  console.log('✅ Connected to MongoDB');
}

async function main() {
  try {
    await connectToDatabase();

    console.log('\n🔍 Finding all user results...');
    
    // Find all results that have a breakdown
    const results = await Result.find({ 'breakdown.0': { $exists: true } });

    console.log(`Found ${results.length} result documents to check.`);

    let updatedCount = 0;

    for (const result of results) {
      let resultUpdated = false;
      const seriesId = result.seriesId;
      
      // Fetch the original test series
      const series = await TestSeries.findOne({ id: seriesId }).lean();
      
      if (!series) continue;

      // Create a map of QuestionNumber -> Explanation
      const explanationMap = new Map<number, string>();
      
      if (series.manualQuestions) {
        for (const q of series.manualQuestions) {
          if (q.explanation && q.explanation !== 'No explanation provided.') {
            explanationMap.set(q.number || 0, q.explanation);
          }
        }
      }
      
      if (series.bilingualQuestions) {
        for (let i = 0; i < series.bilingualQuestions.length; i++) {
          const q = series.bilingualQuestions[i];
          const exp = q.english?.explanation || q.hindi?.explanation;
          if (exp && exp !== 'No explanation provided.') {
            explanationMap.set(q.number || i + 1, exp);
          }
        }
      }

      // Now map it into the result breakdown
      for (let i = 0; i < result.breakdown.length; i++) {
        const item = result.breakdown[i];
        if (!item.explanation) {
          const exp = explanationMap.get(item.questionNumber);
          if (exp) {
            item.explanation = exp;
            resultUpdated = true;
          }
        }
      }

      if (resultUpdated) {
        await Result.updateOne({ _id: result._id }, { $set: { breakdown: result.breakdown } });
        console.log(`✅ Patched explanations into result: ${result.seriesTitle} (${result.userId})`);
        updatedCount++;
      }
    }

    console.log(`\n🎉 Result patching complete! Updated ${updatedCount} documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();

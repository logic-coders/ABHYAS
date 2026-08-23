import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing other modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connect } from 'mongoose';
import { Result } from '../lib/models/Result';
import { TestSeries } from '../lib/models/TestSeries';

async function main() {
  await connect(process.env.MONGODB_URI!);
  const seriesId = 'fc9f6405-9a82-4a0d-b163-5faecd9cfcbc';
  const series = await TestSeries.findOne({ id: seriesId }).lean();
  console.log('Series title:', series?.title);
  
  const q9 = series?.bilingualQuestions?.[8];
  console.log('Q9 English:', q9?.english);
  console.log('Q9 Hindi:', q9?.hindi);

  const result = await Result.findOne({ seriesId }).lean();
  console.log('Result Breakdown Q9:', result?.breakdown[8]);

  process.exit(0);
}
main();

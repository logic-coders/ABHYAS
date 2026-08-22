require('dotenv').config({ path: '.env.local' });
require('ts-node').register({ transpileOnly: true });
const { getAllTestSeries } = require('./lib/metadata-store.ts');
const { getAllUsers } = require('./lib/user-store.ts');
const { getAllResults } = require('./lib/result-store.ts');

async function test() {
  const users = await getAllUsers();
  console.log('Users:', users.length, users[0]);
  
  const series = await getAllTestSeries();
  console.log('Series:', series.length, series[0]);

  const results = await getAllResults();
  console.log('Results:', results.length, results[0]);

  process.exit(0);
}
test().catch(console.error);

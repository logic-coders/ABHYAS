const { getAllTestSeries } = require('./lib/metadata-store');

async function run() {
  try {
    const all = await getAllTestSeries();
    const series = all.find(s => s.id === '2480aaaf-a627-4e35-996d-497923939726');
    console.log('S3 Key:', series.s3Key);
  } catch (err) {
    console.error(err);
  }
}
run();

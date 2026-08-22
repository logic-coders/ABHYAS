require('dotenv').config({ path: '.env.local' });
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const pdfParse = require('pdf-parse');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const { getTestSeriesById } = require('./lib/metadata-store');

async function run() {
  try {
    const series = await getTestSeriesById('2480aaaf-a627-4e35-996d-497923939726');
    const key = series.s3Key;
    console.log('Downloading PDF with Key:', key);
    const data = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
    const buffer = Buffer.from(await data.Body.transformToByteArray());
    console.log('Extracting text...');
    const result = await pdfParse(buffer);
    const text = result.text;
    console.log('\n--- LAST 2000 CHARACTERS ---');
    console.log(text.substring(text.length - 2000));
  } catch (err) {
    console.error(err);
  }
}
run();

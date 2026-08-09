const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

require('dotenv').config({ path: './.env.local' });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME;

async function run() {
  const buffer = fs.readFileSync('../ABHYAS Logo.png');
  
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: 'abhyas-logo.png',
      Body: buffer,
      ContentType: 'image/png'
    })
  );
  console.log(`Uploaded to https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/abhyas-logo.png`);
}

run().catch(console.error);

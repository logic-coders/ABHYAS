const { loadEnvConfig } = require('@next/env');
loadEnvConfig('./');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PDFParse } = require('pdf-parse');
const s3 = new S3Client({ region: process.env.AWS_REGION });

async function run() {
  const s3Key = 'abhyas/pdfs/35189ac0-112a-4a01-8796-afeb39149efa-_music_10th__2024_.pdf';
  const res = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: s3Key }));
  const chunks = [];
  for await (const chunk of res.Body) { chunks.push(chunk); }
  const buffer = Buffer.concat(chunks);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const text = (await parser.getText()).text;

  // The English section ends somewhere. Hindi Q71 starts after English Q80 or similar.
  // We know "ZmX" is "नाद". Let's search for "ZmX".
  const idx = text.indexOf("ZmX eãX");
  console.log(text.substring(idx, idx + 500));
}
run();

const fs = require('fs');
const pdfParse = require('pdf-parse');

async function run() {
  const buffer = fs.readFileSync('/tmp/music.pdf');
  const result = await pdfParse(buffer);
  const text = result.text;
  console.log('--- LAST 2000 CHARACTERS ---');
  console.log(text.substring(text.length - 2000));
}
run();

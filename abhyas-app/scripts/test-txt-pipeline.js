const { parseTxtQuestions, parseAnswerKey } = require('../lib/parsers/txt-parser');
const { matchEnglishAndHindiQuestions } = require('../lib/parsers/question-matcher');

const sampleEnglish = `
1. First Question with a formula $E=mc^2$

(a) Option A
(b) Option B
(c) Option C
(d) Option D
(e) Option E

2. Second Question: Which is the capital of India?

(a) Mumbai
(b) New Delhi
(c) Kolkata
(d) Chennai
(e) None of the above

3. Third Question with four options

(a) Alpha
(b) Beta
(c) Gamma
(d) Delta
`;

const sampleHindi = `
1. पहला प्रश्न सूत्र $E=mc^2$ के साथ

(a) विकल्प A
(b) विकल्प B
(c) विकल्प C
(d) विकल्प D
(e) विकल्प E

2. दूसरा प्रश्न: भारत की राजधानी कौन सी है?

(a) मुंबई
(b) नई दिल्ली
(c) कोलकाता
(d) चेन्नई
(e) उपर्युक्त में से कोई नहीं

3. तीसरा प्रश्न चार विकल्पों के साथ

(a) अल्फा
(b) बीटा
(c) गामा
(d) डेल्टा
`;

const sampleAnswerKey = `
1. A
2. B
3. C
`;

console.log('--- Testing English TXT Parsing ---');
const parsedEn = parseTxtQuestions(sampleEnglish);
console.log(`Parsed ${parsedEn.length} English questions.`);

console.log('\n--- Testing Hindi TXT Parsing ---');
const parsedHi = parseTxtQuestions(sampleHindi);
console.log(`Parsed ${parsedHi.length} Hindi questions.`);

console.log('\n--- Testing Answer Key TXT Parsing ---');
const parsedAns = parseAnswerKey(sampleAnswerKey);
console.log(`Parsed ${parsedAns.totalParsed} answers.`);
parsedAns.answers.forEach((val, key) => {
  console.log(`Q${key} Answer: -> ${val}`);
});

console.log('\n--- Testing 3-Way English-Hindi-AnswerKey Matcher ---');
const matchResult = matchEnglishAndHindiQuestions(parsedEn, parsedHi, parsedAns.answers);
console.log('Match Summary:', matchResult.summary);
console.log(`Matched Questions Count: ${matchResult.questions.length}`);
matchResult.questions.forEach((q) => {
  console.log(`Matched Q${q.number} [${q.status}]: CorrectAns = ${q.correctAnswer}`);
  console.log(`  EN: ${q.english.text} (${q.english.options.length} options)`);
  console.log(`  HI: ${q.hindi.text} (${q.hindi.options.length} options)`);
});

if (
  matchResult.questions.length === 3 &&
  matchResult.summary.errorCount === 0 &&
  matchResult.summary.answerKeyStatus === 'valid' &&
  matchResult.questions[0].correctAnswer === 'A' &&
  matchResult.questions[1].correctAnswer === 'B' &&
  matchResult.questions[2].correctAnswer === 'C'
) {
  console.log('\n✅ ALL 3-WAY TXT PARSER, MATCHER & ANSWER KEY TESTS PASSED!');
} else {
  console.error('\n❌ TEST FAILED!');
  process.exit(1);
}

import { parseTxtQuestions, parseAnswerKey } from '../lib/parsers/txt-parser';
import { matchEnglishAndHindiQuestions } from '../lib/parsers/question-matcher';

const enText = `
1. Question One
(a) Option A
(b) Option B

2. Question Two
(a) Option A
(b) Option B
(c) Option C
(d) Option D

3. Question Three
(a) Option A
(b) Option B
(c) Option C
(d) Option D
`;

const hiText = `
1. प्रश्न एक
(a) विकल्प A
(b) विकल्प B

2. प्रश्न दो
(a) विकल्प A
(b) विकल्प B
(c) विकल्प C
(d) विकल्प D

3. प्रश्न तीन
(a) विकल्प A
(b) विकल्प B
(c) विकल्प C
(d) विकल्प D
`;

// Answer Key with deliberate issues:
// Q1: E (Invalid, only A, B exist)
// Q2: Valid (B)
// Q3: Missing from Answer key
// Q4: Extra answer for non-existent question
const ansText = `
1. E
2. B
4. A
`;

console.log('--- Testing Answer Key Edge Cases ---');
const parsedEn = parseTxtQuestions(enText);
const parsedHi = parseTxtQuestions(hiText);
const parsedAns = parseAnswerKey(ansText);

const result = matchEnglishAndHindiQuestions(parsedEn, parsedHi, parsedAns.answers);
console.log('Summary:', result.summary);
console.log('\nMatched Items:');
result.questions.forEach((q) => {
  console.log(`Q${q.number} [${q.status}] (Correct: ${q.correctAnswer || 'None'}): Issues -> ${q.issues.join(' | ') || 'None'}`);
});

console.log('\nGlobal Issues:');
result.summary.globalIssues.forEach((iss) => console.log(` - ${iss}`));

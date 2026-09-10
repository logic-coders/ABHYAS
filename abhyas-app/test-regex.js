const regex = /(?:Correct option is|सही विकल्प)\s*\(\s*([A-Ea-e])\s*\)/i;

const tests = [
  "Correct option is (B).",
  "सही विकल्प (c) है।",
  "Correct option is (A)",
  "सही विकल्प (e) है",
];

tests.forEach(t => {
   const match = t.match(regex);
   console.log(`"${t}" -> ${match ? match[1] : 'null'}`);
});

const regex = /(?:Correct option(?: is)?|सही विकल्प|Correct Answer).*?(?:option|विकल्प)?\s*\(?\s*\b([A-Ea-e])\b\s*\)?\s*(?:\.|$|है)/i;

const tests = [
  "Correct option is (B).",
  "सही विकल्प (c) है।",
  "Correct option is (A)",
  "सही विकल्प (e) है",
  "Therefore, the correct option is Ustad Bismillah Khan (Option c).",
  "Correct Answer: B",
  "Correct option is option B.",
  "सही विकल्प विकल्प D है।"
];

tests.forEach(t => {
   const match = t.match(regex);
   console.log(`"${t}" -> ${match ? match[1] : 'null'}`);
});

/**
 * Common Hindi Word & Character Correction Layer (Fix 23)
 *
 * Provides a systemic post-processing correction layer on top of legacy PDF font extraction.
 * Resolves recurring font artifacts, garbled ligatures, and common word misspellings.
 */

// 1. Sub-Word RegEx Repair Rules
const PATTERN_CORRECTIONS: [RegExp, string][] = [
  // Fix recurring 'आैर' -> 'और'
  [/आैर/g, 'और'],

  // Fix recurring '[र' -> 'रि' (e.g. निर्धारित -> निर्धारित, गिरजा -> गिरजा)
  [/\[र/g, 'रि'],

  // Fix leftover 'p' before 'स्' or 'म्' (e.g. पुpस्तका -> पुस्तक, बिpस्मलाह -> बिस्मिल्लाह)
  [/p(स्|म्|स्त)/g, '$1'],

  // Fix 'þ' -> 'ु' (chhotu u) and 'ÿ' -> 'ू' (bada u)
  [/þ/g, 'ु'],
  [/ÿ/g, 'ू'],

  // Fix legacy ligatures
  [/D\$/g, 'ऊ'],
  [/ê\$/g, 'रू'],
  [/Õ/g, 'द्ध'],
  [/ç/g, '्य'],
  [/ó/g, 'स्त्र'],
  [/À/g, 'च्छ'],
  [/Ô/g, 'द्धा'],
  [/μ\$/g, 'फ़ी'],
  [/’\$/g, 'फ़'],
  [/’ु\$/g, 'फ़ु'],
  [/’ै\$/g, 'फ़ै'],
  [/’ू\$/g, 'फ़ू'],
  [/’o\$/g, 'फ़े'],
  [/’m\$/g, 'फ़ा'],
  [/’/g, 'f'],
  [/µ/g, 'f'],
  [/Å/g, 'ट'],

  // Clean double spaces or artifact characters
  [/\s\s+/g, ' '],
];

// 2. Extensible Word-Level Lookup Dictionary
// Key: Extracted malformed word / token
// Value: Correct Hindi word
const WORD_CORRECTIONS: Record<string, string> = {
  // Frequently occurring exam terms
  'आैर': 'और',
  'पुpस्तका': 'पुस्तक',
  'पुpस्तका।': 'पुस्तक।',
  'पुpस्तका:': 'पुस्तक:',
  'हþआ': 'हुआ',
  'हþसैन': 'हुसैन',
  'दÿसरी': 'दूसरी',
  'द्रþपद': 'द्रुपद',
  'अब्दþल': 'अब्दुल',
  'दþन्दþम्भी': 'दुंदुभी',
  'बिpस्मलाह': 'बिस्मिल्लाह',
  'विलpम्बत': 'विलंबित',
  'लखनD$': 'लखनऊ',
  'नाटçशाó': 'नाट्यशास्त्र',
  'भरतनाटçम': 'भरतनाट्यम',
  'शुÕ': 'शुद्ध',
  'बुÕादित्य': 'बुद्धादित्य',
  'सिÕार': 'सिद्धार',
  'गिÔा': 'गिद्धा',
  'कÀछपि': 'कच्छपी',
  'काμ\$ी': 'काफ़ी',
  '’ै\$याज': 'फ़ैयाज़',
  '’ु\$टनोट²स': 'फ़ुटनोट्स',
  'निर्धा[रत': 'निर्धारित',
  'गि[रजा': 'गिरजा',
  'पू[रयाधनाश्री': 'पूरियाधनाश्री',
  'ह[रप्रसाद': 'हरिप्रसाद',
  'ह[र': 'हरि',
  'Pपताल': 'रूपताल',
  'Pुमरा': 'झुमरा',
  'qPPिया': 'झिझिया',
  'Pुमैर': 'झूमैर',
  'क्ु\$मार': 'कुमार',
  'क्ु\$चिपुड़ी': 'कुचिपुड़ी',
  'क्ं\$ठे': 'कंठे',
  '’ू\$ल': 'फूल',
};

/**
 * Applies both pattern-level corrections and word-level lookup replacements
 * to clean up extracted Hindi text.
 */
export function applyHindiCorrections(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // Step 1: Apply Sub-Word Pattern Corrections
  for (const [pattern, replacement] of PATTERN_CORRECTIONS) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Step 2: Apply Word-Level Dictionary Replacements
  // Split into tokens preserving spaces and punctuation
  const words = cleaned.split(/(\s+|[.,!?:;()"[\]{}])/);
  const corrected = words.map((token) => {
    const trimmed = token.trim();
    if (WORD_CORRECTIONS[trimmed]) {
      return WORD_CORRECTIONS[trimmed];
    }
    return token;
  });

  return corrected.join('');
}

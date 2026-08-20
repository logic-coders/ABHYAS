/**
 * Common Hindi Word & Character Correction Layer (Fix 23)
 *
 * Provides a systemic post-processing correction layer on top of legacy PDF font extraction.
 * Resolves recurring font artifacts, garbled ligatures, and common word misspellings.
 */

// 1. Sub-Word RegEx Repair Rules
const PATTERN_CORRECTIONS: [RegExp, string][] = [
  // Fix 'qP' / 'q' (chhoti i matra before legacy glyphs)
  [/qP/g, 'झि'],
  [/qझझिया/g, 'झिझिया'],
  [/qहदुस्तानी/g, 'हिंदुस्तानी'],
  [/qहडोलम/g, 'हिंडोलम'],
  [/qह/g, 'हि'],
  [/qचतामणि/g, 'चिंतामणि'],
  [/qसह/g, 'सिंह'],
  [/Üारा/g, 'द्वारा'],
  [/Ü/g, 'द्व'],

  // Specific question term repairs (e.g. Q78 "Pलक्ु$रिया' -> "झुमरिया', Q7 "चतुदªडी' -> "चतुर्दण्डी')
  [/चतुदªडी/g, 'चतुर्दण्डी'],
  [/चतुदª/g, 'चतुर्द'],
  [/Pलक्ु\$रिया/g, 'झुमरिया'],
  [/Pलक्ु\$रिया'/g, "झुमरिया'"],
  [/Pumra/g, 'झुमरा'],
  [/Pुमैर/g, 'झूमैर'],
  [/Pपताल/g, 'रूपताल'],
  [/P/g, 'झ'],

  // Fix 'K' -> 'घ' in specific positions
  [/Kराने/g, 'घराने'],
  [/Kटक/g, 'घटक'],
  [/मेK/g, 'मेघ'],
  [/Kन/g, 'घन'],
  [/K/g, 'घ'],

  // Fix matra ordering: 'ाै' -> 'ौ' (e.g. जाैनपुरी -> जौनपुरी, मालकाैंस -> मालकौंस, दाैड़कर -> दौड़कर)
  [/([क-ह])ाै/g, '$1ौ'],

  // Fix recurring 'आैर' -> 'और'
  [/आैर/g, 'और'],

  // Fix recurring '[र' -> 'रि' (e.g. निर्धारित -> निर्धारित, गिरजा -> गिरजा)
  [/\[र/g, 'रि'],

  // Fix leftover 'p' before 'स्', 'म्', 'ण्ड', 'न्' (e.g. पुpस्तका -> पुस्तक, बिpस्मलाह -> बिस्मिल्लाह, पpण्डत -> पंडित)
  [/p(स्|म्|स्त|ण्ड|न्)/g, '$1'],
  [/पpण्डत/g, 'पंडित'],
  [/सpन्ध/g, 'संधि'],

  // Fix 'þ' -> 'ु' (chhotu u) and 'ÿ' -> 'ू' (bada u)
  [/þ/g, 'ु'],
  [/ÿ/g, 'ू'],

  // Fix math, music, & geometry artifacts from legacy fonts
  [/Û०रा/g, 'द्वारा'],
  [/Ûा०रा/g, 'द्वारा'],
  [/Û/g, 'द्व'],
  [/मा°ड्यूलेशन/g, 'मॉड्यूलेशन'],
  [/मा°/g, 'मॉ'],
  [/êप/g, 'रूप'],
  [/शुंê/g, 'शुरू'],
  [/ê/g, 'रू'],
  [/क्‌म/g, 'क्रम'],
  [/क्म/g, 'क्रम'],
  [/fुटनोट²स/g, 'फुटनोट्स'],
  [/fुटनोट/g, 'फुटनोट'],

  [/Nूट/g, 'छूट'],
  [/अइउD/g, 'ABCD'],
  [/Dं\$चाई/g, 'ऊंचाई'],
  [/त्रिÁया/g, 'त्रिज्या'],
  [/उत्पध्/g, 'उत्पन्न'],
  [/μख्याल/g, 'ख्याल'],
  [/™याल/g, 'ख्याल'],
  [/तत²/g, 'तत'],
  [/डे‹T/g, 'डेढ़'],
  [/प‹Tते/g, 'पढ़ते'],
  [/प‹Tने/g, 'पढ़ने'],
  [/प‹T/g, 'पढ़'],
  [/काक्ू\$/g, 'काकू'],
  [/आक्}\$स्ट ́ा/g, 'ऑर्केस्ट्रा'],
  [/क्ू\$/g, 'कू'],
  [/क्ु\$/g, 'कु'],
  // Fix Q41 & Q42 artifacts (गड्ढे, ढक, वृंद, हिंदुस्तानी)
  [/गड्Tे/g, 'गड्ढे'],
  [/गड्T/g, 'गड्ढ'],
  [/Tक/g, 'ढक'],
  [/र,ु/g, 'वृंद'],
  [/काμ\\?\$ी/g, 'काफ़ी'],
  [/काμ\$ी/g, 'काफ़ी'],
  [/μ\\?\$ी/g, 'फ़ी'],
  [/\\?\$/g, ''],

  [/क््र\$मिक/g, 'क्रमिक'],
  [/क््रि\$या/g, 'क्रिया'],
  [/क््रi\$या/g, 'क्रिया'],
  [/क््र\$/g, 'क्र'],

  // Fix leftover '$' after common words
  [/के\$/g, 'के'],
  [/डी\$/g, 'डी'],
  [/क्\$/g, 'क'],

  // Fix legacy ligatures
  [/D\$/g, 'ऊ'],
  [/ê\$/g, 'रू'],
  [/Õ/g, 'द्ध'],
  [/ç/g, '्य'],
  [/ó/g, 'स्त्र'],
  [/À/g, 'च्छ'],
  [/Ô/g, 'द्धा'],
  [/कच्छछपि/g, 'कच्छपी'],
  [/गिद्धाा/g, 'गिद्धा'],
  [/कल्लz/g, 'कल्लू'],
  [/बिस्मलाह/g, 'बिस्मिल्लाह'],
  [/काμ\$ी/g, 'काफ़ी'],
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
  'बिस्मलाह': 'बिस्मिल्लाह',
  'विलpम्बत': 'विलंबित',
  'लखनD$': 'लखनऊ',
  'नाटçशाó': 'नाट्यशास्त्र',
  'भरतनाटçम': 'भरतनाट्यम',
  'शुÕ': 'शुद्ध',
  'बुÕादित्य': 'बुद्धादित्य',
  'सिÕार': 'सिद्धार',
  'गिÔा': 'गिद्धा',
  'गिद्धाा': 'गिद्धा',
  'कÀछपि': 'कच्छपी',
  'कच्छछपि': 'कच्छपी',
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
  'Pलक्ु\$रिया': 'झुमरिया',
  'Pलक्ु\$रिया\'': 'झुमरिया\'',
  'चतुदªडी': 'चतुर्दण्डी',
  'qहदुस्तानी': 'हिंदुस्तानी',
  'Üारा': 'द्वारा',
  'गड्Tे': 'गड्ढे',
  'Tक': 'ढक',
  'र,ु': 'वृंद',
  'क्ु\$मार': 'कुमार',
  'क्ु\$चिपुड़ी': 'कुचिपुड़ी',
  'क्ं\$ठे': 'कंठे',
  '’ू\$ल': 'फूल',
  'कल्लz': 'कल्लू',
  'जाैनपुरी': 'जौनपुरी',
  'मालकाैंस': 'मालकौंस',
  'दाैड़कर': 'दौड़कर',
  'Nूट': 'छूट',
  'अइउD': 'ABCD',
  'Dं\$चाई': 'ऊंचाई',
  'त्रिÁया': 'त्रिज्या',
  'उत्पध्': 'उत्पन्न',
  'पpण्डत': 'पंडित',
  'सpन्ध': 'संधि',
  'μख्याल': 'ख्याल',
  '™याल': 'ख्याल',
  'तत²': 'तत',
  'डे‹T': 'डेढ़',
  'काक्ू\$': 'काकू',
  'आक्}\$स्ट ́ा': 'ऑर्केस्ट्रा',
  'क््र\$मिक': 'क्रमिक',
  'क््रि\$या': 'क्रिया',
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

export function decodeHindi(text: string): string {
  if (!text) return text;

  let res = text;

  // 0. Specific exceptions before regex
  res = res.replace(/\{Îm/g, "त्ति");

  // 1. Swap '{' (chhoti-i matra) with the following consonant block.
  // A consonant block is a char + optional '$' + optional '«' (bottom r) or '>'
  res = res.replace(/\{([^\{\s])([\$\>]?)(«?)/g, "$1$2$3ि");

  const map: Record<string, string> = {
    // Special combined words / matras / ligatures
    "{Îm": "त्ति",
    "H$mo": "को",
    "Ho$": "के",
    "Amo": "ओ",
    "Am": "आ",
    "EH$": "एक",
    "H¥$": "कृ",
    "B©": "ई",
    "½": "ग्",
    "’$": "फ़",
    "¹$": "क्व",
    "ि्र": "्रि",
    ">": "",

    // Vowels & Matras
    "m|": "ों",
    "m§": "ां",
    "mo": "ो",
    "m": "ा",
    "o": "े",
    "|": "ें",
    "¡": "ै",
    "¢": "ैं",
    "w": "ु",
    "y": "ू",
    "u": "ीर्",
    "¥": "ृ",
    "t": "ीं",
    "s": "ी",
    "r": "ी",
    "§": "ं",
    "±": "ँ",
    "©": "र्",
    "«": "्र",
    "´": "्र",
    "´>": "्र",

    // Consonants & Ligatures
    "H$": "क",
    "º$": "क्त",
    "Îm": "त्त",
    "Q>": "ट",
    "Q": "ट",
    "R>": "ठ",
    "R": "ठ",
    "S": "ड",
    "N>": "छ",
    "S²>": "ड्",
    "‹S>": "ड़",
    "‹R>": "ढ़",
    "ÊR>": "ण्ठ",
    "ï>": "ष्ट",
    "í>": "ष्ट",
    "í": "श्",
    "¾": "ग्न",
    "º": "क्त्",
    "³": "क्",
    "Š": "क्",
    "Ü": "द्व",
    "Þ": "ध्",
    "Ú": "द्य",
    "„": "ल्ल",
    "œ": "श्व",
    "ë": "ल्",
    "ß": "प्",
    "Ì": "त्र",
    "ü": "श्च",
    "ñ": "स्",
    "l": "श्र",
    "Ý": "न्",
    "Ð": "द्र",
    "á": "प्त",
    "å": "म्",
    "»": "ख्",
    "ì": "व्",
    "_": "म",

    // Base characters
    "A": "अ",
    "B": "इ",
    "C": "उ",
    "E": "ए",
    "Z": "न",
    "X": "द",
    "e": "श",
    "ã": "ब्",
    "‘": "म",
    "j": "क्ष",
    "k": "ज्ञ",
    "a": "र",
    "g": "स",
    "V": "त",
    "Ë": "त्",
    "n": "प",
    "¶": "य",
    "`": "य",
    "h": "ह",
    "ö": "हृ",
    "à": "प्र",
    "^": "भ",
    "U": "ण",
    "Ê": "ण्",
    "d": "व",
    "M": "च",
    "~": "ब",
    "K": "घ",
    "P": "झ",
    "z": "ू",
    "Á": "जि",
    "™": "ख्",
    "J": "ग",
    "W": "थ",
    "Y": "ध",
    "H": "क्",
    "b": "ल",
    "I": "ख",
    "f": "ष",
    "O": "ज",
    "î": "ष्",
  };

  // Replace longest mappings first
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    res = res.split(k).join(map[k]);
  }

  // 3. Fix reph (© mapped to 'र्')
  // In the legacy font, the reph comes AFTER the consonant it sits on (along with any matra).
  // In Unicode, it should come BEFORE the consonant it sits on.
  // E.g. यर् -> र्य, or युर् -> र्यु
  res = res.replace(/([\u0915-\u0939][\u093E-\u094C\u0901\u0902\u093C]?)र्/g, "र्$1");

  return res;
}

const kruti = require('@anthro-ai/krutidev-unicode');
console.log(kruti);
const text = "ZmX eãX ‘| \"Z' Aja go VmËn¶© h¡";
if (kruti.toUnicode) console.log(kruti.toUnicode(text));
if (kruti.convertToUnicode) console.log(kruti.convertToUnicode(text));
if (typeof kruti === 'function') console.log(kruti(text));

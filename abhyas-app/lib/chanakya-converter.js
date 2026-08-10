"use strict";
// Chanakya to Unicode converter
// Ported from chanakyaC.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.chanakyaToUnicode = chanakyaToUnicode;
exports.unicodeToChanakya = unicodeToChanakya;
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function chanakyaToUnicode(text) {
    if (!text)
        return "";
    var array_one = [
        "¤", "U",
        // correct anusvAr+ekAr, ekAr+nuqta to the reverse order
        "¢ð", "´ð", "ð¸",
        "Ò", "¥æò", "¸",
        "¸•", "¸¹", "¸»", "¸Á", "¸Ç", "¸É", "¸È", "¸Ø", "¸Ú", "¸Ù",
        "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
        "N", "O", "P", "Q", "R", "T", "V", "W", "X", "Y",
        "`", "a", "b", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "u",
        "žæ", "ž", "#", "%", "@",
        "„", "¦", "¨", "¯", "µ", "º",
        "Cþ", "q", "Ê", "u", "g",
        "Ÿæ", "Åþ", "Çþ", "Éþ",
        "^", "h", "Ð", "ý", "þ",
        "¥ô", "¥æð", "¥õ", "¥æñ", "¥æ", "¥", "§Z", "§ü", "§", "©", "ª", "«", "¬", "­", "°ð", "°",
        "€", "·", "", "¹", "‚", "»", "ƒæ", "ƒ", "¾",
        "\"", "'", "¿", "À", "\"", "…", "'", "Á", "Ûæ", "Û", "†æ", "†",
        "Å", "Æ", "Ç", "É", "‡æ", "‡",
        "ˆ", "Ì", "‰", "Í", "Î", "¼", "Š", "Ï", "óæ", "ó", "‹æ", "Ù", "‹",
        "Œ", "Â", "", "È", "Ž", "Õ", "", "Ö", "", "×",
        "Ä", "Ø", "Ú", "Ë", "Ü", "¶", "Ý", "Ã", "ß",
        "àæ", "³æ", "o", "³", "à", "c", "á", "S", "â", "ã", "±",
        "ÿæ", "ÿ", "˜æ", "˜", "™æ", "™", "üð´",
        "æò", "æñ", "æ", "è", "é", "ê", "ä", "å", "ë", "ì", "í", "Ô", "ñ", "ô", "õ",
        "¢", "´", "¡", "Ñ", "¸", "ò", "ù", "÷", "ð",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "®", "v", "w", "x", "y", "z", "{", "|", "}", "~",
        "्ो", "्ौ", "्ाे", "्ाा", "ाे", "ाे", "ाै", "्ा", "ंु", "ओे", "ोे", "ाे", "ईंं"
    ];
    var array_two = [
        "", "",
        // correct anusvAr+ekAr, ekAr+nuqta to the reverse order
        "ð¢", "ð´", "¸ð",
        "'", "ऑ", "फ़्",
        "क़", "ख़", "ग़", "ज़", "ड़", "ढ़", "फ़", "य़", "ऱ", "ऩ",
        "्र", "क्च", "ष्ट", "ष्ठ", "श्व", "स्न", "त्र", "॥", "ढ्ढ", "छ्व", "्य", "रु", "रू",
        "हृ", "ह्र", "क्क", "क्त", "क्र", "ञ्ज", "ङ्क", "ङ्ख", "ङ्ग", "ङ्घ",
        "क्व", "ड्ड", "ड्ढ", "स्र", "द्ग", "द्घ", "द्द", "द्ध", "द्ब", "द्भ", "द्म", "द्य", "द्व", "ठ्ठ", "श्च", "ह्न", "ह्म्", "ह्य", "ह्ल", "ह्व",
        "त्त", "त्त्", "प्त", "त्न", "ञ्च",
        "ल्ल", "ष्ट्व", "ङ्क्ष", "ख्न", "द्ब्र", "ख्र",
        "ष्ट्र", "ह्न", "ज़्", "ह्व", "द्द",
        "श्र", "ट्र", "ड्र", "ढ्र",
        "ट्ट", "द्ध", "।", "्र", "्र",
        "ओ", "ओ", "औ", "औ", "आ", "अ", "ईं", "ई", "इ", "उ", "ऊ", "ऋ", "ॠ", "ऌ", "ऐ", "ए",
        "क्", "क", "ख्", "ख", "ग्", "ग", "घ", "घ्", "ङ",
        "च्च्", "च्", "च", "छ", "ज्ज्", "ज्", "ज्", "ज", "झ", "झ्", "ञ", "ञ्",
        "ट", "ठ", "ड", "ढ", "ण", "ण्",
        "त्", "त", "थ्", "थ", "द", "द", "ध्", "ध", "न्न", "न्न्", "न", "न", "न्",
        "प्", "प", "फ्", "फ", "ब्", "ब", "भ्", "भ", "म्", "म",
        "य्", "य", "र", "ल्", "ल", "ल", "ळ", "व्", "व",
        "श", "श", "श", "श्", "श्", "ष्", "ष", "स्", "स", "ह", "ह्",
        "क्ष", "क्ष्", "त्र", "त्र्", "ज्ञ", "ज्ञ्", "ðZ",
        "ॉ", "ौ", "ा", "ी", "ु", "ू", "ु", "ू", "ृ", "ॄ", "ॢ", "े", "ै", "ो", "ौ",
        "ं", "ं", "ँ", ":", "़", "ॅ", "ऽ", "्", "े",
        "०", "१", "२", "३", "४", "५", "६", "७", "८", "९",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "े", "ै", "े", "ा", "ो", "ो", "ौ", "", "ुं", "ओ", "ो", "ो", "ईं"
    ];
    var modified_substring = text;
    // Replace array_one elements with array_two elements
    for (var i = 0; i < array_one.length; i++) {
        var pattern = new RegExp(escapeRegExp(array_one[i]), 'g');
        modified_substring = modified_substring.replace(pattern, array_two[i]);
    }
    // Replace special glyph Z (reph+anusvAr)
    modified_substring = modified_substring.replace(/Z/g, "üं");
    // Code for replacing "ç" with "ि" (chhotee ee kii maatraa) and correcting its position
    var position_of_f = modified_substring.indexOf("ç");
    while (position_of_f !== -1) {
        var character_right_to_f = modified_substring.charAt(position_of_f + 1);
        modified_substring = modified_substring.replace("ç" + character_right_to_f, character_right_to_f + "ि");
        position_of_f = position_of_f + 1;
        while (modified_substring.charAt(position_of_f + 1) === "्" &&
            position_of_f < modified_substring.length - 1) {
            var string_to_be_replaced = modified_substring.charAt(position_of_f + 1) + modified_substring.charAt(position_of_f + 2);
            modified_substring = modified_substring.replace("ि" + string_to_be_replaced, string_to_be_replaced + "ि");
            position_of_f = position_of_f + 2;
        }
        position_of_f = modified_substring.indexOf("ç", position_of_f + 1);
    }
    return modified_substring;
}
function unicodeToChanakya(text) {
    if (!text)
        return "";
    var modified_substring = text;
    // Handle ि (choti i ki matra) - move it before the consonant (to 'd' in Chanakya)
    var position_of_f = modified_substring.indexOf("ि");
    while (position_of_f !== -1) {
        var character_left_to_f = modified_substring.charAt(position_of_f - 1);
        modified_substring = modified_substring.replace(character_left_to_f + "ि", "ç" + character_left_to_f);
        position_of_f = position_of_f - 1;
        // Handle conjuncts (move ि before entire conjunct)
        while (modified_substring.charAt(position_of_f - 1) === "्" && position_of_f !== 0) {
            var string_to_be_replaced = modified_substring.charAt(position_of_f - 2) + "्";
            modified_substring = modified_substring.replace(string_to_be_replaced + "ç", "ç" + string_to_be_replaced);
            position_of_f = position_of_f - 2;
        }
        position_of_f = modified_substring.indexOf("ि", position_of_f + 1);
    }
    // Reverse mapping arrays - Unicode to Chanakya
    var array_one = [
        "'", "'", '"', '"', " '", "' ", "'", "ं", "ऑ",
        "क्ष्", "क्ष", "त्र", "ज्ञ", "् ",
        "क़", "ख़", "ग़", "ज़्", "ज़", "ड़", "ढ़", "फ़्", "फ़", "य़", "ऱ", "ऩ",
        "क्च", "ष्ठ", "श्व", "स्न", "त्र", "॥", "ढ्ढ", "छ्व", "रु", "रू",
        "हृ", "ह्र", "क्क", "क्त", "क्र", "ञ्ज", "ङ्क", "ङ्ख", "ङ्ग", "ङ्घ", "ट्ट", "ट्ठ",
        "क्व", "ड्ड", "ड्ढ", "स्र", "द्ग", "द्घ", "द्द", "द्ध", "द्ब", "द्भ", "द्म", "द्य", "द्व", "ठ्ठ", "श्च", "ह्न", "ह्म्", "ह्य", "ह्ल", "ह्व",
        "त्त", "त्त्", "प्त", "त्न", "ञ्च",
        "ल्ल", "ष्ट्व", "ङ्क्ष", "ख्न", "द्ब्र", "ख्र",
        "ष्ट्र", "ष्ट", "ह्न", "ह्व", "द्द",
        "श्र्", "श्र", "ट्र", "ड्र", "ढ्र",
        "।", "्र",
        "शृ", "शॄ", "कॢ", "ह्ण",
        "ओ", "औ", "आ", "अ", "ईं", "ई", "इ", "उ", "ऊ", "ऋ", "ॠ", "ऌ", "ऐ", "ए",
        "के", "कै", "फे", "फै",
        "क्", "क", "ख्", "ख", "ग्", "ग", "घ्", "घ", "ङ",
        "च्च्", "च्", "च", "छ", "ज्ज्", "ज्", "ज", "झ्", "झ", "ञ्", "ञ",
        "ट", "ठ", "ड", "ढ", "ण्", "ण",
        "त्", "त", "थ्", "थ", "द", "ध्", "ध", "न्न्", "न्न", "न्", "न",
        "प्", "प", "फ्", "फ", "ब्", "ब", "भ्", "भ", "म्", "म",
        "य्", "य", "र", "ल्", "ल", "ळ", "व्", "व",
        "श्", "श", "ष्", "ष", "स्", "स", "ह्", "ह",
        "्य", "x",
        "ॉ", "ा", "ी", "ु", "ू", "ृ", "ॄ", "ॢ", "े", "ै", "ो", "ौ",
        "ं", "ं", "ँ", "ः", ":", "़", "ॅ", "ऽ", "्",
        "०", "१", "२", "३", "४", "५", "६", "७", "८", "९",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ];
    var array_two = [
        "Ò", "Ó", '"', '"', " Ò", "Ó ", "Ó", "´", "¥æò",
        "ÿ", "ÿæ", "˜æ", "™æ", "÷ ",
        "·¸¤", "¹¸", "»¸", "Ê", "Á¸", "Ç¸", "É¸", "¸", "È¸", "Ø¸", "Ú¸", "Ù¸",
        "B¤", "D", "E", "F", "G", "H", "I", "J", "L¤", "M¤",
        "N", "O", "P¤", "Q¤", "R¤", "T", "V", "W", "X", "Y", "^", "_",
        "`¤", "a", "b", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "u",
        "žæ", "ž", "#", "%", "@",
        "„", "¦", "¨", "¯", "µ", "º",
        "Cþ", "C", "q", "u", "g",
        "Ÿ", "Ÿæ", "Åþ", "Çþ", "Éþ",
        "Ð", "ý",
        "oë", "oì", "•í", "ö",
        "¥ô", "¥õ", "¥æ", "¥", "§Z", "§ü", "§", "©", "ª¤", "«", "¬", "­", "°ð", "°",
        "·Ô¤", "·ñ¤", "ÈÔ¤", "Èñ¤",
        "€U", "·¤", "", "¹", "\u0082", "\u00BB", "ƒ", "ƒæ", "¾",
        '"', "'", "¿", "À", '"', "'", "Á", "Û", "Ûæ", "†", "†æ",
        "ÅU", "Æ", "Ç", "É", "‡", "‡æ",
        "ˆ", "Ì", "‰", "Í", "Î", "Š", "Ï", "ó", "óæ", "‹", "Ù",
        "Œ", "Â", "", "È", "Ž", "Õ", "", "Ö", "", "×",
        "Ä", "Ø", "ÚU", "Ë", "Ü", "Ý", "Ã", "ß",
        "K", "&",
        "æò", "æ", "è", "é", "ê", "ë", "ì", "í", "ð", "ñ", "ô", "õ",
        "¢", "´", "¡", "Ñ", "Ñ", "¸", "ò", "ù", "÷",
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
        "®", "v", "w", "x", "y", "z", "{", "|", "}", "~"
    ];
    // Replace array elements
    for (var i = 0; i < array_one.length; i++) {
        if (array_one[i]) {
            modified_substring = modified_substring.split(array_one[i]).join(array_two[i] || '');
        }
    }
    // Convert ç back to d (Chanakya's representation of ि)
    modified_substring = modified_substring.replace(/ç/g, "d");
    return modified_substring;
}

import { Subject, ManualQuestion, BilingualQuestion } from '@/lib/types';

export const BILINGUAL_STREAK_QUESTIONS: Partial<Record<Subject, BilingualQuestion[]>> = {
  Music: [
    {
      number: 1,
      english: {
        text: 'Which musical term indicates a very slow tempo?',
        options: ['A. Allegro', 'B. Largo', 'C. Presto', 'D. Vivace'],
        explanation: 'Largo is the correct answer because it is an Italian musical term designating a very slow and broad tempo. Other terms like Allegro and Vivace indicate fast tempos, while Presto is extremely fast.',
      },
      hindi: {
        text: 'कौन सा संगीत पद अत्यंत धीमी गति (लय) को दर्शाता है?',
        options: ['A. एलेग्रो (Allegro)', 'B. लार्गो (Largo)', 'C. प्रेस्टो (Presto)', 'D. विवाचे (Vivace)'],
        explanation: 'लार्गो सही उत्तर है क्योंकि यह एक इतालवी संगीत शब्द है जो बहुत धीमी और गंभीर गति को दर्शाता है। एलेग्रो और विवाने तेज गति को दर्शाते हैं, जबकि प्रेस्टो अत्यंत तीव्र गति को इंगित करता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'How many semitones make up a perfect fifth interval?',
        options: ['A. 5 semitones', 'B. 6 semitones', 'C. 7 semitones', 'D. 8 semitones'],
        explanation: 'A perfect fifth interval consists of 7 semitones, forming the foundational consonant interval in Western music harmony. It spans seven half-steps on the keyboard, connecting the first and fifth degrees of a diatonic scale.',
      },
      hindi: {
        text: 'एक परफेक्ट फिफ्थ (Perfect Fifth) अंतराल में कितने सेमिटोन (अर्धस्वर) होते हैं?',
        options: ['A. 5 सेमिटोन', 'B. 6 सेमिटोन', 'C. 7 सेमिटोन', 'D. 8 सेमिटोन'],
        explanation: 'एक परफेक्ट फिफ्थ अंतराल में 7 अर्धस्वर (semitones) होते हैं, जो पश्चिमी संगीत हार्मनी में एक बुनियादी संवादी अंतराल बनाते हैं। यह कीबोर्ड पर सात अर्ध-चरणों को कवर करता है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Which clef is also commonly known as the G clef?',
        options: ['A. Treble Clef', 'B. Bass Clef', 'C. Alto Clef', 'D. Tenor Clef'],
        explanation: 'The Treble Clef is commonly known as the G clef because its symbol curls around the second line of the staff, which represents the musical note G. It is primarily used for higher-pitched instruments and vocal ranges.',
      },
      hindi: {
        text: 'किस क्लेफ (Clef) को सामान्यतः जी क्लेफ (G Clef) के नाम से भी जाना जाता है?',
        options: ['A. ट्रेबल क्लेफ (Treble Clef)', 'B. बास क्लेफ (Bass Clef)', 'C. आल्टो क्लेफ (Alto Clef)', 'D. टेनर क्लेफ (Tenor Clef)'],
        explanation: 'ट्रेबल क्लेफ को आमतौर पर जी क्लेफ (G clef) के रूप में जाना जाता है क्योंकि इसका प्रतीक स्टाफ की दूसरी लाइन के चारों ओर घूमता है, जो संगीत नोट जी (G) का प्रतिनिधित्व करता है। इसका उपयोग उच्च स्वर वाले वाद्ययंत्रों के लिए किया जाता है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'Who composed the famous "Moonlight Sonata"?',
        options: ['A. Wolfgang Amadeus Mozart', 'B. Ludwig van Beethoven', 'C. Johann Sebastian Bach', 'D. Franz Schubert'],
        explanation: 'Ludwig van Beethoven composed the iconic "Moonlight Sonata" (Piano Sonata No. 14) in 1801, dedicating it to his pupil Countess Giulietta Guicciardi. It remains one of the most celebrated and enduring masterworks of the Romantic classical era.',
      },
      hindi: {
        text: 'प्रसिद्ध "मूनलाइट सोनाटा" (Moonlight Sonata) की रचना किसने की थी?',
        options: ['A. वोल्फगैंग अमाडेस मोजार्ट', 'B. लुडविग वैन बीथोवेन', 'C. जोहान सेबेस्टियन बाख', 'D. फ्रांज शुबर्ट'],
        explanation: 'लुडविग वैन बीथोoven ने 1801 में प्रसिद्ध "मूनलाइट सोनाटा" (पियानो सोनाटा संख्या 14) की रचना की और इसे अपनी शिष्या काउंटलेस जूलिएटा गुइकियार्डी को समर्पित किया। यह शास्त्रीय संगीत युग की सबसे प्रसिद्ध कृतियों में से एक है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'What note value is equal to half of a quarter note?',
        options: ['A. Eighth note', 'B. Half note', 'C. Whole note', 'D. Sixteenth note'],
        explanation: 'An eighth note is equal to half of a quarter note in Western rhythmic notation. As note values divide by two sequentially, a quarter note divides into two eighth notes.',
      },
      hindi: {
        text: 'क्वार्टर नोट (Quarter Note) के आधे मान के बराबर कौन सा नोट होता है?',
        options: ['A. एइथ नोट (Eighth note)', 'B. हाफ नोट (Half note)', 'C. होल नोट (Whole note)', 'D. सिक्सटीन्थ नोट (Sixteenth note)'],
        explanation: 'पश्चिमी लेयात्मक अंकन में एक आठवां नोट (Eighth note) एक चौथाई नोट (Quarter note) के आधे के बराबर होता है। चूंकि नोट के मूल्य क्रमिक रूप से आधे में विभाजित होते हैं, इसलिए एक चौथाई नोट दो आठवें नोटों में बंट जाता है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'In standard 4/4 time, how many beats does a dotted half note receive?',
        options: ['A. 2 beats', 'B. 3 beats', 'C. 4 beats', 'D. 1.5 beats'],
        explanation: 'In 4/4 time, a regular half note receives 2 beats. The addition of a dot increases its duration by half of its original value (1 beat), resulting in a total of 3 beats.',
      },
      hindi: {
        text: 'मानक 4/4 ताल में, एक डॉटेड हाफ नोट (Dotted Half Note) को कितनी मात्राएँ मिलती हैं?',
        options: ['A. 2 मात्राएँ', 'B. 3 मात्राएँ', 'C. 4 मात्राएँ', 'D. 1.5 मात्राएँ'],
        explanation: 'मानक 4/4 समय में, एक सामान्य हाफ नोट को 2 बीट मिलती हैं। बिंदु (डॉट) जुड़ने से इसकी अवधि अपने मूल मूल्य की आधी (1 बीट) बढ़ जाती है, जिससे कुल 3 बीट प्राप्त होती हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Which instrument family does the oboe belong to?',
        options: ['A. Brass', 'B. Strings', 'C. Woodwinds', 'D. Percussion'],
        explanation: 'The oboe is a double-reed woodwind instrument that produces sound by blowing air through a reed. It is a standard member of the woodwind family in a symphony orchestra.',
      },
      hindi: {
        text: 'ओबो (Oboe) किस वाद्ययंत्र परिवार से संबंधित है?',
        options: ['A. पीतल (Brass)', 'B. तंतु वाद्य (Strings)', 'C. काष्ठ-सुषिर वाद्य (Woodwinds)', 'D. अवनद्ध वाद्य (Percussion)'],
        explanation: 'ऑबो एक डबल-रीड वुडविंड वाद्ययंत्र है जो रीड के माध्यम से हवा फूंककर ध्वनि उत्पन्न करता है। यह एक सिम्फनी ऑर्केस्ट्रा में वुडविंड परिवार का एक मानक सदस्य है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the relative minor key of C major?',
        options: ['A. D minor', 'B. E minor', 'C. A minor', 'D. G minor'],
        explanation: 'Every major key has a relative minor key that shares the exact same key signature. C major has no sharps or flats, and its relative minor, A minor, also contains no sharps or flats.',
      },
      hindi: {
        text: 'सी मेजर (C Major) की सापेक्ष माइनर (Relative Minor) कुंजी क्या है?',
        options: ['A. डी माइनर (D minor)', 'B. ई माइनर (E minor)', 'C. ए माइनर (A minor)', 'D. जी माइनर (G minor)'],
        explanation: 'प्रत्येक मेजर कुंजी की एक सापेक्ष माइनर कुंजी होती है जो समान कुंजी हस्ताक्षर साझा करती है। C मेजर में कोई शार्प या फ्लैट नहीं होता है, और इसकी सापेक्ष माइनर, A माइनर में भी कोई शार्प या फ्लैट नहीं होता है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'What does the dynamic marking "pianissimo" (pp) mean?',
        options: ['A. Very loud', 'B. Moderately soft', 'C. Very soft', 'D. Gradually louder'],
        explanation: 'In musical notation, \'pianissimo\' (abbreviated as pp) is an Italian dynamic marking indicating that a passage should be played very softly. It is quieter than \'piano\' (p).',
      },
      hindi: {
        text: 'संगीत में "पियानिसिमो" (pp) का क्या अर्थ है?',
        options: ['A. बहुत तेज', 'B. मध्यम कोमल', 'C. बहुत कोमल/धीमा', 'D. धीरे-धीरे तेज'],
        explanation: 'संगीत संकेतन में, \'पियानिसिमो\' (संक्षिप्त रूप में pp) एक इतालवी गतिक अंकन है जो यह दर्शाता है कि किसी धुन को बहुत ही कोमलता से बजाया जाना चाहिए। यह \'पियानो\' (p) की तुलना में अधिक शांत होता है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'How many sharps are in the key signature of D major?',
        options: ['A. 1 sharp', 'B. 2 sharps', 'C. 3 sharps', 'D. 4 sharps'],
        explanation: 'The key signature of D major contains two sharps: F-sharp and C-sharp. This follows the standard circle of fifths for major keys.',
      },
      hindi: {
        text: 'डी मेजर (D Major) के मुख्य हस्ताक्षर में कितने शार्प (#) होते हैं?',
        options: ['A. 1 शार्प', 'B. 2 शार्प', 'C. 3 शार्प', 'D. 4 शार्प'],
        explanation: 'D मेजर की कुंजी हस्ताक्षर में दो शार्प होते हैं: F-शार्प और C-शार्प। यह मेजर कुंजियों के लिए मानक सर्कल ऑफ फिफ्थ्स का पालन करता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Which Indian classical musical scale system is known as a parent scale?',
        options: ['A. Raga', 'B. Thaat', 'C. Tala', 'D. Gharana'],
        explanation: 'In Hindustani classical music, a \'Thaat\' is a parent scale consisting of seven basic notes (swaras) from which various ragas are derived. Pandit Vishnu Narayan Bhatkhande classified North Indian ragas into ten primary thaats based on their structural framework.',
      },
      hindi: {
        text: 'भारतीय शास्त्रीय संगीत में जनक (मूल) स्वर समूह को क्या कहा जाता है?',
        options: ['A. राग', 'B. ठाठ', 'C. ताल', 'D. घराना'],
        explanation: 'हिन्दुस्तानी शास्त्रीय संगीत में \'थाट\' एक जनक पैमाना (पेरेंट स्केल) है जिसमें सात मूल स्वर होते हैं जिनसे विभिन्न रागों की उत्पत्ति होती है। पंडित विष्णु नारायण भातखंडे ने उत्तर भारतीय रागों को उनकी संरचनात्मक रूपरेखा के आधार पर दस प्रमुख थाटों में वर्गीकृत किया है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'What is the standard concert pitch frequency for the note A4?',
        options: ['A. 432 Hz', 'B. 440 Hz', 'C. 444 Hz', 'D. 420 Hz'],
        explanation: 'The standard international concert pitch frequency for the musical note A above middle C (A4) is established at 440 Hz, as standardized by the International Organization for Standardization (ISO 16). This frequency serves as an acoustic benchmark for tuning musical instruments worldwide.',
      },
      hindi: {
        text: 'स्वर A4 के लिए मानक कॉन्सर्ट पिच आवृत्ति क्या है?',
        options: ['A. 432 Hz', 'B. 440 Hz', 'C. 444 Hz', 'D. 420 Hz'],
        explanation: 'मध्य सी से ऊपर के संगीत स्वर ए4 (A4) के लिए मानक अंतर्राष्ट्रीय संगीत कार्यक्रम पिच आवृत्ति 440 हर्ट्ज़ निर्धारित है, जिसे मानकीकरण के लिए अंतर्राष्ट्रीय संगठन (ISO 16) द्वारा मानकीकृत किया गया है। यह आवृत्ति दुनिया भर में वाद्ययंत्रों को ट्यून करने के लिए एक ध्वustic मानक के रूप में कार्य करती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Which Italian term directs musicians to play smoothly and connected?',
        options: ['A. Staccato', 'B. Legato', 'C. Pizzicato', 'D. Marcato'],
        explanation: 'The Italian musical term \'Legato\' directs musicians to play or sing notes smoothly and connectedly without any perceptible silence between them. It contrasts with \'staccato\', which indicates detached and short articulation.',
      },
      hindi: {
        text: 'कौन सा इतालवी शब्द स्वरों को निर्बाध और जोड़कर बजाने का निर्देश देता है?',
        options: ['A. स्टैकाटो (Staccato)', 'B. लेगाटो (Legato)', 'C. पिज़िकाटो (Pizzicato)', 'D. मार्काटो (Marcato)'],
        explanation: 'इतालवी संगीत शब्द \'लेगाटो\' संगीतकारों को बिना किसी ध्यान देने योग्य अंतराल के स्वरों को सुचारू और परस्पर जुड़े हुए रूप में बजाने या गाने का निर्देश देता है। यह \'स्टैकाटो\' के विपरीत है, जो अलग-अलग और छोटे उच्चारण को इंगित करता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Which of the following is a brass instrument that uses a slide rather than valves?',
        options: ['A. Trumpet', 'B. French Horn', 'C. Trombone', 'D. Tuba'],
        explanation: 'The trombone is a brass instrument that uniquely alters its pitch using a telescoping slide mechanism rather than traditional piston valves. This design allows for a continuous, smooth glissando effect across various musical intervals.',
      },
      hindi: {
        text: 'निम्नलिखित में से कौन सा पीतल का वाद्य यंत्र वाल्व के बजाय स्लाइड का उपयोग करता है?',
        options: ['A. तुरही (Trumpet)', 'B. फ्रेंच हॉर्न', 'C. ट्रॉम्बोन (Trombone)', 'D. ट्यूबा'],
        explanation: 'ट्रॉम्बोन एक पीतल का वाद्य यंत्र है जो पारंपरिक पिस्टन वाल्व के बजाय एक टेलीस्कोपिक स्लाइड तंत्र का उपयोग करके अपनी पिच को अनूठे ढंग से बदलता है। यह डिज़ाइन विभिन्न संगीत अंतरालों में निरंतर, सुचारू ग्लािसैंडो प्रभाव की अनुमति देता है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'A chord composed of a root, minor third, and diminished fifth is called:',
        options: ['A. Major triad', 'B. Diminished triad', 'C. Augmented triad', 'D. Suspended triad'],
        explanation: 'A diminished triad is a three-note chord consisting of a root note, a minor third, and a diminished fifth (which is a tritone above the root). This chord inherently possesses a tense, unstable acoustic quality, making it a crucial element in Western harmonic resolution.',
      },
      hindi: {
        text: 'मूल स्वर, माइनर थर्ड और डिमिनिश्ड फिफ्थ से बना कॉर्ड क्या कहलाता है?',
        options: ['A. मेजर ट्रायड', 'B. डिमिनिश्ड ट्रायड (Diminished Triad)', 'C. ऑगमेंटेड ट्रायड', 'D. सस्पेंडेड ट्रायड'],
        explanation: 'एक डिमिनिशड त्रय (ट्रायड) तीन स्वरों का एकChord है जिसमें एक मूल स्वर, एक लघु तृतीय (माइनर थर्ड) और एक कम पंचम (डिमिनिशड फिफ्थ) शामिल होता है। इस कॉर्ड में स्वाभाविक रूप से एक तनावपूर्ण, अस्थिर ध्वनिक गुणवत्ता होती है, जो इसे पश्चिमी हार्मोनिक समाधान में एक महत्वपूर्ण तत्व बनाती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'What does the musical direction "Da Capo" (D.C.) mean?',
        options: ['A. From the sign', 'B. From the beginning', 'C. To the finish', 'D. Repeat measure'],
        explanation: '"Da Capo" is an Italian musical term that translates to "from the head" or "from the beginning". It instructs the musician to return to the very start of the piece and play through to the designated ending.',
      },
      hindi: {
        text: 'संगीत निर्देश "दा कापो" (D.C.) का क्या अर्थ है?',
        options: ['A. चिन्ह से', 'B. आरंभ से (From the beginning)', 'C. अंत तक', 'D. माप दोहराएं'],
        explanation: '"डा कापो" (Da Capo) एक इतालवी संगीत निर्देश है जिसका अर्थ "सिर से" या "आरंभ से" होता है। यह संगीतकार को रचना की शुरुआत में वापस जाने और निर्धारित अंत तक बजाने का निर्देश देता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'How many strings does a standard classical concert harp typically have?',
        options: ['A. 47', 'B. 36', 'C. 52', 'D. 40'],
        explanation: 'A standard modern concert harp is a large, complex instrument typically featuring 47 strings tuned in diatonic scales across a range of six and a half octaves. These strings are manipulated using seven pedals to alter their pitch by half-steps.',
      },
      hindi: {
        text: 'एक मानक शास्त्रीय कॉन्सर्ट वीणा (Harp) में आमतौर पर कितने तार होते हैं?',
        options: ['A. 47 तार', 'B. 36 तार', 'C. 52 तार', 'D. 40 तार'],
        explanation: 'एक मानक आधुनिक कॉन्सर्ट हार्प एक बड़ा और जटिल वाद्य यंत्र है जिसमें आमतौर पर 47 तार होते हैं जो साढ़े छह सप्तकों के दायरे में डायटोनिक पैमाने पर ट्यून किए जाते हैं। इन तारों को अर्ध-स्वर बदलने के लिए सात पैडलों की सहायता से नियंत्रित किया जाता है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Which period in music history followed the Renaissance and preceded the Classical period?',
        options: ['A. Romantic', 'B. Baroque', 'C. Medieval', 'D. Modern'],
        explanation: 'The Baroque period in Western classical music lasted roughly from 1600 to 1750, occurring directly after the Renaissance and preceding the Classical era. This era is characterized by ornate musical ornamentation, the development of counterpoint, and the birth of opera.',
      },
      hindi: {
        text: 'संगीत इतिहास में पुनर्जागरण के बाद और शास्त्रीय काल से पहले कौन सा काल आया?',
        options: ['A. रोमांटिक', 'B. बारोक (Baroque)', 'C. मध्यकालीन', 'D. आधुनिक'],
        explanation: 'पश्चिमी शास्त्रीय संगीत में बारोक काल लगभग 1600 से 1750 तक रहा, जो पुनर्जागरण (Renaissance) के तुरंत बाद और शास्त्रीय युग से पहले आया था। इस काल की विशेषता अलंकृत संगीत, काउंटरपॉइंट का विकास और ओपेरा का उद्गम है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What is the time signature for a traditional waltz?',
        options: ['A. 4/4', 'B. 3/4', 'C. 2/4', 'D. 6/8'],
        explanation: 'A traditional waltz is characterized by its distinctive triple meter, universally represented by the 3/4 time signature. This means each measure contains three quarter-note beats, with a strong emphasis typically placed on the first beat.',
      },
      hindi: {
        text: 'एक पारंपरिक वॉल्ट्ज़ (Waltz) नृत्य के लिए ताल हस्ताक्षर (Time Signature) क्या है?',
        options: ['A. 4/4', 'B. 3/4', 'C. 2/4', 'D. 6/8'],
        explanation: 'पारंपरिक वाल्ट्ज (waltz) की पहचान इसकी विशिष्ट त्रिक ताल से होती है, जिसे सार्वभौमिक रूप से 3/4 समय हस्ताक्षर द्वारा दर्शाया जाता है। इसका अर्थ है कि प्रत्येक माप में तीन चौथाई-नोट बीट होते हैं, जिसमें आमतौर पर पहली बीट पर विशेष जोर दिया जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'In Indian classical music, what is the principal melodic note of a raga called?',
        options: ['A. Samvadi', 'B. Vadi', 'C. Anuvadi', 'D. Vivadi'],
        explanation: 'In Indian classical music, the "Vadi" swara is considered the most important or principal melodic note of a raga. It is the most frequently used note that defines the soul and character of the raga, often compared to a king in a court.',
      },
      hindi: {
        text: 'भारतीय शास्त्रीय संगीत में, किसी राग के सबसे प्रमुख (राजा) स्वर को क्या कहा जाता है?',
        options: ['A. संवादी', 'B. वादी', 'C. अनुवादी', 'D. विवादी'],
        explanation: 'भारतीय शास्त्रीय संगीत में, "वादी" स्वर को किसी राग का सबसे महत्वपूर्ण या प्रमुख स्वर माना जाता है। यह सबसे अधिक बार प्रयोग किया जाने वाला स्वर है जो राग की आत्मा और स्वरूप को परिभाषित करता है, और इसकी तुलना अक्सर दरबार के राजा से की जाती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    }
  ],
  Math: [
    {
      number: 1,
      english: {
        text: 'What is the value of 15% of 240?',
        options: ['A. 32', 'B. 36', 'C. 40', 'D. 30'],
        explanation: 'To find 15% of 240, convert the percentage to a fraction or decimal (15/100 or 0.15) and multiply it by 240. Multiplying 0.15 by 240 yields 36, making option B correct.',
      },
      hindi: {
        text: '240 का 15% मान क्या है?',
        options: ['A. 32', 'B. 36', 'C. 40', 'D. 30'],
        explanation: '240 का 15% ज्ञात करने के लिए, प्रतिशत को भिन्न या दशमलव (15/100 या 0.15) में बदलें और इसे 240 से गुणा करें। 0.15 को 240 से गुणा करने पर 36 प्राप्त होता है, अतः विकल्प B सही है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'What is the next prime number after 29?',
        options: ['A. 31', 'B. 33', 'C. 37', 'D. 39'],
        explanation: 'A prime number is a whole number greater than 1 whose only divisors are 1 and itself. Checking the numbers after 29, 30 is divisible by 2, and 31 has no positive divisors other than 1 and itself, making it the immediate next prime.',
      },
      hindi: {
        text: '29 के बाद अगली अभाज्य संख्या (Prime Number) कौन सी है?',
        options: ['A. 31', 'B. 33', 'C. 37', 'D. 39'],
        explanation: 'अभाज्य संख्या 1 से बड़ी एक ऐसी पूर्ण संख्या होती है जिसके केवल 1 और वह स्वयं गुणनखंड होते हैं। 29 के बाद की संख्याओं की जाँच करने पर, 30 दो से विभाज्य है, जबकि 31 का 1 और स्वयं के अलावा कोई अन्य धनात्मक गुणनखंड नहीं है, इसलिए यह अगली अभाज्य संख्या है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'If 3x + 7 = 22, what is the value of x?',
        options: ['A. 3', 'B. 5', 'C. 7', 'D. 4'],
        explanation: 'To solve the linear equation 3x + 7 = 22, subtract 7 from both sides to get 3x = 15. Then, divide by 3 to find x = 5, which satisfies the given equation.',
      },
      hindi: {
        text: 'यदि 3x + 7 = 22 है, तो x का मान क्या है?',
        options: ['A. 3', 'B. 5', 'C. 7', 'D. 4'],
        explanation: 'रैखिक समीकरण 3x + 7 = 22 को हल करने के लिए, दोनों पक्षों से 7 घटाने पर 3x = 15 प्राप्त होता है। इसके पश्चात, 3 से भाग देने पर x = 5 प्राप्त होता है, जो दी गई समीकरण को संतुष्ट करता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the sum of the interior angles of a hexagon?',
        options: ['A. 540°', 'B. 720°', 'C. 900°', 'D. 360°'],
        explanation: 'The sum of the interior angles of any n-sided polygon is given by the formula (n - 2) × 180°. For a hexagon, n = 6, so substituting this yields (6 - 2) × 180° = 4 × 180° = 720°.',
      },
      hindi: {
        text: 'एक षट्भुज (Hexagon) के आंतरिक कोणों का योग कितना होता है?',
        options: ['A. 540°', 'B. 720°', 'C. 900°', 'D. 360°'],
        explanation: 'किसी भी n भुजाओं वाले बहुभुज के अंतःकोणों का योग सूत्र (n - 2) × 180° द्वारा दिया जाता है। षдभुज (hexagon) के लिए n = 6 है, अतः इसे प्रतिस्थापित करने पर (6 - 2) × 180° = 4 × 180° = 720° प्राप्त होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'What is the square root of 144?',
        options: ['A. 11', 'B. 12', 'C. 13', 'D. 14'],
        explanation: 'The square root of a number is a value that, when multiplied by itself, gives the original number. Since 12 multiplied by 12 equals 144, the principal square root of 144 is 12.',
      },
      hindi: {
        text: '144 का वर्गमूल क्या है?',
        options: ['A. 11', 'B. 12', 'C. 13', 'D. 14'],
        explanation: 'किसी संख्या का वर्गमूल वह मान होता है जिसे स्वयं से गुणा करने पर मूल संख्या प्राप्त होती है। चूंकि 12 को 12 से गुणा करने पर 144 प्राप्त होता है, अतः 144 का मुख्य वर्गमूल 12 है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'If a triangle has sides of length 3 cm, 4 cm, and 5 cm, what type of triangle is it?',
        options: ['A. Acute triangle', 'B. Right-angled triangle', 'C. Obtuse triangle', 'D. Equilateral triangle'],
        explanation: 'The correct answer is option (B).',
      },
      hindi: {
        text: 'यदि किसी त्रिभुज की भुजाएँ 3 सेमी, 4 सेमी और 5 सेमी हैं, तो वह किस प्रकार का त्रिभुज है?',
        options: ['A. न्यूनकोण त्रिभुज', 'B. समकोण त्रिभुज', 'C. अधिककोण त्रिभुज', 'D. समबाहु त्रिभुज'],
        explanation: 'सही उत्तर विकल्प (B) है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'What is the value of 2³ × 2⁴?',
        options: ['A. 64', 'B. 128', 'C. 256', 'D. 512'],
        explanation: 'The correct answer is option (B).',
      },
      hindi: {
        text: '2³ × 2⁴ का मान क्या होगा?',
        options: ['A. 64', 'B. 128', 'C. 256', 'D. 512'],
        explanation: 'सही उत्तर विकल्प (B) है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the area of a circle with a radius of 7 cm (take π ≈ 22/7)?',
        options: ['A. 144 cm²', 'B. 154 cm²', 'C. 164 cm²', 'D. 174 cm²'],
        explanation: 'The correct answer is option (B).',
      },
      hindi: {
        text: '7 सेमी त्रिज्या वाले वृत्त का क्षेत्रफल क्या है (π ≈ 22/7 लें)?',
        options: ['A. 144 वर्ग सेमी', 'B. 154 वर्ग सेमी', 'C. 164 वर्ग सेमी', 'D. 174 वर्ग सेमी'],
        explanation: 'सही उत्तर विकल्प (B) है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What was the removed number?',
        options: ['A. 24', 'B. 26', 'C. 28', 'D. 30'],
        explanation: 'The correct answer is option (C).',
      },
      hindi: {
        text: '5 संख्याओं का औसत 20 है। यदि एक संख्या हटा दी जाए, तो औसत 18 हो जाता है। हटाई गई संख्या क्या थी?',
        options: ['A. 24', 'B. 26', 'C. 28', 'D. 30'],
        explanation: 'सही उत्तर विकल्प (C) है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'What is the slope of the line given by the equation y = 4x - 7?',
        options: ['A. -7', 'B. 4', 'C. -4', 'D. 7'],
        explanation: 'The correct answer is option (B).',
      },
      hindi: {
        text: 'समीकरण y = 4x - 7 द्वारा दी गई रेखा की ढाल (Slope) क्या है?',
        options: ['A. -7', 'B. 4', 'C. -4', 'D. 7'],
        explanation: 'सही उत्तर विकल्प (B) है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'What is the Greatest Common Divisor (GCD) of 36 and 48?',
        options: ['A. 6', 'B. 12', 'C. 18', 'D. 24'],
        explanation: 'The Greatest Common Divisor (GCD) is the largest positive integer that divides both numbers without a remainder. Prime factorization of 36 is 2² × 3² and 48 is 2⁴ × 3; multiplying the lowest powers of common prime factors (2² × 3) yields 12.',
      },
      hindi: {
        text: '36 और 48 का महत्तम समापवर्तक (HCF / GCD) क्या है?',
        options: ['A. 6', 'B. 12', 'C. 18', 'D. 24'],
        explanation: 'महत्तम समापवर्तक (GCD) वह सबसे बड़ी धनात्मक पूर्णांक संख्या है जो दोनों संख्याओं को पूरी तरह विभाजित करती है। 36 का अभाज्य गुणनखंड 2² × 3² और 48 का 2⁴ × 3 है; उभयनिष्ठ अभाज्य गुणनखंडों की न्यूनतम घातों (2² × 3) का गुणनफल 12 प्राप्त होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'If a car travels 180 km in 3 hours, what is its average speed in m/s?',
        options: ['A. 15 m/s', 'B. 16.67 m/s', 'C. 20 m/s', 'D. 25 m/s'],
        explanation: 'Average speed is calculated as total distance divided by total time, which gives 180 km / 3 h = 60 km/h. To convert km/h to m/s, multiply by 5/18, resulting in 60 × (5/18) = 16.67 m/s.',
      },
      hindi: {
        text: 'यदि एक कार 3 घंटे में 180 किमी की दूरी तय करती है, तो उसकी औसत गति मीटर/सेकंड में क्या है?',
        options: ['A. 15 m/s', 'B. 16.67 m/s', 'C. 20 m/s', 'D. 25 m/s'],
        explanation: 'औसत चाल कुल दूरी को कुल समय से विभाजित करके निकाली जाती है, जो 180 किमी / 3 घंटे = 60 किमी/घंटा है। किमी/घंटा को मीटर/सेकंड में बदलने के लिए 5/18 से गुणा करते हैं, जिससे 60 × (5/18) = 16.67 मीटर/सेकंड प्राप्त होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'What is the value of cos(60°)?',
        options: ['A. 0', 'B. 1/2', 'C. √3/2', 'D. 1'],
        explanation: 'In trigonometry, the cosine of an angle in a right-angled triangle is defined as the ratio of the adjacent side to the hypotenuse. For a standard 60-degree angle, based on trigonometric values of standard angles, cos(60°) is precisely equal to 1/2.',
      },
      hindi: {
        text: 'cos(60°) का मान क्या है?',
        options: ['A. 0', 'B. 1/2', 'C. √3/2', 'D. 1'],
        explanation: 'त्रिकोणमिति में, समकोण त्रिभुज में किसी कोण का कोसाइन (cosine) उसकी संलग्न भुजा और कर्ण का अनुपात होता है। मानक कोणों के त्रिकोणमितीय मानों के अनुसार, 60 डिग्री के कोण के लिए cos(60°) का मान ठीक 1/2 होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Solve for x: x² - 9 = 0 (where x > 0)',
        options: ['A. 1', 'B. 3', 'C. 9', 'D. 6'],
        explanation: 'The equation x² - 9 = 0 can be rearranged as x² = 9. Taking the square root on both sides gives x = ±3, and since the condition specifies x > 0, the valid solution is x = 3.',
      },
      hindi: {
        text: 'x के लिए हल करें: x² - 9 = 0 (जहाँ x > 0 है)',
        options: ['A. 1', 'B. 3', 'C. 9', 'D. 6'],
        explanation: 'समीकरण x² - 9 = 0 को x² = 9 के रूप में लिखा जा सकता है। दोनों पक्षों का वर्गमूल लेने पर x = ±3 प्राप्त होता है, और चूंकि प्रश्न में शर्त दी गई है कि x > 0 है, इसलिए इसका मान्य हल x = 3 है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'What is the sum of the first 10 positive odd integers?',
        options: ['A. 90', 'B. 100', 'C. 110', 'D. 120'],
        explanation: 'The sum of the first n positive odd integers is always given by the algebraic formula n². For the first 10 positive odd integers, the sum is simply 10² = 100.',
      },
      hindi: {
        text: 'प्रथम 10 धनात्मक विषम पूर्णांकों का योग क्या है?',
        options: ['A. 90', 'B. 100', 'C. 110', 'D. 120'],
        explanation: 'प्रथम n धनात्मक विषम पूर्णांकों का योग हमेशा बीजगणितीय सूत्र n² द्वारा दिया जाता है। प्रथम 10 धनात्मक विषम पूर्णांकों के लिए, इनका कुल योग सीधे 10² = 100 होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'A fair six-sided die is rolled. What is the probability of rolling a number greater than 4?',
        options: ['A. 1/6', 'B. 1/3', 'C. 1/2', 'D. 2/3'],
        explanation: 'A fair six-sided die has sample space {1, 2, 3, 4, 5, 6}. The numbers greater than 4 are 5 and 6, giving 2 favorable outcomes out of 6 total. Thus, the probability is 2/6, which simplifies to 1/3.',
      },
      hindi: {
        text: 'एक निष्पक्ष 6-फलकीय पासा फेंका जाता है। 4 से अधिक संख्या आने की प्रायिकता क्या है?',
        options: ['A. 1/6', 'B. 1/3', 'C. 1/2', 'D. 2/3'],
        explanation: 'एक मानक छः-मुख वाले पासे में कुल परिणाम {1, 2, 3, 4, 5, 6} होते हैं। 4 से बड़ी संख्याएँ 5 और 6 हैं, अतः अनुकूल परिणामों की संख्या 2 है और कुल परिणाम 6 हैं, जिससे प्रायिकता 2/6 अर्थात 1/3 प्राप्त होती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'What is 25% written as a simplified fraction?',
        options: ['A. 1/2', 'B. 1/4', 'C. 1/5', 'D. 2/5'],
        explanation: 'Percentage literally means \'per hundred\', so 25% is expressed as the fraction 25/100. Simplifying this fraction by dividing both the numerator and denominator by their greatest common divisor, 25, yields 1/4.',
      },
      hindi: {
        text: '25% को सरलतम भिन्न के रूप में क्या लिखा जाएगा?',
        options: ['A. 1/2', 'B. 1/4', 'C. 1/5', 'D. 2/5'],
        explanation: 'प्रतिशत का अर्थ \'प्रति सैकड़ा\' होता है, इसलिए 25% को भिन्न 25/100 के रूप में लिखा जाता है। अंश और हर दोनों को उनके महत्तम समापवर्तक (25) से विभाजित करने पर यह सरल होकर 1/4 बनता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'If the perimeter of a square is 36 cm, what is its area?',
        options: ['A. 72 cm²', 'B. 81 cm²', 'C. 64 cm²', 'D. 100 cm²'],
        explanation: 'The perimeter of a square is 4 times its side length (4s = 36), which means each side measures 9 cm. The area of a square is calculated as side squared (s²), resulting in 9² = 81 cm².',
      },
      hindi: {
        text: 'यदि एक वर्ग का परिमाप 36 सेमी है, तो उसका क्षेत्रफल क्या होगा?',
        options: ['A. 72 वर्ग सेमी', 'B. 81 वर्ग सेमी', 'C. 64 वर्ग सेमी', 'D. 100 वर्ग सेमी'],
        explanation: 'वर्ग का परिमाप उसकी भुजा की लंबाई का 4 गुना होता है (4s = 36), जिसका अर्थ है कि प्रत्येक भुजा 9 सेमी है। वर्ग का क्षेत्रफल भुजा का वर्ग (s²) होता है, जिससे 9² = 81 वर्ग सेमी प्राप्त होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What is log₁₀(1000)?',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 10'],
        explanation: 'Logarithm evaluates the power to which the base must be raised to yield a given number. Since 10 raised to the power of 3 equals 1000 (10³ = 1000), the base-10 logarithm of 1000 is 3.',
      },
      hindi: {
        text: 'log₁₀(1000) का मान क्या है?',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 10'],
        explanation: 'लघुगणक यह निर्धारित करता है कि दी गई संख्या प्राप्त करने के लिए आधार को किस घात तक बढ़ाया जाना चाहिए। चूंकि 10 की घात 3 का मान 1000 होता है (10³ = 1000), इसलिए 1000 का आधार-10 लघुगणक 3 है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'What is the product of (x + 3) and (x - 3)?',
        options: ['A. x² + 9', 'B. x² - 9', 'C. x² - 6x + 9', 'D. x² + 6x - 9'],
        explanation: 'The product of (x + 3) and (x - 3) represents the algebraic identity for the difference of squares: (a + b)(a - b) = a² - b². Applying this formula with a = x and b = 3 yields x² - 3², which simplifies to x² - 9.',
      },
      hindi: {
        text: '(x + 3) और (x - 3) का गुणनफल क्या है?',
        options: ['A. x² + 9', 'B. x² - 9', 'C. x² - 6x + 9', 'D. x² + 6x - 9'],
        explanation: '(x + 3) और (x - 3) का गुणनफल \'वर्गों के अंतर\' की बीजगणितीय सर्वसमिका (a + b)(a - b) = a² - b² को दर्शाता है। a = x और b = 3 रखने पर यह x² - 3² बनता है, जो सरल होकर x² - 9 हो जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    }
  ],
  Geography: [
    {
      number: 1,
      english: {
        text: 'What is the longest river in the world?',
        options: ['A. Amazon River', 'B. Nile River', 'C. Yangtze River', 'D. Mississippi River'],
        explanation: 'The Nile River is widely recognized as the longest river in the world, stretching approximately 6,650 kilometers through northeastern Africa. While the Amazon River has the largest water volume, the Nile holds the official record for length, flowing northward into the Mediterranean Sea.',
      },
      hindi: {
        text: 'विश्व की सबसे लंबी नदी कौन सी है?',
        options: ['A. अमेज़न नदी', 'B. नील नदी', 'C. यांग्त्ज़ी नदी', 'D. मिसिसिपी नदी'],
        explanation: 'नील नदी को विश्व की सबसे लंबी नदी के रूप में मान्यता प्राप्त है, जो उत्तर-पूर्वी अफ्रीका में लगभग 6,650 किलोमीटर तक फैली हुई है। हालांकि अमेज़न नदी का जल आयतन सबसे अधिक है, लेकिन नील नदी अपनी लंबाई के लिए आधिकारिक तौर पर जानी जाती है और उत्तर की ओर बहते हुए भूमध्य सागर में गिरती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Which is the highest mountain peak in the world?',
        options: ['A. K2 (Godwin-Austen)', 'B. Kangchenjunga', 'C. Mount Everest', 'D. Lhotse'],
        explanation: 'Mount Everest is the highest mountain peak in the world, with an official elevation of 8,848.86 meters above sea level. Located in the Himalayas on the border between Nepal and China (Tibet), it is a major focal point for mountaineers globally.',
      },
      hindi: {
        text: 'विश्व की सबसे ऊँची पर्वत चोटी कौन सी है?',
        options: ['A. K2 (गॉडविन ऑस्टिन)', 'B. कंचनजंगा', 'C. माउंट एवरेस्ट', 'D. ल्होत्से'],
        explanation: 'माउंट एवरेस्ट दुनिया की सबसे ऊंची पर्वत चोटी है, जिसकी समुद्र तल से आधिकारिक ऊंचाई 8,848.86 मीटर है। नेपाल और चीन (तिब्बत) की सीमा पर हिमालय में स्थित यह पर्वतमाला वैश्विक पर्वतारोहियों के लिए मुख्य आकर्षण का केंद्र है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Which Indian state has the longest coastline?',
        options: ['A. Maharashtra', 'B. Gujarat', 'C. Tamil Nadu', 'D. Andhra Pradesh'],
        explanation: 'Gujarat has the longest coastline among all Indian states, measuring approximately 1,600 kilometers due to its deeply indented shoreline along the Arabian Sea. This extensive maritime boundary significantly contributes to the state\'s vibrant trade, ports, and maritime economy.',
      },
      hindi: {
        text: 'भारत के किस राज्य की तटरेखा सबसे लंबी है?',
        options: ['A. महाराष्ट्र', 'B. गुजरात', 'C. तमिलनाडु', 'D. आंध्र प्रदेश'],
        explanation: 'अरब सागर के साथ अपनी कटी-फटी तटरेखा के कारण गुजरात के पास सभी भारतीय राज्यों में सबसे लंबी तटरेखा है, जिसकी लंबाई लगभग 1,600 किलोमीटर है। यह विस्तृत समुद्री सीमा राज्य के जीवंत व्यापार, बंदरगाहों और समुद्री अर्थव्यवस्था में महत्वपूर्ण योगदान देती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'The Tropic of Cancer passes through how many Indian states?',
        options: ['A. 6 states', 'B. 7 states', 'C. 8 states', 'D. 9 states'],
        explanation: 'The Tropic of Cancer (23.30° N) passes through eight Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. It divides the country into almost two climatic zones, namely tropical and subtropical.',
      },
      hindi: {
        text: 'कर्क रेखा भारत के कितने राज्यों से होकर गुजरती है?',
        options: ['A. 6 राज्य', 'B. 7 राज्य', 'C. 8 राज्य', 'D. 9 राज्य'],
        explanation: 'कर्क रेखा (23.30° उत्तर) भारत के आठ राज्यों से गुजरती है: गुजरात, राजस्थान, मध्य प्रदेश, छत्तीसगढ़, झारखंड, पश्चिम बंगाल, त्रिपुरा और मिजोरम। यह रेखा देश को लगभग दो जलवायु क्षेत्रों, उष्णकटिबंधीय और उपोष्णकटिबंधीय में विभाजित करती है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Which is the largest freshwater lake in India?',
        options: ['A. Chilika Lake', 'B. Wular Lake', 'C. Sambhar Lake', 'D. Dal Lake'],
        explanation: 'Wular Lake, located in the Bandipora district of Jammu and Kashmir, is the largest freshwater lake in India. Formed as a result of tectonic activity, it is fed primarily by the Jhelum River and plays a crucial role in the region\'s hydrographic system.',
      },
      hindi: {
        text: 'भारत की सबसे बड़ी मीठे पानी की झील कौन सी है?',
        options: ['A. चिल्का झील', 'B. वुलर झील', 'C. सांभर झील', 'D. डल झील'],
        explanation: 'जम्मू और कश्मीर के बांदीपोरा जिले में स्थित वुलर झील भारत की सबसे बड़ी मीठे पानी की झील है। टेक्टोनिक गतिविधियों के परिणामस्वरूप बनी इस झील में मुख्य रूप से झेलम नदी से पानी आता है और यह क्षेत्र की जल निकासी प्रणाली में महत्वपूर्ण भूमिका निभाती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'Which layer of the atmosphere contains the ozone layer?',
        options: ['A. Troposphere', 'B. Stratosphere', 'C. Mesosphere', 'D. Thermosphere'],
        explanation: 'The ozone layer resides primarily in the stratosphere, specifically between 15 to 50 kilometers above the Earth\'s surface. This layer is crucial for absorbing harmful ultraviolet (UV) radiation from the Sun, protecting life on Earth.',
      },
      hindi: {
        text: 'वायुमंडल की किस परत में ओजोन परत पाई जाती है?',
        options: ['A. क्षोभमंडल', 'B. समतापमंडल (Stratosphere)', 'C. मध्यमंडल', 'D. बाह्य वायुमंडल'],
        explanation: 'ओजोन परत मुख्य रूप से समताप मंडल (स्ट्रेटोस्फेयर) में पृथ्वी की सतह से लगभग 15 से 50 किलोमीटर की ऊंचाई पर पाई जाती है। यह परत सूर्य की हानिकारक पराबैंगनी (UV) विकिरण को अवशोषित करने के लिए महत्वपूर्ण है, जो पृथ्वी पर जीवन की रक्षा करती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Which strait separates India and Sri Lanka?',
        options: ['A. Malacca Strait', 'B. Palk Strait', 'C. Sunda Strait', 'D. Gibraltar Strait'],
        explanation: 'The Palk Strait connects the Bay of Bengal in the northeast with the Palk Bay and then the Gulf of Mannar in the southwest, acting as a marine boundary between India and Sri Lanka. Named after Robert Palk, a governor of Madras during the British Raj, it is a vital geographical feature for regional trade and geopolitics.',
      },
      hindi: {
        text: 'कौन सी जलडमरूमध्य भारत और श्रीलंका को अलग करती है?',
        options: ['A. मलक्का जलडमरूमध्य', 'B. पाक जलडमरूमध्य (Palk Strait)', 'C. सुंडा जलडमरूमध्य', 'D. जिब्राल्टर जलडमरूमध्य'],
        explanation: 'पाल्क जलडमरूमध्य उत्तर-पूर्व में बंगाल की खाड़ी को दक्षिण-पश्चिम में पाल्क खाड़ी और मन्नार की खाड़ी से जोड़ता है, जो भारत और श्रीलंका के बीच एक समुद्री सीमा के रूप में कार्य करता है। ब्रिटिश राज के दौरान मद्रास के गवर्नर रहे रॉबर्ट पाल्क के नाम पर इसका नाम रखा गया है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the capital city of Australia?',
        options: ['A. Sydney', 'B. Melbourne', 'C. Canberra', 'D. Brisbane'],
        explanation: 'Canberra is the federal capital city of Australia, chosen as a compromise between the rival cities of Sydney and Melbourne in 1908. It is a specially planned city located in the Australian Capital Territory (ACT) rather than being part of any single state.',
      },
      hindi: {
        text: 'ऑस्ट्रेलिया की राजधानी क्या है?',
        options: ['A. सिडनी', 'B. मेलबर्न', 'C. कैनबरा', 'D. ब्रिस्बेन'],
        explanation: 'केनबरा ऑस्ट्रेलिया की संघीय राजधानी है, जिसे 1908 में सिडनी और मेलबर्न के बीच प्रतिद्वंद्विता को समाप्त करने के लिए एक समझौते के रूप में चुना गया था। यह किसी एक राज्य का हिस्सा होने के बजाय ऑस्ट्रेलियाई राजधानी क्षेत्र (ACT) में स्थित एक नियोजित शहर है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'Which is the largest hot desert in the world?',
        options: ['A. Gobi Desert', 'B. Kalahari Desert', 'C. Sahara Desert', 'D. Thar Desert'],
        explanation: 'The Sahara Desert is the largest hot desert in the world, spanning approximately 9.2 million square kilometers across North Africa. While Antarctica and the Arctic are technically larger deserts, they are classified as cold deserts due to their low temperatures.',
      },
      hindi: {
        text: 'विश्व का सबसे बड़ा गर्म मरुस्थल कौन सा है?',
        options: ['A. गोबी मरुस्थल', 'B. कालाहारी मरुस्थल', 'C. सहारा मरुस्थल', 'D. थार मरुस्थल'],
        explanation: 'सहारा मरुस्थल दुनिया का सबसे बड़ा गर्म रेगिस्तान है, जो उत्तरी अफ्रीका में लगभग 92 लाख वर्ग किलोमीटर में फैला हुआ है। हालांकि अंटार्कटिका और आर्कटिक तकनीकी रूप से इससे बड़े रेगिस्तान हैं, लेकिन कम तापमान के कारण उन्हें ठंडे रेगिस्तान के रूप में वर्गीकृत किया जाता है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'The standard meridian of India (82°30\\',
        options: ['A. Mirzapur (Prayagraj)', 'B. Varanasi', 'C. Patna', 'D. Bhopal'],
        explanation: 'The standard meridian of India, 82°30\' E longitude, passes through Mirzapur near Prayagraj in Uttar Pradesh. This longitude determines the Indian Standard Time (IST), which is 5 hours and 30 minutes ahead of Greenwich Mean Time (GMT).',
      },
      hindi: {
        text: 'भारत की मानक मध्याह्न रेखा (82°30\\',
        options: ['A. मिर्जापुर (प्रयागराज)', 'B. वाराणसी', 'C. पटना', 'D. भोपाल'],
        explanation: 'भारत की मानक याम्योत्तर रेखा (82°30\' पूर्व देशांतर), उत्तर प्रदेश में प्रयागराज के पास मिर्ज़ापुर से गुजरती है। यह देशांतर भारतीय मानक समय (IST) निर्धारित करता है, जो ग्रीनविच मीन टाइम (GMT) से 5 घंटे 30 मिनट आगे है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Which continent is known as the "Dark Continent"?',
        options: ['A. Asia', 'B. Africa', 'C. South America', 'D. Australia'],
        explanation: 'Africa is known as the "Dark Continent" because it remained largely unexplored and unknown to Europeans until the 19th century due to its dense jungles, impenetrable terrain, and challenging interior geography. This historical moniker reflects the geographical mystery it once posed to external explorers.',
      },
      hindi: {
        text: 'किस महाद्वीप को "अंध महाद्वीप" (Dark Continent) कहा जाता है?',
        options: ['A. एशिया', 'B. अफ्रीका', 'C. दक्षिण अमेरिका', 'D. ऑस्ट्रेलिया'],
        explanation: 'अफ़्रीका को "अंध महाद्वीप" (Dark Continent) कहा जाता है क्योंकि अपने घने जंगलों, दुर्गम इलाकों और चुनौतीपूर्ण आंतरिक भूगोल के कारण यह 19वीं शताब्दी तक यूरोपीय लोगों के लिए बड़े पैमाने पर अज्ञात और अनछुआ रहा था। यह ऐतिहासिक उपमा उस भौगोलिक रहस्य को दर्शाती है जो कभी बाहरी खोजकर्ताओं के सामने था।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'Which river is known as the "Sorrow of Bihar"?',
        options: ['A. Gandak', 'B. Kosi', 'C. Son', 'D. Damodar'],
        explanation: 'The Kosi River is known as the "Sorrow of Bihar" because of its frequent and unpredictable channel shifts, which cause catastrophic floods in the region. These sudden inundations result in massive devastation to human lives, agriculture, and property every year.',
      },
      hindi: {
        text: 'किस नदी को "बिहार का शोक" कहा जाता है?',
        options: ['A. गंडक', 'B. कोसी', 'C. सोन', 'D. दामोदर'],
        explanation: 'कोसी नदी को उसके बार-बार और अप्रत्याशित मार्ग बदलने के कारण "बिहार का शोक" कहा जाता है, जिससे इस क्षेत्र में विनाशकारी बाढ़ आती है। ये अचानक आने वाली बाढ़ हर साल मानव जीवन, कृषि और संपत्ति को भारी तबाही पहुंचाती हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Which planet is known as the "Red Planet"?',
        options: ['A. Venus', 'B. Mars', 'C. Jupiter', 'D. Saturn'],
        explanation: 'Mars is known as the "Red Planet" due to the abundance of iron oxide (rust) covering its surface, which gives it a reddish appearance when viewed from space or through a telescope. It is the fourth planet from the Sun in our solar system.',
      },
      hindi: {
        text: 'किस ग्रह को "लाल ग्रह" के नाम से जाना जाता है?',
        options: ['A. शुक्र', 'B. मंगल (Mars)', 'C. बृहस्पति', 'D. शनि'],
        explanation: 'मंगल ग्रह को उसकी सतह पर प्रचुर मात्रा में मौजूद आयरन ऑक्साइड (जंग) के कारण "लाल ग्रह" कहा जाता है, जो अंतरिक्ष से या टेलीस्कोप से देखने पर इसे लाल रंग का दिखाता है। यह हमारे सौर मंडल में सूर्य से चौथा ग्रह है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Which soil is best suited for cotton cultivation in India?',
        options: ['A. Alluvial Soil', 'B. Black Soil (Regur)', 'C. Red Soil', 'D. Laterite Soil'],
        explanation: 'Black soil, also known as Regur soil, is best suited for cotton cultivation because of its high clay content, excellent moisture-retention capacity, and self-ploughing properties. It is predominantly found in the Deccan Traps region formed by volcanic activity.',
      },
      hindi: {
        text: 'भारत में कपास की खेती के लिए कौन सी मिट्टी सबसे उपयुक्त मानी जाती है?',
        options: ['A. जलोढ़ मिट्टी', 'B. काली मिट्टी (रेगुर)', 'C. लाल मिट्टी', 'D. लेटराइट मिट्टी'],
        explanation: 'काली मिट्टी, जिसे रेगुर मिट्टी भी कहा जाता है, कपास की खेती के लिए सबसे उपयुक्त है क्योंकि इसमें उच्च मृतिका (क्ले) मात्रा, उत्कृष्ट नमी-धारण क्षमता और स्वतः जुताई के गुण होते हैं। यह मुख्य रूप से दक्कन ट्रैप क्षेत्र में पाई जाती है जो ज्वालामुखी गतिविधि से बना है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'The Sundarbans delta is formed by the confluence of which rivers?',
        options: ['A. Ganga and Yamuna', 'B. Ganga and Brahmaputra', 'C. Indus and Jhelum', 'D. Godavari and Krishna'],
        explanation: 'The Sundarbans delta, the largest delta in the world, is formed by the confluence of the Ganga and Brahmaputra rivers (along with the Meghna) as they empty into the Bay of Bengal. This region is globally renowned for its vast mangrove forests and the Royal Bengal Tiger.',
      },
      hindi: {
        text: 'सुंदरबन डेल्टा किन नदियों के संगम से बनता है?',
        options: ['A. गंगा और यमुना', 'B. गंगा और ब्रह्मपुत्र', 'C. सिंधु और झेलम', 'D. गोदावरी और कृष्णा'],
        explanation: 'सुंदरबन डेल्टा, जो दुनिया का सबसे बड़ा डेल्टा है, बंगाल की खाड़ी में गिरने वाली गंगा और ब्रह्मपुत्र (मेघना के साथ) नदियों के संगम द्वारा बनता है। यह क्षेत्र अपने विशाल मैंग्रोव वनों और रॉयल बंगाल टाइगर के लिए विश्व प्रसिद्ध है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'Which country is known as the "Land of the Rising Sun"?',
        options: ['A. China', 'B. Japan', 'C. Norway', 'D. South Korea'],
        explanation: 'Japan is known as the \'Land of the Rising Sun\' because, being located in the easternmost part of Asia, it is the first major country to witness the sunrise. Historically, the country\'s own name, \'Nihon\' or \'Nippon\', translates to \'origin of the sun\'.',
      },
      hindi: {
        text: 'किस देश को "उगते सूरज की भूमि" कहा जाता है?',
        options: ['A. चीन', 'B. जापान', 'C. नॉर्वे', 'D. दक्षिण कोरिया'],
        explanation: 'जापान को \'उगते सूर्य की भूमि\' कहा जाता है क्योंकि एशिया के सबसे पूर्वी हिस्से में स्थित होने के कारण यहाँ सूर्योदय सबसे पहले दिखाई देता है। ऐतिहासिक रूप से, इस देश के अपने नाम \'निहोन\' या \'निप्पन\' का अर्थ \'सूर्य का उद्गम\' होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'What is the capital of the Indian state of Nagaland?',
        options: ['A. Kohima', 'B. Dimapur', 'C. Imphal', 'D. Aizawl'],
        explanation: 'Kohima is the capital of the northeastern Indian state of Nagaland. Established in 1963 when Nagaland attained statehood, it serves as an important administrative and cultural hub of the region.',
      },
      hindi: {
        text: 'भारतीय राज्य नागालैंड की राजधानी क्या है?',
        options: ['A. कोहिमा', 'B. दीमापुर', 'C. इंफाल', 'D. आइजोल'],
        explanation: 'कोहिमा उत्तर-पूर्वी भारतीय राज्य नागालैंड की राजधानी है। वर्ष 1963 में नागालैंड को राज्य का दर्जा मिलने के बाद इसे राजधानी बनाया गया था, और यह इस क्षेत्र का एक महत्वपूर्ण प्रशासनिक एवं सांस्कृतिक केंद्र है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Which ocean is the largest and deepest ocean on Earth?',
        options: ['A. Atlantic Ocean', 'B. Pacific Ocean', 'C. Indian Ocean', 'D. Arctic Ocean'],
        explanation: 'The Pacific Ocean is the largest and deepest oceanic division on Earth, covering more than 30% of the Earth\'s surface. It also contains the Mariana Trench, which holds the Challenger Deep, the deepest known point on the planet.',
      },
      hindi: {
        text: 'पृथ्वी पर सबसे बड़ा और सबसे गहरा महासागर कौन सा है?',
        options: ['A. अटलांटिक महासागर', 'B. प्रशांत महासागर (Pacific Ocean)', 'C. हिंद महासागर', 'D. आर्कटिक महासागर'],
        explanation: 'प्रशांत महासागर पृथ्वी का सबसे बड़ा और सबसे गहरा महासागर है, जो पृथ्वी की सतह के 30% से अधिक भाग को कवर करता है। इसमें मारियाना ट्रेंच स्थित है, जिसमें चैलेंजर दीप, यानी ग्रह का सबसे गहरा ज्ञात बिंदु शामिल है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What instrument is used to measure atmospheric pressure?',
        options: ['A. Thermometer', 'B. Barometer', 'C. Hygrometer', 'D. Anemometer'],
        explanation: 'A barometer is a scientific instrument used to measure atmospheric pressure, which helps in forecasting weather changes. Evangelista Torricelli invented the first mercury barometer in 1643, revolutionizing meteorological studies.',
      },
      hindi: {
        text: 'वायुमंडलीय दबाव मापने के लिए किस उपकरण का उपयोग किया जाता है?',
        options: ['A. थर्मामीटर', 'B. बैरोमीटर (Barometer)', 'C. हाइग्रोमीटर', 'D. एनीमोमीटर'],
        explanation: 'बैरोमीटर एक वैज्ञानिक उपकरण है जिसका उपयोग वायुमंडलीय दबाव को मापने के लिए किया जाता है, जो मौसम में बदलाव का पूर्वानुमान लगाने में मदद करता है। इवेंजेलिस्टा टॉरीसिल्ली ने 1643 में पहले मरकरी बैरोमीटर का आविष्कार किया था, जिसने मौसम संबंधी अध्ययनों में क्रांति ला दी।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'The Kaziranga National Park in Assam is famous for which animal?',
        options: ['A. Royal Bengal Tiger', 'B. One-horned Rhinoceros', 'C. Asiatic Lion', 'D. Snow Leopard'],
        explanation: 'Kaziranga National Park in Assam is globally renowned for hosting two-thirds of the world\'s great Indian one-horned rhinoceros population. Designated as a UNESCO World Heritage Site, it is a monumental success story in wildlife conservation.',
      },
      hindi: {
        text: 'असम का काजीरंगा राष्ट्रीय उद्यान किस पशु के लिए प्रसिद्ध है?',
        options: ['A. रॉयल बंगाल टाइगर', 'B. एक सींग वाला गैंडा', 'C. एशियाई शेर', 'D. हिम तेंदुआ'],
        explanation: 'असम का काजीरंगा राष्ट्रीय उद्यान दुनिया के दो-तिहाई महान भारतीय एक सींग वाले गैंडों की आबादी का संरक्षण करने के लिए विश्व प्रसिद्ध है। यूनेस्को की विश्व धरोहर स्थल के रूप में नामित, यह वन्यजीव संरक्षण में एक ऐतिहासिक सफलता की कहानी है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    }
  ],
  Science: [
    {
      number: 1,
      english: {
        text: 'What is the chemical formula for water?',
        options: ['A. CO₂', 'B. H₂O', 'C. O₂', 'D. NaCl'],
        explanation: 'The correct answer is B because water is a chemical compound consisting of two hydrogen atoms bonded to one oxygen atom. This fundamental molecular structure is universally represented by the chemical formula H₂O.',
      },
      hindi: {
        text: 'जल का रासायनिक सूत्र क्या है?',
        options: ['A. CO₂', 'B. H₂O', 'C. O₂', 'D. NaCl'],
        explanation: 'सही उत्तर B है क्योंकि जल एक रासायनिक यौगिक है जो एक ऑक्सीजन परमाणु से जुड़े दो हाइड्रोजन परमाणुओं से मिलकर बनता है। इस मूलभूत आणविक संरचना को रासायनिक सूत्र H₂O द्वारा व्यक्त किया जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Which gas is most abundant in the Earth\\',
        options: ['A. Oxygen', 'B. Nitrogen', 'C. Carbon Dioxide', 'D. Argon'],
        explanation: 'The correct answer is B because nitrogen comprises approximately 78% of the Earth\'s atmosphere, making it the most abundant gas. It plays a crucial role in maintaining atmospheric pressure and is essential for plant growth.',
      },
      hindi: {
        text: 'पृथ्वी के वायुमंडल में सबसे अधिक प्रचुर मात्रा में कौन सी गैस है?',
        options: ['A. ऑक्सीजन', 'B. नाइट्रोजन (लगभग 78%)', 'C. कार्बन डाइऑक्साइड', 'D. आर्गन'],
        explanation: 'सही उत्तर B है क्योंकि नाइट्रोजन पृथ्वी के वायुमंडल का लगभग 78% हिस्सा है, जो इसे सबसे प्रचुर मात्रा में पाई जाने वाली गैस बनाता है। यह वायुमंडलीय दबाव बनाए रखने में महत्वपूर्ण भूमिका निभाता है और पौधों की वृद्धि के लिए आवश्यक है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'What is the powerhouse of the cell?',
        options: ['A. Nucleus', 'B. Mitochondria', 'C. Ribosome', 'D. Endoplasmic reticulum'],
        explanation: 'The correct answer is B because mitochondria generate most of the chemical energy needed to power the cell\'s biochemical reactions through adenosine triphosphate (ATP) production. Hence, they are universally termed the powerhouse of the cell.',
      },
      hindi: {
        text: 'कोशिका का पावरहाउस (ऊर्जा घर) किसे कहा जाता है?',
        options: ['A. केंद्रक', 'B. माइटोकॉन्ड्रिया (Mitochondria)', 'C. राइबोसोम', 'D. एंडोप्लाज्मिक रेटिकुलम'],
        explanation: 'सही उत्तर B है क्योंकि माइटोकॉन्ड्रिया एडिनोसिन ट्राइफॉस्फेट (ATP) के उत्पादन के माध्यम से कोशिका की जैव रासायनिक प्रतिक्रियाओं को संचालित करने के लिए आवश्यक अधिकांश रासायनिक ऊर्जा उत्पन्न करता है। इसलिए, इन्हें कोशिका का ऊर्जा गृह कहा जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the speed of light in vacuum approximately?',
        options: ['A. 3 × 10⁶ m/s', 'B. 3 × 10⁸ m/s', 'C. 3 × 10¹⁰ m/s', 'D. 3 × 10⁴ m/s'],
        explanation: 'The correct answer is B because the speed of light in a vacuum is a fundamental physical constant denoted as \'c\', approximately equal to 3 × 10⁸ meters per second. This value is crucial in various calculations in physics and astrophysics.',
      },
      hindi: {
        text: 'निर्वात में प्रकाश की चाल लगभग कितनी होती है?',
        options: ['A. 3 × 10⁶ m/s', 'B. 3 × 10⁸ m/s', 'C. 3 × 10¹⁰ m/s', 'D. 3 × 10⁴ m/s'],
        explanation: 'सही उत्तर B है क्योंकि निर्वात में प्रकाश की गति एक मूलभूत भौतिक नियतांक है जिसे \'c\' द्वारा दर्शाया जाता है, जिसका मान लगभग 3 × 10⁸ मीटर प्रति सेकंड होता है। यह मान भौतिकी और खगोलीय भौतिकी की विभिन्न गणनाओं में अत्यधिक महत्वपूर्ण है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Which vitamin is synthesized in the human body upon exposure to sunlight?',
        options: ['A. Vitamin A', 'B. Vitamin C', 'C. Vitamin D', 'D. Vitamin K'],
        explanation: 'The correct answer is C because ultraviolet B (UV-B) rays from sunlight interact with 7-dehydrocholesterol in the skin to synthesize Vitamin D. This vitamin is essential for calcium absorption and overall bone health.',
      },
      hindi: {
        text: 'सूर्य के प्रकाश के संपर्क में आने पर मानव शरीर में कौन सा विटामिन संश्लेषित होता है?',
        options: ['A. विटामिन A', 'B. विटामिन C', 'C. विटामिन D', 'D. विटामिन K'],
        explanation: 'सही उत्तर C है क्योंकि सूर्य के प्रकाश की पराबैंगनी बी (UV-B) किरणें त्वचा में मौजूद 7-डिडहाइड्रोकोलेस्ट्रॉल के साथ प्रतिक्रिया करके विटामिन D का संश्लेषण करती हैं। यह विटामिन कैल्शियम के अवशोषण और समग्र हड्डियों के स्वास्थ्य के लिए आवश्यक है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'What is the SI unit of electric current?',
        options: ['A. Volt', 'B. Ampere', 'C. Ohm', 'D. Watt'],
        explanation: 'The SI unit of electric current is the Ampere (named after French physicist André-Marie Ampère), which measures the flow rate of electric charge per second. Other units listed measure different electrical quantities: Volt for potential difference, Ohm for resistance, and Watt for power.',
      },
      hindi: {
        text: 'विद्युत धारा की SI इकाई क्या है?',
        options: ['A. वोल्ट', 'B. एम्पीयर (Ampere)', 'C. ओम', 'D. वाट'],
        explanation: 'विद्युत धारा (electric current) की एसआई इकाई एम्पीयर है, जो प्रति सेकंड विद्युत आवेश के प्रवाह की दर को मापती है। विकल्पों में अन्य इकाइयाँ अलग-अलग भौतिक राशियों को मापती हैं: वोल्ट विभवांतर के लिए, ओम प्रतिरोध के लिए और वाट शक्ति के लिए।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Which blood group is known as the "Universal Donor"?',
        options: ['A. AB positive', 'B. O negative', 'C. A positive', 'D. B negative'],
        explanation: 'Blood group O negative is known as the universal donor because red blood cells from this group lack major antigens (A, B, and Rh), minimizing the risk of transfusion reactions in recipients of any blood type. This makes O negative blood critically important for emergency medical situations.',
      },
      hindi: {
        text: 'किस रक्त समूह को "सर्वदाता" (Universal Donor) कहा जाता है?',
        options: ['A. AB पॉजिटिव', 'B. O नेगेटिव', 'C. A पॉजिटिव', 'D. B नेगेटिव'],
        explanation: 'रक्त समूह O नेगेटिव को \'सर्वदाता\' (Universal Donor) कहा जाता है क्योंकि इसकी लाल रक्त कोशिकाओं में प्रमुख एंटीजन (A, B और Rh) नहीं होते हैं, जिससे किसी भी रक्त समूह के प्राप्तकर्ता में संक्रमण या प्रतिक्रिया का जोखिम न्यूनतम हो जाता है। यह आपातकालीन चिकित्सा स्थितियों में अत्यधिक महत्वपूर्ण है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the pH value of pure distilled water at 25°C?',
        options: ['A. 5.5', 'B. 7.0', 'C. 8.5', 'D. 1.0'],
        explanation: 'Pure distilled water at 25°C has a neutral pH of 7.0, indicating an equal balance of hydrogen ions (H⁺) and hydroxide ions (OH⁻). A pH below 7 is acidic, while a value above 7 is basic or alkaline.',
      },
      hindi: {
        text: '25°C पर शुद्ध आसुत जल का pH मान कितना होता है?',
        options: ['A. 5.5', 'B. 7.0 (उदासीन)', 'C. 8.5', 'D. 1.0'],
        explanation: '25°C तापमान पर शुद्ध आंसित जल (pure distilled water) का पीएच मान 7.0 होता है, जो हाइड्रोजन आयनों (H⁺) और हाइड्रॉक्साइड आयनों (OH⁻) के संतुलन को दर्शाता है। 7 से कम पीएच मान अम्लीय और 7 से अधिक मान क्षारीय होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'Which element has the chemical symbol "Fe"?',
        options: ['A. Fluorine', 'B. Iron', 'C. Francium', 'D. Lead'],
        explanation: 'The chemical symbol "Fe" stands for Iron, which is derived from its Latin name "ferrum". Iron is a transition metal essential for various biological and industrial applications, including the formation of hemoglobin in human blood.',
      },
      hindi: {
        text: 'रासायनिक प्रतीक "Fe" किस तत्व का प्रतिनिधित्व करता है?',
        options: ['A. फ्लोरीन', 'B. लोहा (Iron)', 'C. फ्रांसियम', 'D. सीसा'],
        explanation: 'रासायनिक प्रतीक "Fe" आयरन (लोहा) के लिए प्रयुक्त होता है, जिसकी उत्पत्ति इसके लैटिन नाम "फेर्रम" (ferrum) से हुई है। आयरन एक संक्रमण धातु है जो मानव रक्त में हीमोग्लोबिन के निर्माण सहित विभिन्न जैविक और औद्योगिक अनुप्रयोगों के लिए आवश्यक है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'What is the hardest naturally occurring substance on Earth?',
        options: ['A. Graphene', 'B. Diamond', 'C. Platinum', 'D. Quartz'],
        explanation: 'Diamond is the hardest naturally occurring substance on Earth, measuring 10 on the Mohs scale of mineral hardness. This exceptional hardness is due to its rigid crystal lattice structure, where carbon atoms are strongly bonded together via covalent bonds.',
      },
      hindi: {
        text: 'पृथ्वी पर प्राकृतिक रूप से पाया जाने वाला सबसे कठोर पदार्थ कौन सा है?',
        options: ['A. ग्राफीन', 'B. हीरा (Diamond)', 'C. प्लैटिनम', 'D. क्वार्ट्ज'],
        explanation: 'हीरा (Diamond) पृथ्वी पर पाया जाने वाला सबसे कठोर प्राकृतिक पदार्थ है, जो मोह्स कठोरता पैमान पर 10 अंक पर है। इसकी यह असाधारण कठोरता इसकी त्रि-आयामी क्रिस्टल जालक संरचना के कारण है, जिसमें कार्बन परमाणु सहसंयोजक बंधों द्वारा मजबूती से जुड़े होते हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Which law states that "For every action, there is an equal and opposite reaction"?',
        options: ['A. Newton\\', ', ', 's Second Law', 'C. Newton\\', ', '],
        explanation: 'Newton\'s Third Law of Motion states that when two bodies interact, they apply forces to one another that are equal in magnitude and opposite in direction. This fundamental principle explains phenomena ranging from rocket propulsion to walking on the ground.',
      },
      hindi: {
        text: '"प्रत्येक क्रिया के बराबर और विपरीत प्रतिक्रिया होती है" यह न्यूटन का कौन सा नियम है?',
        options: ['A. प्रथम नियम', 'B. द्वितीय नियम', 'C. तृतीय नियम (Newton\\', ', '],
        explanation: 'न्यूटन की गति का तीसरा नियम यह बताता है कि जब दो पिंड परस्पर क्रिया करते हैं, तो वे एक-दूसरे पर परिमाण में समान और दिशा में विपरीत बल लगाते हैं। यह मौलिक सिद्धांत रॉकेट की गति से लेकर जमीन पर चलने तक की कई घटनाओं को स्पष्ट करता है।',
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'What pigment gives plants their green color and enables photosynthesis?',
        options: ['A. Carotenoid', 'B. Chlorophyll', 'C. Melanin', 'D. Anthocyanin'],
        explanation: 'Chlorophyll is the primary photosynthetic pigment found in chloroplasts of plants, absorbing light energy primarily in the blue and red regions while reflecting green light. This pigment is essential for converting light energy into chemical energy during photosynthesis.',
      },
      hindi: {
        text: 'पौधों को हरा रंग देने और प्रकाश संश्लेषण में सहायक वर्णक कौन सा है?',
        options: ['A. कैरोटीनॉयड', 'B. क्लोरोफिल (पर्णहरित)', 'C. मेलेनिन', 'D. एंथोसायनिन'],
        explanation: 'क्लोरोफิล पौधों के क्लोरोप्लास्ट में पाया जाने वाला प्रमुख प्रकाश संश्लेषी वर्णक है, जो मुख्य रूप से नीلي और लाल क्षेत्रों में प्रकाश ऊर्जा को अवशोषित करता है और हरे रंग को परावर्तित करता है। यह वर्णक प्रकाश संश्लेषण के दौरान प्रकाश ऊर्जा को रासायनिक ऊर्जा में बदलने के लिए अनिवार्य है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'What is the main component of natural gas?',
        options: ['A. Ethane', 'B. Methane', 'C. Propane', 'D. Butane'],
        explanation: 'Methane (CH4) is the primary constituent of natural gas, typically accounting for 70% to 90% of its total composition. As the simplest alkane, it serves as an extremely important clean-burning fossil fuel for electricity generation and heating.',
      },
      hindi: {
        text: 'प्राकृतिक गैस का मुख्य घटक क्या है?',
        options: ['A. एथेन', 'B. मीथेन (CH₄)', 'C. प्रोपेन', 'D. ब्यूटेन'],
        explanation: 'मीथेन (CH4) प्राकृतिक गैस का मुख्य घटक है, जो सामान्यतः इसकी कुल संरचना का 70% से 90% हिस्सा होता है। सबसे सरल एल्केन के रूप में, यह विद्युत उत्पादन और तापन के लिए एक अत्यंत महत्वपूर्ण स्वच्छ रूप से जलने वाला जीवाश्म ईंधन है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Which organ in the human body produces insulin?',
        options: ['A. Liver', 'B. Pancreas', 'C. Kidney', 'D. Gallbladder'],
        explanation: 'The pancreas contains specialized clusters of cells known as the Islets of Langerhans, where beta cells synthesize and secrete the hormone insulin. Insulin plays a critical role in regulating blood glucose levels by facilitating the uptake of glucose into body cells.',
      },
      hindi: {
        text: 'मानव शरीर में इंसुलिन का उत्पादन किस अंग द्वारा किया जाता है?',
        options: ['A. यकृत', 'B. अग्न्याशय (Pancreas)', 'C. वृक्क (किडनी)', 'D. पित्ताशय'],
        explanation: 'अग्नाशय में लैंगरहैंस की द्वीपिकाएँ (Islets of Langerhans) नामक विशेष कोशिका समूह होते हैं, जहाँ बीटा कोशिकाएँ इंसुलिन हार्मोन का संश्लेषण और स्राव करती हैं। इंसुलिन शरीर की कोशिकाओं में ग्लूकोज के प्रवेश को सुगम बनाकर रक्त शर्करा के स्तर को नियंत्रित करने में महत्वपूर्ण भूमिका निभाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'Sound waves cannot travel through which of the following?',
        options: ['A. Solids', 'B. Liquids', 'C. Gases', 'D. Vacuum'],
        explanation: 'Sound waves are mechanical waves that require a material medium—such as solids, liquids, or gases—for their propagation through particle vibration. Because a vacuum is completely devoid of matter, sound waves cannot travel through it.',
      },
      hindi: {
        text: 'ध्वनि तरंगें निम्नलिखित में से किसमें से गमन नहीं कर सकती हैं?',
        options: ['A. ठोस', 'B. द्रव', 'C. गैस', 'D. निर्वात (Vacuum)'],
        explanation: 'ध्वनि तरंगें यांत्रिक तरंगें होती हैं जिनके संचरण के लिए कणों के कंपन हेतु ठोस, द्रव या गैस जैसे किसी भौतिक माध्यम की आवश्यकता होती है। चूँकि निर्वात में कोई पदार्थ नहीं होता है, इसलिए ध्वनि तरंगें इसमें गमन नहीं कर सकती हैं।',
      },
      correctAnswer: 'D',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'What is the atomic number of Carbon?',
        options: ['A. 4', 'B. 6', 'C. 8', 'D. 12'],
        explanation: 'Carbon has an atomic number of 6, meaning it contains 6 protons in its nucleus. It is a fundamental element in organic chemistry and is situated in group 14 of the periodic table.',
      },
      hindi: {
        text: 'कार्बन की परमाणु संख्या (Atomic Number) क्या है?',
        options: ['A. 4', 'B. 6', 'C. 8', 'D. 12'],
        explanation: 'कार्बन की परमाणु संख्या 6 होती है, जिसका अर्थ है कि इसके नाभिक में 6 प्रोटॉन होते हैं। यह कार्बनिक रसायन विज्ञान में एक मौलिक तत्व है और आवर्त सारणी के समूह 14 में स्थित है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Which instrument is used to measure heartbeats and internal bodily sounds?',
        options: ['A. Sphygmomanometer', 'B. Stethoscope', 'C. Endoscope', 'D. ECG'],
        explanation: 'A stethoscope is a medical acoustic device used for auscultation, or listening to internal sounds of the human body like heartbeats and lungs. It was invented in France in 1816 by René Laënnec.',
      },
      hindi: {
        text: 'हृदय की धड़कन और आंतरिक शारीरिक ध्वनियों को सुनने के लिए किस उपकरण का उपयोग किया जाता है?',
        options: ['A. स्फिग्मोमैनोमीटर', 'B. स्टेथोस्कोप (Stethoscope)', 'C. एंडोस्कोप', 'D. ईसीजी'],
        explanation: 'स्टेथोस्कोप एक चिकित्सीय श्रवण उपकरण है जिसका उपयोग हृदय की धड़कन और फेफड़ों जैसी शरीर की आंतरिक ध्वनियों को सुनने के लिए किया जाता है। इसका आविष्कार 1816 में फ्रांस में रेने लाेनेक ने किया था।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Dry ice is the solid form of which chemical compound?',
        options: ['A. Nitrogen', 'B. Carbon Dioxide', 'C. Hydrogen', 'D. Methane'],
        explanation: 'Dry ice is the solid form of carbon dioxide (CO2), commonly used as a cooling agent due to its low temperature of -78.5 degrees Celsius. It sublimes directly from a solid to a gas without melting into a liquid.',
      },
      hindi: {
        text: 'सूखी बर्फ (Dry Ice) किस रासायनिक यौगिक का ठोस रूप है?',
        options: ['A. नाइट्रोजन', 'B. कार्बन डाइऑक्साइड (CO₂)', 'C. हाइड्रोजन', 'D. मीथेन'],
        explanation: 'शुष्क बर्फ (ड्राई आइस) कार्बन डाइऑक्साइड (CO2) का ठोस रूप है, जिसका उपयोग -78.5 डिग्री सेल्सियस के कम तापमान के कारण शीतलन एजेंट के रूप में किया जाता है। यह बिना द्रव में बदले सीधे ठोस से गैस में परिवर्तित हो जाती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'Which part of the human eye controls the amount of light entering the eye?',
        options: ['A. Cornea', 'B. Iris', 'C. Retina', 'D. Lens'],
        explanation: 'The iris is the colored, muscular part of the eye that regulates the size of the pupil to control the amount of light entering the eye. In bright light, it contracts the pupil, and in dim light, it dilates it.',
      },
      hindi: {
        text: 'मानव आँख का कौन सा भाग आँख में प्रवेश करने वाले प्रकाश की मात्रा को नियंत्रित करता है?',
        options: ['A. कॉर्निया', 'B. आइरिस (परितारिका)', 'C. रेटिना', 'D. लेंस'],
        explanation: 'आयरिश आँख का रंगीन, पेशीय भाग है जो आँख में प्रवेश करने वाले प्रकाश की मात्रा को नियंत्रित करने के लिए पुतली के आकार को नियमित करता है। तीव्र प्रकाश में यह पुतली को सिकोड़ता है और मंद प्रकाश में इसे फैलाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'What type of lens is used to correct myopia (nearsightedness)?',
        options: ['A. Convex lens', 'B. Concave lens', 'C. Cylindrical lens', 'D. Bifocal lens'],
        explanation: 'Myopia, or nearsightedness, is a vision condition where distant objects appear blurred because light focuses in front of the retina. A concave lens diverges incoming light rays, properly focusing them onto the retina.',
      },
      hindi: {
        text: 'निकट दृष्टि दोष (मायोपिया) को ठीक करने के लिए किस प्रकार के लेंस का उपयोग किया जाता है?',
        options: ['A. उत्तल लेंस', 'B. अवतल लेंस (Concave Lens)', 'C. बेलनाकार लेंस', 'D. द्विफोकसी लेंस'],
        explanation: 'निकट दृष्टि दोष (मायोपिया) एक ऐसी दृष्टि स्थिति है जिसमें दूर की वस्तुएं धुंधली दिखाई देती हैं क्योंकि प्रकाश रेटिना के सामने केंद्रित होता है। एक अवतल लेंस आने वाली प्रकाश किरणों को अपसृत करता है, जिससे वे ठीक प्रकार से रेटिना पर केंद्रित हो जाती हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    }
  ],
  English: [
    {
      number: 1,
      english: {
        text: 'Choose the correct synonym for "ABUNDANT":',
        options: ['A. Scarce', 'B. Plentiful', 'C. Limited', 'D. Rare'],
        explanation: 'The correct answer is Plentiful because \'abundant\' means existing or available in large quantities. Options A, C, and D all represent scarcity or insufficiency, making them antonyms rather than synonyms.',
      },
      hindi: {
        text: '"ABUNDANT" (प्रचुर) के लिए सही समानार्थी शब्द चुनें:',
        options: ['A. Scarce (दुर्लभ)', 'B. Plentiful (प्रचुर/भरपूर)', 'C. Limited (सीमित)', 'D. Rare (अनोखा)'],
        explanation: 'सही उत्तर \'Plentiful\' है क्योंकि \'abundant\' का अर्थ प्रचुर मात्रा में होना है। विकल्प A, C और D सभी कमी या अपर्याप्तता को दर्शाते हैं, जो इसके पर्यायवाची के बजाय विलोम शब्द हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Choose the correct antonym for "CANDID":',
        options: ['A. Frank', 'B. Dishonest', 'C. Sincere', 'D. Truthful'],
        explanation: 'The correct answer is Dishonest because \'candid\' means truthful, frank, and straightforward. \'Dishonest\' serves as its direct antonym, while Frank, Sincere, and Truthful are synonyms.',
      },
      hindi: {
        text: '"CANDID" (निष्कपट/स्पष्टवादी) के लिए सही विलोम शब्द चुनें:',
        options: ['A. Frank (स्पष्ट)', 'B. Dishonest (कपटी/बेईमान)', 'C. Sincere (सच्चा)', 'D. Truthful (सत्यप्रिय)'],
        explanation: 'सही उत्तर \'Dishonest\' है क्योंकि \'candid\' का अर्थ सच्चा, स्पष्टवादी और सीधा होता है। \'Dishonest\' इसका सीधा विलोम है, जबकि Frank, Sincere और Truthful इसके पर्यायवाची हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Identify the part of speech of the underlined word: "She sings BEAUTIFULLY."',
        options: ['A. Adjective', 'B. Adverb', 'C. Noun', 'D. Conjunction'],
        explanation: 'The correct answer is Adverb because \'beautifully\' modifies the verb \'sings\' by describing the manner of the action. In English grammar, words that modify verbs, adjectives, or other adverbs are classified as adverbs.',
      },
      hindi: {
        text: 'रेखांकित शब्द का शब्द भेद (Part of Speech) पहचानें: "She sings BEAUTIFULLY."',
        options: ['A. Adjective (विशेषण)', 'B. Adverb (क्रिया विशेषण)', 'C. Noun (संज्ञा)', 'D. Conjunction (समुच्चयबोधक)'],
        explanation: 'सही उत्तर \'Adverb\' (क्रिया-विशेषण) है क्योंकि \'beautifully\' क्रिया \'sings\' की विशेषता बता रहा है। अंग्रेजी व्याकरण में जो शब्द क्रिया, विशेषण या अन्य क्रिया-विशेषण की विशेषता बताते हैं, उन्हें क्रिया-विशेषण कहा जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the meaning of the idiom "A piece of cake"?',
        options: ['A. Very difficult task', 'B. Very easy task', 'C. A delicious sweet', 'D. An unexpected gift'],
        explanation: 'The correct answer is \'Very easy task\' because the idiom \'a piece of cake\' is used figuratively to describe something that is very simple to accomplish. This idiom originates from the ease of eating a slice of cake.',
      },
      hindi: {
        text: 'मुहावरे "A piece of cake" का क्या अर्थ है?',
        options: ['A. बहुत कठिन कार्य', 'B. बहुत आसान कार्य (Very easy task)', 'C. स्वादिष्ट मिठाई', 'D. अप्रत्याशित उपहार'],
        explanation: 'सही उत्तर \'Very easy task\' है क्योंकि मुहावरे \'a piece of cake\' का प्रयोग रूपक के रूप में किसी ऐसे कार्य को दर्शाने के लिए किया जाता है जो करने में अत्यंत सरल हो।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Fill in the blank: "He has been living in London _____ 2018."',
        options: ['A. for', 'B. since', 'C. from', 'D. by'],
        explanation: 'The correct answer is \'since\' because it is used with the present perfect continuous tense to denote a specific point in time (2018). \'For\' is used for a duration of time, making \'since\' grammatically accurate here.',
      },
      hindi: {
        text: 'रिक्त स्थान भरें: "He has been living in London _____ 2018."',
        options: ['A. for', 'B. since', 'C. from', 'D. by'],
        explanation: 'सही उत्तर \'since\' है क्योंकि इसका प्रयोग प्रेजेंट परफेक्ट कंटीन्यूअस टेंस में समय के एक निश्चित बिंदु (2018) को दर्शाने के लिए किया जाता है। \'for\' का प्रयोग समय की अवधि के लिए होता है, इसलिए यहाँ \'since\' व्याकरणिक रूप से सही है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'Choose the correctly spelt word:',
        options: ['A. Accomodate', 'B. Accommodate', 'C. Acommodate', 'D. Acomodate'],
        explanation: 'The correct spelling is \'Accommodate\', which contains double \'c\' and double \'m\'. It is a commonly tested spelling in competitive exams due to its confusing structure.',
      },
      hindi: {
        text: 'सही वर्तनी (Spelling) वाला शब्द चुनें:',
        options: ['A. Accomodate', 'B. Accommodate', 'C. Acommodate', 'D. Acomodate'],
        explanation: 'सही वर्तनी \'Accommodate\' है, जिसमें दो बार \'c\' और दो बार \'m\' आता है। अपनी भ्रमित करने वाली संरचना के कारण प्रतियोगी परीक्षाओं में यह एक सामान्य रूप से पूछी जाने वाली वर्तनी है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'What is the plural form of the word "Phenomenon"?',
        options: ['A. Phenomenons', 'B. Phenomena', 'C. Phenomenas', 'D. Phenomeni'],
        explanation: 'The plural of \'Phenomenon\' is \'Phenomena\' because words ending in \'-on\' of Greek origin typically form their plural by changing the ending to \'-a\'. This follows standard classical English grammar rules.',
      },
      hindi: {
        text: '"Phenomenon" (घटना) का बहुवचन (Plural) रूप क्या है?',
        options: ['A. Phenomenons', 'B. Phenomena', 'C. Phenomenas', 'D. Phenomeni'],
        explanation: '\'Phenomenon\' का बहुवचन \'Phenomena\' है क्योंकि ग्रीक मूल के जो शब्द \'-on\' पर समाप्त होते हैं, वे आमतौर पर अंत में \'-a\' जोड़कर अपना बहुवचन बनाते हैं। यह मानक शास्त्रीय अंग्रेजी व्याकरण के नियमों का पालन करता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'Convert into Passive Voice: "The teacher praised the boy."',
        options: ['A. The boy praised the teacher.', 'B. The boy was praised by the teacher.', 'C. The boy is praised by the teacher.', 'D. The teacher was praised by the boy.'],
        explanation: 'In the active voice sentence \'The teacher praised the boy\' (Simple Past Tense), the object \'the boy\' becomes the subject in the passive voice, followed by \'was praised by\' and the original subject. Thus, \'The boy was praised by the teacher\' is grammatically correct.',
      },
      hindi: {
        text: 'कर्मवाच्य (Passive Voice) में बदलें: "The teacher praised the boy."',
        options: ['A. The boy praised the teacher.', 'B. The boy was praised by the teacher.', 'C. The boy is praised by the teacher.', 'D. The teacher was praised by the boy.'],
        explanation: 'कृत्य वाच्य (active voice) के वाक्य \'The teacher praised the boy\' (साधारण भूतकाल) में, कर्म \'the boy\' कर्मवाच्य में कर्ता बन जाता है, जिसके बाद \'was praised by\' और मूल कर्ता आता है। अतः \'The boy was praised by the teacher\' व्याकरण की दृष्टि से सही है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'What is a one-word substitution for "A person who loves books"?',
        options: ['A. Philanthropist', 'B. Bibliophile', 'C. Polyglot', 'D. Biographer'],
        explanation: 'A \'Bibliophile\' is a person who loves or collects books, derived from the Greek roots \'biblio\' (book) and \'phile\' (loving). Other options like philanthropist and polyglot refer to a lover of mankind and a speaker of many languages, respectively.',
      },
      hindi: {
        text: '"पुस्तकों से प्रेम करने वाला व्यक्ति" (A person who loves books) के लिए एक शब्द क्या है?',
        options: ['A. Philanthropist', 'B. Bibliophile (पुस्तकपोषी)', 'C. Polyglot', 'D. Biographer'],
        explanation: '\'Bibliophile\' वह व्यक्ति है जो पुस्तकों से प्रेम करता है या उनका संग्रह करता है, जिसकी व्युत्पत्ति ग्रीक मूल \'biblio\' (पुस्तकों) और \'phile\' (प्रेमी) से हुई है। परोपकारी और बहुभाषी जैसे अन्य विकल्प क्रमशः मानवता के प्रेमी और कई भाषाएं बोलने वाले को दर्शाते हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'Fill in the blank with the appropriate article: "Copper is _____ useful metal."',
        options: ['A. an', 'B. a', 'C. the', 'D. no article'],
        explanation: 'The correct article is \'a\' because the word \'useful\' begins with a consonant sound (\'yoo-zful\'), even though it starts with a vowel letter \'u\'. Indefinite articles are chosen based on phonetic pronunciation rather than spelling.',
      },
      hindi: {
        text: 'उचित आर्टिकल (Article) से रिक्त स्थान भरें: "Copper is _____ useful metal."',
        options: ['A. an', 'B. a (क्योंकि useful का उच्चारण य से होता है)', 'C. the', 'D. कोई आर्टिकल नहीं'],
        explanation: 'सही आर्टिकल \'a\' है क्योंकि \'useful\' शब्द की शुरुआत एक व्यंजन ध्वनि (\'yoo-zful\') से होती है, भले ही इसकी शुरुआत स्वर अक्षर \'u\' से होती है। अनिश्चित आर्टिकल (indefinite articles) का चयन वर्तनी के बजाय ध्वन्यात्मक उच्चारण के आधार पर किया जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Choose the correct synonym for "OBSTINATE":',
        options: ['A. Flexible', 'B. Stubborn', 'C. Docile', 'D. Yielding'],
        explanation: '"Obstinate" means stubbornly refusing to change one\'s opinion or chosen course of action, which makes "stubborn" its exact synonym. Words like flexible, docile, and yielding represent the opposite traits of adaptability and compliance.',
      },
      hindi: {
        text: '"OBSTINATE" (जिद्दी/हठी) का सही पर्यायवाची शब्द क्या है?',
        options: ['A. Flexible', 'B. Stubborn (हठी/जिद्दी)', 'C. Docile', 'D. Yielding'],
        explanation: '"Obstinate" का अर्थ जिद्दी या अड-ियल होता है, जिसका सही पर्यायवाची "stubborn" है। \'Flexible\', \'docile\' और \'yielding\' इसके विपरीत गुणों को दर्शाते हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'Identify the figure of speech in "The wind whispered through the dark trees."',
        options: ['A. Simile', 'B. Personification', 'C. Hyperbole', 'D. Metaphor'],
        explanation: 'Personification is a figure of speech where non-human things are endowed with human characteristics. Here, the wind is described as "whispering," an action typically performed by humans.',
      },
      hindi: {
        text: '"The wind whispered through the dark trees" में कौन सा अलंकार (Figure of Speech) है?',
        options: ['A. Simile (उपमा)', 'B. Personification (मानवीकरण)', 'C. Hyperbole (अतिशयोक्ति)', 'D. Metaphor (रूपक)'],
        explanation: 'मानवीकरण (Personification) वह अलंकार है जिसमें निर्जीव वस्तुओं या प्राकृतिक तत्वों पर मानवीय गुणों का आरोपण किया जाता है। यहाँ हवा को "फुसफुसाते" (whispered) हुए दिखाया गया है, जो एक मानवीय क्रिया है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Select the correct antonym for "EPHEMERAL":',
        options: ['A. Transient', 'B. Permanent', 'C. Fleeting', 'D. Short-lived'],
        explanation: '"Ephemeral" denotes something lasting for a very short time, making "permanent" its ideal antonym. Other options like transient, fleeting, and short-lived are actually synonyms of ephemeral.',
      },
      hindi: {
        text: '"EPHEMERAL" (क्षणिक/अल्पकालिक) का सही विलोम शब्द क्या है?',
        options: ['A. Transient', 'B. Permanent (स्थायी/दीर्घकालिक)', 'C. Fleeting', 'D. Short-lived'],
        explanation: '"Ephemeral" का अर्थ अल्पकालिक होता है, इसलिए इसका सही विलोम शब्द "permanent" (स्थायी) है। विकल्प \'transient\', \'fleeting\' और \'short-lived\' इसके पर्यायवाची हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Fill in the blank: "Neither the principal nor the teachers _____ present."',
        options: ['A. was', 'B. were', 'C. is', 'D. has'],
        explanation: 'According to the rule of subject-verb agreement, when subjects are joined by "neither... nor," the verb agrees with the closer subject. Since "teachers" is plural and closer to the blank, the plural verb "were" is correct.',
      },
      hindi: {
        text: 'रिक्त स्थान भरें: "Neither the principal nor the teachers _____ present."',
        options: ['A. was', 'B. were', 'C. is', 'D. has'],
        explanation: 'विषय-क्रिया समझौते (Subject-verb agreement) के नियम के अनुसार, जब कर्ता "neither... nor" से जुड़े हों, तो क्रिया निकटतम कर्ता के अनुसार होती है। चूँकि "teachers" बहुवचन है और रिक्त स्थान के पास है, इसलिए बहुवचन क्रिया "were" का प्रयोग होगा।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'What is the meaning of "To burn the midnight oil"?',
        options: ['A. To waste electricity', 'B. To study or work late into the night', 'C. To cause a fire', 'D. To wake up early'],
        explanation: '"To burn the midnight oil" is a popular idiom that means to work or study late into the night. Historically, it originated from the practice of using oil lamps to provide light for night-time reading and work.',
      },
      hindi: {
        text: '"To burn the midnight oil" मुहावरे का क्या अर्थ है?',
        options: ['A. बिजली बर्बाद करना', 'B. देर रात तक कड़ी मेहनत/पढ़ाई करना', 'C. आग लगाना', 'D. जल्दी उठना'],
        explanation: '"To burn the midnight oil" एक प्रसिद्ध मुहावरा है जिसका अर्थ रात में देर तक पढ़ाई करना या काम करना है। ऐतिहासिक रूप से यह रात में अध्ययन के लिए तेल के दीपकों के प्रयोग से उपजा है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'Choose the word that means "Fear of confined spaces":',
        options: ['A. Acrophobia', 'B. Claustrophobia', 'C. Hydrophobia', 'D. Xenophobia'],
        explanation: 'Claustrophobia is derived from the Latin \'claustrum\' (a locked place) and Greek \'phobos\' (fear), specifically denoting an abnormal fear of confined or crowded spaces. Other terms like Acrophobia, Hydrophobia, and Xenophobia mean fear of heights, water, and strangers/foreigners respectively.',
      },
      hindi: {
        text: '"संकीर्ण या बंद स्थानों का डर" के लिए कौन सा शब्द सही है?',
        options: ['A. Acrophobia', 'B. Claustrophobia', 'C. Hydrophobia', 'D. Xenophobia'],
        explanation: 'क्लास्ट्रोफोबिया लैटिन शब्द \'क्लॉस्ट्रुम\' (बंद स्थान) और ग्रीक शब्द \'फोभस\' (डर) से बना है, जिसका विशेष अर्थ सीमित या बंद स्थानों का अत्यधिक भय होता है। अन्य विकल्प जैसे एक्रोफोबिया, हाइड्रोफोबिया और ज़ेनोफोबिया क्रमशः ऊँचाई, पानी और अजनबियों का डर दर्शाते हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Which of the following sentences is grammatically correct?',
        options: ['A. One of the student are absent.', 'B. One of the students is absent.', 'C. One of the students are absent.', 'D. One of the student is absent.'],
        explanation: 'In English grammar, the phrase \'One of\' is always followed by a plural noun and a singular verb. Therefore, the plural noun \'students\' must be paired with the singular verb \'is\', making option B grammatically correct.',
      },
      hindi: {
        text: 'निम्नलिखित में से कौन सा वाक्य व्याकरण की दृष्टि से सही है?',
        options: ['A. One of the student are absent.', 'B. One of the students is absent.', 'C. One of the students are absent.', 'D. One of the student is absent.'],
        explanation: 'अंग्रेजी व्याकरण में \'One of\' के पश्चात हमेशा बहुवचन संज्ञा (plural noun) और एकवचन क्रिया (singular verb) का प्रयोग होता है। इसलिए, बहुवचन संज्ञा \'students\' के साथ एकवचन क्रिया \'is\' का प्रयोग होगा, जिससे विकल्प B व्याकरण की दृष्टि से सही है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Change into Indirect Speech: He said, "I am reading a book."',
        options: ['A. He said that he was reading a book.', 'B. He said that he is reading a book.', 'C. He told that he reads a book.', 'D. He said that I was reading a book.'],
        explanation: 'When converting direct speech to indirect speech in the past tense (\'He said\'), the present continuous tense (\'am reading\') changes to the past continuous tense (\'was reading\'), and the first-person pronoun \'I\' changes according to the subject (\'he\').',
      },
      hindi: {
        text: 'परोक्ष कथन (Indirect Speech) में बदलें: He said, "I am reading a book."',
        options: ['A. He said that he was reading a book.', 'B. He said that he is reading a book.', 'C. He told that he reads a book.', 'D. He said that I was reading a book.'],
        explanation: 'प्रत्यक्ष कथन को अप्रत्यक्ष कथन में बदलते समय यदि मुख्य खंड भूतकाल में हो (\'He said\'), तो वर्तमान निरंतर काल (\'am reading\') भूतकाल निरंतर काल (\'was reading\') में बदल जाता है, और प्रथम पुरुष सर्वनाम \'I\' कर्ता के अनुसार \'he\' हो जाता है।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'Choose the correct preposition: "She is good _____ mathematics."',
        options: ['A. in', 'B. at', 'C. on', 'D. with'],
        explanation: 'The correct preposition to use with adjectives denoting skill or proficiency, such as \'good\', \'bad\', or \'clever\', is \'at\'. Hence, \'good at mathematics\' is the standard idiomatic usage in English grammar.',
      },
      hindi: {
        text: 'उचित पूर्वसर्ग (Preposition) चुनें: "She is good _____ mathematics."',
        options: ['A. in', 'B. at', 'C. on', 'D. with'],
        explanation: 'कौशल या दक्षता दर्शाने वाले विशेषणों जैसे \'good\', \'bad\' या \'clever\' के साथ उचित पूर्वसर्ग (preposition) \'at\' का प्रयोग किया जाता है। अतः अंग्रेजी व्याकरण में \'good at mathematics\' मानक और सही प्रयोग है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'What is the superlative form of the adjective "BAD"?',
        options: ['A. Badder', 'B. Worst', 'C. Worse', 'D. Baddest'],
        explanation: 'The adjective \'bad\' is an irregular adjective whose degrees of comparison do not follow the standard -er/-est rule. Its comparative form is \'worse\' and its superlative form is \'worst\'.',
      },
      hindi: {
        text: 'विशेषण "BAD" का उत्तमावस्था (Superlative Degree) रूप क्या है?',
        options: ['A. Badder', 'B. Worst', 'C. Worse', 'D. Baddest'],
        explanation: 'विशेषण \'bad\' एक अनियमित विशेषण है जिसकी तुलना की डिग्रियाँ सामान्य -er/-est नियम का पालन नहीं करती हैं। इसकी उत्तरावस्था (comparative) \'worse\' और उत्तमावस्था (superlative) \'worst\' होती है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    }
  ],
  Hindi: [
    {
      number: 1,
      english: {
        text: 'In Hindi grammar, how many types of Sandhi (संधि) are there?',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 5'],
        explanation: 'In Hindi grammar, there are 3 types of Sandhi (संधि): Vriddhi Sandhi, Uddmatsya Sandhi, and Yavasha Sandhi. These types of Sandhi occur when two words are combined to form a new word.',
      },
      hindi: {
        text: 'हिंदी व्याकरण में संधि के मुख्य रूप से कितने भेद होते हैं?',
        options: ['A. 2 भेद', 'B. 3 भेद (स्वर, व्यंजन, विसर्ग)', 'C. 4 भेद', 'D. 5 भेद'],
        explanation: 'हिंदी व्याकरण में, 3 प्रकार की संधि होती हैं: वृद्धि संधि, उद्दमस्य संधि और यवशा संधि। ये संधियाँ दो शब्दों के संयोजन से नई शब्द का निर्माण करती हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'What is the correct antonym of "अनुराग" (Anuraag)?',
        options: ['A. राग', 'B. विराग', 'C. प्रेम', 'D. द्वेष'],
        explanation: 'The correct antonym of "अनुराग" (Anuraag) is "विराग" (Virag), which means dispassion or lack of interest. Anuraag means affection or fondness.',
      },
      hindi: {
        text: '"अनुराग" का सही विलोम शब्द क्या है?',
        options: ['A. राग', 'B. विराग', 'C. प्रेम', 'D. द्वेष'],
        explanation: 'अनुराग का सही विरोधी शब्द है विराग, जिसका अर्थ है निर्लिप्तता या रुचि की कमी। अनुराग का अर्थ है प्रेम या प्रीति।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Which is a correct synonym for "सूर्य" (Sun)?',
        options: ['A. निशाकर', 'B. दिनकर', 'C. शशांक', 'D. हिमांशु'],
        explanation: 'The correct synonym for "सूर्य" (Sun) is "दिनकर", which is another name for the sun. Dinkar is a Sanskrit word that means \'day-maker\' or \'sun\'.',
      },
      hindi: {
        text: 'निम्नलिखित में से कौन सा "सूर्य" का पर्यायवाची शब्द है?',
        options: ['A. निशाकर', 'B. दिनकर', 'C. शशांक', 'D. हिमांशु'],
        explanation: 'सूर्य का सही पर्यायवाची शब्द है दिनकर, जो सूर्य का एक अन्य नाम है। दिनकर एक संस्कृत शब्द है जिसका अर्थ है \'दिन बनाना\' या \'सूर्य\'।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the compound (समास) in "यथाशक्ति"?',
        options: ['A. तत्पुरुष समास', 'B. अव्ययीभाव समास', 'C. द्विगु समास', 'D. द्वंद्व समास'],
        explanation: 'The compound "यथाशक्ति" is an Avyayibhava Samas, which is a type of compound word that consists of two words joined together without any change in their original meaning. In this compound, \'यथा\' and \'शक्ति\' are joined together to form a new word.',
      },
      hindi: {
        text: '"यथाशक्ति" शब्द में कौन सा समास है?',
        options: ['A. तत्पुरुष समास', 'B. अव्ययीभाव समास', 'C. द्विगु समास', 'D. द्वंद्व समास'],
        explanation: 'यथाशक्ति एक अव्ययीभाव समास है, जो दो शब्दों के संयोजन से बने एक शब्द है जिसमें मूल अर्थ में कोई परिवर्तन नहीं होता है। इस समास में, \'यथा\' और \'शक्ति\' का संयोजन होकर एक नए शब्द का निर्माण होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'What is the meaning of the Hindi idiom "आँखों का तारा होना"?',
        options: ['A. कम दिखाई देना', 'B. अत्यधिक प्रिय होना', 'C. घमंड करना', 'D. धोखा देना'],
        explanation: 'The Hindi idiom "आँखों का तारा होना" means to be extremely dear or precious to someone. It is an expression used to describe someone who is very close or beloved.',
      },
      hindi: {
        text: '"आँखों का तारा होना" मुहावरे का सही अर्थ क्या है?',
        options: ['A. कम दिखाई देना', 'B. अत्यधिक प्रिय होना', 'C. घमंड करना', 'D. धोखा देना'],
        explanation: 'आँखों का तारा होना हिंदी का एक वाक्यांश है जिसका अर्थ है किसी के लिए अत्यधिक प्रिय या मूल्यवान होना। यह वाक्यांश किसी को बहुत करीबी या प्रिय बताने के लिए उपयोग किया जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'Choose the correctly spelled (शुद्ध वर्तनी) word in Hindi:',
        options: ['A. उज्जवल', 'B. उज्ज्वल', 'C. उज्वल', 'D. उजवल'],
        explanation: 'The correct spelling is \'उज्ज्वल\' because it contains two consecutive half \'ज\' (jj) characters according to standard Hindi orthography rules. This word is frequently tested in competitive exams to check proficiency in phonetic spelling and sandhi rules.',
      },
      hindi: {
        text: 'निम्नलिखित में से शुद्ध वर्तनी वाला शब्द चुनिए:',
        options: ['A. उज्जवल', 'B. उज्ज्वल', 'C. उज्वल', 'D. उजवल'],
        explanation: 'शुद्ध वर्तनी \'उज्ज्वल\' है क्योंकि मानक हिंदी वर्तनी के नियमों के अनुसार इसमें दो आधे \'ज\' का प्रयोग होता है। प्रतियोगी परीक्षाओं में इस शब्द का बार-बार परीक्षण phonetic और संधि नियमों की जाँच के लिए किया जाता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'What is the feminine form (स्त्रीलिंग) of "कवि"?',
        options: ['A. कविइत्री', 'B. कवयित्री', 'C. कवियत्री', 'D. कवित्री'],
        explanation: 'The feminine form of \'कवि\' is \'कवयित्री\'. In Hindi grammar, nouns ending in \'कवि\' undergo a specific vowel shift when converted to the feminine gender, making this a classic exception heavily favored by examiners.',
      },
      hindi: {
        text: '"कवि" शब्द का सही स्त्रीलिंग रूप क्या होगा?',
        options: ['A. कविइत्री', 'B. कवयित्री', 'C. कवियत्री', 'D. कवित्री'],
        explanation: '\'कवि\' का स्त्रीलिंग रूप \'कवयित्री\' है। हिंदी व्याकरण के नियमों के अनुसार \'कवि\' जैसे शब्दों को स्त्रीलिंग में बदलते समय एक विशिष्ट स्वर परिवर्तन होता है, जो परीक्षकों द्वारा अत्यधिक पूछा जाने वाला अपवाद है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'In Hindi, what is the case marker (विभक्ति चिन्ह) for "करण कारक"?',
        options: ['A. ने', 'B. से / के द्वारा', 'C. को', 'D. में / पर'],
        explanation: 'The case marker (विभक्ति चिह्न) for \'करण कारक\' (Instrumental Case) is \'से\' or \'के द्वारा\', which indicates the instrument or medium through which an action is performed. Other markers like \'ने\' denote the nominative case (कर्ता कारक) and \'को\' denotes the accusative/dative case.',
      },
      hindi: {
        text: 'करण कारक का विभक्ति चिन्ह क्या है?',
        options: ['A. ने', 'B. से / के द्वारा (माध्यम)', 'C. को', 'D. में / पर'],
        explanation: '\'करण कारक\' का विभक्ति चिह्न \'से\' अथवा \'के द्वारा\' है, जो उस साधन या माध्यम को दर्शाता है जिसके द्वारा क्रिया संपन्न होती है। \'ने\' कर्ता कारक और \'को\' कर्म या संप्रदान कारक का बोध कराता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'What is a one-word substitution for "जो सब कुछ जानता हो"?',
        options: ['A. अल्पज्ञ', 'B. सर्वज्ञ', 'C. मर्मज्ञ', 'D. बहुज्ञ'],
        explanation: 'The one-word substitution for \'जो सब कुछ जानता हो\' (one who knows everything) is \'सर्वज्ञ\'. \'अल्पज्ञ\' means one who knows very little, making \'सर्वज्ञ\' the precise vocabulary term tested in standard Indian competitive examinations.',
      },
      hindi: {
        text: '"जो सब कुछ जानता हो" वाक्यांश के लिए एक शब्द क्या होगा?',
        options: ['A. अल्पज्ञ', 'B. सर्वज्ञ', 'C. मर्मज्ञ', 'D. बहुज्ञ'],
        explanation: '\'जो सब कुछ जानता हो\' के लिए एक शब्द \'सर्वज्ञ\' है। \'अल्पज्ञ\' का अर्थ कम जानने वाला होता है, अतः प्रतियोगी परीक्षाओं में शब्दावली के परीक्षण हेतु \'सर्वज्ञ\' ही सही उत्तर है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'What is the Sandhi split of "पवन"?',
        options: ['A. प + अन', 'B. पो + अन', 'C. पौ + अन', 'D. पाव + न'],
        explanation: 'The correct Sandhi split of \'पवन\' is \'पो + अन\', which is an example of \'अयादि संधि\' (Ayadi Sandhi). According to this rule, \'ओ\' followed by any dissimilar vowel changes into \'अव\', transforming \'पो + अन\' into \'पवन\'.',
      },
      hindi: {
        text: '"पवन" शब्द का सही संधि विच्छेद क्या है?',
        options: ['A. प + अन', 'B. पो + अन (अयादि संधि)', 'C. पौ + अन', 'D. पाव + न'],
        explanation: '\'पवन\' का सही संधि-विच्छेद \'पो + अन\' है, जो \'अयादि संधि\' का एक प्रमुख उदाहरण है। इस नियम के अनुसार, जब \'ओ\' के बाद कोई भिन्न स्वर आता है, तो \'ओ\' का परिवर्तन \'अव\' में हो जाता है, जिससे \'पो + अन\' मिलकर \'पवन\' बनता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Who is the author of the famous epic "गोदान" (Godan)?',
        options: ['A. जयशंकर प्रसाद', 'B. मुंशी प्रेमचंद', 'C. महादेवी वर्मा', 'D. सूर्यकांत त्रिपाठी निराला'],
        explanation: '"Godan" is a monumental realist novel written by Munshi Premchand, published in 1936. It vividly portrays the socio-economic exploitation and struggles of the Indian peasantry.',
      },
      hindi: {
        text: 'प्रसिद्ध उपन्यास "गोदान" के रचयिता कौन हैं?',
        options: ['A. जयशंकर प्रसाद', 'B. मुंशी प्रेमचंद', 'C. महादेवी वर्मा', 'D. सूर्यकांत त्रिपाठी निराला'],
        explanation: '"गोदान" मुंशी प्रेमचंद द्वारा रचित एक महान यथार्थवादी उपन्यास है, जो 1936 में प्रकाशित हुआ था। यह भारतीय कृषक समाज के सामाजिक-आर्थिक शोषण और उनके संघर्षों का जीवंत चित्रण करता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'What is the compound (समास) in "दशानन"?',
        options: ['A. द्विगु समास', 'B. बहुव्रीहि समास', 'C. कर्मधारय समास', 'D. द्वंद्व समास'],
        explanation: 'In the word "Dashanan" (Ten-faced, meaning Ravana), neither the first nor the second term is dominant; instead, a third specific entity is implied, which defines the Bahuvrihi Samas.',
      },
      hindi: {
        text: '"दशानन" (दस हैं आनन जिसके अर्थात् रावण) में कौन सा समास है?',
        options: ['A. द्विगु समास', 'B. बहुव्रीहि समास', 'C. कर्मधारय समास', 'D. द्वंद्व समास'],
        explanation: 'शब्द "दशानन" (दस हैं आनंद जिसके,अर्थात रावण) में न तो पहला और न ही दूसरा पद प्रधान है, बल्कि यह किसी तीसरे विशिष्ट अर्थ (रावण) को संकेत करता है, जो बहुव्रीहि समास का लक्षण है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'What is the opposite word (विलोम) of "आस्तिक"?',
        options: ['A. धार्मिक', 'B. नास्तिक', 'C. सात्विक', 'D. अधर्मी'],
        explanation: 'The antonym of "Aastik" (one who believes in God) is "Naastik" (one who does not believe in God). This is a standard direct lexical opposition in Hindi vocabulary.',
      },
      hindi: {
        text: '"आस्तिक" शब्द का सही विलोम शब्द क्या होगा?',
        options: ['A. धार्मिक', 'B. नास्तिक', 'C. सात्विक', 'D. अधर्मी'],
        explanation: '"आस्तिक" (ईश्वर में विश्वास रखने वाला) शब्द का सटीक विलोम शब्द "नास्तिक" (ईश्वर में विश्वास न रखने वाला) होता है। यह हिंदी शब्दावली का एक प्रत्यक्ष और महत्वपूर्ण विपरीतार्थक युग्म है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'What is the meaning of "दांत खट्टे करना"?',
        options: ['A. खट्टी चीज खाना', 'B. पराजित करना / हराना', 'C. दांत में दर्द होना', 'D. गुस्सा करना'],
        explanation: '"Daant khatte karna" is a standard Hindi idiom meaning to defeat or vanquish an opponent decisively in a battle or competition.',
      },
      hindi: {
        text: '"दांत खट्टे करना" मुहावरे का सही अर्थ क्या है?',
        options: ['A. खट्टी चीज खाना', 'B. पराजित करना / हरा देना', 'C. दांत में दर्द होना', 'D. गुस्सा करना'],
        explanation: '"दांत खट्टे करना" एक प्रसिद्ध हिंदी मुहावरा है जिसका शाब्दिक अर्थ किसी प्रतियोगिता या युद्ध में शत्रु को बुरी तरह से पराजित करना या हराना होता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'In Devanagari script, which consonant is a Sanyukta Vyanjan (संयुक्त व्यंजन)?',
        options: ['A. क', 'B. ज्ञ', 'C. प', 'D. स'],
        explanation: 'In the Devanagari script, "Gy" (ज्ञ) is a conjunct consonant (Sanyukta Vyanjan) formed by the combination of the consonants \'J\' (ज) and \'Nya\' (ञ).',
      },
      hindi: {
        text: 'देवनागरी लिपि में निम्नलिखित में से संयुक्त व्यंजन कौन सा है?',
        options: ['A. क', 'B. ज्ञ (ज् + ञ)', 'C. प', 'D. स'],
        explanation: 'देवनागरी लिपि में "ज्ञ" एक संयुक्त व्यंजन है जो \'ज\' और \'ञ\' वर्णों के मेल से बनता है। अन्य विकल्प सामान्य व्यंजन हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'What is the plural form (बहुवचन) of "चिड़िया"?',
        options: ['A. चिड़िये', 'B. चिड़ियाँ', 'C. चिड़ियों', 'D. चिड़ियन'],
        explanation: 'In Hindi grammar, feminine nouns ending in \'इ\' or \'ई\' are made plural by adding a chandrabindu (ँ) to the \'इ\' or \'ई\', changing \'चिड़िया\' to \'चिड़ियाँ\'. This rule is a fundamental standard for pluralization of such words in competitive exams.',
      },
      hindi: {
        text: '"चिड़िया" शब्द का सही बहुवचन रूप क्या है?',
        options: ['A. चिड़िये', 'B. चिड़ियाँ', 'C. चिड़ियों', 'D. चिड़ियन'],
        explanation: 'हिंदी व्याकरण के नियमानुसार, \'इ\' या \'ई\' अंत वाली स्त्रीलिंग संज्ञाओं को बहुवचन बनाते समय उनके अंत में चंद्रबिंदु (ँ) जोड़ दिया जाता है, जिससे \'चिड़िया\' का बहुवचन \'चिड़ियाँ\' बनता है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Which word is a Tadbhav (तद्भव) word?',
        options: ['A. अग्नि', 'B. आग', 'C. सूर्य', 'D. कर्ण'],
        explanation: 'Tadbhav words are those words derived from Sanskrit that have undergone changes in their Prakrit and Apabhramsha stages over time. Among the options, \'आग\' is a Tadbhav word whose original Sanskrit Tatsam form is \'अग्नि\'.',
      },
      hindi: {
        text: 'निम्नलिखित में से तद्भव शब्द कौन सा है?',
        options: ['A. अग्नि (तत्सम)', 'B. आग (तद्भव)', 'C. सूर्य (तत्सम)', 'D. कर्ण (तत्सम)'],
        explanation: 'तद्भव वे शब्द होते हैं जो संस्कृत से प्राकृत और अपभ्रंश होते हुए हिंदी में रूप बदलकर प्रयुक्त होते हैं। विकल्पों में \'आग\' एक तद्भव शब्द है, जिसका तत्सम रूप \'अग्नि\' है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'What is the Sandhi split of "महर्षि"?',
        options: ['A. महा + ऋषि', 'B. मह + ऋषि', 'C. महा + ऋषी', 'D. महर + षि'],
        explanation: 'The word "महर्षि" is formed by the Guṇ Sandhi rule where \'आ\' + \'ऋ\' combines to produce \'अर्\'. Therefore, the correct morphological split of the word is "महा + ऋषि".',
      },
      hindi: {
        text: '"महर्षि" का सही संधि विच्छेद क्या है?',
        options: ['A. महा + ऋषि (गुण संधि)', 'B. मह + ऋषि', 'C. महा + ऋषी', 'D. महर + षि'],
        explanation: 'शब्द \'महर्षि\' का संधि-विच्छेद \'महा + ऋषि\' है, जो गुण स्वर संधि का नियम है जिसमें \'आ\' और \'ऋ\' मिलकर \'अर्\' बनाते हैं।',
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What is the permanent emotion (स्थायी भाव) of "वीर रस"?',
        options: ['A. रति', 'B. उत्साह', 'C. क्रोध', 'D. शोक'],
        explanation: 'In Indian Poetics (Kavya Shastra), the permanent emotion (Sthayi Bhav) associated with \'Veer Rasa\' (Heroic sentiment) is \'Utsah\' (Enthusiasm). It is evoked when a person is filled with vigor and determination for heroic deeds.',
      },
      hindi: {
        text: '"वीर रस" का स्थायी भाव क्या है?',
        options: ['A. रति', 'B. उत्साह', 'C. क्रोध', 'D. शोक'],
        explanation: 'भारतीय काव्यशास्त्र के अनुसार \'वीर रस\' का स्थायी भाव \'उत्साह\' होता है। यह किसी कार्य को करने, युद्ध लड़ने या धर्म की रक्षा के लिए जागृत होने वाली ऊर्जा का द्योतक है।',
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'In Hindi, which word is a synonym for "अमृत"?',
        options: ['A. गरल', 'B. पीयूष', 'C. हलाहल', 'D. विष'],
        explanation: 'Among the given options, \'पीयूष\' is a direct synonym for \'अमृत\' (nectar of immortality), while \'गरल\', \'हलाहल\', and \'विष\' are synonyms for poison. Knowing these lexical pairs is essential for vocabulary sections in Hindi tests.',
      },
      hindi: {
        text: '"अमृत" का पर्यायवाची शब्द कौन सा है?',
        options: ['A. गरल (विष)', 'B. पीयूष (अमृत)', 'C. हलाहल (विष)', 'D. विष'],
        explanation: 'दिए गए विकल्पों में \'पीयूष\' शब्द \'अमृत\' का पर्यायवाची है, जबकि \'गरल\', \'हलाहल\' और \'विष\' जहर या विष के पर्यायवाची शब्द हैं।',
      },
      correctAnswer: 'B',
      status: 'verified',
    }
  ],
};

// Derived English-only representation for backward compatibility
export const CURATED_STREAK_QUESTIONS: Partial<Record<Subject, ManualQuestion[]>> = Object.fromEntries(
  Object.entries(BILINGUAL_STREAK_QUESTIONS).map(([subj, qs]) => [
    subj as Subject,
    (qs || []).map((q) => ({
      number: q.number,
      text: q.english.text,
      options: q.english.options,
      correctAnswer: q.correctAnswer || 'A',
      explanation: q.english.explanation,
    })),
  ])
) as Partial<Record<Subject, ManualQuestion[]>>;

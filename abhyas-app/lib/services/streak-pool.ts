import { Subject, ManualQuestion, BilingualQuestion } from '@/lib/types';

export const BILINGUAL_STREAK_QUESTIONS: Record<Subject, BilingualQuestion[]> = {
  Music: [
    {
      number: 1,
      english: {
        text: 'Which musical term indicates a very slow tempo?',
        options: ['A. Allegro', 'B. Largo', 'C. Presto', 'D. Vivace'],
      },
      hindi: {
        text: 'कौन सा संगीत पद अत्यंत धीमी गति (लय) को दर्शाता है?',
        options: ['A. एलेग्रो (Allegro)', 'B. लार्गो (Largo)', 'C. प्रेस्टो (Presto)', 'D. विवाचे (Vivace)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'How many semitones make up a perfect fifth interval?',
        options: ['A. 5 semitones', 'B. 6 semitones', 'C. 7 semitones', 'D. 8 semitones'],
      },
      hindi: {
        text: 'एक परफेक्ट फिफ्थ (Perfect Fifth) अंतराल में कितने सेमिटोन (अर्धस्वर) होते हैं?',
        options: ['A. 5 सेमिटोन', 'B. 6 सेमिटोन', 'C. 7 सेमिटोन', 'D. 8 सेमिटोन'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Which clef is also commonly known as the G clef?',
        options: ['A. Treble Clef', 'B. Bass Clef', 'C. Alto Clef', 'D. Tenor Clef'],
      },
      hindi: {
        text: 'किस क्लेफ (Clef) को सामान्यतः जी क्लेफ (G Clef) के नाम से भी जाना जाता है?',
        options: ['A. ट्रेबल क्लेफ (Treble Clef)', 'B. बास क्लेफ (Bass Clef)', 'C. आल्टो क्लेफ (Alto Clef)', 'D. टेनर क्लेफ (Tenor Clef)'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'Who composed the famous "Moonlight Sonata"?',
        options: ['A. Wolfgang Amadeus Mozart', 'B. Ludwig van Beethoven', 'C. Johann Sebastian Bach', 'D. Franz Schubert'],
      },
      hindi: {
        text: 'प्रसिद्ध "मूनलाइट सोनाटा" (Moonlight Sonata) की रचना किसने की थी?',
        options: ['A. वोल्फगैंग अमाडेस मोजार्ट', 'B. लुडविग वैन बीथोवेन', 'C. जोहान सेबेस्टियन बाख', 'D. फ्रांज शुबर्ट'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'What note value is equal to half of a quarter note?',
        options: ['A. Eighth note', 'B. Half note', 'C. Whole note', 'D. Sixteenth note'],
      },
      hindi: {
        text: 'क्वार्टर नोट (Quarter Note) के आधे मान के बराबर कौन सा नोट होता है?',
        options: ['A. एइथ नोट (Eighth note)', 'B. हाफ नोट (Half note)', 'C. होल नोट (Whole note)', 'D. सिक्सटीन्थ नोट (Sixteenth note)'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'In standard 4/4 time, how many beats does a dotted half note receive?',
        options: ['A. 2 beats', 'B. 3 beats', 'C. 4 beats', 'D. 1.5 beats'],
      },
      hindi: {
        text: 'मानक 4/4 ताल में, एक डॉटेड हाफ नोट (Dotted Half Note) को कितनी मात्राएँ मिलती हैं?',
        options: ['A. 2 मात्राएँ', 'B. 3 मात्राएँ', 'C. 4 मात्राएँ', 'D. 1.5 मात्राएँ'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Which instrument family does the oboe belong to?',
        options: ['A. Brass', 'B. Strings', 'C. Woodwinds', 'D. Percussion'],
      },
      hindi: {
        text: 'ओबो (Oboe) किस वाद्ययंत्र परिवार से संबंधित है?',
        options: ['A. पीतल (Brass)', 'B. तंतु वाद्य (Strings)', 'C. काष्ठ-सुषिर वाद्य (Woodwinds)', 'D. अवनद्ध वाद्य (Percussion)'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the relative minor key of C major?',
        options: ['A. D minor', 'B. E minor', 'C. A minor', 'D. G minor'],
      },
      hindi: {
        text: 'सी मेजर (C Major) की सापेक्ष माइनर (Relative Minor) कुंजी क्या है?',
        options: ['A. डी माइनर (D minor)', 'B. ई माइनर (E minor)', 'C. ए माइनर (A minor)', 'D. जी माइनर (G minor)'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'What does the dynamic marking "pianissimo" (pp) mean?',
        options: ['A. Very loud', 'B. Moderately soft', 'C. Very soft', 'D. Gradually louder'],
      },
      hindi: {
        text: 'संगीत में "पियानिसिमो" (pp) का क्या अर्थ है?',
        options: ['A. बहुत तेज', 'B. मध्यम कोमल', 'C. बहुत कोमल/धीमा', 'D. धीरे-धीरे तेज'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'How many sharps are in the key signature of D major?',
        options: ['A. 1 sharp', 'B. 2 sharps', 'C. 3 sharps', 'D. 4 sharps'],
      },
      hindi: {
        text: 'डी मेजर (D Major) के मुख्य हस्ताक्षर में कितने शार्प (#) होते हैं?',
        options: ['A. 1 शार्प', 'B. 2 शार्प', 'C. 3 शार्प', 'D. 4 शार्प'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Which Indian classical musical scale system is known as a parent scale?',
        options: ['A. Raga', 'B. Thaat', 'C. Tala', 'D. Gharana'],
      },
      hindi: {
        text: 'भारतीय शास्त्रीय संगीत में जनक (मूल) स्वर समूह को क्या कहा जाता है?',
        options: ['A. राग', 'B. ठाठ', 'C. ताल', 'D. घराना'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'What is the standard concert pitch frequency for the note A4?',
        options: ['A. 432 Hz', 'B. 440 Hz', 'C. 444 Hz', 'D. 420 Hz'],
      },
      hindi: {
        text: 'स्वर A4 के लिए मानक कॉन्सर्ट पिच आवृत्ति क्या है?',
        options: ['A. 432 Hz', 'B. 440 Hz', 'C. 444 Hz', 'D. 420 Hz'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Which Italian term directs musicians to play smoothly and connected?',
        options: ['A. Staccato', 'B. Legato', 'C. Pizzicato', 'D. Marcato'],
      },
      hindi: {
        text: 'कौन सा इतालवी शब्द स्वरों को निर्बाध और जोड़कर बजाने का निर्देश देता है?',
        options: ['A. स्टैकाटो (Staccato)', 'B. लेगाटो (Legato)', 'C. पिज़िकाटो (Pizzicato)', 'D. मार्काटो (Marcato)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Which of the following is a brass instrument that uses a slide rather than valves?',
        options: ['A. Trumpet', 'B. French Horn', 'C. Trombone', 'D. Tuba'],
      },
      hindi: {
        text: 'निम्नलिखित में से कौन सा पीतल का वाद्य यंत्र वाल्व के बजाय स्लाइड का उपयोग करता है?',
        options: ['A. तुरही (Trumpet)', 'B. फ्रेंच हॉर्न', 'C. ट्रॉम्बोन (Trombone)', 'D. ट्यूबा'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'A chord composed of a root, minor third, and diminished fifth is called:',
        options: ['A. Major triad', 'B. Diminished triad', 'C. Augmented triad', 'D. Suspended triad'],
      },
      hindi: {
        text: 'मूल स्वर, माइनर थर्ड और डिमिनिश्ड फिफ्थ से बना कॉर्ड क्या कहलाता है?',
        options: ['A. मेजर ट्रायड', 'B. डिमिनिश्ड ट्रायड (Diminished Triad)', 'C. ऑगमेंटेड ट्रायड', 'D. सस्पेंडेड ट्रायड'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'What does the musical direction "Da Capo" (D.C.) mean?',
        options: ['A. From the sign', 'B. From the beginning', 'C. To the finish', 'D. Repeat measure'],
      },
      hindi: {
        text: 'संगीत निर्देश "दा कापो" (D.C.) का क्या अर्थ है?',
        options: ['A. चिन्ह से', 'B. आरंभ से (From the beginning)', 'C. अंत तक', 'D. माप दोहराएं'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'How many strings does a standard classical concert harp typically have?',
        options: ['A. 47', 'B. 36', 'C. 52', 'D. 40'],
      },
      hindi: {
        text: 'एक मानक शास्त्रीय कॉन्सर्ट वीणा (Harp) में आमतौर पर कितने तार होते हैं?',
        options: ['A. 47 तार', 'B. 36 तार', 'C. 52 तार', 'D. 40 तार'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Which period in music history followed the Renaissance and preceded the Classical period?',
        options: ['A. Romantic', 'B. Baroque', 'C. Medieval', 'D. Modern'],
      },
      hindi: {
        text: 'संगीत इतिहास में पुनर्जागरण के बाद और शास्त्रीय काल से पहले कौन सा काल आया?',
        options: ['A. रोमांटिक', 'B. बारोक (Baroque)', 'C. मध्यकालीन', 'D. आधुनिक'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What is the time signature for a traditional waltz?',
        options: ['A. 4/4', 'B. 3/4', 'C. 2/4', 'D. 6/8'],
      },
      hindi: {
        text: 'एक पारंपरिक वॉल्ट्ज़ (Waltz) नृत्य के लिए ताल हस्ताक्षर (Time Signature) क्या है?',
        options: ['A. 4/4', 'B. 3/4', 'C. 2/4', 'D. 6/8'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'In Indian classical music, what is the principal melodic note of a raga called?',
        options: ['A. Samvadi', 'B. Vadi', 'C. Anuvadi', 'D. Vivadi'],
      },
      hindi: {
        text: 'भारतीय शास्त्रीय संगीत में, किसी राग के सबसे प्रमुख (राजा) स्वर को क्या कहा जाता है?',
        options: ['A. संवादी', 'B. वादी', 'C. अनुवादी', 'D. विवादी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
  Math: [
    {
      number: 1,
      english: {
        text: 'What is the value of 15% of 240?',
        options: ['A. 32', 'B. 36', 'C. 40', 'D. 30'],
      },
      hindi: {
        text: '240 का 15% मान क्या है?',
        options: ['A. 32', 'B. 36', 'C. 40', 'D. 30'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'What is the next prime number after 29?',
        options: ['A. 31', 'B. 33', 'C. 37', 'D. 39'],
      },
      hindi: {
        text: '29 के बाद अगली अभाज्य संख्या (Prime Number) कौन सी है?',
        options: ['A. 31', 'B. 33', 'C. 37', 'D. 39'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'If 3x + 7 = 22, what is the value of x?',
        options: ['A. 3', 'B. 5', 'C. 7', 'D. 4'],
      },
      hindi: {
        text: 'यदि 3x + 7 = 22 है, तो x का मान क्या है?',
        options: ['A. 3', 'B. 5', 'C. 7', 'D. 4'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the sum of the interior angles of a hexagon?',
        options: ['A. 540°', 'B. 720°', 'C. 900°', 'D. 360°'],
      },
      hindi: {
        text: 'एक षट्भुज (Hexagon) के आंतरिक कोणों का योग कितना होता है?',
        options: ['A. 540°', 'B. 720°', 'C. 900°', 'D. 360°'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'What is the square root of 144?',
        options: ['A. 11', 'B. 12', 'C. 13', 'D. 14'],
      },
      hindi: {
        text: '144 का वर्गमूल क्या है?',
        options: ['A. 11', 'B. 12', 'C. 13', 'D. 14'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'If a triangle has sides of length 3 cm, 4 cm, and 5 cm, what type of triangle is it?',
        options: ['A. Acute triangle', 'B. Right-angled triangle', 'C. Obtuse triangle', 'D. Equilateral triangle'],
      },
      hindi: {
        text: 'यदि किसी त्रिभुज की भुजाएँ 3 सेमी, 4 सेमी और 5 सेमी हैं, तो वह किस प्रकार का त्रिभुज है?',
        options: ['A. न्यूनकोण त्रिभुज', 'B. समकोण त्रिभुज', 'C. अधिककोण त्रिभुज', 'D. समबाहु त्रिभुज'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'What is the value of 2³ × 2⁴?',
        options: ['A. 64', 'B. 128', 'C. 256', 'D. 512'],
      },
      hindi: {
        text: '2³ × 2⁴ का मान क्या होगा?',
        options: ['A. 64', 'B. 128', 'C. 256', 'D. 512'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the area of a circle with a radius of 7 cm (take π ≈ 22/7)?',
        options: ['A. 144 cm²', 'B. 154 cm²', 'C. 164 cm²', 'D. 174 cm²'],
      },
      hindi: {
        text: '7 सेमी त्रिज्या वाले वृत्त का क्षेत्रफल क्या है (π ≈ 22/7 लें)?',
        options: ['A. 144 वर्ग सेमी', 'B. 154 वर्ग सेमी', 'C. 164 वर्ग सेमी', 'D. 174 वर्ग सेमी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What was the removed number?',
        options: ['A. 24', 'B. 26', 'C. 28', 'D. 30'],
      },
      hindi: {
        text: '5 संख्याओं का औसत 20 है। यदि एक संख्या हटा दी जाए, तो औसत 18 हो जाता है। हटाई गई संख्या क्या थी?',
        options: ['A. 24', 'B. 26', 'C. 28', 'D. 30'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'What is the slope of the line given by the equation y = 4x - 7?',
        options: ['A. -7', 'B. 4', 'C. -4', 'D. 7'],
      },
      hindi: {
        text: 'समीकरण y = 4x - 7 द्वारा दी गई रेखा की ढाल (Slope) क्या है?',
        options: ['A. -7', 'B. 4', 'C. -4', 'D. 7'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'What is the Greatest Common Divisor (GCD) of 36 and 48?',
        options: ['A. 6', 'B. 12', 'C. 18', 'D. 24'],
      },
      hindi: {
        text: '36 और 48 का महत्तम समापवर्तक (HCF / GCD) क्या है?',
        options: ['A. 6', 'B. 12', 'C. 18', 'D. 24'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'If a car travels 180 km in 3 hours, what is its average speed in m/s?',
        options: ['A. 15 m/s', 'B. 16.67 m/s', 'C. 20 m/s', 'D. 25 m/s'],
      },
      hindi: {
        text: 'यदि एक कार 3 घंटे में 180 किमी की दूरी तय करती है, तो उसकी औसत गति मीटर/सेकंड में क्या है?',
        options: ['A. 15 m/s', 'B. 16.67 m/s', 'C. 20 m/s', 'D. 25 m/s'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'What is the value of cos(60°)?',
        options: ['A. 0', 'B. 1/2', 'C. √3/2', 'D. 1'],
      },
      hindi: {
        text: 'cos(60°) का मान क्या है?',
        options: ['A. 0', 'B. 1/2', 'C. √3/2', 'D. 1'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Solve for x: x² - 9 = 0 (where x > 0)',
        options: ['A. 1', 'B. 3', 'C. 9', 'D. 6'],
      },
      hindi: {
        text: 'x के लिए हल करें: x² - 9 = 0 (जहाँ x > 0 है)',
        options: ['A. 1', 'B. 3', 'C. 9', 'D. 6'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'What is the sum of the first 10 positive odd integers?',
        options: ['A. 90', 'B. 100', 'C. 110', 'D. 120'],
      },
      hindi: {
        text: 'प्रथम 10 धनात्मक विषम पूर्णांकों का योग क्या है?',
        options: ['A. 90', 'B. 100', 'C. 110', 'D. 120'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'A fair six-sided die is rolled. What is the probability of rolling a number greater than 4?',
        options: ['A. 1/6', 'B. 1/3', 'C. 1/2', 'D. 2/3'],
      },
      hindi: {
        text: 'एक निष्पक्ष 6-फलकीय पासा फेंका जाता है। 4 से अधिक संख्या आने की प्रायिकता क्या है?',
        options: ['A. 1/6', 'B. 1/3', 'C. 1/2', 'D. 2/3'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'What is 25% written as a simplified fraction?',
        options: ['A. 1/2', 'B. 1/4', 'C. 1/5', 'D. 2/5'],
      },
      hindi: {
        text: '25% को सरलतम भिन्न के रूप में क्या लिखा जाएगा?',
        options: ['A. 1/2', 'B. 1/4', 'C. 1/5', 'D. 2/5'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'If the perimeter of a square is 36 cm, what is its area?',
        options: ['A. 72 cm²', 'B. 81 cm²', 'C. 64 cm²', 'D. 100 cm²'],
      },
      hindi: {
        text: 'यदि एक वर्ग का परिमाप 36 सेमी है, तो उसका क्षेत्रफल क्या होगा?',
        options: ['A. 72 वर्ग सेमी', 'B. 81 वर्ग सेमी', 'C. 64 वर्ग सेमी', 'D. 100 वर्ग सेमी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What is log₁₀(1000)?',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 10'],
      },
      hindi: {
        text: 'log₁₀(1000) का मान क्या है?',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 10'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'What is the product of (x + 3) and (x - 3)?',
        options: ['A. x² + 9', 'B. x² - 9', 'C. x² - 6x + 9', 'D. x² + 6x - 9'],
      },
      hindi: {
        text: '(x + 3) और (x - 3) का गुणनफल क्या है?',
        options: ['A. x² + 9', 'B. x² - 9', 'C. x² - 6x + 9', 'D. x² + 6x - 9'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
  'Modern History': [
    {
      number: 1,
      english: {
        text: 'In which year did the Battle of Plassey take place?',
        options: ['A. 1757', 'B. 1764', 'C. 1857', 'D. 1748'],
      },
      hindi: {
        text: 'प्लासी का प्रसिद्ध युद्ध किस वर्ष लड़ा गया था?',
        options: ['A. 1757', 'B. 1764', 'C. 1857', 'D. 1748'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Who was the Governor-General of India during the Revolt of 1857?',
        options: ['A. Lord Dalhousie', 'B. Lord Canning', 'C. Lord Wellesley', 'D. Lord Curzon'],
      },
      hindi: {
        text: '1857 के विद्रोह के समय भारत का गवर्नर-जनरल कौन था?',
        options: ['A. लॉर्ड डलहौजी', 'B. लॉर्ड कैनिंग', 'C. लॉर्ड वेलेस्ली', 'D. लॉर्ड कर्जन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Who led the Revolt of 1857 in Jagdishpur, Bihar?',
        options: ['A. Nana Saheb', 'B. Kunwar Singh', 'C. Tatya Tope', 'D. Begum Hazrat Mahal'],
      },
      hindi: {
        text: 'बिहार के जगदीशपुर में 1857 के विद्रोह का नेतृत्व किसने किया था?',
        options: ['A. नाना साहेब', 'B. कुंवर सिंह', 'C. तात्या टोपे', 'D. बेगम हज़रत महल'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'Who founded the Brahmo Samaj in Calcutta in 1828?',
        options: ['A. Swami Vivekananda', 'B. Raja Ram Mohan Roy', 'C. Swami Dayananda Saraswati', 'D. Ishwar Chandra Vidyasagar'],
      },
      hindi: {
        text: '1828 में कलकत्ता में ब्रह्म समाज की स्थापना किसने की थी?',
        options: ['A. स्वामी विवेकानंद', 'B. राजा राम मोहन राय', 'C. स्वामी दयानंद सरस्वती', 'D. ईश्वर चंद्र विद्यासागर'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Who founded the "Satyashodhak Samaj" in Maharashtra for the upliftment of lower castes and women?',
        options: ['A. Dr. B.R. Ambedkar', 'B. Jyotirao Phule', 'C. Gopal Krishna Gokhale', 'D. Bal Gangadhar Tilak'],
      },
      hindi: {
        text: 'महाराष्ट्र में वंचित वर्गों और महिलाओं के उत्थान के लिए "सत्यशोधक समाज" की स्थापना किसने की थी?',
        options: ['A. डॉ. बी.आर. अंबेडकर', 'B. ज्योतिराव फुले', 'C. गोपाल कृष्ण गोखले', 'D. बाल गंगाधर तिलक'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'In which year was the Indian National Congress (INC) founded in Bombay?',
        options: ['A. 1885', 'B. 1880', 'C. 1890', 'D. 1895'],
      },
      hindi: {
        text: 'बंबई में भारतीय राष्ट्रीय कांग्रेस (INC) की स्थापना किस वर्ष हुई थी?',
        options: ['A. 1885', 'B. 1880', 'C. 1890', 'D. 1895'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Who was the first President of the Indian National Congress in 1885?',
        options: ['A. A.O. Hume', 'B. W.C. Bonnerjee', 'C. Dadabhai Naoroji', 'D. Badruddin Tyabji'],
      },
      hindi: {
        text: '1885 में भारतीय राष्ट्रीय कांग्रेस के प्रथम अध्यक्ष कौन थे?',
        options: ['A. ए.ओ. ह्यूम', 'B. डब्ल्यू.सी. बनर्जी (व्योमेश चंद्र बनर्जी)', 'C. दादाभाई नौरोजी', 'D. बदरुद्दीन तैयबजी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'The Partition of Bengal in 1905 was ordered by which Viceroy of India?',
        options: ['A. Lord Ripon', 'B. Lord Curzon', 'C. Lord Minto', 'D. Lord Hardinge'],
      },
      hindi: {
        text: '1905 में बंगाल विभाजन का आदेश भारत के किस वायसराय ने दिया था?',
        options: ['A. लॉर्ड रिपन', 'B. लॉर्ड कर्जन', 'C. लॉर्ड मिंटो', 'D. लॉर्ड हार्डिंग'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'In which year did the Dandi March (Salt Satyagraha) take place?',
        options: ['A. 1920', 'B. 1930', 'C. 1942', 'D. 1919'],
      },
      hindi: {
        text: 'महात्मा गांधी का ऐतिहासिक दांडी मार्च (नमक सत्याग्रह) किस वर्ष हुआ था?',
        options: ['A. 1920', 'B. 1930', 'C. 1942', 'D. 1919'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'The tragic Jallianwala Bagh massacre occurred on which date in Amritsar?',
        options: ['A. 13 April 1919', 'B. 15 August 1919', 'C. 26 January 1920', 'D. 10 May 1857'],
      },
      hindi: {
        text: 'अमृतसर में दुखद जलियांवाला बाग हत्याकांड किस तारीख को हुआ था?',
        options: ['A. 13 अप्रैल 1919', 'B. 15 अगस्त 1919', 'C. 26 जनवरी 1920', 'D. 10 मई 1857'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'In which historic session of INC was the resolution of "Purna Swaraj" (Complete Independence) passed in 1929?',
        options: ['A. Calcutta', 'B. Lahore', 'C. Karachi', 'D. Lucknow'],
      },
      hindi: {
        text: '1929 में कांग्रेस के किस ऐतिहासिक अधिवेशन में "पूर्ण स्वराज" का प्रस्ताव पारित किया गया था?',
        options: ['A. कलकत्ता', 'B. लाहौर', 'C. कराची', 'D. लखनऊ'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'In which year was the Non-Cooperation Movement suspended following the Chauri Chaura incident?',
        options: ['A. 1920', 'B. 1922', 'C. 1924', 'D. 1930'],
      },
      hindi: {
        text: 'चौरी-चौरा घटना के बाद असहयोग आंदोलन को किस वर्ष स्थगित किया गया था?',
        options: ['A. 1920', 'B. 1922', 'C. 1924', 'D. 1930'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Who gave the historic slogan "Give me blood, and I shall give you freedom!"?',
        options: ['A. Mahatma Gandhi', 'B. Subhash Chandra Bose', 'C. Bhagat Singh', 'D. Bal Gangadhar Tilak'],
      },
      hindi: {
        text: '"तुम मुझे खून दो, मैं तुम्हें आजादी दूंगा!" का ऐतिहासिक नारा किसने दिया था?',
        options: ['A. महात्मा गांधी', 'B. सुभाष चंद्र बोस', 'C. भगत सिंह', 'D. बाल गंगाधर तिलक'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'In which year did Mahatma Gandhi launch the "Quit India Movement" with the call "Do or Die"?',
        options: ['A. 1940', 'B. 1942', 'C. 1945', 'D. 1939'],
      },
      hindi: {
        text: 'महात्मा गांधी ने "करो या मरो" के नारे के साथ "भारत छोड़ो आंदोलन" किस वर्ष शुरू किया था?',
        options: ['A. 1940', 'B. 1942', 'C. 1945', 'D. 1939'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'Who was known as the "Grand Old Man of India" and authored "Poverty and Un-British Rule in India"?',
        options: ['A. Gopal Krishna Gokhale', 'B. Dadabhai Naoroji', 'C. Surendranath Banerjee', 'D. Pheroze Shah Mehta'],
      },
      hindi: {
        text: '"भारत के वयोवृद्ध पुरुष" (Grand Old Man of India) के रूप में कौन जाने जाते थे, जिन्होंने "पॉवर्टी एंड अन-ब्रिटिश रूल इन इंडिया" लिखी?',
        options: ['A. गोपाल कृष्ण गोखले', 'B. दादाभाई नौरोजी', 'C. सुरेंद्रनाथ बनर्जी', 'D. फिरोजशाह मेहता'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'Which British Viceroy is known as the "Father of Local Self-Government in India"?',
        options: ['A. Lord Lytton', 'B. Lord Ripon', 'C. Lord Mayo', 'D. Lord Curzon'],
      },
      hindi: {
        text: 'किस ब्रिटिश वायसराय को "भारत में स्थानीय स्वशासन का जनक" कहा जाता है?',
        options: ['A. लॉर्ड लिटन', 'B. लॉर्ड रिपन', 'C. लॉर्ड मेयो', 'D. लॉर्ड कर्जन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Who was the founder of the "Servants of India Society" in 1905?',
        options: ['A. Bal Gangadhar Tilak', 'B. Gopal Krishna Gokhale', 'C. Lala Lajpat Rai', 'D. Bipin Chandra Pal'],
      },
      hindi: {
        text: '1905 में "सर्वेंट्स ऑफ इंडिया सोसाइटी" की स्थापना किसने की थी?',
        options: ['A. बाल गंगाधर तिलक', 'B. गोपाल कृष्ण गोखले', 'C. लाला लाजपत राय', 'D. बिपिन चंद्र पाल'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'The Poona Pact (1932) was signed between Mahatma Gandhi and which prominent leader?',
        options: ['A. Jawaharlal Nehru', 'B. Dr. B.R. Ambedkar', 'C. Muhammad Ali Jinnah', 'D. Tej Bahadur Sapru'],
      },
      hindi: {
        text: 'पूना पैक्ट (1932) महात्मा गांधी और किस प्रमुख नेता के बीच हस्ताक्षरित हुआ था?',
        options: ['A. जवाहरलाल नेहरू', 'B. डॉ. बी.आर. अंबेडकर', 'C. मुहम्मद अली जिन्ना', 'D. तेज बहादुर सप्रू'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'Who was known as the "Iron Man of India" for integrating 560+ princely states?',
        options: ['A. Jawaharlal Nehru', 'B. Sardar Vallabhbhai Patel', 'C. Subhas Chandra Bose', 'D. C. Rajagopalachari'],
      },
      hindi: {
        text: '560 से अधिक रियासतों के एकीकरण के लिए किसे "भारत का लौह पुरुष" कहा जाता है?',
        options: ['A. जवाहरलाल नेहरू', 'B. सरदार वल्लभभाई पटेल', 'C. सुभाष चंद्र बोस', 'D. सी. राजगोपालाचारी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'Who was the first Governor-General of independent India (1947–1948)?',
        options: ['A. Lord Wavell', 'B. Lord Mountbatten', 'C. C. Rajagopalachari', 'D. Dr. Rajendra Prasad'],
      },
      hindi: {
        text: 'स्वतंत्र भारत के प्रथम गवर्नर-जनरल (1947–1948) कौन थे?',
        options: ['A. लॉर्ड वेवेल', 'B. लॉर्ड माउंटबेटन', 'C. सी. राजगोपालाचारी', 'D. डॉ. राजेंद्र प्रसाद'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
  Geography: [
    {
      number: 1,
      english: {
        text: 'What is the longest river in the world?',
        options: ['A. Amazon River', 'B. Nile River', 'C. Yangtze River', 'D. Mississippi River'],
      },
      hindi: {
        text: 'विश्व की सबसे लंबी नदी कौन सी है?',
        options: ['A. अमेज़न नदी', 'B. नील नदी', 'C. यांग्त्ज़ी नदी', 'D. मिसिसिपी नदी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Which is the highest mountain peak in the world?',
        options: ['A. K2 (Godwin-Austen)', 'B. Kangchenjunga', 'C. Mount Everest', 'D. Lhotse'],
      },
      hindi: {
        text: 'विश्व की सबसे ऊँची पर्वत चोटी कौन सी है?',
        options: ['A. K2 (गॉडविन ऑस्टिन)', 'B. कंचनजंगा', 'C. माउंट एवरेस्ट', 'D. ल्होत्से'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Which Indian state has the longest coastline?',
        options: ['A. Maharashtra', 'B. Gujarat', 'C. Tamil Nadu', 'D. Andhra Pradesh'],
      },
      hindi: {
        text: 'भारत के किस राज्य की तटरेखा सबसे लंबी है?',
        options: ['A. महाराष्ट्र', 'B. गुजरात', 'C. तमिलनाडु', 'D. आंध्र प्रदेश'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'The Tropic of Cancer passes through how many Indian states?',
        options: ['A. 6 states', 'B. 7 states', 'C. 8 states', 'D. 9 states'],
      },
      hindi: {
        text: 'कर्क रेखा भारत के कितने राज्यों से होकर गुजरती है?',
        options: ['A. 6 राज्य', 'B. 7 राज्य', 'C. 8 राज्य', 'D. 9 राज्य'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Which is the largest freshwater lake in India?',
        options: ['A. Chilika Lake', 'B. Wular Lake', 'C. Sambhar Lake', 'D. Dal Lake'],
      },
      hindi: {
        text: 'भारत की सबसे बड़ी मीठे पानी की झील कौन सी है?',
        options: ['A. चिल्का झील', 'B. वुलर झील', 'C. सांभर झील', 'D. डल झील'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'Which layer of the atmosphere contains the ozone layer?',
        options: ['A. Troposphere', 'B. Stratosphere', 'C. Mesosphere', 'D. Thermosphere'],
      },
      hindi: {
        text: 'वायुमंडल की किस परत में ओजोन परत पाई जाती है?',
        options: ['A. क्षोभमंडल', 'B. समतापमंडल (Stratosphere)', 'C. मध्यमंडल', 'D. बाह्य वायुमंडल'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Which strait separates India and Sri Lanka?',
        options: ['A. Malacca Strait', 'B. Palk Strait', 'C. Sunda Strait', 'D. Gibraltar Strait'],
      },
      hindi: {
        text: 'कौन सी जलडमरूमध्य भारत और श्रीलंका को अलग करती है?',
        options: ['A. मलक्का जलडमरूमध्य', 'B. पाक जलडमरूमध्य (Palk Strait)', 'C. सुंडा जलडमरूमध्य', 'D. जिब्राल्टर जलडमरूमध्य'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the capital city of Australia?',
        options: ['A. Sydney', 'B. Melbourne', 'C. Canberra', 'D. Brisbane'],
      },
      hindi: {
        text: 'ऑस्ट्रेलिया की राजधानी क्या है?',
        options: ['A. सिडनी', 'B. मेलबर्न', 'C. कैनबरा', 'D. ब्रिस्बेन'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'Which is the largest hot desert in the world?',
        options: ['A. Gobi Desert', 'B. Kalahari Desert', 'C. Sahara Desert', 'D. Thar Desert'],
      },
      hindi: {
        text: 'विश्व का सबसे बड़ा गर्म मरुस्थल कौन सा है?',
        options: ['A. गोबी मरुस्थल', 'B. कालाहारी मरुस्थल', 'C. सहारा मरुस्थल', 'D. थार मरुस्थल'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'The standard meridian of India (82°30\' E) passes through which city?',
        options: ['A. Mirzapur (Prayagraj)', 'B. Varanasi', 'C. Patna', 'D. Bhopal'],
      },
      hindi: {
        text: 'भारत की मानक मध्याह्न रेखा (82°30\' पूर्व) किस शहर के निकट से गुजरती है?',
        options: ['A. मिर्जापुर (प्रयागराज)', 'B. वाराणसी', 'C. पटना', 'D. भोपाल'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Which continent is known as the "Dark Continent"?',
        options: ['A. Asia', 'B. Africa', 'C. South America', 'D. Australia'],
      },
      hindi: {
        text: 'किस महाद्वीप को "अंध महाद्वीप" (Dark Continent) कहा जाता है?',
        options: ['A. एशिया', 'B. अफ्रीका', 'C. दक्षिण अमेरिका', 'D. ऑस्ट्रेलिया'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'Which river is known as the "Sorrow of Bihar"?',
        options: ['A. Gandak', 'B. Kosi', 'C. Son', 'D. Damodar'],
      },
      hindi: {
        text: 'किस नदी को "बिहार का शोक" कहा जाता है?',
        options: ['A. गंडक', 'B. कोसी', 'C. सोन', 'D. दामोदर'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Which planet is known as the "Red Planet"?',
        options: ['A. Venus', 'B. Mars', 'C. Jupiter', 'D. Saturn'],
      },
      hindi: {
        text: 'किस ग्रह को "लाल ग्रह" के नाम से जाना जाता है?',
        options: ['A. शुक्र', 'B. मंगल (Mars)', 'C. बृहस्पति', 'D. शनि'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Which soil is best suited for cotton cultivation in India?',
        options: ['A. Alluvial Soil', 'B. Black Soil (Regur)', 'C. Red Soil', 'D. Laterite Soil'],
      },
      hindi: {
        text: 'भारत में कपास की खेती के लिए कौन सी मिट्टी सबसे उपयुक्त मानी जाती है?',
        options: ['A. जलोढ़ मिट्टी', 'B. काली मिट्टी (रेगुर)', 'C. लाल मिट्टी', 'D. लेटराइट मिट्टी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'The Sundarbans delta is formed by the confluence of which rivers?',
        options: ['A. Ganga and Yamuna', 'B. Ganga and Brahmaputra', 'C. Indus and Jhelum', 'D. Godavari and Krishna'],
      },
      hindi: {
        text: 'सुंदरबन डेल्टा किन नदियों के संगम से बनता है?',
        options: ['A. गंगा और यमुना', 'B. गंगा और ब्रह्मपुत्र', 'C. सिंधु और झेलम', 'D. गोदावरी और कृष्णा'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'Which country is known as the "Land of the Rising Sun"?',
        options: ['A. China', 'B. Japan', 'C. Norway', 'D. South Korea'],
      },
      hindi: {
        text: 'किस देश को "उगते सूरज की भूमि" कहा जाता है?',
        options: ['A. चीन', 'B. जापान', 'C. नॉर्वे', 'D. दक्षिण कोरिया'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'What is the capital of the Indian state of Nagaland?',
        options: ['A. Kohima', 'B. Dimapur', 'C. Imphal', 'D. Aizawl'],
      },
      hindi: {
        text: 'भारतीय राज्य नागालैंड की राजधानी क्या है?',
        options: ['A. कोहिमा', 'B. दीमापुर', 'C. इंफाल', 'D. आइजोल'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Which ocean is the largest and deepest ocean on Earth?',
        options: ['A. Atlantic Ocean', 'B. Pacific Ocean', 'C. Indian Ocean', 'D. Arctic Ocean'],
      },
      hindi: {
        text: 'पृथ्वी पर सबसे बड़ा और सबसे गहरा महासागर कौन सा है?',
        options: ['A. अटलांटिक महासागर', 'B. प्रशांत महासागर (Pacific Ocean)', 'C. हिंद महासागर', 'D. आर्कटिक महासागर'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What instrument is used to measure atmospheric pressure?',
        options: ['A. Thermometer', 'B. Barometer', 'C. Hygrometer', 'D. Anemometer'],
      },
      hindi: {
        text: 'वायुमंडलीय दबाव मापने के लिए किस उपकरण का उपयोग किया जाता है?',
        options: ['A. थर्मामीटर', 'B. बैरोमीटर (Barometer)', 'C. हाइग्रोमीटर', 'D. एनीमोमीटर'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'The Kaziranga National Park in Assam is famous for which animal?',
        options: ['A. Royal Bengal Tiger', 'B. One-horned Rhinoceros', 'C. Asiatic Lion', 'D. Snow Leopard'],
      },
      hindi: {
        text: 'असम का काजीरंगा राष्ट्रीय उद्यान किस पशु के लिए प्रसिद्ध है?',
        options: ['A. रॉयल बंगाल टाइगर', 'B. एक सींग वाला गैंडा', 'C. एशियाई शेर', 'D. हिम तेंदुआ'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
  Science: [
    {
      number: 1,
      english: {
        text: 'What is the chemical formula for water?',
        options: ['A. CO₂', 'B. H₂O', 'C. O₂', 'D. NaCl'],
      },
      hindi: {
        text: 'जल का रासायनिक सूत्र क्या है?',
        options: ['A. CO₂', 'B. H₂O', 'C. O₂', 'D. NaCl'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Which gas is most abundant in the Earth\'s atmosphere?',
        options: ['A. Oxygen', 'B. Nitrogen', 'C. Carbon Dioxide', 'D. Argon'],
      },
      hindi: {
        text: 'पृथ्वी के वायुमंडल में सबसे अधिक प्रचुर मात्रा में कौन सी गैस है?',
        options: ['A. ऑक्सीजन', 'B. नाइट्रोजन (लगभग 78%)', 'C. कार्बन डाइऑक्साइड', 'D. आर्गन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'What is the powerhouse of the cell?',
        options: ['A. Nucleus', 'B. Mitochondria', 'C. Ribosome', 'D. Endoplasmic reticulum'],
      },
      hindi: {
        text: 'कोशिका का पावरहाउस (ऊर्जा घर) किसे कहा जाता है?',
        options: ['A. केंद्रक', 'B. माइटोकॉन्ड्रिया (Mitochondria)', 'C. राइबोसोम', 'D. एंडोप्लाज्मिक रेटिकुलम'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the speed of light in vacuum approximately?',
        options: ['A. 3 × 10⁶ m/s', 'B. 3 × 10⁸ m/s', 'C. 3 × 10¹⁰ m/s', 'D. 3 × 10⁴ m/s'],
      },
      hindi: {
        text: 'निर्वात में प्रकाश की चाल लगभग कितनी होती है?',
        options: ['A. 3 × 10⁶ m/s', 'B. 3 × 10⁸ m/s', 'C. 3 × 10¹⁰ m/s', 'D. 3 × 10⁴ m/s'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Which vitamin is synthesized in the human body upon exposure to sunlight?',
        options: ['A. Vitamin A', 'B. Vitamin C', 'C. Vitamin D', 'D. Vitamin K'],
      },
      hindi: {
        text: 'सूर्य के प्रकाश के संपर्क में आने पर मानव शरीर में कौन सा विटामिन संश्लेषित होता है?',
        options: ['A. विटामिन A', 'B. विटामिन C', 'C. विटामिन D', 'D. विटामिन K'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'What is the SI unit of electric current?',
        options: ['A. Volt', 'B. Ampere', 'C. Ohm', 'D. Watt'],
      },
      hindi: {
        text: 'विद्युत धारा की SI इकाई क्या है?',
        options: ['A. वोल्ट', 'B. एम्पीयर (Ampere)', 'C. ओम', 'D. वाट'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'Which blood group is known as the "Universal Donor"?',
        options: ['A. AB positive', 'B. O negative', 'C. A positive', 'D. B negative'],
      },
      hindi: {
        text: 'किस रक्त समूह को "सर्वदाता" (Universal Donor) कहा जाता है?',
        options: ['A. AB पॉजिटिव', 'B. O नेगेटिव', 'C. A पॉजिटिव', 'D. B नेगेटिव'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'What is the pH value of pure distilled water at 25°C?',
        options: ['A. 5.5', 'B. 7.0', 'C. 8.5', 'D. 1.0'],
      },
      hindi: {
        text: '25°C पर शुद्ध आसुत जल का pH मान कितना होता है?',
        options: ['A. 5.5', 'B. 7.0 (उदासीन)', 'C. 8.5', 'D. 1.0'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'Which element has the chemical symbol "Fe"?',
        options: ['A. Fluorine', 'B. Iron', 'C. Francium', 'D. Lead'],
      },
      hindi: {
        text: 'रासायनिक प्रतीक "Fe" किस तत्व का प्रतिनिधित्व करता है?',
        options: ['A. फ्लोरीन', 'B. लोहा (Iron)', 'C. फ्रांसियम', 'D. सीसा'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'What is the hardest naturally occurring substance on Earth?',
        options: ['A. Graphene', 'B. Diamond', 'C. Platinum', 'D. Quartz'],
      },
      hindi: {
        text: 'पृथ्वी पर प्राकृतिक रूप से पाया जाने वाला सबसे कठोर पदार्थ कौन सा है?',
        options: ['A. ग्राफीन', 'B. हीरा (Diamond)', 'C. प्लैटिनम', 'D. क्वार्ट्ज'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Which law states that "For every action, there is an equal and opposite reaction"?',
        options: ['A. Newton\'s First Law', 'B. Newton\'s Second Law', 'C. Newton\'s Third Law', 'D. Law of Gravitation'],
      },
      hindi: {
        text: '"प्रत्येक क्रिया के बराबर और विपरीत प्रतिक्रिया होती है" यह न्यूटन का कौन सा नियम है?',
        options: ['A. प्रथम नियम', 'B. द्वितीय नियम', 'C. तृतीय नियम (Newton\'s 3rd Law)', 'D. गुरुत्वाकर्षण का नियम'],
      },
      correctAnswer: 'C',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'What pigment gives plants their green color and enables photosynthesis?',
        options: ['A. Carotenoid', 'B. Chlorophyll', 'C. Melanin', 'D. Anthocyanin'],
      },
      hindi: {
        text: 'पौधों को हरा रंग देने और प्रकाश संश्लेषण में सहायक वर्णक कौन सा है?',
        options: ['A. कैरोटीनॉयड', 'B. क्लोरोफिल (पर्णहरित)', 'C. मेलेनिन', 'D. एंथोसायनिन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'What is the main component of natural gas?',
        options: ['A. Ethane', 'B. Methane', 'C. Propane', 'D. Butane'],
      },
      hindi: {
        text: 'प्राकृतिक गैस का मुख्य घटक क्या है?',
        options: ['A. एथेन', 'B. मीथेन (CH₄)', 'C. प्रोपेन', 'D. ब्यूटेन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Which organ in the human body produces insulin?',
        options: ['A. Liver', 'B. Pancreas', 'C. Kidney', 'D. Gallbladder'],
      },
      hindi: {
        text: 'मानव शरीर में इंसुलिन का उत्पादन किस अंग द्वारा किया जाता है?',
        options: ['A. यकृत', 'B. अग्न्याशय (Pancreas)', 'C. वृक्क (किडनी)', 'D. पित्ताशय'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'Sound waves cannot travel through which of the following?',
        options: ['A. Solids', 'B. Liquids', 'C. Gases', 'D. Vacuum'],
      },
      hindi: {
        text: 'ध्वनि तरंगें निम्नलिखित में से किसमें से गमन नहीं कर सकती हैं?',
        options: ['A. ठोस', 'B. द्रव', 'C. गैस', 'D. निर्वात (Vacuum)'],
      },
      correctAnswer: 'D',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'What is the atomic number of Carbon?',
        options: ['A. 4', 'B. 6', 'C. 8', 'D. 12'],
      },
      hindi: {
        text: 'कार्बन की परमाणु संख्या (Atomic Number) क्या है?',
        options: ['A. 4', 'B. 6', 'C. 8', 'D. 12'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Which instrument is used to measure heartbeats and internal bodily sounds?',
        options: ['A. Sphygmomanometer', 'B. Stethoscope', 'C. Endoscope', 'D. ECG'],
      },
      hindi: {
        text: 'हृदय की धड़कन और आंतरिक शारीरिक ध्वनियों को सुनने के लिए किस उपकरण का उपयोग किया जाता है?',
        options: ['A. स्फिग्मोमैनोमीटर', 'B. स्टेथोस्कोप (Stethoscope)', 'C. एंडोस्कोप', 'D. ईसीजी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Dry ice is the solid form of which chemical compound?',
        options: ['A. Nitrogen', 'B. Carbon Dioxide', 'C. Hydrogen', 'D. Methane'],
      },
      hindi: {
        text: 'सूखी बर्फ (Dry Ice) किस रासायनिक यौगिक का ठोस रूप है?',
        options: ['A. नाइट्रोजन', 'B. कार्बन डाइऑक्साइड (CO₂)', 'C. हाइड्रोजन', 'D. मीथेन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'Which part of the human eye controls the amount of light entering the eye?',
        options: ['A. Cornea', 'B. Iris', 'C. Retina', 'D. Lens'],
      },
      hindi: {
        text: 'मानव आँख का कौन सा भाग आँख में प्रवेश करने वाले प्रकाश की मात्रा को नियंत्रित करता है?',
        options: ['A. कॉर्निया', 'B. आइरिस (परितारिका)', 'C. रेटिना', 'D. लेंस'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'What type of lens is used to correct myopia (nearsightedness)?',
        options: ['A. Convex lens', 'B. Concave lens', 'C. Cylindrical lens', 'D. Bifocal lens'],
      },
      hindi: {
        text: 'निकट दृष्टि दोष (मायोपिया) को ठीक करने के लिए किस प्रकार के लेंस का उपयोग किया जाता है?',
        options: ['A. उत्तल लेंस', 'B. अवतल लेंस (Concave Lens)', 'C. बेलनाकार लेंस', 'D. द्विफोकसी लेंस'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
  English: [
    {
      number: 1,
      english: {
        text: 'Choose the correct synonym for "ABUNDANT":',
        options: ['A. Scarce', 'B. Plentiful', 'C. Limited', 'D. Rare'],
      },
      hindi: {
        text: '"ABUNDANT" (प्रचुर) के लिए सही समानार्थी शब्द चुनें:',
        options: ['A. Scarce (दुर्लभ)', 'B. Plentiful (प्रचुर/भरपूर)', 'C. Limited (सीमित)', 'D. Rare (अनोखा)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'Choose the correct antonym for "CANDID":',
        options: ['A. Frank', 'B. Dishonest', 'C. Sincere', 'D. Truthful'],
      },
      hindi: {
        text: '"CANDID" (निष्कपट/स्पष्टवादी) के लिए सही विलोम शब्द चुनें:',
        options: ['A. Frank (स्पष्ट)', 'B. Dishonest (कपटी/बेईमान)', 'C. Sincere (सच्चा)', 'D. Truthful (सत्यप्रिय)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Identify the part of speech of the underlined word: "She sings BEAUTIFULLY."',
        options: ['A. Adjective', 'B. Adverb', 'C. Noun', 'D. Conjunction'],
      },
      hindi: {
        text: 'रेखांकित शब्द का शब्द भेद (Part of Speech) पहचानें: "She sings BEAUTIFULLY."',
        options: ['A. Adjective (विशेषण)', 'B. Adverb (क्रिया विशेषण)', 'C. Noun (संज्ञा)', 'D. Conjunction (समुच्चयबोधक)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the meaning of the idiom "A piece of cake"?',
        options: ['A. Very difficult task', 'B. Very easy task', 'C. A delicious sweet', 'D. An unexpected gift'],
      },
      hindi: {
        text: 'मुहावरे "A piece of cake" का क्या अर्थ है?',
        options: ['A. बहुत कठिन कार्य', 'B. बहुत आसान कार्य (Very easy task)', 'C. स्वादिष्ट मिठाई', 'D. अप्रत्याशित उपहार'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'Fill in the blank: "He has been living in London _____ 2018."',
        options: ['A. for', 'B. since', 'C. from', 'D. by'],
      },
      hindi: {
        text: 'रिक्त स्थान भरें: "He has been living in London _____ 2018."',
        options: ['A. for', 'B. since', 'C. from', 'D. by'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'Choose the correctly spelt word:',
        options: ['A. Accomodate', 'B. Accommodate', 'C. Acommodate', 'D. Acomodate'],
      },
      hindi: {
        text: 'सही वर्तनी (Spelling) वाला शब्द चुनें:',
        options: ['A. Accomodate', 'B. Accommodate', 'C. Acommodate', 'D. Acomodate'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'What is the plural form of the word "Phenomenon"?',
        options: ['A. Phenomenons', 'B. Phenomena', 'C. Phenomenas', 'D. Phenomeni'],
      },
      hindi: {
        text: '"Phenomenon" (घटना) का बहुवचन (Plural) रूप क्या है?',
        options: ['A. Phenomenons', 'B. Phenomena', 'C. Phenomenas', 'D. Phenomeni'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'Convert into Passive Voice: "The teacher praised the boy."',
        options: ['A. The boy praised the teacher.', 'B. The boy was praised by the teacher.', 'C. The boy is praised by the teacher.', 'D. The teacher was praised by the boy.'],
      },
      hindi: {
        text: 'कर्मवाच्य (Passive Voice) में बदलें: "The teacher praised the boy."',
        options: ['A. The boy praised the teacher.', 'B. The boy was praised by the teacher.', 'C. The boy is praised by the teacher.', 'D. The teacher was praised by the boy.'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'What is a one-word substitution for "A person who loves books"?',
        options: ['A. Philanthropist', 'B. Bibliophile', 'C. Polyglot', 'D. Biographer'],
      },
      hindi: {
        text: '"पुस्तकों से प्रेम करने वाला व्यक्ति" (A person who loves books) के लिए एक शब्द क्या है?',
        options: ['A. Philanthropist', 'B. Bibliophile (पुस्तकपोषी)', 'C. Polyglot', 'D. Biographer'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'Fill in the blank with the appropriate article: "Copper is _____ useful metal."',
        options: ['A. an', 'B. a', 'C. the', 'D. no article'],
      },
      hindi: {
        text: 'उचित आर्टिकल (Article) से रिक्त स्थान भरें: "Copper is _____ useful metal."',
        options: ['A. an', 'B. a (क्योंकि useful का उच्चारण य से होता है)', 'C. the', 'D. कोई आर्टिकल नहीं'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Choose the correct synonym for "OBSTINATE":',
        options: ['A. Flexible', 'B. Stubborn', 'C. Docile', 'D. Yielding'],
      },
      hindi: {
        text: '"OBSTINATE" (जिद्दी/हठी) का सही पर्यायवाची शब्द क्या है?',
        options: ['A. Flexible', 'B. Stubborn (हठी/जिद्दी)', 'C. Docile', 'D. Yielding'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'Identify the figure of speech in "The wind whispered through the dark trees."',
        options: ['A. Simile', 'B. Personification', 'C. Hyperbole', 'D. Metaphor'],
      },
      hindi: {
        text: '"The wind whispered through the dark trees" में कौन सा अलंकार (Figure of Speech) है?',
        options: ['A. Simile (उपमा)', 'B. Personification (मानवीकरण)', 'C. Hyperbole (अतिशयोक्ति)', 'D. Metaphor (रूपक)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'Select the correct antonym for "EPHEMERAL":',
        options: ['A. Transient', 'B. Permanent', 'C. Fleeting', 'D. Short-lived'],
      },
      hindi: {
        text: '"EPHEMERAL" (क्षणिक/अल्पकालिक) का सही विलोम शब्द क्या है?',
        options: ['A. Transient', 'B. Permanent (स्थायी/दीर्घकालिक)', 'C. Fleeting', 'D. Short-lived'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'Fill in the blank: "Neither the principal nor the teachers _____ present."',
        options: ['A. was', 'B. were', 'C. is', 'D. has'],
      },
      hindi: {
        text: 'रिक्त स्थान भरें: "Neither the principal nor the teachers _____ present."',
        options: ['A. was', 'B. were', 'C. is', 'D. has'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'What is the meaning of "To burn the midnight oil"?',
        options: ['A. To waste electricity', 'B. To study or work late into the night', 'C. To cause a fire', 'D. To wake up early'],
      },
      hindi: {
        text: '"To burn the midnight oil" मुहावरे का क्या अर्थ है?',
        options: ['A. बिजली बर्बाद करना', 'B. देर रात तक कड़ी मेहनत/पढ़ाई करना', 'C. आग लगाना', 'D. जल्दी उठना'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'Choose the word that means "Fear of confined spaces":',
        options: ['A. Acrophobia', 'B. Claustrophobia', 'C. Hydrophobia', 'D. Xenophobia'],
      },
      hindi: {
        text: '"संकीर्ण या बंद स्थानों का डर" के लिए कौन सा शब्द सही है?',
        options: ['A. Acrophobia', 'B. Claustrophobia', 'C. Hydrophobia', 'D. Xenophobia'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Which of the following sentences is grammatically correct?',
        options: ['A. One of the student are absent.', 'B. One of the students is absent.', 'C. One of the students are absent.', 'D. One of the student is absent.'],
      },
      hindi: {
        text: 'निम्नलिखित में से कौन सा वाक्य व्याकरण की दृष्टि से सही है?',
        options: ['A. One of the student are absent.', 'B. One of the students is absent.', 'C. One of the students are absent.', 'D. One of the student is absent.'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'Change into Indirect Speech: He said, "I am reading a book."',
        options: ['A. He said that he was reading a book.', 'B. He said that he is reading a book.', 'C. He told that he reads a book.', 'D. He said that I was reading a book.'],
      },
      hindi: {
        text: 'परोक्ष कथन (Indirect Speech) में बदलें: He said, "I am reading a book."',
        options: ['A. He said that he was reading a book.', 'B. He said that he is reading a book.', 'C. He told that he reads a book.', 'D. He said that I was reading a book.'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'Choose the correct preposition: "She is good _____ mathematics."',
        options: ['A. in', 'B. at', 'C. on', 'D. with'],
      },
      hindi: {
        text: 'उचित पूर्वसर्ग (Preposition) चुनें: "She is good _____ mathematics."',
        options: ['A. in', 'B. at', 'C. on', 'D. with'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'What is the superlative form of the adjective "BAD"?',
        options: ['A. Badder', 'B. Worst', 'C. Worse', 'D. Baddest'],
      },
      hindi: {
        text: 'विशेषण "BAD" का उत्तमावस्था (Superlative Degree) रूप क्या है?',
        options: ['A. Badder', 'B. Worst', 'C. Worse', 'D. Baddest'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
  Hindi: [
    {
      number: 1,
      english: {
        text: 'In Hindi grammar, how many types of Sandhi (संधि) are there?',
        options: ['A. 2', 'B. 3', 'C. 4', 'D. 5'],
      },
      hindi: {
        text: 'हिंदी व्याकरण में संधि के मुख्य रूप से कितने भेद होते हैं?',
        options: ['A. 2 भेद', 'B. 3 भेद (स्वर, व्यंजन, विसर्ग)', 'C. 4 भेद', 'D. 5 भेद'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 2,
      english: {
        text: 'What is the correct antonym of "अनुराग" (Anuraag)?',
        options: ['A. राग', 'B. विराग', 'C. प्रेम', 'D. द्वेष'],
      },
      hindi: {
        text: '"अनुराग" का सही विलोम शब्द क्या है?',
        options: ['A. राग', 'B. विराग', 'C. प्रेम', 'D. द्वेष'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 3,
      english: {
        text: 'Which is a correct synonym for "सूर्य" (Sun)?',
        options: ['A. निशाकर', 'B. दिनकर', 'C. शशांक', 'D. हिमांशु'],
      },
      hindi: {
        text: 'निम्नलिखित में से कौन सा "सूर्य" का पर्यायवाची शब्द है?',
        options: ['A. निशाकर', 'B. दिनकर', 'C. शशांक', 'D. हिमांशु'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 4,
      english: {
        text: 'What is the compound (समास) in "यथाशक्ति"?',
        options: ['A. तत्पुरुष समास', 'B. अव्ययीभाव समास', 'C. द्विगु समास', 'D. द्वंद्व समास'],
      },
      hindi: {
        text: '"यथाशक्ति" शब्द में कौन सा समास है?',
        options: ['A. तत्पुरुष समास', 'B. अव्ययीभाव समास', 'C. द्विगु समास', 'D. द्वंद्व समास'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 5,
      english: {
        text: 'What is the meaning of the Hindi idiom "आँखों का तारा होना"?',
        options: ['A. कम दिखाई देना', 'B. अत्यधिक प्रिय होना', 'C. घमंड करना', 'D. धोखा देना'],
      },
      hindi: {
        text: '"आँखों का तारा होना" मुहावरे का सही अर्थ क्या है?',
        options: ['A. कम दिखाई देना', 'B. अत्यधिक प्रिय होना', 'C. घमंड करना', 'D. धोखा देना'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 6,
      english: {
        text: 'Choose the correctly spelled (शुद्ध वर्तनी) word in Hindi:',
        options: ['A. उज्जवल', 'B. उज्ज्वल', 'C. उज्वल', 'D. उजवल'],
      },
      hindi: {
        text: 'निम्नलिखित में से शुद्ध वर्तनी वाला शब्द चुनिए:',
        options: ['A. उज्जवल', 'B. उज्ज्वल', 'C. उज्वल', 'D. उजवल'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 7,
      english: {
        text: 'What is the feminine form (स्त्रीलिंग) of "कवि"?',
        options: ['A. कविइत्री', 'B. कवयित्री', 'C. कवियत्री', 'D. कवित्री'],
      },
      hindi: {
        text: '"कवि" शब्द का सही स्त्रीलिंग रूप क्या होगा?',
        options: ['A. कविइत्री', 'B. कवयित्री', 'C. कवियत्री', 'D. कवित्री'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 8,
      english: {
        text: 'In Hindi, what is the case marker (विभक्ति चिन्ह) for "करण कारक"?',
        options: ['A. ने', 'B. से / के द्वारा', 'C. को', 'D. में / पर'],
      },
      hindi: {
        text: 'करण कारक का विभक्ति चिन्ह क्या है?',
        options: ['A. ने', 'B. से / के द्वारा (माध्यम)', 'C. को', 'D. में / पर'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 9,
      english: {
        text: 'What is a one-word substitution for "जो सब कुछ जानता हो"?',
        options: ['A. अल्पज्ञ', 'B. सर्वज्ञ', 'C. मर्मज्ञ', 'D. बहुज्ञ'],
      },
      hindi: {
        text: '"जो सब कुछ जानता हो" वाक्यांश के लिए एक शब्द क्या होगा?',
        options: ['A. अल्पज्ञ', 'B. सर्वज्ञ', 'C. मर्मज्ञ', 'D. बहुज्ञ'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 10,
      english: {
        text: 'What is the Sandhi split of "पवन"?',
        options: ['A. प + अन', 'B. पो + अन', 'C. पौ + अन', 'D. पाव + न'],
      },
      hindi: {
        text: '"पवन" शब्द का सही संधि विच्छेद क्या है?',
        options: ['A. प + अन', 'B. पो + अन (अयादि संधि)', 'C. पौ + अन', 'D. पाव + न'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 11,
      english: {
        text: 'Who is the author of the famous epic "गोदान" (Godan)?',
        options: ['A. जयशंकर प्रसाद', 'B. मुंशी प्रेमचंद', 'C. महादेवी वर्मा', 'D. सूर्यकांत त्रिपाठी निराला'],
      },
      hindi: {
        text: 'प्रसिद्ध उपन्यास "गोदान" के रचयिता कौन हैं?',
        options: ['A. जयशंकर प्रसाद', 'B. मुंशी प्रेमचंद', 'C. महादेवी वर्मा', 'D. सूर्यकांत त्रिपाठी निराला'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 12,
      english: {
        text: 'What is the compound (समास) in "दशानन"?',
        options: ['A. द्विगु समास', 'B. बहुव्रीहि समास', 'C. कर्मधारय समास', 'D. द्वंद्व समास'],
      },
      hindi: {
        text: '"दशानन" (दस हैं आनन जिसके अर्थात् रावण) में कौन सा समास है?',
        options: ['A. द्विगु समास', 'B. बहुव्रीहि समास', 'C. कर्मधारय समास', 'D. द्वंद्व समास'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 13,
      english: {
        text: 'What is the opposite word (विलोम) of "आस्तिक"?',
        options: ['A. धार्मिक', 'B. नास्तिक', 'C. सात्विक', 'D. अधर्मी'],
      },
      hindi: {
        text: '"आस्तिक" शब्द का सही विलोम शब्द क्या होगा?',
        options: ['A. धार्मिक', 'B. नास्तिक', 'C. सात्विक', 'D. अधर्मी'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 14,
      english: {
        text: 'What is the meaning of "दांत खट्टे करना"?',
        options: ['A. खट्टी चीज खाना', 'B. पराजित करना / हराना', 'C. दांत में दर्द होना', 'D. गुस्सा करना'],
      },
      hindi: {
        text: '"दांत खट्टे करना" मुहावरे का सही अर्थ क्या है?',
        options: ['A. खट्टी चीज खाना', 'B. पराजित करना / हरा देना', 'C. दांत में दर्द होना', 'D. गुस्सा करना'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 15,
      english: {
        text: 'In Devanagari script, which consonant is a Sanyukta Vyanjan (संयुक्त व्यंजन)?',
        options: ['A. क', 'B. ज्ञ', 'C. प', 'D. स'],
      },
      hindi: {
        text: 'देवनागरी लिपि में निम्नलिखित में से संयुक्त व्यंजन कौन सा है?',
        options: ['A. क', 'B. ज्ञ (ज् + ञ)', 'C. प', 'D. स'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 16,
      english: {
        text: 'What is the plural form (बहुवचन) of "चिड़िया"?',
        options: ['A. चिड़िये', 'B. चिड़ियाँ', 'C. चिड़ियों', 'D. चिड़ियन'],
      },
      hindi: {
        text: '"चिड़िया" शब्द का सही बहुवचन रूप क्या है?',
        options: ['A. चिड़िये', 'B. चिड़ियाँ', 'C. चिड़ियों', 'D. चिड़ियन'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 17,
      english: {
        text: 'Which word is a Tadbhav (तद्भव) word?',
        options: ['A. अग्नि', 'B. आग', 'C. सूर्य', 'D. कर्ण'],
      },
      hindi: {
        text: 'निम्नलिखित में से तद्भव शब्द कौन सा है?',
        options: ['A. अग्नि (तत्सम)', 'B. आग (तद्भव)', 'C. सूर्य (तत्सम)', 'D. कर्ण (तत्सम)'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 18,
      english: {
        text: 'What is the Sandhi split of "महर्षि"?',
        options: ['A. महा + ऋषि', 'B. मह + ऋषि', 'C. महा + ऋषी', 'D. महर + षि'],
      },
      hindi: {
        text: '"महर्षि" का सही संधि विच्छेद क्या है?',
        options: ['A. महा + ऋषि (गुण संधि)', 'B. मह + ऋषि', 'C. महा + ऋषी', 'D. महर + षि'],
      },
      correctAnswer: 'A',
      status: 'verified',
    },
    {
      number: 19,
      english: {
        text: 'What is the permanent emotion (स्थायी भाव) of "वीर रस"?',
        options: ['A. रति', 'B. उत्साह', 'C. क्रोध', 'D. शोक'],
      },
      hindi: {
        text: '"वीर रस" का स्थायी भाव क्या है?',
        options: ['A. रति', 'B. उत्साह', 'C. क्रोध', 'D. शोक'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
    {
      number: 20,
      english: {
        text: 'In Hindi, which word is a synonym for "अमृत"?',
        options: ['A. गरल', 'B. पीयूष', 'C. हलाहल', 'D. विष'],
      },
      hindi: {
        text: '"अमृत" का पर्यायवाची शब्द कौन सा है?',
        options: ['A. गरल (विष)', 'B. पीयूष (अमृत)', 'C. हलाहल (विष)', 'D. विष'],
      },
      correctAnswer: 'B',
      status: 'verified',
    },
  ],
};

// Derived English-only representation for backward compatibility
export const CURATED_STREAK_QUESTIONS: Record<Subject, ManualQuestion[]> = Object.fromEntries(
  Object.entries(BILINGUAL_STREAK_QUESTIONS).map(([subj, qs]) => [
    subj as Subject,
    qs.map((q) => ({
      number: q.number,
      text: q.english.text,
      options: q.english.options,
      correctAnswer: q.correctAnswer || 'A',
    })),
  ])
) as Record<Subject, ManualQuestion[]>;

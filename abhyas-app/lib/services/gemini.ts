/**
 * Lightweight Gemini AI utility for:
 * 1. Translating manual quiz questions to Hindi
 * 2. (Future) Auto-generating streak quiz questions
 *
 * Uses Google Gemini API (free tier) to conserve resources.
 */

import { ManualQuestion, Subject, Question, BilingualQuestion } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

/**
 * Calls OpenAI API (gpt-4o-mini)
 */
async function callOpenAIInternal(prompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    cache: 'no-store',
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('OpenAI API error:', res.status, errBody);
    const err = new Error(`OpenAI API error: ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('No text in OpenAI response');
  }

  return text.trim();
}

/**
 * Calls Gemini API
 */
async function callGeminiInternal(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Gemini API error:', res.status, errBody);
    const err = new Error(`Gemini API error: ${res.status}`);
    (err as any).status = res.status;
    throw err;
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text in Gemini response');
  }

  return text.trim();
}

// Global state to track which provider is currently active
let activeProvider: 'gemini' | 'openai' = GEMINI_API_KEY ? 'gemini' : 'openai';

/**
 * Calls the active AI provider.
 * Automatically swaps to the other provider if a 429 Rate Limit error is hit.
 */
export async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    throw new Error('Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured');
  }

  try {
    if (activeProvider === 'openai') {
      return await callOpenAIInternal(prompt);
    } else {
      return await callGeminiInternal(prompt);
    }
  } catch (err: any) {
    // If it's a rate limit error (429), try swapping
    if (err.status === 429 || err.message?.includes('429')) {
      const otherProvider = activeProvider === 'gemini' ? 'openai' : 'gemini';
      
      // Only swap if we actually have the key for the other provider
      const hasKeyForOther = otherProvider === 'gemini' ? !!GEMINI_API_KEY : !!OPENAI_API_KEY;
      
      if (hasKeyForOther) {
        console.log(`⚠️ Rate limit (429) hit on ${activeProvider}. Auto-swapping to ${otherProvider} API...`);
        activeProvider = otherProvider;
        
        if (activeProvider === 'openai') {
          return await callOpenAIInternal(prompt);
        } else {
          return await callGeminiInternal(prompt);
        }
      }
    }
    
    // Rethrow if it wasn't a 429 or if we don't have the key for the other provider
    throw err;
  }
}

/**
 * Translate an array of ManualQuestions from English to Hindi using Google Translate API (fast).
 * Returns translated questions with the same structure.
 */
export async function translateQuestionsToHindi(
  questions: ManualQuestion[]
): Promise<ManualQuestion[]> {
  if (questions.length === 0) return questions;

  try {
    const CHUNK_SIZE = 20;
    const translatedQuestions: ManualQuestion[] = [];

    // Create an array of chunked promises for parallel processing
    const promises = [];
    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);
      
      const prompt = `You are an expert academic translator specializing in Indian competitive exams.
Translate the following multiple-choice questions from English to Hindi.

Rules:
1. Ensure mathematical, scientific, and technical terms are accurately translated into formal academic Hindi.
2. Preserve all mathematical formulas, equations, numbers, and Latin/Greek symbols exactly as they are.
3. Translate ONLY the 'text' string and the strings inside the 'options' array.
4. Do NOT translate the 'correctAnswer' or 'number' fields.
5. Return EXACTLY the same JSON structure as provided.
6. Provide ONLY the final JSON array in your response, with no markdown, no code blocks, and no extra text.

Here is the JSON array of questions to translate:
${JSON.stringify(chunk, null, 2)}`;

      promises.push(
        callGemini(prompt).then((rawResponse) => {
          let jsonStr = rawResponse;
          const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          return JSON.parse(jsonStr) as ManualQuestion[];
        })
      );
    }

    // Wait for all chunks to finish translating
    const chunkResults = await Promise.all(promises);

    // Flatten results
    for (const resChunk of chunkResults) {
      translatedQuestions.push(...resChunk);
    }

    // Ensure all questions translated properly, and clean up options
    if (translatedQuestions.length !== questions.length) {
      console.warn(`Translation length mismatch: expected ${questions.length}, got ${translatedQuestions.length}`);
    }

    return translatedQuestions.map(q => ({
      number: q.number,
      text: q.text,
      options: q.options.map(opt => opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim()),
      correctAnswer: q.correctAnswer,
    }));
  } catch (error) {
    console.error('Failed to translate questions to Hindi via LLM:', error);
    return questions; // Graceful fallback to English if translation fails
  }
}

/**
 * Extract exact questions from raw PDF text using Gemini AI.
 * This does deep analysis to correctly identify the question numbers, text, and options,
 * even when special characters and encoding artifacts are present (like Hindi Kruti Dev/DevLys).
 */
export async function extractQuestionsWithLLM(
  text: string,
  start: number,
  end: number,
  language: string
): Promise<Question[]> {
  try {
    const prompt = `You are an expert data extractor and OCR text corrector for Indian competitive exams.
I have extracted raw text from a PDF containing multiple-choice questions. 
The text might contain garbled characters, formatting issues, or mixed English/Hindi content.

Task:
1. Extract questions numbered exactly from ${start} to ${end}.
2. The target language for extraction is: ${language === 'hi' ? 'Hindi' : 'English'}. If the PDF is bilingual, only extract the ${language === 'hi' ? 'Hindi' : 'English'} version of the questions.
3. Fix any garbled characters, typos, and font artifacts (e.g., legacy font encodings in Hindi) to form correct academic words.
4. Preserve all mathematical formulas, numbers, equations, and Latin/Greek symbols exactly as they are.
5. Identify exactly 4 options for each question, stripping out any '(A)', '(B)' prefixes from the option text itself.
6. Do NOT include the answer key or any explanation.

Return ONLY a valid JSON array of objects with this structure (no markdown, no extra text):
[
  {
    "number": 1,
    "text": "Question text...",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
  }
]

Here is the raw PDF text:
"""
${text}
"""`;

    // Wait, the text can be huge, but Gemini Flash has 1M context. Let's send it.
    const rawResponse = await callGemini(prompt);
    
    let jsonStr = rawResponse;
    const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    let questions = JSON.parse(jsonStr) as Question[];
    
    // Ensure we only return questions within start and end
    questions = questions.filter(q => q.number >= start && q.number <= end);
    
    // Clean up option prefixes if LLM missed it
    return questions.map(q => ({
      number: q.number,
      text: q.text,
      options: (q.options || []).map(opt => opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim()),
    }));
  } catch (error) {
    console.error('Failed to extract questions via LLM:', error);
    return []; // Return empty so fallback can happen if necessary
  }
}

/**
 * Clean up garbled Hindi text extracted from PDFs (Kruti Dev/DevLys artifacts) using Gemini AI.
 * This runs on PDF test extractions when language is Hindi.
 */
export async function cleanGarbledHindiQuestions(
  questions: Question[]
): Promise<Question[]> {
  if (questions.length === 0) return questions;

  try {
    const CHUNK_SIZE = 20;
    const cleanedQuestions: Question[] = [];
    const promises = [];

    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);
      
      const prompt = `You are an expert Hindi proofreader and editor.
The following JSON array contains multiple-choice questions in Hindi extracted from a PDF.
Due to legacy font encodings (like Kruti Dev) and PDF extraction issues, the text contains garbled characters and artifacts such as 'ê', 'f', 'Û०रा', 'क्‌म', 'र,ु', 'मा°', etc.

Rules:
1. Fix all garbled characters, typos, and font artifacts to form correct academic Hindi words (e.g. 'Û०रा' -> 'द्वारा', 'êप' -> 'रूप', 'fूल' -> 'फूल', 'कृ्‌या' -> 'क्रिया', 'र,ु' -> 'वृंद').
2. Do NOT translate the questions. They are already in Hindi. Just correct the spelling/artifacts.
3. Preserve all mathematical formulas, numbers, equations, and Latin/Greek symbols exactly as they are.
4. Correct ONLY the 'text' string and the strings inside the 'options' array.
5. Do NOT modify the 'number' field.
6. Return EXACTLY the same JSON structure as provided.
7. Provide ONLY the final JSON array in your response, with no markdown, no code blocks, and no extra text.

Here is the JSON array of questions to clean:
${JSON.stringify(chunk, null, 2)}`;

      promises.push(
        callGemini(prompt).then((rawResponse) => {
          let jsonStr = rawResponse;
          const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          return JSON.parse(jsonStr) as Question[];
        })
      );
    }

    const chunkResults = await Promise.all(promises);

    for (const resChunk of chunkResults) {
      cleanedQuestions.push(...resChunk);
    }

    if (cleanedQuestions.length !== questions.length) {
      console.warn(`Cleaning length mismatch: expected ${questions.length}, got ${cleanedQuestions.length}`);
    }

    // Return cleaned results, preserving exact original options count and non-empty options
    return cleanedQuestions.map((q, idx) => {
      const orig = questions[idx];
      let opts = (q.options || []).map((opt, oIdx) => {
        const cleaned = opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim();
        if (!cleaned && orig && orig.options && orig.options[oIdx]) {
          return orig.options[oIdx].replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim() || orig.options[oIdx].trim();
        }
        return cleaned || opt.trim();
      });
      if (orig && orig.options && opts.length > orig.options.length) {
        opts = opts.slice(0, orig.options.length);
      }
      return {
        number: orig ? orig.number : q.number,
        text: q.text || (orig ? orig.text : ''),
        options: opts.length > 0 ? opts : (orig ? orig.options : []),
      };
    });
  } catch (error) {
    console.error('Failed to clean Hindi questions via LLM:', error);
    return questions; // Graceful fallback to regex-only cleaned questions
  }
}

/**
 * Generate 20 quiz questions for a given subject using Gemini AI.
 * Used for the Daily Streak Quiz auto-generation.
 */
export async function generateStreakQuestions(subject: Subject): Promise<ManualQuestion[]> {
  const subjectGuidance = (subject === 'Modern History' || (subject as string) === 'History')
    ? `CRITICAL REQUIREMENT FOR "Modern History":
Every single question MUST be strictly from Modern Indian History (1757–1947).
Topics to cover:
- Revolt of 1857 (leaders, centers, causes)
- Indian Freedom Struggle & National Movement
- Socio-Religious Reform Movements (Brahmo Samaj, Arya Samaj, Satyashodhak Samaj, Ramakrishna Mission, Aligarh Movement)
- Formation and Sessions of Indian National Congress (1885–1947)
- Partition of Bengal (1905), Swadeshi & Boycott Movement
- Home Rule League, Lucknow Pact, Rowlatt Act, Jallianwala Bagh (1919)
- Non-Cooperation Movement (1920-22), Khilafat Movement, Chauri Chaura
- Simon Commission, Lahore Session (Purna Swaraj 1929), Dandi March & Civil Disobedience (1930)
- Round Table Conferences, Poona Pact (1932), Government of India Act 1935
- Quit India Movement (1942), INA & Subhash Chandra Bose, Cabinet Mission & Independence 1947
- British Governors-General and Viceroys (Dalhousie, Canning, Ripon, Curzon, Mountbatten)
- Revolutionary freedom fighters (Bhagat Singh, Chandrashekhar Azad, Surya Sen)
DO NOT include Ancient or Medieval or non-Indian World History questions.`
    : `Questions should cover a broad range of sub-topics within ${subject}.`;

  const prompt = `You are an expert quiz question creator for competitive exam preparation in India.

Generate exactly 20 multiple-choice questions for the subject: "${subject}".
Each question should be at an intermediate difficulty level, suitable for competitive exam aspirants.

${subjectGuidance}

Return ONLY a valid JSON array (no markdown, no code fences, no extra text):
[
  {
    "number": 1,
    "text": "Question text here",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correctAnswer": "B",
    "explanation": "A detailed, full explanation in simple language clarifying why the correct answer is right, providing relevant historical, scientific, or mathematical context and why other key options are incorrect."
  },
  ...
]

Rules:
- Each question must have exactly 4 options labeled A, B, C, D
- The correctAnswer must be one of "A", "B", "C", or "D"
- Questions should be factually accurate
- Options should be plausible (no obviously wrong distractors)
- Vary the position of the correct answer across questions
- Do NOT repeat questions or make trivially similar ones
- Return exactly 20 questions`;

  const rawResponse = await callGemini(prompt);

  // Extract JSON
  let jsonStr = rawResponse;
  const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const questions: ManualQuestion[] = JSON.parse(jsonStr);

  if (!Array.isArray(questions) || questions.length < 10) {
    throw new Error(`Expected 20 questions, got ${questions?.length || 0}`);
  }

  // Ensure proper numbering and structure
  return questions.slice(0, 20).map((q, idx) => ({
    number: idx + 1,
    text: q.text,
    options: q.options.slice(0, 4),
    correctAnswer: q.correctAnswer,
    explanation: q.explanation || 'No explanation provided.',
  }));
}

/**
 * Builds subject-specific STET/BPSC TRE-level prompt guidance for practice test generation.
 */
function getPracticeSubjectGuidance(subject: string): string {
  switch (subject) {
    case 'Modern History':
      return `CRITICAL: Every question MUST be from Modern Indian History (1757–1947).
Topics: Revolt of 1857, Indian Freedom Struggle, Socio-Religious Reform Movements (Brahmo Samaj, Arya Samaj, Ramakrishna Mission, Aligarh Movement), INC Sessions (1885–1947), Partition of Bengal (1905), Swadeshi & Boycott, Home Rule League, Rowlatt Act, Jallianwala Bagh, Non-Cooperation Movement, Khilafat, Simon Commission, Dandi March, Quit India 1942, INA & Subhash Chandra Bose, Independence 1947, British Viceroys, Revolutionary fighters.
DO NOT include Ancient, Medieval, or World History questions.`;
    case 'Indian Geography':
      return `CRITICAL: ALL questions must be about Indian Geography only.
Topics: Indian states and capitals, rivers and tributaries (Ganga, Yamuna, Brahmaputra, Godavari, Krishna, Kaveri), mountain ranges (Himalayas, Aravalli, Vindhya, Sahyadri), Deccan Plateau, soil types (alluvial, black cotton, laterite, red), climate zones and monsoon patterns, national parks and wildlife sanctuaries (Jim Corbett, Kaziranga, Sundarbans, Gir), minerals and mining regions, agriculture (wheat, rice, cotton, jute belts), coastal geography, islands (Andaman & Nicobar, Lakshadweep), Indian ocean and Bay of Bengal features.
DO NOT include any world geography questions.`;
    case 'Global Geography':
      return `CRITICAL: ALL questions must be about World/Global Geography.
Topics: World continents and oceans, world capitals, longest rivers (Nile, Amazon, Yangtze, Mississippi), highest mountains (Everest, K2, Kangchenjunga), world deserts (Sahara, Gobi, Arabian, Atacama), climate zones (tropical, temperate, polar), ocean currents, world time zones, international boundaries and border disputes, major straits and channels (Strait of Gibraltar, Bosphorus, Malacca, Palk Strait), continents geography, island nations, world seas and gulfs, tectonic plates and earthquakes, trade winds and cyclone regions.
DO NOT include any India-specific geography questions.`;
    case 'Science':
      return `Topics for STET/BPSC TRE Science: Physics (motion, force, light, sound, electricity, magnetism, heat), Chemistry (elements, compounds, mixtures, acids-bases-salts, chemical reactions, periodic table, carbon chemistry), Biology (cell structure, human body systems — digestive, respiratory, circulatory, nervous, skeletal — plant physiology, nutrition, diseases and pathogens, ecology and food chains). Match difficulty to Bihar STET Paper II level.`;
    case 'Math':
      return `Topics for STET/BPSC TRE Mathematics: Number System, HCF & LCM, Fractions & Decimals, Percentage, Profit & Loss, Ratio & Proportion, Simple & Compound Interest, Time & Work, Time & Distance, Average, Algebra (linear equations), Geometry (triangles, circles, quadrilaterals), Mensuration (area, volume), Statistics (mean, median, mode). Match difficulty to BPSC TRE Math level.`;
    case 'Music':
      return `Topics for STET/BPSC TRE Music: Classical Music theory (Ragas, Talas, Swaras — Sa Re Ga Ma Pa Dha Ni), Hindustani and Carnatic traditions, famous classical musicians (Tansen, Bismillah Khan, Ravi Shankar, Lata Mangeshkar, MS Subbulakshmi), musical instruments (classification — string/wind/percussion/keyboard), Music Gharanas (Gwalior, Kirana, Agra, Patiala, Jaipur-Atrauli), film music history, folk music of different states, UNESCO intangible cultural heritage in Indian music.`;
    case 'English':
      return `Topics for STET/BPSC TRE English: Grammar (parts of speech, tenses, active-passive voice, direct-indirect speech, subject-verb agreement), Vocabulary (synonyms, antonyms, one-word substitutions, idioms and phrases), Reading Comprehension, Spotting Errors, Sentence Improvement, Fill in the Blanks, Literature (Shakespeare, John Milton, Charles Dickens, George Orwell, Rabindranath Tagore works in English). Match STET/BPSC TRE difficulty.`;
    case 'Hindi':
      return `Topics for STET/BPSC TRE Hindi: Hindi Grammar (संज्ञा, सर्वनाम, विशेषण, क्रिया, काल, वाच्य, समास, संधि, अलंकार, रस, छंद), Vocabulary (पर्यायवाची, विलोम, मुहावरे, लोकोक्तियाँ), Hindi Literature (Kabir, Tulsidas, Surdas, Premchand, Mahadevi Verma, Jai Shankar Prasad, Ramdhari Singh 'Dinkar'), Apathit Gadyansh. Match Bihar STET Hindi Paper II difficulty.`;
    case 'Geography':
      return `Topics: Indian geography, world geography, physical geography, human geography — broad coverage suitable for STET/BPSC TRE level.`;
    default:
      return `Questions should cover a broad range of important topics within ${subject} at STET/BPSC TRE difficulty level.`;
  }
}

/**
 * Generate 80 STET/BPSC TRE-level practice test questions for the given subject using Gemini AI.
 * Returns bilingual (English + Hindi) BilingualQuestion[] with 5 options (a–e) and correct answers.
 * Generation happens in two passes: English first, then Hindi translation.
 */
export async function generatePracticeTestQuestions(subject: string): Promise<BilingualQuestion[]> {
  const TOTAL_QUESTIONS = 80;
  const BATCH_SIZE = 20; // Generate 4 batches of 20 to stay within token limits
  const subjectGuidance = getPracticeSubjectGuidance(subject);

  // --- Pass 1: Generate 80 English questions in 4 batches ---
  const englishBatches: ManualQuestion[][] = [];

  for (let batch = 0; batch < 4; batch++) {
    const startNum = batch * BATCH_SIZE + 1;
    const endNum = startNum + BATCH_SIZE - 1;

    const prompt = `You are an expert exam question creator for STET (State Teacher Eligibility Test) and BPSC TRE (Bihar Public Service Commission Teacher Recruitment Exam) in India.

Generate exactly ${BATCH_SIZE} multiple-choice questions for the subject: "${subject}".
These are questions ${startNum} to ${endNum} in a ${TOTAL_QUESTIONS}-question practice test.

DIFFICULTY & PATTERN REQUIREMENTS:
- Match the difficulty and style of real STET Paper II and BPSC TRE exam questions.
- Questions should test factual recall, conceptual understanding, and application — not trivial general knowledge.
- Use 5 options labeled a, b, c, d, e (not A, B, C, D) with one correct answer.
- The correct answer key must be one of: "a", "b", "c", "d", "e" (lowercase).
- Plausible distractors — incorrect options should be reasonable, not obviously wrong.

SUBJECT GUIDANCE:
${subjectGuidance}

Return ONLY a valid JSON array (no markdown, no code fences, no extra text):
[
  {
    "number": ${startNum},
    "text": "Question text here?",
    "options": ["a. Option 1", "b. Option 2", "c. Option 3", "d. Option 4", "e. Option 5"],
    "correctAnswer": "b",
    "explanation": "A detailed, full explanation in simple language clarifying why the correct answer is right, providing relevant historical, scientific, or mathematical context and why other key options are incorrect."
  }
]

Rules:
- Exactly ${BATCH_SIZE} questions numbered ${startNum} to ${endNum}
- correctAnswer MUST be lowercase: "a", "b", "c", "d", or "e"
- No duplicate questions
- No trivially easy questions
- All questions must be factually accurate`;

    const rawResponse = await callGemini(prompt);
    let jsonStr = rawResponse;
    const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    const batch_questions: ManualQuestion[] = JSON.parse(jsonStr);
    if (!Array.isArray(batch_questions) || batch_questions.length < 15) {
      throw new Error(`Batch ${batch + 1} returned only ${batch_questions?.length || 0} questions`);
    }

    // Renumber to ensure correct sequential numbering
    const renumbered = batch_questions.slice(0, BATCH_SIZE).map((q, i) => ({
      number: startNum + i,
      text: q.text,
      options: (q.options || []).slice(0, 5),
      correctAnswer: (q.correctAnswer || 'a').toLowerCase(),
      explanation: q.explanation || 'No explanation provided.',
    }));

    englishBatches.push(renumbered);
  }

  // Flatten all 80 English questions
  const allEnglishQuestions: ManualQuestion[] = englishBatches.flat();

  // --- Pass 2: Translate to Hindi in parallel chunks ---
  const TRANSLATE_CHUNK = 20;
  const translationPromises: Promise<ManualQuestion[]>[] = [];

  for (let i = 0; i < allEnglishQuestions.length; i += TRANSLATE_CHUNK) {
    const chunk = allEnglishQuestions.slice(i, i + TRANSLATE_CHUNK);

    const translatePrompt = `You are an expert academic translator specializing in Indian competitive exams (STET and BPSC TRE).
Translate the following multiple-choice questions from English to Hindi.

Rules:
1. Translate question text, all option text, and the explanation into formal academic Hindi (शुद्ध हिंदी).
2. Keep option labels (a., b., c., d., e.) intact.
3. Preserve all numbers, equations, proper nouns, and technical terms (like compound names) exactly as-is.
4. Do NOT translate the "correctAnswer" or "number" fields.
5. Return ONLY the same JSON structure, no markdown, no extra text.

JSON to translate:
${JSON.stringify(chunk, null, 2)}`;

    translationPromises.push(
      callGemini(translatePrompt).then((raw) => {
        let jsonStr = raw;
        const m = raw.match(/\[[\s\S]*\]/);
        if (m) jsonStr = m[0];
        return JSON.parse(jsonStr) as ManualQuestion[];
      })
    );
  }

  const hindiChunks = await Promise.all(translationPromises);
  const allHindiQuestions: ManualQuestion[] = hindiChunks.flat();

  // --- Pass 3: Merge into BilingualQuestion[] ---
  const bilingualQuestions: BilingualQuestion[] = allEnglishQuestions.map((enQ, idx) => {
    const hiQ = allHindiQuestions[idx];
    return {
      number: enQ.number,
      english: {
        text: enQ.text,
        options: (enQ.options || []).slice(0, 5),
        explanation: enQ.explanation,
      },
      hindi: {
        text: hiQ?.text || enQ.text,
        options: (hiQ?.options || enQ.options || []).slice(0, 5),
        explanation: hiQ?.explanation || enQ.explanation,
      },
      correctAnswer: (enQ.correctAnswer || 'a').toLowerCase(),
      status: 'verified' as const,
    };
  });

  return bilingualQuestions;
}


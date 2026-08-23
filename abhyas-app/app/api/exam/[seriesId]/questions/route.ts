import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getTestSeriesById, updateTestSeriesCache } from '@/lib/db/metadata-store';
import { downloadPDF } from '@/lib/services/s3';
import { extractText, Language, parseQuestions } from '@/lib/parsers/pdf-parser';
import { Question, ManualQuestion } from '@/lib/types';
import { translateQuestionsToHindi, extractQuestionsWithLLM, cleanGarbledHindiQuestions } from '@/lib/services/gemini';
import { BILINGUAL_STREAK_QUESTIONS } from '@/lib/services/streak-pool';

/**
 * Helper to test if a string contains Devanagari (Hindi) characters
 */
function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

/**
 * GET /api/exam/[seriesId]/questions?lang=en|hi
 * Fetches questions for test or quiz in the requested language (English or Hindi).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const series = await getTestSeriesById(seriesId);

    if (!series) {
      return NextResponse.json(
        { error: 'Test series not found' },
        { status: 404 }
      );
    }

    // Read language from query parameter (default: 'en')
    const url = new URL(request.url);
    const lang = (url.searchParams.get('lang') || 'en') as Language;

    // 1. Direct Bilingual Questions priority (Fastest & 100% Reliable)
    if (series.bilingualQuestions && series.bilingualQuestions.length > 0) {
      const questions: Question[] = series.bilingualQuestions.map((q, idx) => ({
        number: q.number || idx + 1,
        text: (lang === 'hi' ? q.hindi?.text : q.english?.text) || q.english?.text || q.hindi?.text || '',
        options: (lang === 'hi' ? q.hindi?.options : q.english?.options) || q.english?.options || q.hindi?.options || [],
      }));

      return NextResponse.json({
        seriesId: series.id,
        seriesTitle: series.title,
        subject: series.subject,
        totalQuestions: questions.length,
        questions,
        testType: series.testType || (series.isRandom ? 'practice' : 'prev-year'),
        durationMinutes: series.durationMinutes || (series.isRandom ? 80 : 150),
      });
    }

    // 2. Check if valid cached questions exist (ensure Hindi cache actually contains Hindi)
    if (series.cachedQuestions && series.cachedQuestions[lang] && series.cachedQuestions[lang].length > 0) {
      const cachedList = series.cachedQuestions[lang];
      // For Hindi, verify cache is not contaminated with English fallback
      const isValidHindi = lang !== 'hi' || containsDevanagari(cachedList[0]?.text || '');

      if (isValidHindi) {
        return NextResponse.json({
          seriesId: series.id,
          seriesTitle: series.title,
          subject: series.subject,
          totalQuestions: cachedList.length,
          questions: cachedList,
          testType: series.testType || (series.isRandom ? 'practice' : 'prev-year'),
          durationMinutes: series.durationMinutes || (series.isRandom ? 80 : 150),
        });
      }
    }

    let questions: Question[] = [];

    if (series.isManual && series.manualQuestions && series.manualQuestions.length > 0) {
      // Check if we have curated bilingual matches for this subject
      const curatedPool = BILINGUAL_STREAK_QUESTIONS[series.subject];
      if (lang === 'hi' && curatedPool && curatedPool.length > 0) {
        // Try matching by English text or index
        questions = series.manualQuestions.map((mq, idx) => {
          const match = curatedPool.find((cq) => cq.english.text.trim().toLowerCase() === mq.text.trim().toLowerCase()) || curatedPool[idx];
          if (match && match.hindi?.text) {
            return {
              number: mq.number || idx + 1,
              text: match.hindi.text,
              options: match.hindi.options,
            };
          }
          return {
            number: mq.number || idx + 1,
            text: mq.text,
            options: mq.options,
          };
        });
      } else if (lang === 'hi') {
        let manualQs: ManualQuestion[] = series.manualQuestions;
        try {
          manualQs = await translateQuestionsToHindi(manualQs);
        } catch (err) {
          console.warn('Hindi translation failed:', err);
        }
        questions = manualQs.map((q, idx) => ({
          number: q.number || idx + 1,
          text: q.text,
          options: q.options,
        }));
      } else {
        questions = series.manualQuestions.map((q, idx) => ({
          number: q.number || idx + 1,
          text: q.text,
          options: q.options,
        }));
      }
    } else if (series.isRandom && series.randomQuestions) {
      // Group by S3 Key to minimize downloads
      const groupedByS3Key = new Map<string, number[]>();
      for (const rq of series.randomQuestions) {
        if (!groupedByS3Key.has(rq.s3Key)) {
          groupedByS3Key.set(rq.s3Key, []);
        }
        groupedByS3Key.get(rq.s3Key)!.push(rq.number);
      }

      // Fetch and parse each required PDF in parallel
      const fetchPromises = Array.from(groupedByS3Key.entries()).map(async ([s3Key, nums]) => {
        const pdfBuffer = await downloadPDF(s3Key);
        const text = await extractText(pdfBuffer);
        const start = Math.min(...nums);
        const end = Math.max(...nums);
        let parsed = parseQuestions(text, start, end, lang);
        if (lang === 'hi') {
          parsed = await cleanGarbledHindiQuestions(parsed);
        }
        const requiredSet = new Set(nums);
        return parsed.filter(q => requiredSet.has(q.number));
      });

      const resultsArray = await Promise.all(fetchPromises);
      const rawQuestions = resultsArray.flat();
      
      // Remap question numbers 1..N based on the random order
      questions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
    } else if (series.s3Key) {
      // Regular single-PDF test series (Prev Year or long-form)
      const pdfBuffer = await downloadPDF(series.s3Key);
      const text = await extractText(pdfBuffer);
      let parsed = parseQuestions(text, series.startQuestion || 1, series.endQuestion || 150, lang);
      if (lang === 'hi') {
        parsed = await cleanGarbledHindiQuestions(parsed);
      }
      questions = parsed.map((q, idx) => ({ ...q, number: idx + 1 }));
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'No questions could be parsed for this test series',
        },
        { status: 422 }
      );
    }

    // Save to cache asynchronously if valid
    if (lang !== 'hi' || containsDevanagari(questions[0]?.text || '')) {
      updateTestSeriesCache(series.id, lang, questions).catch(err => {
        console.error('Failed to update cache:', err);
      });
    }

    const durationMinutes = series.isRandom
      ? (series.durationMinutes || 80)
      : (series.durationMinutes && series.durationMinutes <= questions.length ? series.durationMinutes : questions.length);

    return NextResponse.json({
      seriesId: series.id,
      seriesTitle: series.title,
      subject: series.subject,
      totalQuestions: questions.length,
      questions,
      testType: series.testType || (series.isRandom ? 'practice' : 'prev-year'),
      durationMinutes,
    });
  } catch (error) {
    console.error('Failed to fetch exam questions:', error);
    return NextResponse.json(
      { error: 'Failed to load exam questions' },
      { status: 500 }
    );
  }
}

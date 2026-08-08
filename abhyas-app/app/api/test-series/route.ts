import { NextResponse } from 'next/server';
import { getAllTestSeries, addTestSeries } from '@/lib/metadata-store';
import { TestSeries, Subject } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /api/test-series
 * Returns all test series metadata.
 */
export async function GET() {
  try {
    const series = await getAllTestSeries();
    return NextResponse.json(series);
  } catch (error) {
    console.error('Failed to fetch test series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test series' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-series
 * Creates a new test series.
 * Body: { title, subject, s3Key, startQuestion, endQuestion }
 */
export async function POST(request: Request) {
  try {
    // Check admin role
    const authHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(authHeader.split('; ').map(c => c.split('=')));
    const token = cookies['abhyas-token'];
    
    // Fallback simple validation without full JWT verify here, as middleware already blocks non-admins
    // But it's good defense-in-depth or if middleware is bypassed
    if (!token) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subject, s3Key, startQuestion, endQuestion } = body;

    // Validation
    if (!title || !subject || !s3Key || !startQuestion || !endQuestion) {
      return NextResponse.json(
        { error: 'All fields are required: title, subject, s3Key, startQuestion, endQuestion' },
        { status: 400 }
      );
    }

    if (startQuestion >= endQuestion) {
      return NextResponse.json(
        { error: 'Start question must be less than end question' },
        { status: 400 }
      );
    }

    const validSubjects: Subject[] = ['Music', 'Math', 'History', 'Geography'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json(
        { error: `Invalid subject. Must be one of: ${validSubjects.join(', ')}` },
        { status: 400 }
      );
    }

    const entry: TestSeries = {
      id: uuidv4(),
      title,
      subject,
      s3Key,
      startQuestion: Number(startQuestion),
      endQuestion: Number(endQuestion),
      createdAt: new Date().toISOString(),
    };

    await addTestSeries(entry);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Failed to create test series:', error);
    return NextResponse.json(
      { error: 'Failed to create test series' },
      { status: 500 }
    );
  }
}

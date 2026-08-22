import { NextRequest, NextResponse } from 'next/server';
import { updateTestSeriesTitle, deleteTestSeries, getTestSeriesById } from '@/lib/db/metadata-store';
import { getUser } from '@/lib/utils/auth';

/**
 * PATCH /api/test-series/[id]
 * Renames a test series.
 * Body: { title }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const existing = await getTestSeriesById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
    }

    await updateTestSeriesTitle(id, title.trim());

    return NextResponse.json({ success: true, id, title: title.trim() });
  } catch (error) {
    console.error('Failed to update test series:', error);
    return NextResponse.json({ error: 'Failed to update test series' }, { status: 500 });
  }
}

/**
 * DELETE /api/test-series/[id]
 * Deletes a test series.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await getTestSeriesById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
    }

    await deleteTestSeries(id);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Failed to delete test series:', error);
    return NextResponse.json({ error: 'Failed to delete test series' }, { status: 500 });
  }
}

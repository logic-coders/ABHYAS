import { NextResponse } from 'next/server';

/**
 * POST /api/upload-pdf
 * Deprecated: Replaced by TXT-based import (/api/admin/parse-txt & /api/admin/create-test-txt).
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'PDF processing has been retired. Please use the new TXT-based import workflow.',
    },
    { status: 410 }
  );
}


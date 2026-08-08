import { NextResponse } from 'next/server';
import { uploadPDF } from '@/lib/s3';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/upload-pdf
 * Accepts a multipart form upload with a PDF file.
 * Uploads to S3 and returns the S3 key.
 */
export async function POST(request: Request) {
  try {
    // Check admin role
    const authHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(authHeader.split('; ').map(c => c.split('=')));
    const token = cookies['abhyas-token'];
    
    if (!token) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Max file size: 50MB
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `abhyas/pdfs/${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const s3Key = await uploadPDF(buffer, key);

    return NextResponse.json({ s3Key }, { status: 200 });
  } catch (error) {
    console.error('Failed to upload PDF:', error);
    return NextResponse.json(
      { error: 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}

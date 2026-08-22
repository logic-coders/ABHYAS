import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

function getS3Client(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
}

function getBucket(): string {
  return process.env.S3_BUCKET_NAME || 'abhyas-app-pdfs-bucket';
}

/**
 * Upload a PDF buffer to S3 under the given key.
 * Returns the S3 key for later retrieval.
 */
export async function uploadPDF(
  buffer: Buffer,
  key: string
): Promise<string> {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    })
  );
  return key;
}

/**
 * Download a PDF from S3 by key, returning the raw Buffer.
 */
export async function downloadPDF(key: string): Promise<Buffer> {
  const s3 = getS3Client();
  const res = await s3.send(
    new GetObjectCommand({
      Bucket: getBucket(),
      Key: key,
    })
  );
  const stream = res.Body;
  if (!stream) throw new Error(`Empty body for S3 key: ${key}`);

  // Convert readable stream to Buffer
  const chunks: Uint8Array[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for await (const chunk of stream as any) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Upload a generic JSON object to S3.
 */
export async function uploadJSON(key: string, data: unknown): Promise<void> {
  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: 'application/json',
    })
  );
}

/**
 * Download and parse a JSON file from S3.
 * Returns null if the file doesn't exist yet.
 */
export async function downloadJSON<T>(key: string): Promise<T | null> {
  try {
    const s3 = getS3Client();
    const res = await s3.send(
      new GetObjectCommand({
        Bucket: getBucket(),
        Key: key,
      })
    );
    const body = await res.Body?.transformToString();
    if (!body) return null;
    return JSON.parse(body) as T;
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.name === 'NoSuchKey' || err.name === 'AccessDenied')
    ) {
      return null;
    }
    throw err;
  }
}

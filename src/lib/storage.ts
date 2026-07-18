import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
}

const BUCKETS = {
  kyc: 'kyc-documents',
  echeck: 'echeck-signatures',
} as const;

function getSupabaseUrl(): string | null {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbUrl = process.env.DATABASE_URL || '';
  const match = dbUrl.match(/postgres\.([a-z0-9]+):/i) || dbUrl.match(/\/\/postgres\.([a-z0-9]+)/i);
  if (match?.[1]) return `https://${match[1]}.supabase.co`;
  return null;
}

let _client: SupabaseClient | null = null;

function getStorageClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!_client) _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf',
  };
  return map[ext || ''] || 'application/octet-stream';
}

export async function uploadFileToStorage(
  file: Buffer,
  fileName: string,
  userId: string,
  documentType: string,
  bucket: keyof typeof BUCKETS = 'kyc'
): Promise<StorageUploadResult> {
  const client = getStorageClient();
  if (!client) throw new Error('Supabase Storage not configured');

  const bucketName = BUCKETS[bucket];
  const timestamp = Date.now();
  const key = `${bucket === 'kyc' ? 'kyc' : 'echeck'}/${userId}/${documentType}/${timestamp}-${fileName}`;

  const { error } = await client.storage.from(bucketName).upload(key, file, {
    contentType: getContentType(fileName),
    upsert: false,
    metadata: { userId, documentType, originalName: fileName },
  });

  if (error) throw new Error(error.message);

  const { data: signed } = await client.storage.from(bucketName).createSignedUrl(key, 3600);
  const url = signed?.signedUrl || `${getSupabaseUrl()}/storage/v1/object/public/${bucketName}/${key}`;

  return { key, url, size: file.length };
}

export async function getSignedDownloadUrl(key: string, bucket: keyof typeof BUCKETS = 'kyc'): Promise<string> {
  const client = getStorageClient();
  if (!client) throw new Error('Supabase Storage not configured');
  const { data, error } = await client.storage.from(BUCKETS[bucket]).createSignedUrl(key, 3600);
  if (error || !data?.signedUrl) throw new Error(error?.message || 'Failed to sign URL');
  return data.signedUrl;
}

export async function deleteFileFromStorage(key: string, bucket: keyof typeof BUCKETS = 'kyc'): Promise<void> {
  const client = getStorageClient();
  if (!client) throw new Error('Supabase Storage not configured');
  const { error } = await client.storage.from(BUCKETS[bucket]).remove([key]);
  if (error) throw new Error(error.message);
}

export function isStorageConfigured(): boolean {
  return !!(getSupabaseUrl() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// Backward-compatible aliases (replaces S3)
export const uploadFileToS3 = uploadFileToStorage;
export const deleteFileFromS3 = (key: string) => deleteFileFromStorage(key);

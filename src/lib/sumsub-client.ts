import crypto from 'crypto';

export type SumsubReviewAnswer = 'GREEN' | 'RED' | 'RETRY' | string;

export interface SumsubApplicant {
  id: string;
  externalUserId?: string;
  review?: {
    reviewStatus?: string;
    reviewResult?: {
      reviewAnswer?: SumsubReviewAnswer;
      rejectLabels?: string[];
      moderationComment?: string;
    };
  };
  info?: {
    firstName?: string;
    lastName?: string;
    country?: string;
  };
}

function getConfig() {
  const appToken = process.env.SUMSUB_APP_TOKEN;
  const secretKey = process.env.SUMSUB_SECRET_KEY;
  const baseUrl = (process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com').replace(/\/$/, '');
  const levelName = process.env.SUMSUB_VERIFICATION_LEVEL || 'basic';

  if (!appToken || !secretKey) {
    throw new Error('SUMSUB_APP_TOKEN and SUMSUB_SECRET_KEY must be configured');
  }

  return { appToken, secretKey, baseUrl, levelName };
}

function signRequest(method: string, pathWithQuery: string, body: string, secretKey: string, ts: number) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(String(ts) + method.toUpperCase() + pathWithQuery);
  if (body) hmac.update(body);
  return hmac.digest('hex');
}

export async function sumsubRequest<T>(
  method: 'GET' | 'POST' | 'PATCH',
  pathWithQuery: string,
  body?: Record<string, unknown> | null
): Promise<T> {
  const { appToken, secretKey, baseUrl } = getConfig();
  const bodyStr = body ? JSON.stringify(body) : '';
  const ts = Math.floor(Date.now() / 1000);
  const signature = signRequest(method, pathWithQuery, bodyStr, secretKey, ts);

  const response = await fetch(`${baseUrl}${pathWithQuery}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-App-Token': appToken,
      'X-App-Access-Ts': String(ts),
      'X-App-Access-Sig': signature,
    },
    ...(bodyStr ? { body: bodyStr } : {}),
  });

  const text = await response.text();
  let data: T | Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      throw new Error(`Sumsub returned non-JSON response (${response.status})`);
    }
  }

  if (!response.ok) {
    const err = data as { description?: string; error?: string; message?: string };
    const message = err.description || err.error || err.message || text || `Sumsub API error ${response.status}`;
    const error = new Error(message) as Error & { status?: number; details?: unknown };
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data as T;
}

export function mapSumsubToKycStatus(applicant: SumsubApplicant): 'PENDING' | 'VERIFIED' | 'REJECTED' {
  const answer = applicant.review?.reviewResult?.reviewAnswer?.toUpperCase();
  if (answer === 'GREEN') return 'VERIFIED';
  if (answer === 'RED') return 'REJECTED';
  return 'PENDING';
}

export async function getApplicantByExternalUserId(externalUserId: string): Promise<SumsubApplicant | null> {
  try {
    return await sumsubRequest<SumsubApplicant>(
      'GET',
      `/resources/applicants/-;externalUserId=${encodeURIComponent(externalUserId)}/one`
    );
  } catch (error) {
    const err = error as Error & { status?: number };
    if (err.status === 404) return null;
    throw error;
  }
}

export async function getApplicantById(applicantId: string): Promise<SumsubApplicant | null> {
  try {
    return await sumsubRequest<SumsubApplicant>('GET', `/resources/applicants/${encodeURIComponent(applicantId)}/one`);
  } catch (error) {
    const err = error as Error & { status?: number };
    if (err.status === 404) return null;
    throw error;
  }
}

export interface CreateApplicantInput {
  externalUserId: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  country?: string;
  levelName?: string;
}

export async function createApplicant(input: CreateApplicantInput): Promise<SumsubApplicant> {
  const { levelName: defaultLevel } = getConfig();
  const levelName = input.levelName || defaultLevel;
  const path = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;

  const body = {
    externalUserId: input.externalUserId,
    email: input.email,
    phone: input.phone || undefined,
    fixedInfo: {
      firstName: input.firstName,
      lastName: input.lastName,
      country: input.country || process.env.SUMSUB_DEFAULT_COUNTRY || 'THA',
    },
  };

  try {
    return await sumsubRequest<SumsubApplicant>('POST', path, body);
  } catch (error) {
    const err = error as Error & { status?: number };
    if (err.status === 409) {
      const existing = await getApplicantByExternalUserId(input.externalUserId);
      if (existing) return existing;
    }
    throw error;
  }
}

export async function ensureApplicant(input: CreateApplicantInput): Promise<SumsubApplicant> {
  const existing = await getApplicantByExternalUserId(input.externalUserId);
  if (existing) return existing;
  return createApplicant(input);
}

export async function createAccessToken(externalUserId: string, levelName?: string): Promise<{ token: string; userId: string }> {
  const { levelName: defaultLevel } = getConfig();
  const level = levelName || defaultLevel;
  const path = `/resources/accessTokens?userId=${encodeURIComponent(externalUserId)}&levelName=${encodeURIComponent(level)}&ttlInSecs=600`;

  return sumsubRequest<{ token: string; userId: string }>('POST', path);
}

export function getDefaultLevelName(): string {
  return getConfig().levelName;
}

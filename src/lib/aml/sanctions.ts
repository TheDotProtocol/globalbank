/** Sanctions screening — stub with local denylist; replace with OpenSanctions/ComplyAdvantage in production */

const LOCAL_SANCTIONS_LIST = [
  'OSAMA BIN LADEN',
  'KIM JONG UN',
  'TEST SANCTIONS HIT',
];

export interface SanctionsScreenResult {
  hit: boolean;
  matchScore: number;
  matchedName?: string;
  provider: string;
}

function normalize(name: string): string {
  return name.trim().toUpperCase().replace(/\s+/g, ' ');
}

export async function screenName(fullName: string): Promise<SanctionsScreenResult> {
  const normalized = normalize(fullName);

  for (const entry of LOCAL_SANCTIONS_LIST) {
    if (normalized.includes(entry) || entry.includes(normalized)) {
      return {
        hit: true,
        matchScore: 95,
        matchedName: entry,
        provider: 'LOCAL_DENYLIST',
      };
    }
  }

  if (process.env.SANCTIONS_API_URL && process.env.SANCTIONS_API_KEY) {
    try {
      const response = await fetch(`${process.env.SANCTIONS_API_URL}/screen`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SANCTIONS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: fullName }),
      });
      if (response.ok) {
        const data = (await response.json()) as { hit?: boolean; score?: number; match?: string };
        return {
          hit: Boolean(data.hit),
          matchScore: data.score ?? 0,
          matchedName: data.match,
          provider: 'EXTERNAL_API',
        };
      }
    } catch (error) {
      console.error('External sanctions API unavailable:', error);
    }
  }

  return { hit: false, matchScore: 0, provider: 'LOCAL_DENYLIST' };
}

export async function screenUser(userId: string): Promise<SanctionsScreenResult> {
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  if (!user) return { hit: false, matchScore: 0, provider: 'LOCAL_DENYLIST' };
  return screenName(`${user.firstName} ${user.lastName}`);
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ActorType } from '@prisma/client';

export interface AuditLogInput {
  actorType: ActorType;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeState?: unknown;
  afterState?: unknown;
  metadata?: unknown;
  request?: NextRequest;
}

function extractClientMeta(request?: NextRequest) {
  if (!request) return { ipAddress: null as string | null, userAgent: null as string | null };
  return {
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      null,
    userAgent: request.headers.get('user-agent'),
  };
}

export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  const { ipAddress, userAgent } = extractClientMeta(input.request);
  try {
    await prisma.auditLog.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        beforeState: input.beforeState ? (input.beforeState as object) : undefined,
        afterState: input.afterState ? (input.afterState as object) : undefined,
        metadata: input.metadata ? (input.metadata as object) : undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('[AUDIT] Failed to write audit log:', error);
  }
}

export async function auditAdminAction(
  request: NextRequest,
  admin: { username: string; role: string },
  action: string,
  entityType: string,
  entityId: string | null,
  beforeState?: unknown,
  afterState?: unknown,
  metadata?: unknown
) {
  await writeAuditLog({
    actorType: admin.role === 'COMPLIANCE' ? 'COMPLIANCE' : 'ADMIN',
    actorId: admin.username,
    actorEmail: admin.username,
    action,
    entityType,
    entityId,
    beforeState,
    afterState,
    metadata,
    request,
  });
}

export async function auditUserAction(
  request: NextRequest,
  user: { id: string; email: string },
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: unknown
) {
  await writeAuditLog({
    actorType: 'USER',
    actorId: user.id,
    actorEmail: user.email,
    action,
    entityType,
    entityId,
    metadata,
    request,
  });
}

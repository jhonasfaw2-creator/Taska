import { prisma } from '../../prisma/client';

interface AuditEntry {
  adminId?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      adminId: entry.adminId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      changes: entry.changes ?? undefined as any,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    },
  });
}

export async function getAuditLogs(params: {
  limit?: number;
  offset?: number;
  entityType?: string;
  entityId?: string;
  adminId?: string;
  action?: string;
}) {
  const where: Record<string, unknown> = {};
  if (params.entityType) where.entityType = params.entityType;
  if (params.entityId) where.entityId = params.entityId;
  if (params.adminId) where.adminId = params.adminId;
  if (params.action) where.action = params.action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: where as any,
      orderBy: { createdAt: 'desc' },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
      include: { admin: { select: { user: { select: { firstName: true, lastName: true, email: true } } } } },
    }),
    prisma.auditLog.count({ where: where as any }),
  ]);
  return { logs, total };
}

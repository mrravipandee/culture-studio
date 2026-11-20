import "server-only";

/**
 * Minimal audit trail writer (collection: audit_logs). SERVER-ONLY.
 *
 * Called after an admin action has succeeded. A failed write is reported in the server log
 * (error name only) and never fails or undoes the action itself: the action is already
 * committed, and MongoDB has no cross-document atomicity here without a transaction.
 */

import { Types, isValidObjectId } from "mongoose";
import { withDb } from "@/lib/db/mongoose";
import { AuditLogModel, type AuditAction, type AuditEntityType, type AuditLogDoc } from "@/lib/db/models/AuditLog";

export interface AuditEntry {
  adminId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  at: Date;
  meta?: AuditLogDoc["meta"];
}

export async function recordAudit(entry: AuditEntry): Promise<void> {
  if (!isValidObjectId(entry.adminId) || !isValidObjectId(entry.entityId)) {
    console.error(`[audit] Skipped ${entry.action}: invalid id.`);
    return;
  }
  try {
    await withDb(() =>
      AuditLogModel.create({
        adminId: new Types.ObjectId(entry.adminId),
        action: entry.action,
        entityType: entry.entityType,
        entityId: new Types.ObjectId(entry.entityId),
        at: entry.at,
        ...(entry.meta ? { meta: entry.meta } : {}),
      }),
    );
  } catch (error) {
    console.error(`[audit] Could not record ${entry.action} (${error instanceof Error ? error.name : "error"}).`);
  }
}

/** Several entries at once (bulk actions). Same failure policy as recordAudit. */
export async function recordAuditMany(entries: AuditEntry[]): Promise<void> {
  const valid = entries.filter((e) => isValidObjectId(e.adminId) && isValidObjectId(e.entityId));
  if (valid.length === 0) return;
  try {
    await withDb(() =>
      AuditLogModel.insertMany(
        valid.map((e) => ({ adminId: new Types.ObjectId(e.adminId), action: e.action, entityType: e.entityType, entityId: new Types.ObjectId(e.entityId), at: e.at, ...(e.meta ? { meta: e.meta } : {}) })),
        { ordered: false },
      ),
    );
  } catch (error) {
    console.error(`[audit] Could not record ${valid.length} entries (${error instanceof Error ? error.name : "error"}).`);
  }
}

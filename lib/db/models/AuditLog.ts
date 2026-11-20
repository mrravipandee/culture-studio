import "server-only";

/**
 * AuditLog — important admin actions (collection: audit_logs). SERVER-ONLY.
 *
 * Minimal and reusable by any module: who (adminId), what (action), on which entity
 * (entityType + entityId) and when (at). `meta` holds small non-sensitive context only
 * (e.g. a slug or a status change); content bodies are never logged. Append-only.
 */

import mongoose, { Schema, type Model, type Types } from "mongoose";

export const AUDIT_ENTITY_TYPES = ["CaseStudy", "Subscriber"] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const AUDIT_ACTIONS = [
  "case_study.created",
  "case_study.updated",
  "case_study.published",
  "case_study.unpublished",
  "case_study.archived",
  "case_study.deleted",
  "case_study.restored",
  "subscriber.added",
  "subscriber.unsubscribed",
  "subscriber.reactivated",
  "subscriber.deleted",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLogDoc {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: Types.ObjectId;
  at: Date;
  meta?: { slug?: string; from?: string; to?: string; fields?: string[] };
}

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    entityType: { type: String, enum: AUDIT_ENTITY_TYPES, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    at: { type: Date, required: true },
    meta: {
      type: new Schema(
        { slug: { type: String, maxlength: 80 }, from: { type: String, maxlength: 20 }, to: { type: String, maxlength: 20 }, fields: { type: [{ type: String, maxlength: 40 }], default: undefined } },
        { _id: false, strict: "throw" },
      ),
      default: undefined,
    },
  },
  { collection: "audit_logs", versionKey: false, strict: "throw" },
);

auditLogSchema.index({ entityType: 1, entityId: 1, at: -1 }, { name: "entity_recent" });
auditLogSchema.index({ adminId: 1, at: -1 }, { name: "admin_recent" });

export const AuditLogModel: Model<AuditLogDoc> = (mongoose.models.AuditLog as Model<AuditLogDoc> | undefined) ?? mongoose.model<AuditLogDoc>("AuditLog", auditLogSchema);

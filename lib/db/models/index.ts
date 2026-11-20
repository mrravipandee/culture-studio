import "server-only";

/**
 * Registry of every Mongoose model. SERVER-ONLY.
 * scripts/db-indexes.mjs reads index definitions from these models, so a new model must be
 * added here to have its indexes managed.
 */

import { AdminModel } from "./Admin";
import { AdminLoginActivityModel } from "./AdminLoginActivity";
import { AdminSessionModel } from "./AdminSession";
import { RateLimitModel } from "./RateLimit";
import { EnquiryModel } from "./Enquiry";
import { CaseStudyModel } from "./CaseStudy";
import { AuditLogModel } from "./AuditLog";
import { SubscriberModel } from "./Subscriber";

export { AdminModel, AdminLoginActivityModel, AdminSessionModel, RateLimitModel, EnquiryModel, CaseStudyModel, AuditLogModel, SubscriberModel };

export const ALL_MODELS = [AdminModel, AdminLoginActivityModel, AdminSessionModel, RateLimitModel, EnquiryModel, CaseStudyModel, AuditLogModel, SubscriberModel] as const;

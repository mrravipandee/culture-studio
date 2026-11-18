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

export { AdminModel, AdminLoginActivityModel, AdminSessionModel, RateLimitModel, EnquiryModel };

export const ALL_MODELS = [AdminModel, AdminLoginActivityModel, AdminSessionModel, RateLimitModel, EnquiryModel] as const;

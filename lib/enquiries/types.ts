/** Enquiry API result shapes. Client-safe (types only). */

import type { Enquiry, EnquiryStatus } from "@/lib/admin/types";

export type StatusCounts = Record<EnquiryStatus, number>;

export interface EnquiryListResult {
  items: Enquiry[];
  page: number;
  pageSize: number;
  totalPages: number;
  /** Matching the filters. */
  filteredCount: number;
  /** All non-deleted enquiries. */
  totalCount: number;
  statusCounts: StatusCounts;
}

/** POST /api/enquiries success data. */
export interface EnquiryReceipt {
  received: true;
  /** Short reference to quote in follow-ups. */
  reference: string;
}

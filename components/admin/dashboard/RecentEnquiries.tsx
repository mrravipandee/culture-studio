import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { editorialSerif } from "@/lib/fonts";
import { serviceLabels, type Enquiry, type EnquiryStatus } from "@/lib/admin/types";
import EnquiryStatusBadge from "@/components/admin/enquiries/EnquiryStatusBadge";
import { formatDate } from "@/lib/admin/dashboard-utils";

/** Unread enquiries get a dot next to the name. */
const dot = (status: EnquiryStatus) => (status === "NEW" ? "bg-[#2f9e5b]" : "bg-black/20");

/** First selected service, plus "+N" when the enquiry selected more than one. */
function ServicePill({ services }: { services: Enquiry["services"] }) {
  const [first, ...rest] = services;
  return (
    <span
      title={services.map((s) => serviceLabels[s]).join(", ")}
      className="inline-block max-w-full truncate whitespace-nowrap rounded-full border border-burgundy/20 bg-burgundy/[0.04] px-2.5 py-0.5 align-middle text-xs text-burgundy"
    >
      {first ? serviceLabels[first] : "—"}
      {rest.length > 0 && ` +${rest.length}`}
    </span>
  );
}

export default function RecentEnquiries({ items }: { items: Enquiry[] }) {
  return (
    <section
      aria-labelledby="recent-enquiries-title"
      className="admin-fade-up flex h-full flex-col rounded-xl border border-black/[0.08] bg-white/80 p-5 sm:p-6 [animation-delay:540ms]"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="recent-enquiries-title" className={`${editorialSerif.className} text-2xl text-[#1a0a0c]`}>
          Recent Enquiries
        </h2>
        <Link href="/admin/enquiries" className="group inline-flex items-center gap-1.5 text-sm font-medium text-burgundy hover:underline focus-visible:outline-2 focus-visible:outline-burgundy">
          View All
          <ArrowRight aria-hidden="true" size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-black/15 py-10 text-center text-sm text-ink-2">No enquiries yet.</p>
      ) : (
        <>
          {/* Tablet / desktop: table */}
          <div className="mt-4 hidden md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs text-ink-3">
                  <th scope="col" className="w-[22%] py-2.5 pl-6 font-normal">Name</th>
                  <th scope="col" className="w-[23%] py-2.5 font-normal">Service</th>
                  <th scope="col" className="py-2.5 font-normal">Message</th>
                  <th scope="col" className="w-[16%] py-2.5 font-normal">Date</th>
                  <th scope="col" className="w-[12%] py-2.5 text-right font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id} className="border-b border-black/[0.06] transition-colors last:border-0 hover:bg-black/[0.02]">
                    <td className="py-3 pl-2">
                      <span className="flex items-center gap-2.5">
                        <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${dot(e.status)}`} />
                        <span className={`truncate ${e.status === "NEW" ? "font-semibold text-[#1a0a0c]" : "text-ink"}`}>{e.name}</span>
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <ServicePill services={e.services} />
                    </td>
                    <td className="truncate py-3 pr-4 text-ink-2" title={e.message}>
                      {e.message}
                    </td>
                    <td className="whitespace-nowrap py-3 text-ink-2">
                      <time dateTime={e.createdAt}>{formatDate(e.createdAt)}</time>
                    </td>
                    <td className="py-3 text-right">
                      <EnquiryStatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked list */}
          <ul className="mt-4 divide-y divide-black/[0.06] md:hidden">
            {items.map((e) => (
              <li key={e.id} className="py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className={`truncate ${e.status === "NEW" ? "font-semibold text-[#1a0a0c]" : "text-ink"}`}>{e.name}</span>
                  <EnquiryStatusBadge status={e.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-ink-2">{e.message}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <ServicePill services={e.services} />
                  <time dateTime={e.createdAt} className="text-xs text-ink-3">
                    {formatDate(e.createdAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

import { ArrowLeft, ArrowRight } from "lucide-react";
import { pageList } from "@/lib/admin/enquiry-utils";

interface Props {
  page: number;
  pages: number;
  /** Total matching records and the range on this page, for the status line. */
  total: number;
  from: number;
  to: number;
  onPage: (page: number) => void;
  /** Plural noun for the status line. */
  noun?: string;
}

export default function EnquiryPagination({ page, pages, total, from, to, onPage, noun = "enquiries" }: Props) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p aria-live="polite" className="text-sm text-ink-2">
        {total === 0 ? `No ${noun} to show` : `Showing ${from}–${to} of ${new Intl.NumberFormat("en-IN").format(total)} ${noun}`}
      </p>
      {pages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page === 1}
            onClick={() => onPage(page - 1)}
            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-30"
          >
            <ArrowLeft aria-hidden="true" size={19} strokeWidth={1.5} />
          </button>
          {pageList(page, pages).map((entry, i) =>
            entry === "gap" ? (
              <span key={`gap-${i}`} aria-hidden="true" className="w-7 text-center text-sm text-ink-3">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                aria-label={`Page ${entry}`}
                aria-current={entry === page ? "page" : undefined}
                onClick={() => onPage(entry)}
                className={`grid size-10 place-items-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
                  entry === page ? "bg-[#5a0c14] text-white" : "text-ink hover:text-burgundy"
                }`}
              >
                {entry}
              </button>
            ),
          )}
          <button
            type="button"
            aria-label="Next page"
            disabled={page === pages}
            onClick={() => onPage(page + 1)}
            className="grid size-10 place-items-center rounded-full text-ink transition-colors hover:text-burgundy focus-visible:outline-2 focus-visible:outline-burgundy disabled:opacity-30"
          >
            <ArrowRight aria-hidden="true" size={19} strokeWidth={1.5} />
          </button>
        </nav>
      )}
    </div>
  );
}

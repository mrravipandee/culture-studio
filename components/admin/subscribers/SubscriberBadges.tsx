import { subscriberSourceLabels, subscriberStatusLabels, type Subscriber, type SubscriberSource, type SubscriberStatus } from "@/lib/admin/types";
import { subscriberInitials } from "@/lib/admin/subscriber-utils";

const STATUS: Record<SubscriberStatus, string> = {
  ACTIVE: "bg-[#e5f1e8] text-[#245a3a] ring-[#2f6b47]/15",
  UNSUBSCRIBED: "bg-[#f7e4e4] text-[#6e1a24] ring-[#7a1f2b]/15",
};

/** Text label + colour (never colour alone). */
export function SubscriberStatusBadge({ status, className = "" }: { status: SubscriberStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors duration-300 ${STATUS[status]} ${className}`}>
      {subscriberStatusLabels[status]}
    </span>
  );
}

export function SourceBadge({ source }: { source: SubscriberSource }) {
  return <span className="inline-block whitespace-nowrap rounded-full border border-[#7a1f2b]/20 bg-[#7a1f2b]/[0.04] px-2.5 py-0.5 text-xs text-[#7a1f2b]">{subscriberSourceLabels[source]}</span>;
}

/** Email that, if it must wrap, wraps at the "@" rather than mid-word. */
export function EmailText({ email }: { email: string }) {
  const at = email.lastIndexOf("@");
  if (at <= 0) return <>{email}</>;
  return (
    <>
      {email.slice(0, at)}
      <wbr />
      {email.slice(at)}
    </>
  );
}

export function SubscriberAvatar({ subscriber, size = "md", serifClassName }: { subscriber: Pick<Subscriber, "name" | "email">; size?: "md" | "lg"; serifClassName: string }) {
  return (
    <span aria-hidden="true" className={`${serifClassName} grid shrink-0 place-items-center rounded-full bg-[#f7e4e4] text-[#7a1f2b] ${size === "lg" ? "size-16 text-2xl" : "size-10 text-base"}`}>
      {subscriberInitials(subscriber)}
    </span>
  );
}

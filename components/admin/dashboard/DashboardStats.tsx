import { FileText, Layers, Mail, MailOpen, Users } from "lucide-react";
import StatCard, { type StatCardProps } from "./StatCard";

export interface DashboardStatsData {
  totalEnquiries: number;
  totalChange: { percent: number } | null;
  newEnquiries: number;
  publishedCaseStudies: number;
  totalCaseStudies: number;
  publishedBlogs: number;
  draftBlogs: number;
  subscribers: number;
  activeSubscribers: number;
}

/** The five KPI cards. Every value arrives pre-computed from lib/admin/dashboard-utils.ts. */
export default function DashboardStats({ data }: { data: DashboardStatsData }) {
  const cards: StatCardProps[] = [
    {
      icon: Mail,
      value: data.totalEnquiries,
      label: "Total Enquiries",
      change: data.totalChange ? { percent: data.totalChange.percent, caption: "last 30 vs prior 30 days" } : null,
      note: "All time",
    },
    { icon: MailOpen, value: data.newEnquiries, label: "New Enquiries", note: "Status: new (unread)" },
    { icon: Layers, value: data.publishedCaseStudies, label: "Published Case Studies", note: `of ${data.totalCaseStudies} approved projects` },
    { icon: FileText, value: data.publishedBlogs, label: "Published Blogs", note: `${data.draftBlogs} ${data.draftBlogs === 1 ? "draft" : "drafts"}` },
    { icon: Users, value: data.subscribers, label: "Subscribe Emails", note: `${data.activeSubscribers} active` },
  ];

  return (
    <section aria-label="Key figures">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card, i) => (
          <li key={card.label} className={i === 4 ? "col-span-2 lg:col-span-1" : ""}>
            <StatCard {...card} delay={80 + i * 60} />
          </li>
        ))}
      </ul>
    </section>
  );
}

import type { Metadata } from "next";
import { pageMetadata } from "@/lib/site";
import Navbar from "@/components/navigation/Navbar";
import PrivacyPolicy from "@/components/privacy/PrivacyPolicy";
import { privacyDescription } from "@/lib/content/privacy";

/**
 * FIRST DRAFT — not published. noindex/nofollow, not in the sitemap and not linked from
 * the Footer or the enquiry form until the policy is completed and legally reviewed.
 * (pageMetadata omits the canonical while a page is noindex; it is emitted from
 * lib/site.ts automatically once `noindex` is removed here.)
 */
const base = pageMetadata({
  title: "Privacy Policy",
  path: "/privacy-policy",
  description: privacyDescription,
  noindex: true,
});

export const metadata: Metadata = {
  ...base,
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-paper">
      <Navbar />
      <main className="relative z-0">
        <PrivacyPolicy />
      </main>
    </div>
  );
}

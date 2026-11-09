import Navbar from "@/components/navigation/Navbar";
import { Button, TextLink } from "@/components/ui/site-button";

export const metadata = { title: "Page not found", robots: { index: false, follow: true } };

/** Branded 404 with a clear way back. */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col bg-paper text-ink">
      <Navbar />
      <main id="content" className="container-content flex flex-1 flex-col justify-center py-32">
        <p className="eyebrow text-burgundy">404</p>
        <h1 className="heading-1 mt-6 max-w-narrow">This page is not part of the story.</h1>
        <p className="body-lead mt-6 max-w-measure text-ink-2">
          The link may be outdated or mistyped. Everything we do is one click away.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Button href="/" icon="arrow">Back to home</Button>
          <TextLink href="/case-studies" className="title-3">View case studies</TextLink>
        </div>
      </main>
    </div>
  );
}

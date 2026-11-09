import MotionProvider from "@/components/motion/MotionProvider";
import Footer from "@/components/navigation/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { siteSchema } from "@/lib/schema";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-paper text-ink">
      <a
        href="#content"
        className="btn btn-primary btn-sm fixed top-4 left-4 z-[60] -translate-y-24 focus:translate-y-0"
      >
        Skip to content
      </a>
      <JsonLd data={siteSchema()} />
      <MotionProvider>
        <div id="content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <Footer />
      </MotionProvider>
    </div>
  );
}

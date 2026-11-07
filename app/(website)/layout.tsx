import type { Metadata } from "next";
import MotionProvider from "@/components/motion/MotionProvider";
import Footer from "@/components/navigation/Footer";

export const metadata: Metadata = {
  title: {
    default: "CULT.URE | Beyond the noise. Into the culture.",
    template: "%s | CULT.URE",
  },
  description:
    "A premier personal branding and cultural positioning agency for visionary founders and leaders.",
};

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-paper text-ink">
      <a
        href="#content"
        className="btn btn-primary btn-sm fixed top-4 left-4 z-[60] -translate-y-24 focus:translate-y-0"
      >
        Skip to content
      </a>
      <MotionProvider>
        <div id="content" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </div>
        <Footer />
      </MotionProvider>
    </div>
  );
}

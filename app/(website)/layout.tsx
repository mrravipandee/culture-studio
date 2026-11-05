import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CULT.URE | Beyond the Noise. Into the Culture.",
  description:
    "A premier personal branding and cultural positioning agency for visionary founders and leaders.",
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-white text-black selection:bg-[#240c0e] selection:text-white">
      {children}
    </div>
  );
}


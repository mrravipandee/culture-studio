import type { Metadata } from "next";
import GlobeDemo from "@/components/globe-demo";

/** Internal component demo: never indexed. */
export const metadata: Metadata = {
  title: "Globe demo",
  robots: { index: false, follow: false },
  description: "Internal component demo.",
};

export default function GlobeDemoPage() {
  return (
    <>
      <h1 className="sr-only">Globe demo</h1>
      <GlobeDemo />
    </>
  );
}

import PageTransition from "@/components/motion/PageTransition";

/** Re-mounts on every navigation, which is what lets PageTransition play. */
export default function WebsiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

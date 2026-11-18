"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { History, KeyRound, UserRound, type LucideIcon } from "lucide-react";
import type { ProfileData } from "@/lib/admin/settings-schemas";
import { EASE } from "@/lib/motion";
import ProfileSection from "./ProfileSection";
import PasswordSection from "./PasswordSection";
import LoginActivitySection from "./LoginActivitySection";

const SECTIONS: { id: string; label: string; short: string; icon: LucideIcon }[] = [
  { id: "settings-profile", label: "Profile", short: "Profile", icon: UserRound },
  { id: "settings-password", label: "Password & Security", short: "Security", icon: KeyRound },
  { id: "settings-activity", label: "Login Activity", short: "Activity", icon: History },
];

/**
 * Settings layout: a secondary navigation (vertical at ≥1280px, sticky tabs below) that
 * follows the scroll position, plus the three sections. All data comes from MongoDB via the
 * server page (profile) and the Settings API routes.
 */
export default function SettingsWorkspace({ initialProfile, serifClassName }: { initialProfile: ProfileData; serifClassName: string }) {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [profile, setProfile] = useState(initialProfile);
  const reduce = useReducedMotion();

  // Scroll-spy: the section crossing the upper part of the viewport is "active".
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id.replace("settings-", "")}`);
  };

  // Deep links: /admin/settings#password etc.
  useEffect(() => {
    const target = SECTIONS.find((s) => s.id === `settings-${window.location.hash.slice(1)}`);
    if (target) requestAnimationFrame(() => document.getElementById(target.id)?.scrollIntoView({ block: "start" }));
  }, []);

  const indicator = { type: "tween" as const, duration: reduce ? 0 : 0.35, ease: EASE };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[13.5rem_minmax(0,1fr)] xl:gap-8">
      {/* Secondary navigation */}
      <nav aria-label="Settings sections" className="sticky top-16 z-20 -mx-4 bg-[var(--cream)]/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 md:top-0 xl:top-6 xl:mx-0 xl:self-start xl:bg-transparent xl:p-0 xl:backdrop-blur-none">
        <ul className="grid grid-cols-3 gap-1 rounded-xl border border-black/[0.08] bg-white/80 p-1 xl:grid-cols-1 xl:gap-0.5 xl:p-2">
          {SECTIONS.map(({ id, label, short, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id} className="relative">
                {isActive && <motion.span layoutId="settings-nav-active" transition={indicator} aria-hidden="true" className="absolute inset-0 rounded-lg bg-[#f7e7e6]" />}
                <a
                  href={`#${id.replace("settings-", "")}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go(id);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative flex h-11 items-center justify-center gap-2 rounded-lg px-2 text-[0.8125rem] transition-colors focus-visible:outline-2 focus-visible:outline-burgundy sm:text-sm xl:justify-start xl:px-3 ${
                    isActive ? "font-semibold text-[#5a0c14]" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  <Icon aria-hidden="true" size={17} strokeWidth={1.7} className="hidden shrink-0 min-[400px]:block" />
                  <span className="xl:hidden">{short}</span>
                  <span className="hidden xl:inline">{label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="flex min-w-0 flex-col gap-6"
      >
        <ProfileSection profile={profile} onProfile={setProfile} serifClassName={serifClassName} />
        <PasswordSection passwordChangedAt={profile.passwordChangedAt} onChanged={setProfile} serifClassName={serifClassName} />
        <LoginActivitySection serifClassName={serifClassName} />
      </motion.div>
    </div>
  );
}

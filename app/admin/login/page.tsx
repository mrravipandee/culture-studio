import type { Metadata } from "next";
import Image from "next/image";
import { editorialSerif } from "@/lib/fonts";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Login" };

/**
 * /admin/login — split screen: burgundy brand panel (43%) and sign-in form (57%).
 * Signed-in admins never see this page: proxy.ts redirects them to /admin/dashboard.
 */
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <section
        aria-label="CULT.URE Admin Portal"
        className="relative isolate flex min-h-[15rem] items-end overflow-hidden bg-[#2a0a0f] px-6 pt-14 pb-9 text-[#faf7f2] sm:min-h-[18rem] sm:px-10 lg:min-h-screen lg:w-[43%] lg:items-center lg:px-[7.5%] lg:py-16"
      >
        <Image
          src="/images/admin/admin-login-bg.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 43vw, 100vw"
          className="admin-reveal -z-10 object-cover object-[60%_40%]"
        />
        {/* Light scrim so white text stays readable on the lit areas of the image. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/35 via-black/10 to-transparent" />

        <div className="admin-fade-up max-w-md lg:-mt-16">
          <p className={`${editorialSerif.className} text-[1.75rem] font-medium leading-none tracking-[-0.01em] lg:text-[2.375rem]`}>
            CULT.URE
          </p>
          <span aria-hidden="true" className="mt-5 block h-px w-12 bg-[#faf7f2]/80 lg:mt-9 lg:w-14" />
          <h1
            className={`${editorialSerif.className} mt-5 text-[2.25rem] font-normal leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:mt-9 lg:text-[3.75rem]`}
          >
            Admin Portal
          </h1>
          <p className="mt-3 max-w-[24rem] text-sm leading-relaxed text-[#faf7f2]/90 sm:text-base lg:mt-5 lg:text-[1.1875rem]">
            Manage case studies, blogs and enquiries for CULT.URE.
          </p>
        </div>
      </section>

      {/* Sign-in */}
      <section aria-labelledby="admin-login-title" className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:w-[57%] lg:px-[6%]">
        <div className="admin-fade-up w-full max-w-[36rem] [animation-delay:120ms]">
          <p className="flex items-center gap-5 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-burgundy">
            Admin access
            <span aria-hidden="true" className="h-px w-16 bg-burgundy/70" />
          </p>
          <h2
            id="admin-login-title"
            className={`${editorialSerif.className} mt-5 text-[2.5rem] font-medium leading-[1.05] tracking-[-0.015em] text-[#1a0a0c] sm:text-5xl lg:text-[3.5rem]`}
          >
            Welcome Back
          </h2>
          <p className="mt-3 text-base text-ink-2 sm:text-[1.1875rem]">Sign in to access the CULT.URE dashboard.</p>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}

# CULT.URE — Creative Personal Branding Agency

> **"Beyond the noise. Into the culture."**

CULT.URE is a premier personal branding and cultural positioning agency website designed for visionary founders, executives, and category leaders.

---

## ✦ Brand Identity & Visual Language

- **Primary Background**: Pure White (`#FFFFFF`)
- **Primary Accent / Brand Color**: Burgundy (`#240C0E`)
- **Foreground / Text**: Deep Black (`#000000` / `#111111`)
- **Aesthetic**: Premium, editorial, cinematic, minimal, and experimental.

---

## ✦ Key Features

### 1. Cinematic Entrance Experience
- **Phase 1: Brand Film Intro**: Full-viewport muted video canvas (`/videos/file.mp4`) with subtle ambient gradient vignette.
- **Phase 2: Timed Brand Reveal**: Timed fade-in of high-editorial typography (`CULT.URE` and tagline).
- **Phase 3: Smooth Transition**: Seamless scale and fade out from video overlay directly into the editorial hero section.
- **Phase 4: Scroll-Aware Navigation**: Header stays out of view during entrance and reveals on scroll or mobile tap.
- **Accessibility & Controls**: Built-in `prefers-reduced-motion` detection and interactive "Enter Site / Skip" button.

### 2. Editorial Layout & Navigation
- Floating frosted-glass navbar with smooth cubic-bezier transitions.
- Responsive mobile drawer menu.
- Semantic route group architecture (`app/(website)`).

---

## ✦ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: TypeScript

---

## ✦ Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the entrance experience.

---

## ✦ Component Architecture

```
app/(website)/
├── layout.tsx                     # Website shell with root brand styling
├── page.tsx                       # Orchestrates entrance & home page
├── about/page.tsx                 # About agency page
├── case-studies/page.tsx          # Selected works & case studies
└── services/page.tsx              # Agency services & contact
components/
├── entrance/
│   ├── CinematicIntro.tsx         # Full-viewport video & state controller
│   └── BrandReveal.tsx            # Cinematic typography overlay
├── navigation/
│   └── Navbar.tsx                 # Scroll-aware minimal header & mobile menu
└── home/
    └── HomeHero.tsx               # Editorial hero statement section
```

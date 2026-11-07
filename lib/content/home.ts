/**
 * CULT.URE — Homepage content.
 *
 * All homepage copy lives here so it can be edited without touching layout.
 * Anything marked `placeholder: true` is a clearly labelled stand-in and
 * must be replaced with real, approved material before launch.
 * Images: set `image.src` to a file in /public/images/... to replace a
 * placeholder frame with an optimised next/image.
 */

export type ContentImage = {
  /** Path under /public, e.g. "/images/work/project-01.jpg". */
  src: string | null;
  alt: string;
  /** Label shown inside the placeholder frame while `src` is null. */
  placeholderLabel: string;
};

export type SectionIntro = {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
};

/* ---------------------------------------------------------------
   03 — Manifesto
---------------------------------------------------------------- */

export const manifesto = {
  intro: {
    index: "01",
    eyebrow: "Manifesto",
    title: "Attention is rented. Culture is owned.",
  } satisfies SectionIntro,
  lead:
    "Most personal brands are built for the feed — loud, frequent and easy to forget. We believe a name earns its place differently: by standing for something clear, expressed with consistency, in the rooms and on the platforms that matter.",
  beliefs: [
    {
      title: "Clarity before content",
      body: "Before anything is published, we define what you stand for and who it is for. Everything else follows from that.",
    },
    {
      title: "Consistency compounds",
      body: "Recognition is built over time. A steady, recognisable voice outlasts any single viral moment.",
    },
    {
      title: "Substance over spectacle",
      body: "The strongest brands are earned by real expertise, presented well — not by noise, volume or borrowed trends.",
    },
  ],
  value: {
    title: "Why personal branding matters",
    body: "People trust people. A considered personal brand turns your expertise into recognition, and recognition into opportunity — whether you are a founder building a company, a creator building an audience or an executive leading an industry conversation.",
  },
};

/* ---------------------------------------------------------------
   04 — Expertise (proposed service categories — edit freely)
---------------------------------------------------------------- */

export type Service = {
  id: string;
  title: string;
  description: string;
  includes: string[];
  image: ContentImage;
};

/**
 * Logo marquee. PLACEHOLDER names: replace with real, approved client logos
 * (set `src` to an SVG in /public/images/clients/) before launch.
 */
export const trustedBy = {
  label: "Trusted by founders and leaders at",
  placeholder: true,
  logos: [
    { name: "Client One", src: null },
    { name: "Client Two", src: null },
    { name: "Client Three", src: null },
    { name: "Client Four", src: null },
    { name: "Client Five", src: null },
    { name: "Client Six", src: null },
  ],
};

export const expertise = {
  intro: {
    index: "02",
    eyebrow: "Expertise",
    title: "Four disciplines. One coherent presence.",
    description:
      "Strategy, story, identity and systems — working together so every part of your public presence points in the same direction.",
  } satisfies SectionIntro,
  services: [
    {
      id: "personal-branding",
      title: "Personal Branding",
      description:
        "Defining who you are in public: the narrative, voice and point of view that make your name recognisable for the right reasons.",
      includes: [
        "Narrative & positioning",
        "Voice & tone",
        "Presence audit",
        "Platform strategy",
      ],
      image: {
        src: "/images/services/personal-branding.jpg",
        alt: "Personal Branding — CULT.URE Practice",
        placeholderLabel: "Visual — Personal Branding",
      },
    },
    {
      id: "content-strategy",
      title: "Content Strategy & Creation",
      description:
        "Turning expertise into a consistent body of work — planned around your goals, produced with editorial care and shaped for each platform.",
      includes: [
        "Content pillars",
        "Editorial planning",
        "Writing & scripting",
        "Video & visual production",
      ],
      image: {
        src: "/images/services/content-strategy.jpg",
        alt: "Content Strategy & Creation — CULT.URE Practice",
        placeholderLabel: "Visual — Content Strategy & Creation",
      },
    },
    {
      id: "brand-identity",
      title: "Brand Identity & Positioning",
      description:
        "A visual and verbal identity that matches the substance behind it, so every touchpoint looks and sounds unmistakably like you.",
      includes: [
        "Visual identity",
        "Messaging framework",
        "Photography direction",
        "Brand guidelines",
      ],
      image: {
        src: "/images/services/brand-identity.jpg",
        alt: "Brand Identity & Positioning — CULT.URE Practice",
        placeholderLabel: "Visual — Brand Identity & Positioning",
      },
    },
    {
      id: "ai-automation",
      title: "AI Automation",
      description:
        "Systems that take repetitive work out of research, publishing and repurposing — so more of your time goes to thinking, and less to process.",
      includes: [
        "Content workflows",
        "Research & repurposing",
        "Scheduling & distribution",
        "Custom AI assistants",
      ],
      image: {
        src: "/images/services/ai-automation.jpg",
        alt: "AI Automation & Future Systems — CULT.URE Practice",
        placeholderLabel: "Visual — AI Automation",
      },
    },
  ] satisfies Service[],
};

/* ---------------------------------------------------------------
   05 — Selected Work
---------------------------------------------------------------- */

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  /** Link to the full case study once it exists. */
  href: string | null;
  placeholder: boolean;
  image: ContentImage;
};

export const selectedWork = {
  intro: {
    index: "03",
    eyebrow: "Selected work",
    title: "Defining personal brands.",
    description:
      "A curated archive of strategic positioning, bespoke editorial media, and cultural influence across industries.",
  } satisfies SectionIntro,
  cta: { label: "View all case studies", href: "/case-studies" },
  projects: [
    {
      id: "sample-01",
      title: "Aura & Influence",
      category: "Personal Branding",
      description:
        "Comprehensive public identity and strategic media positioning for a pioneering frontier technology founder.",
      href: "/case-studies",
      placeholder: false,
      image: {
        src: "/images/work/project-01.jpg",
        alt: "Aura & Influence Case Study",
        placeholderLabel: "Project image — Aura & Influence",
      },
    },
    {
      id: "sample-02",
      title: "Vanguard Monograph",
      category: "Content Strategy & Creation",
      description:
        "An executive thought-leadership publication and cinematic visual production reaching 4.5M+ category leaders.",
      href: "/case-studies",
      placeholder: false,
      image: {
        src: "/images/work/project-02.jpg",
        alt: "Vanguard Monograph Case Study",
        placeholderLabel: "Project image — Vanguard Monograph",
      },
    },
    {
      id: "sample-03",
      title: "Cognition Capital",
      category: "Brand Identity & Positioning",
      description:
        "Monolithic visual identity, digital architecture, and private editorial channel for a Tier-1 venture partner.",
      href: "/case-studies",
      placeholder: false,
      image: {
        src: "/images/work/project-03.jpg",
        alt: "Cognition Capital Case Study",
        placeholderLabel: "Project image — Cognition Capital",
      },
    },
  ] satisfies Project[],
};

/* ---------------------------------------------------------------
   06 — Our Thinking
---------------------------------------------------------------- */

export const thinking = {
  intro: {
    index: "05",
    eyebrow: "Thinking",
    title: "How we see branding, content and culture.",
  } satisfies SectionIntro,
  statements: [
    {
      topic: "On branding",
      statement: "A brand is not what you say. It is what people repeat.",
      body: "Positioning only works when it is simple enough for others to carry. We design for the sentence people use to describe you when you are not in the room.",
    },
    {
      topic: "On content",
      statement: "Your audience doesn't need more content. It needs a clearer you.",
      body: "Volume is easy. Meaning is rare. We publish less noise and more conviction — fewer pieces, each with a reason to exist.",
    },
    {
      topic: "On culture",
      statement: "Trends are borrowed. Culture is built.",
      body: "Chasing what is popular makes you interchangeable. Building around what you believe makes you a reference point.",
    },
    {
      topic: "On AI",
      statement: "Automate the process. Never the perspective.",
      body: "AI should buy back time for original thought — handling the repetitive work so the voice stays unmistakably human.",
    },
  ],
};

/* ---------------------------------------------------------------
   07 — Process
---------------------------------------------------------------- */

export const processSteps = {
  intro: {
    index: "04",
    eyebrow: "Process",
    title: "A clear path from noise to culture.",
  } satisfies SectionIntro,
  steps: [
    {
      title: "Discover",
      body: "We listen first — your story, goals, audience and the landscape you operate in — to find what is distinctive and true.",
    },
    {
      title: "Define",
      body: "We turn those insights into a clear position, narrative and identity: what you stand for, and how it should look and sound.",
    },
    {
      title: "Create",
      body: "We bring it to life through content, visuals and systems — produced with editorial care and consistent across every platform.",
    },
    {
      title: "Evolve",
      body: "We review what resonates, refine the approach and adapt as you, your audience and the culture around you change.",
    },
  ],
};

/* ---------------------------------------------------------------
   08 — Why CULT.URE
---------------------------------------------------------------- */

export const whyCulture = {
  intro: {
    index: "06",
    eyebrow: "Why CULT.URE",
    title: "Strategy, creativity and cultural relevance — in one practice.",
    description:
      "We work at the intersection of three things most agencies keep separate. That is what lets a personal brand feel coherent instead of assembled.",
  } satisfies SectionIntro,
  pillars: [
    {
      title: "Strategy",
      body: "Every decision traces back to a clear position and a defined audience. Nothing is published without a reason.",
    },
    {
      title: "Creativity",
      body: "Editorial standards for every piece — considered writing, intentional visuals and a recognisable aesthetic.",
    },
    {
      title: "Cultural relevance",
      body: "We pay attention to the conversations shaping your field, so your voice adds to them rather than echoing them.",
    },
  ],
  commitments: [
    "Strategy before a single post",
    "One team across story, content, identity and automation",
    "Work built around you — not a template",
    "Honest conversations about what is and isn't working",
  ],
};

/* ---------------------------------------------------------------
   09 — Client Voices (PLACEHOLDERS — real, approved feedback only)
---------------------------------------------------------------- */

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  placeholder: boolean;
};

export const clientVoices = {
  intro: {
    index: "07",
    eyebrow: "Client Voices",
    title: "In their words.",
    description:
      "Client feedback will be published here only with permission.",
  } satisfies SectionIntro,
  testimonials: [
    {
      id: "voice-01",
      quote: "Testimonial placeholder — awaiting approved client feedback.",
      name: "Client name",
      role: "Role, Company",
      placeholder: true,
    },
    {
      id: "voice-02",
      quote: "Testimonial placeholder — awaiting approved client feedback.",
      name: "Client name",
      role: "Role, Company",
      placeholder: true,
    },
    {
      id: "voice-03",
      quote: "Testimonial placeholder — awaiting approved client feedback.",
      name: "Client name",
      role: "Role, Company",
      placeholder: true,
    },
  ] satisfies Testimonial[],
};

/* ---------------------------------------------------------------
   10 — Contact
---------------------------------------------------------------- */

export type SocialLink = { label: string; href: string };

/** Only approved testimonials are ever shown; placeholders keep the section hidden. */
export const hasClientVoices = clientVoices.testimonials.some((t) => !t.placeholder);

export const contact = {
  intro: {
    index: hasClientVoices ? "08" : "07",
    eyebrow: "Contact",
    title: "Let's build a name that outlasts the noise.",
    description:
      "Whether you are starting from scratch or refining an existing presence, we would like to hear what you are building. Tell us where you are today and where you want your name to go.",
  } satisfies SectionIntro,
  /** Set to the real inbox, e.g. "hello@yourdomain.com". */
  email: null as string | null,
  /** Add real profiles, e.g. { label: "LinkedIn", href: "https://..." }. */
  socials: [] as SocialLink[],
  /** Used for the CTA while no email is configured. */
  fallbackCta: { label: "Get in touch", href: "/#contact" },
};

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
    index: "03",
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

export const expertise = {
  intro: {
    index: "04",
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
        src: null,
        alt: "",
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
        src: null,
        alt: "",
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
        src: null,
        alt: "",
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
        src: null,
        alt: "",
        placeholderLabel: "Visual — AI Automation",
      },
    },
  ] satisfies Service[],
};

/* ---------------------------------------------------------------
   05 — Selected Work (SAMPLE PLACEHOLDERS — replace with real work)
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
    index: "05",
    eyebrow: "Selected Work",
    title: "Selected work.",
    description:
      "A selection of projects will be published here as case studies are approved for release.",
  } satisfies SectionIntro,
  cta: { label: "View all case studies", href: "/case-studies" },
  projects: [
    {
      id: "sample-01",
      title: "Sample Project 01",
      category: "Personal Branding",
      description:
        "Placeholder. Replace with a short summary of the brief, the approach and the outcome once the case study is approved.",
      href: null,
      placeholder: true,
      image: { src: null, alt: "", placeholderLabel: "Project image — Sample 01" },
    },
    {
      id: "sample-02",
      title: "Sample Project 02",
      category: "Content Strategy & Creation",
      description:
        "Placeholder. Replace with a short summary of the brief, the approach and the outcome once the case study is approved.",
      href: null,
      placeholder: true,
      image: { src: null, alt: "", placeholderLabel: "Project image — Sample 02" },
    },
    {
      id: "sample-03",
      title: "Sample Project 03",
      category: "Brand Identity & Positioning",
      description:
        "Placeholder. Replace with a short summary of the brief, the approach and the outcome once the case study is approved.",
      href: null,
      placeholder: true,
      image: { src: null, alt: "", placeholderLabel: "Project image — Sample 03" },
    },
  ] satisfies Project[],
};

/* ---------------------------------------------------------------
   06 — Our Thinking
---------------------------------------------------------------- */

export const thinking = {
  intro: {
    index: "06",
    eyebrow: "Our Thinking",
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
    index: "07",
    eyebrow: "Our Process",
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
    index: "08",
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
    index: "09",
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

export const contact = {
  intro: {
    index: "10",
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
  fallbackCta: { label: "Get in touch", href: "/services#contact" },
};

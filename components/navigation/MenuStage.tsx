import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useIsPresent } from "motion/react";
import { DURATION, EASE } from "@/lib/motion";

/**
 * Web cut of /videos/navbar-video.mp4: letterbox removed, no audio, ~0.5 MB, 6.6s.
 * Each pass fades up from and back down into the wine backdrop, so the loop point
 * reads as a film dip rather than a jump.
 */
const VIDEO_SRC = "/videos/navbar-video-web.mp4";
/** Frame at START_AT of the web cut, so the poster hands over to the video seamlessly. */
const POSTER_SRC = "/images/navbar-video-poster.jpg";
/** Open on the first fully faded-in frame (later loops include the fade-up). */
const START_AT = 0.5;
const BRAND = Array.from("CULT.URE");
/** Per-letter delay; matches --stagger-word (50ms). */
const STAGGER = 0.05;

/** Visitors who asked for less motion or less data get the still frame only. */
function shouldPlayVideo() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !conn?.saveData;
}

/**
 * Cinematic film inside the open mobile menu.
 *
 * Only mounted while the menu is open (and the menu exists below 768px only), so the
 * video is never requested on desktop or while the menu is closed. The optimized poster
 * fills the frame first; the video is attached on open, starts from the beginning, loops
 * muted and inline, and pauses as soon as the menu starts closing. Reduced motion,
 * Save-Data and playback errors all leave the poster in place. Decorative: hidden from
 * assistive technology.
 */
export default function MenuStage({ delay = 0, reduce = false }: { delay?: number; reduce?: boolean | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPresent = useIsPresent();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  // Open: attach the source and play from the start.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldPlayVideo()) return;
    video.muted = true; // set as a property too: iOS requires it for autoplay
    video.src = VIDEO_SRC;
    video.currentTime = START_AT;
    video.play().catch(() => {
      // Autoplay refused (e.g. low-power mode): the poster stays.
    });
    return () => {
      video.pause();
      video.removeAttribute("src");
      video.load(); // releases the network request and decoder
    };
  }, []);

  // Closing: AnimatePresence keeps this mounted for the exit fade, so stop playback now.
  useEffect(() => {
    if (!isPresent) videoRef.current?.pause();
  }, [isPresent]);

  return (
    <motion.div
      aria-hidden="true"
      className="menu-stage"
      initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: DURATION.image, ease: EASE, delay }}
    >
      <Image src={POSTER_SRC} alt="" fill sizes="(min-width: 768px) 0px, 100vw" className="object-cover" />
      {!failed && (
        <video
          ref={videoRef}
          className="menu-stage__video"
          data-playing={playing || undefined}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          disableRemotePlayback
          tabIndex={-1}
          onPlaying={() => setPlaying(true)}
          onError={() => setFailed(true)}
        />
      )}

      {/* Wordmark: letters rise out of a mask one after another once the frame has opened. */}
      <div className="menu-stage__scrim" />
      <p className="menu-stage__brand">
        {BRAND.map((char, i) => (
          <span key={i} className="menu-stage__char-mask">
            <motion.span
              className={char === "." ? "menu-stage__char menu-stage__char--dot" : "menu-stage__char"}
              initial={reduce ? { opacity: 0 } : { y: "180%" }}
              animate={reduce ? { opacity: 1 } : { y: "0%" }}
              transition={{ duration: DURATION.text, ease: EASE, delay: delay + 0.45 + i * STAGGER }}
            >
              {char}
            </motion.span>
          </span>
        ))}
      </p>
    </motion.div>
  );
}

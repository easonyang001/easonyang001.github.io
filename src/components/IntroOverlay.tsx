import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { introSentences } from "../data/site.ts";

interface IntroOverlayProps {
  onExitStart: () => void;
  onDone: () => void;
}

type TierKey = "XS" | "S" | "L" | "XL";
type Direction = "ltr" | "rtl";

interface TierConfig {
  fontSize: string;
  opacity: number;
  duration: number;
}

interface LineDef {
  text: string;
  wave: number;
  tier: TierKey;
}

interface ActiveSentence {
  id: number;
  text: string;
  tier: TierKey;
  track: number;
  direction: Direction;
}

interface Track {
  direction: Direction;
  freeAt: number;
}

const DESKTOP_TIERS: Record<TierKey, TierConfig> = {
  XS: { fontSize: "clamp(16px, 1.6vw, 22px)", opacity: 0.55, duration: 5.0 },
  S: { fontSize: "clamp(24px, 2.8vw, 36px)", opacity: 0.42, duration: 6.0 },
  L: { fontSize: "clamp(40px, 5vw, 68px)", opacity: 0.24, duration: 7.5 },
  XL: { fontSize: "clamp(56px, 7vw, 96px)", opacity: 0.15, duration: 9.0 },
};

const MOBILE_TIERS: Record<TierKey, TierConfig> = {
  XS: { fontSize: "14px", opacity: 0.55, duration: 5.0 },
  S: { fontSize: "20px", opacity: 0.42, duration: 6.0 },
  L: { fontSize: "28px", opacity: 0.24, duration: 7.5 },
  XL: { fontSize: "38px", opacity: 0.15, duration: 9.0 }, // defined, never assigned on mobile
};

// Across the 9 sentences: at most 1 XL, at most 2 L, the rest S/XS.
const DESKTOP_TIER_MAP: TierKey[] = ["S", "XS", "L", "XS", "S", "XL", "S", "L", "XS"];

const DESKTOP_LANES = [15, 25, 35, 45, 55, 65, 75, 85];
const MOBILE_LANES = [15, 32.5, 50, 67.5, 85];

const DESKTOP_TIMELINE = { waves: [0.3, 1.4, 2.5], fadeoutStart: 4.0, maskExitStart: 4.4, end: 5.1 };
const MOBILE_TIMELINE = { waves: [0.3, 1.3], fadeoutStart: 2.8, maskExitStart: 3.1, end: 3.8 };
const TRACK_CLEARANCE_MS = 2000;
const SKIP_FADE_MS = 400;

function buildLines(isMobile: boolean): LineDef[] {
  if (!isMobile) {
    return introSentences.map((text, i) => ({
      text,
      wave: Math.floor(i / 3),
      tier: DESKTOP_TIER_MAP[i],
    }));
  }
  // Mobile: opening pair + closing pair, 2 waves of 2. None of these are the XL sentence.
  const idxs = [0, 1, 7, 8];
  return idxs.map((idx, i) => ({
    text: introSentences[idx],
    wave: Math.floor(i / 2),
    tier: DESKTOP_TIER_MAP[idx],
  }));
}

/** Lane N (1-indexed): odd enters from the right and drifts left, even enters from the left and drifts right. */
function laneDirection(trackIndex: number): Direction {
  return (trackIndex + 1) % 2 === 1 ? "rtl" : "ltr";
}

export default function IntroOverlay({ onExitStart, onDone }: IntroOverlayProps) {
  const [mounted, setMounted] = useState(true);
  const [activeSentences, setActiveSentences] = useState<ActiveSentence[]>([]);
  const [fadingOut, setFadingOut] = useState(false);
  const [maskExiting, setMaskExiting] = useState(false);
  const [showSkipHint, setShowSkipHint] = useState(false);
  const timersRef = useRef<number[]>([]);
  const skippedRef = useRef(false);
  const startRef = useRef(0);
  const nextIdRef = useRef(0);

  const isMobile = useRef(typeof window !== "undefined" && window.innerWidth < 768).current;
  const lines = useRef(buildLines(isMobile)).current;
  const lanes = isMobile ? MOBILE_LANES : DESKTOP_LANES;
  const tiers = isMobile ? MOBILE_TIERS : DESKTOP_TIERS;
  const timeline = isMobile ? MOBILE_TIMELINE : DESKTOP_TIMELINE;
  const naturalMaskFadeMs = (timeline.end - timeline.maskExitStart) * 1000;

  const tracksRef = useRef<Track[]>(
    lanes.map((_, i) => ({ direction: laneDirection(i), freeAt: 0 }))
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const spawnWave = (waveIndex: number) => {
    const elapsed = Date.now() - startRef.current;
    const waveLines = lines.filter((l) => l.wave === waveIndex);
    const spawned: ActiveSentence[] = [];
    for (const line of waveLines) {
      let trackIdx = tracksRef.current.findIndex((t) => t.freeAt <= elapsed);
      if (trackIdx === -1) trackIdx = 0;
      const track = tracksRef.current[trackIdx];
      track.freeAt = elapsed + TRACK_CLEARANCE_MS;
      spawned.push({
        id: nextIdRef.current++,
        text: line.text,
        tier: line.tier,
        track: trackIdx,
        direction: track.direction,
      });
    }
    setActiveSentences((prev) => [...prev, ...spawned]);
  };

  const skip = () => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setFadingOut(true);
    setMaskExiting(true);
    onExitStart();
    window.setTimeout(() => {
      setMounted(false);
      onDone();
    }, SKIP_FADE_MS);
  };

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      startRef.current = Date.now();
      timeline.waves.forEach((s, i) => {
        timersRef.current.push(window.setTimeout(() => spawnWave(i), s * 1000));
      });
      timersRef.current.push(window.setTimeout(() => setFadingOut(true), timeline.fadeoutStart * 1000));
      timersRef.current.push(
        window.setTimeout(() => {
          setMaskExiting(true);
          onExitStart();
        }, timeline.maskExitStart * 1000)
      );
      timersRef.current.push(
        window.setTimeout(() => {
          setMounted(false);
          onDone();
        }, timeline.end * 1000)
      );
      timersRef.current.push(window.setTimeout(() => setShowSkipHint(true), 1000));
    });
    return () => {
      cancelled = true;
      timersRef.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    document.addEventListener("keydown", handleKey);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchmove", skip, { passive: true });
    return () => {
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchmove", skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      aria-hidden="true"
      onClick={skip}
      className="bg-background"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        opacity: maskExiting ? 0 : 1,
        transition: `opacity ${maskExiting ? (skippedRef.current ? SKIP_FADE_MS : naturalMaskFadeMs) : 0}ms ease-out`,
        pointerEvents: "auto",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      <style>{`
        @keyframes intro-drift-rtl {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100%); }
        }
        @keyframes intro-drift-ltr {
          from { transform: translateX(-100%); }
          to { transform: translateX(100vw); }
        }
      `}</style>

      {activeSentences.map((s) => {
        const tier = tiers[s.tier];
        return (
          <motion.span
            key={s.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: fadingOut ? 0 : tier.opacity }}
            transition={{ duration: fadingOut ? 0.4 : 0.4 }}
            className="text-text-primary"
            style={{
              position: "absolute",
              top: `${lanes[s.track]}%`,
              left: 0,
              whiteSpace: "nowrap",
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              fontSize: tier.fontSize,
              willChange: "transform",
              animation: `intro-drift-${s.direction} ${tier.duration}s linear forwards`,
            }}
          >
            {s.text}
          </motion.span>
        );
      })}

      {showSkipHint && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: fadingOut ? 0 : 0.4 }}
          transition={{ duration: 0.4 }}
          className="font-mono text-mono-label uppercase text-text-muted"
          style={{ position: "absolute", right: 24, bottom: 24 }}
        >
          Skip
        </motion.p>
      )}
    </div>,
    document.body
  );
}

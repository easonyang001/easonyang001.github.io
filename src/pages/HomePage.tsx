import { MotionConfig } from "framer-motion";
import Hero from "../components/Hero.tsx";
import HomeAbout from "../components/home/HomeAbout.tsx";
import HomeVisualFocus from "../components/home/HomeVisualFocus.tsx";
import HomeExploreLinks from "../components/home/HomeExploreLinks.tsx";
import { useSeo } from "../lib/seo/useSeo.ts";

export default function HomePage() {
  useSeo({
    description:
      "Mrama Institute for Quantum Information and Intelligence is an independent research institute advancing quantum computing, quantum information science, artificial intelligence, and intelligent optimization.",
    path: "/",
  });

  return (
    <MotionConfig reducedMotion="user">
      <Hero />
      <HomeAbout />
      <HomeVisualFocus />
      <HomeExploreLinks />
    </MotionConfig>
  );
}

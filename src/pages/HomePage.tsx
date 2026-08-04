import { MotionConfig } from "framer-motion";
import Hero from "../components/Hero.tsx";
import HomeAbout from "../components/home/HomeAbout.tsx";
import HomeResearch from "../components/home/HomeResearch.tsx";
import HomeProjects from "../components/home/HomeProjects.tsx";
import HomeLab from "../components/home/HomeLab.tsx";
import HomePublications from "../components/home/HomePublications.tsx";
import HomeOpenSource from "../components/home/HomeOpenSource.tsx";
import HomeNews from "../components/home/HomeNews.tsx";
import HomeContact from "../components/home/HomeContact.tsx";
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
      <HomeResearch />
      <HomeProjects />
      <HomeLab />
      <HomePublications />
      <HomeOpenSource />
      <HomeNews />
      <HomeContact />
    </MotionConfig>
  );
}

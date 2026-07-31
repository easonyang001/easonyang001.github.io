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

export default function HomePage() {
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

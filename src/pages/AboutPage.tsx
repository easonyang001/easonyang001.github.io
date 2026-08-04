import AboutHero from "../components/about/AboutHero.tsx";
import AboutGlance from "../components/about/AboutGlance.tsx";
import AboutVisionMission from "../components/about/AboutVisionMission.tsx";
import AboutPrinciples from "../components/about/AboutPrinciples.tsx";
import AboutNetwork from "../components/about/AboutNetwork.tsx";
import AboutOpenScience from "../components/about/AboutOpenScience.tsx";
import AboutFounder from "../components/about/AboutFounder.tsx";
import AboutCollaboration from "../components/about/AboutCollaboration.tsx";
import AboutFAQ from "../components/about/AboutFAQ.tsx";
import { useSeo } from "../lib/seo/useSeo.ts";

export default function AboutPage() {
  useSeo({
    title: "About",
    description:
      "Mrama Institute is an independent, self-funded research initiative advancing quantum information science, quantum machine learning, and intelligent optimization.",
    path: "/about",
  });

  return (
    <>
      <AboutHero />
      <AboutGlance />

      <AboutVisionMission />
      <AboutPrinciples />
      <AboutNetwork />
      <AboutOpenScience />
      <AboutFounder />
      <AboutCollaboration />
      <AboutFAQ />
    </>
  );
}

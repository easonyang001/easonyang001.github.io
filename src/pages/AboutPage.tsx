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
      "Co-founded by two young researchers from Taiwan and France, Mrama Institute advances quantum information science, quantum machine learning, and intelligent optimization.",
    path: "/about",
  });

  return (
    <div className="overflow-x-clip">
      <AboutHero />
      <AboutGlance />

      <AboutVisionMission />
      <AboutPrinciples />
      <AboutNetwork />
      <AboutOpenScience />
      <AboutFounder />
      <AboutCollaboration />
      <AboutFAQ />
    </div>
  );
}

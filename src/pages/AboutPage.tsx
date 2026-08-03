import AboutHero from "../components/about/AboutHero.tsx";
import AboutVisionMission from "../components/about/AboutVisionMission.tsx";
import AboutPrinciples from "../components/about/AboutPrinciples.tsx";
import AboutNetwork from "../components/about/AboutNetwork.tsx";
import AboutOpenScience from "../components/about/AboutOpenScience.tsx";
import AboutFounder from "../components/about/AboutFounder.tsx";
import AboutCollaboration from "../components/about/AboutCollaboration.tsx";
import AboutFAQ from "../components/about/AboutFAQ.tsx";

export default function AboutPage() {
  return (
    <>
      <AboutHero />

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

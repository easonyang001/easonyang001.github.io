import PageShell from "../components/PageShell.tsx";
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
      <PageShell title="About the Institute">
        <p className="max-w-prose text-body-lg text-text-secondary">
          Mrama Institute for Quantum Information and Intelligence is an independent research
          initiative dedicated to advancing quantum information science, quantum machine learning,
          intelligent optimization, and hybrid quantum-classical computing.
        </p>

        <div className="mt-8 max-w-prose">
          <p className="font-mono text-mono-label uppercase text-text-muted">Organization</p>
          <p className="mt-4 text-body-lg text-text-secondary">
            Mrama Institute is an independent research project, currently led by a single
            researcher, self-funded, and not a registered legal entity. Research is focused on
            practical applications of quantum optimization and quantum machine learning.
          </p>
        </div>
      </PageShell>

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

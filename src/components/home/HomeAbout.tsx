import HomeSection from "./HomeSection.tsx";
import { site } from "../../data/site.ts";

export default function HomeAbout() {
  return (
    <HomeSection
      title="About the Institute"
      description={site.aboutBlurb}
      viewAllHref="/about"
      viewAllLabel="Full story"
    >
      <p className="max-w-prose text-body-lg text-text-secondary">
        Founded by Chia-Chen in Taiwan and Alexandre in France, Mrama grew from their shared passion
        for quantum science, intelligent systems, and research that can move from ideas into
        practical experimentation.
      </p>

      <div className="glass-card mt-8 max-w-prose p-8">
        <p className="font-mono text-mono-label uppercase text-text-muted">Mission</p>
        <p className="mt-4 text-body-lg text-text-primary">
          Bridge theoretical research with practical engineering applications.
        </p>
      </div>
    </HomeSection>
  );
}

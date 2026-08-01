import HomeSection from "./HomeSection.tsx";

export default function HomeAbout() {
  return (
    <HomeSection title="About the Institute" viewAllHref="/about" viewAllLabel="Full story">
      <p className="max-w-prose text-body-lg text-text-secondary">
        Mrama Institute for Quantum Information and Intelligence is an independent research
        initiative dedicated to advancing quantum information science, quantum machine learning,
        intelligent optimization, and hybrid quantum-classical computing.
      </p>

      <div className="glass-card mt-8 max-w-prose p-8">
        <p className="font-mono text-mono-label uppercase text-accent">Mission</p>
        <p className="mt-4 text-body-lg text-text-primary">
          Bridge theoretical research with practical engineering applications.
        </p>
      </div>
    </HomeSection>
  );
}

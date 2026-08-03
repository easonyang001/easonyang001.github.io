import type { Project } from "../types/index.ts";

export const projects: Project[] = [
  {
    slug: "aed-placement-optimization",
    title: "[SAMPLE] AED Placement Optimization",
    year: 2026,
    status: "Active",
    summary:
      "Optimizing the placement of automated external defibrillators across urban areas using quantum and classical combinatorial optimization to maximize cardiac arrest survival coverage.",
    coverImageUrl: null,
    technologies: ["Quantum Annealing", "Classical Solvers"],
    researchAreas: ["Operations Research", "Public Health"],
    readMoreUrl: null,
  },
  {
    slug: "quantum-diet-optimization",
    title: "[SAMPLE] Quantum Diet Optimization",
    year: 2026,
    status: "Active",
    summary:
      "Formulating nutritional planning as a constrained optimization problem and solving it with quantum annealing and hybrid solvers.",
    coverImageUrl: null,
    technologies: ["Quantum Annealing", "Hybrid Solvers"],
    researchAreas: ["Optimization", "Healthcare"],
    readMoreUrl: null,
  },
  {
    slug: "hybrid-quantum-solver",
    title: "[SAMPLE] Hybrid Quantum Solver",
    year: 2026,
    status: "Active",
    summary:
      "A hybrid quantum-classical solver framework that decomposes large optimization problems into quantum-tractable subproblems.",
    coverImageUrl: null,
    technologies: ["Hybrid Computing", "Quantum-Classical Decomposition"],
    researchAreas: ["Solver Design"],
    readMoreUrl: null,
  },
  {
    slug: "quantum-portfolio-optimization",
    title: "[SAMPLE] Quantum Portfolio Optimization",
    year: 2025,
    status: "On Hold",
    summary:
      "Applying quantum optimization techniques to portfolio construction under risk and diversification constraints.",
    coverImageUrl: null,
    technologies: ["Quantum Computing"],
    researchAreas: ["Finance", "Optimization"],
    readMoreUrl: null,
  },
];

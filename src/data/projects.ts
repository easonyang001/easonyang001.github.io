import type { Project } from "../types/index.ts";

export const projects: Project[] = [
  {
    slug: "aed-placement-optimization",
    title: "AED Placement Optimization",
    status: "Ongoing",
    description:
      "Optimizing the placement of automated external defibrillators across urban areas using quantum and classical combinatorial optimization to maximize cardiac arrest survival coverage.",
    tags: ["Quantum Optimization", "Operations Research", "Public Health"],
    readMoreUrl: null,
  },
  {
    slug: "quantum-diet-optimization",
    title: "Quantum Diet Optimization",
    status: "Ongoing",
    description:
      "Formulating nutritional planning as a constrained optimization problem and solving it with quantum annealing and hybrid solvers.",
    tags: ["Quantum Annealing", "Optimization", "Healthcare"],
    readMoreUrl: null,
  },
  {
    slug: "hybrid-quantum-solver",
    title: "Hybrid Quantum Solver",
    status: "In Development",
    description:
      "A hybrid quantum-classical solver framework that decomposes large optimization problems into quantum-tractable subproblems.",
    tags: ["Hybrid Computing", "Quantum-Classical", "Solver Design"],
    readMoreUrl: null,
  },
  {
    slug: "quantum-portfolio-optimization",
    title: "Quantum Portfolio Optimization",
    status: "Research",
    description:
      "Applying quantum optimization techniques to portfolio construction under risk and diversification constraints.",
    tags: ["Quantum Computing", "Finance", "Optimization"],
    readMoreUrl: null,
  },
];

import type { LabTool } from "../types/index.ts";

export const labTools: LabTool[] = [
  {
    slug: "bloch-sphere",
    name: "Bloch Sphere",
    description: "Interactive single-qubit state visualization on the Bloch sphere.",
    status: "published",
  },
  {
    slug: "circuit",
    name: "Circuit Playground",
    description: "Build and simulate small quantum circuits gate by gate.",
    status: "published",
  },
  {
    slug: "vqc",
    name: "Variational Quantum Classifier",
    description: "Train a 2-qubit classifier and watch the decision boundary form.",
    status: "published",
  },
  {
    slug: "vqe-h2",
    name: "H₂ Ground State (VQE)",
    description: "Find the ground-state energy of H₂ with a single-parameter ansatz.",
    status: "published",
  },
  {
    slug: "qubo",
    name: "QUBO Solver",
    description: "Formulate and solve QUBO problems interactively.",
    status: "coming-soon",
  },
  {
    slug: "annealing",
    name: "Annealing Simulator",
    description: "Visualize simulated annealing over an energy landscape.",
    status: "coming-soon",
  },
  {
    slug: "quantum-kernel",
    name: "Quantum Kernel Explorer",
    description: "Compare a quantum feature-map kernel against a classical RBF kernel.",
    status: "coming-soon",
  },
  {
    slug: "barren-plateau",
    name: "Barren Plateau Demo",
    description: "Visualize gradient variance collapse as circuit width grows.",
    status: "coming-soon",
  },
];

import {
  Atom,
  BrainCircuit,
  Waves,
  Snowflake,
  Cpu,
  Sparkles,
  Network,
  FlaskConical,
} from "lucide-react";
import type { ResearchArea } from "../types/index.ts";

export const researchAreas: ResearchArea[] = [
  {
    slug: "quantum-information",
    icon: Atom,
    title: "Quantum Information",
    description:
      "Foundational study of information encoded in quantum states, entanglement, and quantum communication protocols.",
    status: "exploratory",
    relatedLabTools: ["bloch-sphere", "circuit"],
  },
  {
    slug: "quantum-machine-learning",
    icon: BrainCircuit,
    title: "Quantum Machine Learning",
    description:
      "Designing quantum-enhanced learning algorithms that exploit superposition and entanglement for pattern discovery.",
    status: "exploratory",
    relatedLabTools: ["vqc", "quantum-kernel"],
  },
  {
    slug: "quantum-optimization",
    icon: Waves,
    title: "Quantum Optimization",
    description:
      "Formulating and solving combinatorial optimization problems using variational and quantum-native methods.",
    status: "active",
    relatedLabTools: ["qubo"],
  },
  {
    slug: "quantum-annealing",
    icon: Snowflake,
    title: "Quantum Annealing",
    description:
      "Leveraging adiabatic quantum hardware to explore rugged energy landscapes for near-term optimization advantage.",
    status: "active",
    relatedLabTools: ["annealing"],
  },
  {
    slug: "hybrid-quantum-classical-computing",
    icon: Cpu,
    title: "Hybrid Quantum-Classical Computing",
    description:
      "Building architectures that combine classical compute with quantum processors to solve real-world problems.",
    status: "active",
    relatedLabTools: ["vqe-h2"],
  },
  {
    slug: "artificial-intelligence",
    icon: Sparkles,
    title: "Artificial Intelligence",
    description:
      "Advancing machine learning theory and systems, from optimization to reasoning, that complement quantum research.",
    status: "exploratory",
  },
  {
    slug: "operations-research",
    icon: Network,
    title: "Operations Research",
    description:
      "Applying mathematical optimization and decision science to complex, large-scale operational systems.",
    status: "active",
  },
  {
    slug: "quantum-simulation-chemistry",
    icon: FlaskConical,
    title: "Quantum Simulation and Chemistry",
    description:
      "Educational exploration of quantum simulation for molecular systems, starting from minimal-basis, two-qubit examples.",
    status: "educational",
    relatedLabTools: ["vqe-h2"],
  },
];

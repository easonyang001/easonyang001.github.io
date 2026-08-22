import {
  Atom,
  Orbit,
  BrainCircuit,
  Waves,
  Cpu,
  Radio,
  Shield,
  FlaskConical,
  Sparkles,
  Network,
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
    group: "Quantum Foundations",
    relatedLabTools: ["bloch-sphere", "circuit"],
  },
  {
    slug: "quantum-theory",
    icon: Orbit,
    title: "Quantum Theory",
    description:
      "The mathematical and physical postulates underlying quantum mechanics -- state spaces, measurement, and unitary evolution -- that every quantum algorithm builds on.",
    status: "exploratory",
    group: "Quantum Foundations",
    relatedLabTools: ["bloch-sphere"],
  },
  {
    slug: "quantum-machine-learning",
    icon: BrainCircuit,
    title: "Quantum Machine Learning",
    description:
      "Designing quantum-enhanced learning algorithms that exploit superposition and entanglement for pattern discovery.",
    status: "exploratory",
    group: "Quantum Computing",
    relatedLabTools: ["vqc", "quantum-kernel"],
  },
  {
    slug: "quantum-optimization-annealing",
    icon: Waves,
    title: "Quantum Optimization & Annealing",
    description:
      "Formulating combinatorial optimization problems as energy landscapes and solving them with variational, quantum-native, and adiabatic annealing methods.",
    status: "active",
    group: "Quantum Computing",
    relatedLabTools: ["qubo", "annealing"],
  },
  {
    slug: "hybrid-quantum-classical-computing",
    icon: Cpu,
    title: "Hybrid Quantum-Classical Computing",
    description:
      "Building architectures that combine classical compute with quantum processors to solve real-world problems.",
    status: "active",
    group: "Quantum Computing",
    relatedLabTools: ["vqe-h2"],
  },
  {
    slug: "quantum-communication-networks",
    icon: Radio,
    title: "Quantum Communication & Networks",
    description:
      "Protocols for transmitting and distributing quantum information across distance, including quantum key distribution and the building blocks of a future quantum internet.",
    status: "exploratory",
    group: "Quantum Systems",
  },
  {
    slug: "quantum-security",
    icon: Shield,
    title: "Quantum Security",
    description:
      "Cryptographic protocols and threat models for a post-quantum world, spanning quantum-resistant algorithms and the guarantees quantum hardware can provide.",
    status: "exploratory",
    group: "Quantum Systems",
  },
  {
    slug: "quantum-simulation-chemistry",
    icon: FlaskConical,
    title: "Quantum Simulation & Chemistry",
    description:
      "Educational exploration of quantum simulation for molecular systems, starting from minimal-basis, two-qubit examples.",
    status: "educational",
    group: "Quantum Science",
    relatedLabTools: ["vqe-h2"],
  },
  {
    slug: "artificial-intelligence",
    icon: Sparkles,
    title: "Artificial Intelligence",
    description:
      "Advancing machine learning theory and systems, from optimization to reasoning, that complement quantum research.",
    status: "exploratory",
    group: null,
  },
  {
    slug: "operations-research",
    icon: Network,
    title: "Operations Research",
    description:
      "Applying mathematical optimization and decision science to complex, large-scale operational systems.",
    status: "active",
    group: null,
  },
];

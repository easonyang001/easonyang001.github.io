import type { Person } from "../types/index.ts";

export const people: Person[] = [
  {
    slug: "chia-chen-yang",
    name: "Chia-Chen Yang",
    roles: ["Founder"],
    biography:
      "Founder of Mrama Institute in Taiwan, building the institute around quantum machine learning, optimization, open research, and the one-dragon path from idea to working system.",
    researchInterests: [
      "Quantum Machine Learning",
      "Quantum Optimization",
      "Quantum Annealing",
      "Artificial Intelligence",
      "Operations Research",
    ],
    avatarUrl: null,
    avatarInitials: "CY",
    email: null,
    githubUrl: null,
    scholarUrl: null,
    linkedinUrl: null,
    orcid: null,
    locationCountry: "Taiwan",
    locationCity: null,
  },
  {
    slug: "alexandre-lam",
    name: "Alexandre Lam",
    roles: ["Co-Founder"],
    biography:
      "Co-founder of Mrama Institute in France, bringing a Mines Nancy background and a shared commitment to quantum research, engineering, and the institute's Taiwan-France founding story.",
    researchInterests: ["Quantum Computing", "Quantum Research", "Scientific Software"],
    avatarUrl: null,
    avatarInitials: "AL",
    email: null,
    githubUrl: null,
    scholarUrl: null,
    linkedinUrl: null,
    orcid: null,
    locationCountry: "France",
    locationCity: "Paris",
  },
];

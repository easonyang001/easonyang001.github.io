import type { Publication } from "../types/index.ts";

export const publications: Publication[] = [
  {
    slug: "quantum-annealing-facility-placement",
    title: "[SAMPLE] Quantum Annealing Approaches to Facility Placement Optimization",
    conference: "IEEE Quantum Week",
    year: "2026",
    area: "Quantum Annealing",
    type: "Conference Paper",
    status: "Published",
    abstract:
      "We present a quantum annealing formulation for large-scale facility placement problems, demonstrating competitive solution quality against classical heuristics on real-world urban datasets.",
    pdfUrl: null,
    doiUrl: null,
    codeUrl: null,
    bibtex: `@inproceedings{mrama2026facility,
  title     = {[SAMPLE] Quantum Annealing Approaches to Facility Placement Optimization},
  author    = {Yang, Jia-Zhen},
  booktitle = {IEEE Quantum Week},
  year      = {2026}
}`,
  },
  {
    slug: "annealing-schedules-near-term-hardware",
    title: "[SAMPLE] Simulated Annealing Schedules for Near-Term Quantum Hardware",
    conference: "arXiv preprint",
    year: "2026",
    area: "Quantum Annealing",
    type: "Preprint",
    status: "Preprint",
    abstract:
      "We study annealing schedule design for near-term quantum annealers, comparing linear and adaptive schedules under realistic noise models.",
    pdfUrl: null,
    doiUrl: null,
    codeUrl: null,
    bibtex: `@misc{mrama2026schedules,
  title  = {[SAMPLE] Simulated Annealing Schedules for Near-Term Quantum Hardware},
  author = {Yang, Jia-Zhen},
  year   = {2026},
  note   = {Preprint}
}`,
  },
  {
    slug: "hybrid-quantum-classical-diet-solver",
    title: "[SAMPLE] Hybrid Quantum-Classical Solvers for Constrained Nutritional Planning",
    conference: "International Conference on Quantum Computing and Engineering (QCE)",
    year: "2025",
    area: "Hybrid Quantum-Classical Computing",
    type: "Conference Paper",
    status: "Published",
    abstract:
      "This work introduces a hybrid solver architecture for diet optimization under nutritional and budget constraints, combining QUBO formulations with classical refinement.",
    pdfUrl: null,
    doiUrl: null,
    codeUrl: null,
    bibtex: `@inproceedings{mrama2025diet,
  title     = {[SAMPLE] Hybrid Quantum-Classical Solvers for Constrained Nutritional Planning},
  author    = {Yang, Jia-Zhen},
  booktitle = {QCE},
  year      = {2025}
}`,
  },
  {
    slug: "quantum-enhanced-portfolio-optimization",
    title: "[SAMPLE] Toward Quantum-Enhanced Portfolio Optimization Under Realistic Constraints",
    conference: "Quantum Machine Intelligence Workshop",
    year: "2025",
    area: "Quantum Optimization",
    type: "Workshop Paper",
    status: "Published",
    abstract:
      "We evaluate variational quantum algorithms for portfolio optimization, incorporating transaction costs and sector diversification constraints into the objective function.",
    pdfUrl: null,
    doiUrl: null,
    codeUrl: null,
    bibtex: `@inproceedings{mrama2025portfolio,
  title     = {[SAMPLE] Toward Quantum-Enhanced Portfolio Optimization Under Realistic Constraints},
  author    = {Yang, Jia-Zhen},
  booktitle = {Quantum Machine Intelligence Workshop},
  year      = {2025}
}`,
  },
];

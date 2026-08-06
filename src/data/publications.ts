import type { Publication } from "../types/index.ts";

export const publications: Publication[] = [
  {
    slug: "hybrid-reverse-annealing-truck-drone-delivery-qubo",
    title: "Hybrid Reverse Annealing for Carbon-Efficient Truck-Drone Delivery with Scalable QUBO Decomposition",
    authors: ["Chia-Ho Ou", "Chia-Chen yang", "Masayuki Ohzeki", "Chih-Yu Chen"],
    year: 2026,
    venue: "IEEE QCE",
    type: "Full Paper",
    status: "Published",
    abstract: "oordinated truck-drone delivery offers a promising\nmeans of reducing carbon emissions in last mile logistics, yet the\njoint optimization of truck routing and drone operations yields a\nstrongly coupled, NP-hard combinatorial problem. We formulate\nthis problem as a Quadratic Unconstrained Binary Optimization\n(QUBO) model under a single carbon emission minimization\nobjective and benchmark it against Gurobi, simulated annealing,\nsimulated quantum annealing, and a GPU-based digital annealer.\nDirect embedding of the full QUBO on D-Wave Advantage\nquickly becomes infeasible: the logical variable count scales as\nO(n3), rapidly exceeding hardware capacity and causing actual\nembedding failure for n ≥ 15 in our experiments. To overcome\nthis scalability barrier, we propose a Hybrid Reverse Annealing\n(Hybrid RA) framework that decomposes each iteration into\nfixed-size sub-QUBOs and combines D-Wave quantum local\nsearch with classical improvement, keeping physical qubit usage\nat approximately 450 qubits independent of problem size. Exper\niments on instances up to 35 customers show that Hybrid RA\nachieves 100% feasibility across all tested scales, reduces carbon\nemissions by 2–8% over a strong greedy baseline, outperforms\nthe within-decomposition Hybrid SA baseline at all 7 tested\nsizes, and beats the Hybrid 2-opt baseline at 6 of 7 tested\nsizes; pooled paired Wilcoxon tests confirm both advantages are\nstatistically significant (p < 0.001), supporting quantum-classical\nhybrid optimization as a practical near-term approach where\nthe primary gain comes from decomposition-enabled scalability\nand the QPU contributes a statistically significant local-search\nimprovement.\n",
    keywords: [],
    researchAreas: ["quantum annealing"],
    pdfUrl: "file:///C:/Users/123/Desktop/truck_drone_coordinate/%E8%AB%96%E6%96%87726/truck%20_drone_coordinated726.pdf",
    doiUrl: "None",
    codeUrl: "None",
    bibtex: null,
  }
];

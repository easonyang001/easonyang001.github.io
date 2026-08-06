<p align="center">
  <img src="public/brand/logo.png" alt="Mrama Institute" width="240">
</p>

# Mrama Institute for Quantum Information and Intelligence

[![Deploy to GitHub Pages](https://github.com/easonyang001/easonyang001.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/easonyang001/easonyang001.github.io/actions/workflows/deploy.yml)

The official website and interactive learning platform of the Mrama Institute,
an independent research initiative based in Taiwan. The project presents work
across quantum information, quantum machine learning, quantum chemistry,
artificial intelligence, and intelligent optimization.

**Live site:** [mrama.org](https://mrama.org)

## What Is Included

- **Research website:** research areas, projects, publications, people, news,
  education, open-source work, solutions, and contact information.
- **Interactive Lab:** eight browser-based quantum computing and optimization
  learning experiences with guided narratives, live controls, visualizations,
  challenges, and locally saved progress.
- **Solution case studies:** schema-validated case data with reusable tables,
  charts, matrices, comparisons, and improvement summaries.
- **Content administration:** authenticated editing for site content and news
  drafts, rich-text editing, image upload, and review-first publishing through
  GitHub pull requests.
- **Search-ready delivery:** per-page metadata, canonical URLs, structured data,
  generated sitemap, robots policy, and build-time prerendering for public routes.
- **Content automation:** scheduled arXiv digest collection and a weekly quantum
  news draft pipeline for editorial review.

## Interactive Lab

| Experience | Topic | What users can explore |
| --- | --- | --- |
| Bloch Sphere | Quantum states | Qubit geometry, amplitudes, phase, measurement, and gates |
| Circuit Playground | Quantum circuits | Small circuits, statevectors, probabilities, and controlled operations |
| Variational Quantum Classifier | Quantum machine learning | Training, decision boundaries, loss, accuracy, and parameter-shift gradients |
| H2 Ground State (VQE) | Quantum chemistry | Variational energy, bond length, ansatz parameters, and exact references |
| QUBO Solver | Optimization | Binary quadratic models, constraints, penalties, and solver comparison |
| Annealing Simulator | Optimization dynamics | Temperature schedules, accepted moves, energy traces, and seeded trials |
| Quantum Kernel Explorer | Quantum machine learning | Feature maps, kernel matrices, alignment, and classical RBF comparison |
| Barren Plateau Demo | Trainability | Gradient variance, circuit depth, qubit count, and cost-function behavior |

## Architecture

```text
Browser
  |
  +-- React + Vite frontend
  |     +-- Public website and Interactive Lab
  |     +-- Admin interface
  |     +-- Static metadata, sitemap, and prerendered HTML
  |
  +-- Express API (server/)
        +-- JWT authentication and rate limiting
        +-- Postgres-backed admin accounts
        +-- GitHub API content branches and pull requests
        +-- Supabase image storage and news drafts

GitHub Actions
  +-- Build and deploy to GitHub Pages
  +-- Generate weekly arXiv digest pull requests
  +-- Generate weekly quantum news drafts
```

Public pages deploy as static assets to GitHub Pages. Administrative operations
go through the separate API so repository and Supabase credentials never ship in
the browser bundle.

## Tech Stack

**Frontend**

- React 18, TypeScript, Vite 5, and React Router
- Tailwind CSS and Framer Motion
- Three.js, React Three Fiber, and Drei
- Tiptap and DOMPurify
- AJV schema validation

**Backend and infrastructure**

- Node.js, Express, TypeScript, and PostgreSQL
- Supabase database and object storage
- GitHub REST API and GitHub Actions
- GitHub Pages for the public site and Render-compatible API deployment

**Quality and delivery**

- Vitest for unit tests
- Playwright and Chromium for build-time prerendering
- Generated sitemap, route metadata, canonical links, and JSON-LD

## Getting Started

### Requirements

- Node.js 24
- npm

### Frontend

```bash
npm install
npm run dev
```

The development server is available at `http://localhost:5173`.

The public site can run without the admin API. To use authentication, content
editing, or image uploads locally, create `.env` from `.env.example` and provide
the relevant frontend configuration:

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Admin API

The backend has its own dependencies and environment configuration:

```bash
cd server
npm install
npm run dev
```

See [server/README.md](server/README.md) for database setup, account creation,
required environment variables, and deployment details.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Validate content, type-check, build, copy the SPA fallback, and prerender public routes |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run the Vitest test suite |
| `npm run digest` | Fetch and generate the current arXiv digest data |
| `npm run types:case` | Regenerate TypeScript types from the case-study schema |

## Project Structure

```text
src/
  components/        Shared UI, visualizations, and lab learning framework
  data/              Research, projects, people, publications, news, and lab metadata
  lib/               Quantum, chemistry, QML, optimization, admin, SEO, and validation logic
  pages/             Route-level pages, including all Interactive Lab experiences
  styles/            Global Tailwind styles
  types/             Shared TypeScript models
  App.tsx             Route configuration
  main.tsx            Browser entry point
server/               Admin API, authentication, GitHub publishing, and storage integration
scripts/              Sitemap, prerender, digest, news, and schema generation tools
contract/             JSON schemas for structured case-study content
data/                 Automation state and supporting data
docs/                 Architecture and SEO documentation
public/               Brand assets, favicon, robots.txt, sitemap, and custom domain
.github/workflows/     Deployment and scheduled content automation
```

## Content and Publishing

Most public content is maintained as typed data under `src/data/`. Solution case
studies use JSON files validated against `contract/schema/case.v1.schema.json`.

The `/admin` workflow does not write directly to `main`. It creates a content
branch and pull request through the backend, keeping review and deployment in the
normal GitHub workflow.

## Testing and Production Build

```bash
npm test
npm run build
```

The production build is written to `dist/`. The build discovers all crawlable
routes, generates the sitemap, compiles the application, creates the GitHub Pages
SPA fallback, and prerenders public pages. The authenticated `/admin` route is
intentionally excluded from sitemap generation and prerendering.

## Deployment

Pushes to `main` trigger [the deployment workflow](.github/workflows/deploy.yml),
which installs Chromium, runs the complete production build, and publishes
`dist/` to GitHub Pages.

Deployment secrets used by the frontend build:

- `VITE_API_BASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Backend, Supabase, GitHub token, and OpenAI credentials belong in their server or
workflow environments and must never be committed to the repository.

## Documentation

- [Admin architecture](docs/architecture/admin.md)
- [SEO plan and implementation record](docs/SEO_PLAN.md)
- [Admin API setup](server/README.md)

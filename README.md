# Mrama Institute for Quantum Information and Intelligence

The official website of the Mrama Institute — an independent research
institute dedicated to quantum computing, quantum information science,
artificial intelligence, and intelligent optimization.

Live site: https://mrama.org

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Framer Motion
- Lucide React

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

The production build is output to `dist/`.

## Deployment

This project deploys automatically to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) on every push
to `main`. In the repository settings, set **Settings → Pages → Source** to
**GitHub Actions** (one-time setup). After that:

```bash
git add .
git commit -m "update"
git push
```

GitHub Actions builds the project and publishes `dist/` automatically.

## Project Structure

```
src/
  components/   Reusable page sections (Navbar, Hero, About, Research, ...)
  data/         Sample content for research areas, projects, publications, people, news
  styles/       Global Tailwind styles
  App.jsx
  main.jsx
public/         Static assets (favicon, robots.txt, sitemap.xml, OG image)
```

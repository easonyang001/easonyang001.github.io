# Mrama Institute for Quantum Information and Intelligence

## Objective

Build a professional, production-ready website for the **Mrama Institute for Quantum Information and Intelligence**.

This website represents an **independent research institute** dedicated to quantum computing, quantum information science, artificial intelligence, and intelligent optimization.

The website should resemble the official websites of internationally recognized research organizations.

Reference design language:

- IBM Research
- MIT CSAIL
- Microsoft Research
- Google DeepMind
- OpenAI

Do NOT build a personal portfolio website.

Do NOT build a startup landing page.

Do NOT build a template-style website.

The overall impression should be:

- Academic
- Premium
- Modern
- Minimal
- Elegant
- Trustworthy
- Technology-focused

---

# Deployment Requirement (Very Important)

The project **must be deployable directly to GitHub Pages**.

GitHub username:

easonyang001

Repository:

easonyag001.github.io

Deployment URL:

https://easonyang001.github.io

The repository is a **GitHub User Pages repository**, therefore configure Vite with:

```js
base: "/"
```

Do NOT configure:

```js
base: "/repository-name/"
```

The project must include a working GitHub Actions workflow that automatically deploys the website after every push to the `main` branch.

The user should only need to run:

```bash
git add .
git commit -m "update"
git push
```

GitHub should handle the deployment automatically.

---

# Technology Stack

Use:

- React
- Vite
- JavaScript
- Tailwind CSS
- Framer Motion
- Lucide React

The project should be lightweight and production-ready.

It must successfully execute:

```bash
npm install
npm run dev
npm run build
```

without errors.

---

# GitHub Actions

Create:

```
.github/workflows/deploy.yml
```

Use the latest official GitHub Pages deployment workflow.

The deployment should automatically publish the `dist` folder.

No manual deployment scripts.

No gh-pages branch.

---

# Folder Structure

```
src/

components/
    Navbar
    Hero
    About
    Research
    Projects
    Publications
    People
    News
    Contact
    Footer

assets/

data/

styles/

App.jsx
main.jsx
```

Separate reusable components.

Keep code clean.

---

# Website Structure

## Navigation

Sticky navigation bar.

Left:

Logo mark — liquid chrome "MRAMA" wordmark image (`public/brand/logo.png`), not plain text.

Right:

- Home
- Research
- Projects
- Publications
- People
- News
- Contact

GitHub icon.

Smooth scrolling.

---

## Hero Section

Large fullscreen hero.

Title

Mrama Institute

Subtitle

for Quantum Information and Intelligence

Description

Advancing Quantum Information,
Artificial Intelligence,
and Intelligent Optimization.

Buttons

- Explore Research
- Publications

Background

Very subtle animated particles.

Soft glowing grid.

Modern scientific atmosphere.

---

## About

Title

About the Institute

Content

Mrama Institute for Quantum Information and Intelligence is an independent research initiative dedicated to advancing quantum information science, quantum machine learning, intelligent optimization, and hybrid quantum-classical computing.

Mission

Bridge theoretical research with practical engineering applications.

---

## Research

Display responsive cards.

Research Areas

- Quantum Information
- Quantum Machine Learning
- Quantum Optimization
- Quantum Annealing
- Hybrid Quantum-Classical Computing
- Artificial Intelligence
- Operations Research

Each card should contain

- icon
- title
- description

Hover animation.

---

## Projects

Cards.

Projects

AED Placement Optimization

Quantum Diet Optimization

Hybrid Quantum Solver

Quantum Portfolio Optimization

Each project contains

- status badge
- short description
- technology tags
- Read More button

---

## Publications

Timeline layout.

Publication cards.

Each publication contains

- title
- conference
- year
- abstract
- PDF button
- DOI button
- BibTeX button

Sample data is acceptable.

---

## People

Professional profile cards.

Founder

Jia-Zhen Yang

Research Interests

- Quantum Machine Learning
- Quantum Optimization
- Quantum Annealing
- Artificial Intelligence
- Operations Research

Design should allow adding future members easily.

---

## News

Timeline.

Sample news.

Examples

Website launched

Research accepted

Conference presentation

Publication released

---

## Contact

Professional contact section.

Display

Email

GitHub

Location

Simple contact form.

Frontend only.

No backend.

---

## Footer

Logo mark — same liquid chrome "MRAMA" wordmark image as the navbar (`public/brand/logo.png`).

Institute name

Copyright

© 2026 Mrama Institute

All rights reserved.

---

# Design Language

Dark mode.

Background

#020617

Cards

#0F172A

Accent

#8B5CF6 (violet). Do not use blue as the accent color.

Secondary accent (for gradients only, paired with the accent above)

#D946EF (fuchsia)

Text

#F8FAFC

Secondary text

#94A3B8

Rounded corners.

Glass effect.

Subtle shadows.

Large spacing.

Professional typography.

---

# Motion / Interaction Library

The site makes heavy use of hand-built ReactBits-style effect
components, kept dependency-free (Framer Motion + Tailwind + Canvas
only — no GSAP, OGL, or Three.js) so the project stays lightweight and
builds cleanly on GitHub Actions. They live in
`src/components/reactbits/` and are used throughout, not just in the
hero:

- `SplitText` — word/char reveal, used for the hero title and every
  section heading.
- `DecryptedText` — scramble-to-reveal text, used for the hero subtitle.
- `ShinyText` — animated light sweep across text, used for eyebrow
  labels.
- `GradientText` — animated violet-to-fuchsia gradient fill, used for
  the stats numbers.
- `SpotlightCard` — cursor-tracking radial glow, used on Research,
  Projects, Publications, People cards and the contact form.
- `TiltedCard` — cursor-driven 3D tilt, wraps the Research, Projects,
  and People card grids (composed with `SpotlightCard`).
- `Magnetic` — pulls an element toward the cursor, used on the hero
  CTA buttons.
- `ClickSpark` — particle burst on click, used on the hero CTA, the
  BibTeX copy button, and the contact form submit button.
- `Particles` — lightweight canvas constellation background (drifting
  dots + connecting lines), layered behind the hero.

When adding new sections or components, prefer reusing or extending
these primitives over introducing a new one-off animation, and prefer
adding a new primitive over pulling in an animation library.

---

# Brand Assets

Logo: `public/brand/logo.png` — liquid chrome 3D "MRAMA" wordmark on a
near-black background. This is the site's only logo mark; do not
reintroduce a text-only or vector wordmark in the navbar or footer.

The image has a solid dark background (not transparent), which blends
with the site's dark theme. If a transparent-background or square-crop
variant is ever produced, replace `logo.png` in place so the navbar and
footer picks it up automatically.

---

# Animations

Use Framer Motion.

Only subtle animations.

Examples

- fade in
- slide up
- card hover
- navbar transition

No flashy effects.

---

# Responsive

Must work on

Desktop

Tablet

Mobile

---

# Accessibility

Semantic HTML.

Keyboard accessible.

Proper heading hierarchy.

Good color contrast.

---

# Performance

Lazy load where appropriate.

Optimize images.

Minimize bundle size.

---

# SEO

Include

- title
- description
- Open Graph tags
- favicon
- robots.txt
- sitemap.xml

---

# Deliverables

Claude Code should generate a **complete, production-ready project**.

The project must include:

- all React source code
- Tailwind configuration
- Vite configuration
- package.json
- GitHub Actions deployment workflow
- README.md with setup instructions

The final result should be a website that feels like the official homepage of a world-class quantum research institute and can be deployed immediately to GitHub Pages by pushing to the `main` branch.
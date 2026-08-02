# Mrama Institute for Quantum Information and Intelligence

## Objective

Build a professional, production-ready website for the **Mrama Institute for
Quantum Information and Intelligence** — an independent research institute
working on quantum computing, quantum information science, artificial
intelligence, and intelligent optimization.

Reference design language:

- IBM Research
- MIT CSAIL
- Microsoft Research
- Google DeepMind
- OpenAI

Study what these sites actually do: quiet typography, generous whitespace,
information density over decoration, near-zero cursor-driven effects. They
earn credibility by looking restrained, not by looking impressive.

Do NOT build a personal portfolio website.
Do NOT build a startup landing page.
Do NOT build a template-style website.

Target impression: academic, premium, modern, minimal, elegant, trustworthy,
technology-focused.

**The single most common failure mode for this project is over-decoration.**
When a decision is ambiguous, choose the quieter option.

---

# Deployment Requirement (Very Important)

The project **must be deployable directly to GitHub Pages**.

- GitHub username: `easonyang001`
- Repository: `easonyang001.github.io`
- Deployment URL: `https://easonyang001.github.io`

> The repository name must match the username **exactly**. An earlier version
> of this spec had `easonyag001.github.io` (missing the `n`), which would not
> serve at the deployment URL. Verify the actual repository name on GitHub
> before assuming deployment is misconfigured elsewhere.

This is a **GitHub User Pages** repository, so configure Vite with:

```js
base: "/"
```

Do NOT configure `base: "/repository-name/"`.

Include a working GitHub Actions workflow that deploys automatically on every
push to `main`. The user should only need:

```bash
git add .
git commit -m "update"
git push
```

---

# Admin System

The `/admin` login + content-management backend is a separate service from
the static site. Its architecture, security constraints, and required env
vars are documented in [docs/architecture/admin.md](docs/architecture/admin.md) — read it before touching
any admin-related code.

---

# Technology Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- Framer Motion
- Lucide React

No GSAP, OGL, or Three.js. The project must run `npm install`, `npm run dev`,
and `npm run build` without errors.

---

# GitHub Actions

Create `.github/workflows/deploy.yml` using the latest official GitHub Pages
deployment workflow, publishing the `dist` folder. No manual deployment
scripts, no `gh-pages` branch.

---

# Design Tokens (Single Source of Truth)

These are **values, not suggestions**. Define them once in
`tailwind.config.js` under `theme.extend` and reference them by name
everywhere. Do not introduce a color, size, or radius that is not listed here.
If something seems to need a new value, stop and ask.

## Color

```
bg              #020617   page background
surface         #0F172A   cards, panels
surface-raised  #131C31   card hover state
border          #1E293B   default 1px card / divider border
border-strong   #334155   hover / focus border
text            #F8FAFC   headings, primary body
text-secondary  #94A3B8   descriptions, supporting copy
text-muted      #64748B   captions, metadata, timestamps
accent          #8B5CF6   violet — links, focus rings, active nav
accent-hover    #A78BFA
accent-subtle   rgba(139, 92, 246, 0.12)   tag / badge backgrounds
accent-2        #D946EF   fuchsia — see restriction below
```

Do not use blue as an accent color.

**Restriction on `accent-2`:** the violet→fuchsia gradient is the visual
signature of 2023–2024 AI startup landing pages, and it actively works against
the academic register this site is aiming for. Permitted in **at most one
place** on the entire site — a single hairline rule or a small mark. Never on
text, never as a card background, never on a button fill. Solid `accent` is
the default for everything interactive.

## Separation on dark backgrounds

On a `#020617` background, box-shadows are essentially invisible — they add
CSS weight and no visual result. **Use a 1px `border` to separate surfaces,
not shadows.** Do not use `shadow-lg`, `shadow-xl`, or glow shadows on cards.

**Glass / backdrop-blur is permitted in exactly one place: the sticky navbar**,
where content genuinely scrolls behind it. Everywhere else it blurs one solid
dark color against another solid dark color, which produces nothing.

## Typography

- Headings (h1–h4): **Space Grotesk**
- Body: **Inter**
- Numbers, dates, tags, code-like labels: **JetBrains Mono**

Never collapse to a single sans-serif for both headings and body. The
Space Grotesk / Inter contrast is deliberate.

| Role | Size (desktop / mobile) | Family | Weight | Tracking | Line height |
|---|---|---|---|---|---|
| h1 / hero | 60 / 40 | Space Grotesk | 500 | -0.02em | 1.05 |
| h2 / section | 36 / 30 | Space Grotesk | 500 | -0.015em | 1.15 |
| h3 / card title | 20 / 20 | Space Grotesk | 500 | -0.01em | 1.30 |
| h4 | 16 / 16 | Space Grotesk | 500 | 0 | 1.40 |
| body-lg | 18 / 17 | Inter | 400 | 0 | 1.60 |
| body | 16 / 16 | Inter | 400 | 0 | 1.65 |
| small | 14 / 14 | Inter | 400 | 0 | 1.50 |
| mono-label | 12 / 12 | JetBrains Mono | 500 | 0.08em | 1.40, uppercase |

**Maximum heading weight is 500.** Do not use `font-bold` or `font-semibold`
on headings. Heavy weights are the fastest way to make a site read as a
template; institute-grade typography gets its authority from size and tight
tracking, not from thickness.

Use `mono-label` for: section eyebrows, publication years, project status
badges, technology tags, news dates. It is the utility voice and should never
be used for sentences.

## Spacing

Use only: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128` (px).

- Section vertical padding: **128 desktop / 80 mobile**
- Section heading → content: **48**
- Card interior padding: **32**
- Card grid gap: **24**
- Paragraph spacing: **16**

## Layout

- Content max-width: **1200px**
- **Prose max-width: 720px** — applies to the About body, publication
  abstracts, and any run of continuous text. Full-width paragraphs at 1200px
  are unreadable and are one of the strongest "generated" tells.
- Gutter: 24 mobile / 48 desktop

## Radius

- Cards, panels: **8px**
- Buttons, inputs, tags, badges: **6px**
- Dividers, rules: **0**

One value per category. Do not mix `rounded-lg`, `rounded-xl`, and
`rounded-2xl` across components.

---

# Motion Budget (Replaces the previous "Motion Library" and "Animations" sections)

The previous version of this spec asked for heavy effect usage in one section
and "only subtle animations, no flashy effects" in another. The specific
instruction won and the site ended up over-decorated. This section is now the
**only** authority on motion, and it is stated as limits rather than adjectives.

## Site-wide, allowed

| Where | What | Spec |
|---|---|---|
| Section entrance | fade + 12px rise | 400ms, ease-out, `once: true`, 60ms stagger |
| Card hover | `border` → `border-strong`, `surface` → `surface-raised` | 150ms |
| Nav on scroll | background opacity + border-bottom fade in | 200ms |
| Links / buttons hover | color or background shift only | 150ms |

That is the complete list. Every section on the site uses the same entrance
animation. Consistency reads as intentional; variety reads as undisciplined.

## The hero gets exactly one signature effect

**Keep `Particles`** — the ambient canvas constellation behind the hero.
**The hero type does not animate.** Still, confident typography over a slowly
moving background reads premium. Moving type over a moving background reads
chaotic, and was the main problem with the previous build.

Particles constraints: ≤ 60 nodes, opacity ≤ 0.25, no cursor interaction,
disabled entirely under `prefers-reduced-motion`.

## Banned outright

Do not use, anywhere on the site:

- `SplitText` on section headings (or anywhere except — optionally — nothing)
- `DecryptedText` / scramble-reveal on any text
- `ShinyText` light sweeps
- `GradientText`
- `TiltedCard` / any cursor-driven 3D tilt
- `Magnetic` / cursor-attracted buttons
- `ClickSpark` / click particle bursts
- Cursor-tracking spotlight glows (`SpotlightCard`)
- Number count-up animations
- Scroll-linked parallax
- Any animation on a heading, label, or badge

These are portfolio-site devices. None of IBM Research, CSAIL, Microsoft
Research, DeepMind, or OpenAI uses any of them. Using them here creates a
mismatch between what the effects signal and what the content claims, which
costs credibility rather than adding polish.

## Exceptions to the ban

The ban above is the default, not an absolute. The user may ask for a
specific banned effect (e.g. a typewriter/typing effect) in a specific
place. If they explicitly confirm they want it after being told it's on the
banned list, that one instance is permitted — implement exactly what was
confirmed, nowhere else.

This is a per-instance exception, not a reopening of the list: it does not
carry over to other effects, other pages, or future work, and it does not
lower the bar for anything not explicitly discussed. When in doubt whether
something was actually confirmed, ask again rather than assume.

## Keeping the source available

`src/components/reactbits/` **stays in the repository** even though the
components above are no longer imported. Unused modules are tree-shaken out of
the bundle, so the cost is zero, and keeping real source files on disk means
future work reads actual code instead of reconstructing it from memory.

Mark the folder clearly:

```
src/components/reactbits/README.md
→ "Reference implementations. Not imported. See the Motion Budget
   section of claude.md before using anything here."
```

## Optional signature (one considered risk)

If a stronger hero identity is wanted later: instead of a generic drifting
constellation, have the particle graph **settle** on page load — nodes start
scattered and relax into a low-energy configuration over ~1.5s, then hold
still. That is a visual quotation of annealing, which is literally the
institute's research subject, and it earns its place in a way that a generic
particle field does not. Implement only if it can be done cleanly; a generic
field executed well beats a clever one executed badly.

---

# Folder Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Research.jsx
│   ├── Projects.jsx
│   ├── Publications.jsx
│   ├── People.jsx
│   ├── News.jsx
│   ├── Contact.jsx
│   ├── Footer.jsx
│   ├── SectionHeading.jsx
│   └── reactbits/          # reference only, not imported
├── data/                   # all content lives here, not inline in components
├── styles/
├── assets/
├── App.jsx
└── main.jsx
```

All copy, publication entries, project entries, people, and news items live in
`src/data/` as plain modules. Components render data; they do not contain it.

---

# Website Structure

## Navigation

Sticky. Left: liquid chrome "MRAMA" wordmark image (`public/brand/logo.png`),
not text. Right: Home, Research, Projects, Publications, People, News,
Contact, plus a GitHub icon. Smooth scrolling. Active-section indication uses
`accent`.

## Hero

Full-height. Title "Mrama Institute", subtitle "for Quantum Information and
Intelligence", description:

> Advancing Quantum Information, Artificial Intelligence,
> and Intelligent Optimization.

Buttons: "Explore Research" (solid `accent`), "Publications" (border only).
Background: `Particles` per the Motion Budget, plus an optional grid at
opacity ≤ 0.04.

## About

Heading "About the Institute". Body constrained to the 720px prose width.

> Mrama Institute for Quantum Information and Intelligence is an independent
> research initiative dedicated to advancing quantum information science,
> quantum machine learning, intelligent optimization, and hybrid
> quantum-classical computing.

Mission: bridge theoretical research with practical engineering applications.

## Research

Responsive card grid. Areas: Quantum Information, Quantum Machine Learning,
Quantum Optimization, Quantum Annealing, Hybrid Quantum-Classical Computing,
Artificial Intelligence, Operations Research.

Each card: Lucide icon at 20px in `accent`, h3 title, 2–3 line description in
`text-secondary`. Hover per the Motion Budget — border and surface shift only.

## Projects

Cards: AED Placement Optimization, Quantum Diet Optimization, Hybrid Quantum
Solver, Quantum Portfolio Optimization.

Each: status badge (`mono-label` on `accent-subtle`), short description,
technology tags (`mono-label`), Read More link.

## Publications

Timeline layout with a single 1px `border` vertical rule. Each entry: title,
venue, year (`mono-label`), abstract at prose width, and PDF / DOI / BibTeX
actions as text links rather than filled buttons.

## People

Profile cards, currently one entry:

**Jia-Zhen Yang** — Founder.
Research interests: Quantum Machine Learning, Quantum Optimization, Quantum
Annealing, Artificial Intelligence, Operations Research.

Structure the component so additional members require only a new object in
`src/data/people.js`. A single card should sit left-aligned in the grid, not
stretched to full width.

## News

Timeline matching the Publications treatment. Dates in `mono-label`.

## Contact

Email, GitHub, Location, and a frontend-only form. Inputs use `surface`
background with `border`, and `accent` focus rings with a visible focus state.

## Footer

Same `public/brand/logo.png` wordmark, institute name, and:

> © 2026 Mrama Institute. All rights reserved.

## Not included

**No statistics / metrics section.** It appeared in the previous build without
ever being specified here. Animated counters on an institute with one listed
member undermine the credibility the rest of the site is trying to establish.
Do not add one.

---

# Content Integrity

Sample publications, projects, and news are acceptable during development, but
this site carries a real person's name at a real URL. Every placeholder entry
must be prefixed `[SAMPLE]` in `src/data/` so nothing fictional ships by
accident. Never invent a DOI, a venue name, or a citation count.

---

# Brand Assets

`public/brand/logo.png` — liquid chrome 3D "MRAMA" wordmark, transparent
background (RGBA). This is the site's only logo mark; do not reintroduce a
text-only or vector wordmark in the navbar or footer. If a new render is
produced later, replace `logo.png` in place and both navbar and footer pick
it up automatically — keep it transparent, not a solid-color background.

---

# Responsive

Desktop, tablet, mobile. Verify the type scale's mobile column, the 80px
mobile section padding, and that card grids collapse to a single column below
768px.

---

# Accessibility

Semantic HTML. Proper heading hierarchy — one h1, no level skipping. Visible
keyboard focus using `accent`. All interactive elements reachable by keyboard.
`prefers-reduced-motion` disables Particles and all entrance animations. Verify
`text-secondary` on `surface` meets AA contrast.

---

# Performance

Lazy load below-the-fold sections. Optimize images. Keep the bundle small —
this is a large part of why no animation library beyond Framer Motion is
permitted.

---

# SEO

Title, description, Open Graph tags, favicon, `robots.txt`, `sitemap.xml`.

---

# Working Method (For the Agent)

1. **Build one section at a time.** Generating the full page in a single pass
   reliably produces averaged, templated output.
2. **Look at the result.** If screenshots are available, take one after each
   section and check it against this spec before continuing. Writing UI code
   without visual feedback is the largest single source of poor output.
3. **Read files, do not recall them.** When a component is referenced, open
   the actual file. Do not reconstruct it from memory.
4. **Do not invent tokens.** Every color, size, radius, and duration comes
   from the Design Tokens section. If something appears to be missing, stop
   and ask rather than filling in a Tailwind default.
5. **Separate commits** per logical change, following `<type>: <summary>`
   with types `feat` / `fix` / `docs` / `refactor`.

---

# Deliverables

A complete, production-ready project: all React source, Tailwind config, Vite
config, `package.json`, the GitHub Actions workflow, and a README with setup
instructions.

The result should read as the official homepage of a serious research
institute — which means, more than anything else, that it should be quiet.
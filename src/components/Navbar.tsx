import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Github, Menu, X } from "lucide-react";
import { site } from "../data/site.ts";
import { researchAreas } from "../data/research.ts";

interface NavChild {
  label: string;
  href: string;
  external?: boolean;
}

interface NavGroup {
  heading: string | null;
  items: NavChild[];
}

interface NavLink {
  label: string;
  href: string;
  groups?: NavGroup[];
}

/** Buckets consecutive items sharing the same heading, preserving source order. */
function toGroups(items: Array<NavChild & { heading: string | null }>): NavGroup[] {
  const groups: NavGroup[] = [];
  items.forEach(({ heading, ...child }) => {
    const last = groups[groups.length - 1];
    if (last && last.heading === heading) {
      last.items.push(child);
    } else {
      groups.push({ heading, items: [child] });
    }
  });
  return groups;
}

const researchGroups = toGroups(
  researchAreas.map((area) => ({
    heading: area.group,
    label: area.title,
    href: `/research/${area.slug}`,
  }))
);

const labLinks: NavGroup[] = [
  {
    heading: "Fundamentals",
    items: [
      { label: "Bloch Sphere", href: "/lab/bloch-sphere" },
      { label: "Circuit Playground", href: "/lab/circuit" },
    ],
  },
  {
    heading: "Quantum AI",
    items: [
      { label: "Variational Quantum Classifier", href: "/lab/vqc" },
      { label: "Quantum Kernel Explorer", href: "/lab/quantum-kernel" },
      { label: "Barren Plateau Demo", href: "/lab/barren-plateau" },
    ],
  },
  {
    heading: "Quantum Simulation",
    items: [
      { label: "H2 Ground State · VQE", href: "/lab/vqe-h2" },
      { label: "QUBO Solver", href: "/lab/qubo" },
      { label: "Annealing Simulator", href: "/lab/annealing" },
    ],
  },
  {
    heading: "Interactive Lab",
    items: [
      { label: "System Recovery", href: "/lab/system-recovery" },
      { label: "LAB 01 · First-Person Lab", href: "/quantum-lab.html", external: true },
    ],
  },
];

const publicationLinks: NavGroup[] = [
  {
    heading: "Directory",
    items: [
      { label: "Publication", href: "/publications#publication" },
      { label: "Preprint", href: "/publications#preprint" },
    ],
  },
];

const aboutLinks: NavGroup[] = [
  {
    heading: "Overview",
    items: [
      { label: "Story", href: "/about#story" },
      { label: "Vision & Mission", href: "/about#vision-mission" },
      { label: "FAQ", href: "/about#faq" },
    ],
  },
  {
    heading: "Community",
    items: [
      { label: "Research Areas", href: "/about#principles" },
      { label: "Research Network", href: "/about#network" },
      { label: "Open Science", href: "/about#open-science" },
      { label: "Founding Team", href: "/about#founding-team" },
      { label: "Collaboration", href: "/about#collaboration" },
    ],
  },
];

const links: NavLink[] = [
  { label: "Research", href: "/research", groups: researchGroups },
  { label: "Solutions", href: "/solutions" },
  { label: "Lab", href: "/lab", groups: labLinks },
  { label: "Publications", href: "/publications", groups: publicationLinks },
  { label: "About", href: "/about", groups: aboutLinks },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

function DropdownChild({ child, onClick }: { child: NavChild; onClick?: () => void }) {
  const className =
    "group relative flex items-center overflow-hidden rounded-[18px] px-4 py-3 text-[15px] leading-6 text-slate-300 transition-all duration-200 hover:-translate-y-px hover:bg-white/[0.11] hover:text-white hover:shadow-[0_14px_36px_rgba(15,23,42,0.42)] hover:ring-1 hover:ring-white/[0.14]";
  if (child.external) {
    return (
      <a key={child.href} href={child.href} className={className} onClick={onClick}>
        <span className="relative z-10 font-sans transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-[1.01]">
          {child.label}
        </span>
        <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px scale-x-0 bg-gradient-to-r from-transparent via-white/95 to-transparent transition-transform duration-200 group-hover:scale-x-100" />
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_42%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </a>
    );
  }
  return (
    <Link key={child.href} to={child.href} className={className} onClick={onClick}>
      <span className="relative z-10 font-sans transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-[1.01]">
        {child.label}
      </span>
      <span className="pointer-events-none absolute inset-x-3 bottom-1 h-px scale-x-0 bg-gradient-to-r from-transparent via-white/95 to-transparent transition-transform duration-200 group-hover:scale-x-100" />
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_42%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
    </Link>
  );
}

function MenuSection({
  group,
  index,
  onChildClick,
}: {
  group: NavGroup;
  index: number;
  onChildClick?: (child: NavChild) => void;
}) {
  return (
    <div
      className={`rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
        index > 0 ? "mt-3" : ""
      }`}
    >
      {group.heading && (
        <p className="px-1 pb-3 font-display text-[17px] font-semibold tracking-[-0.02em] text-white">
          {group.heading}
        </p>
      )}
      <div className="space-y-1">
        {group.items.map((child) => (
          <DropdownChild
            key={child.href}
            child={child}
            onClick={onChildClick ? () => onChildClick(child) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimer = useRef<number>();
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const openNow = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  };

  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenDropdown(null), 120);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-content items-center justify-between px-6 transition-all duration-200 md:px-12 ${
          scrolled ? "py-4" : "py-6"
        }`}
      >
        <Link to="/" className="flex items-center">
          <img src="/brand/logo.png" alt={site.name} className="h-[72px] w-auto md:h-[88px]" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) =>
            link.groups ? (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => openNow(link.label)}
                onMouseLeave={closeSoon}
              >
                <Link
                  to={link.href}
                  aria-expanded={openDropdown === link.label}
                  className={`group flex items-center gap-1 px-4 py-2 text-small font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <span className="relative">
                    {link.label}
                    <span
                      className={`absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-transparent via-white/90 to-transparent transition-transform duration-200 group-hover:scale-x-100 ${
                        isActive(link.href) ? "scale-x-100" : ""
                      }`}
                    />
                  </span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`transition-all duration-150 ${openDropdown === link.label ? "rotate-180 text-white" : "text-current"}`}
                  />
                </Link>

                {openDropdown === link.label && (
                  <div
                    className="absolute left-1/2 top-full w-[372px] -translate-x-1/2 pt-3"
                    onMouseEnter={() => openNow(link.label)}
                    onMouseLeave={closeSoon}
                  >
                    <div className="relative overflow-hidden rounded-[30px] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(9,14,29,0.98),rgba(4,8,18,0.96))] p-4 shadow-[0_40px_140px_rgba(2,6,23,0.76)] ring-1 ring-white/[0.04] backdrop-blur-[34px]">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.07),transparent_18%,rgba(255,255,255,0.02))]" />
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-4 bottom-2 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-75" />
                      <div className="nav-dropdown-scrollbar relative max-h-[70vh] overflow-y-auto pr-1">
                        {link.groups.map((group, index) => (
                          <div key={group.heading ?? `ungrouped-${index}`} className="px-1 py-0.5">
                            <MenuSection group={group} index={index} />
                          </div>
                        ))}
                      </div>
                      <Link
                        to={link.href}
                        className="group mt-2 block rounded-b-[22px] border-t border-white/10 px-3 pt-4 pb-1 font-display text-[12px] font-semibold tracking-[0.14em] text-accent transition-all duration-150 hover:text-accent-hover"
                      >
                        <span className="relative inline-flex items-center gap-2">
                          <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                            View all {link.label.toLowerCase()}
                          </span>
                          <span className="transition-transform duration-150 group-hover:translate-x-1">
                            &rarr;
                          </span>
                          <span className="pointer-events-none absolute left-0 -bottom-1 h-px w-full origin-left scale-x-0 bg-current/80 transition-transform duration-200 group-hover:scale-x-100" />
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 text-small font-medium transition-colors duration-150 ${
                  isActive(link.href)
                    ? "text-accent"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
          {site.githubUrl && (
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="ml-3 text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              <Github size={19} />
            </a>
          )}
        </div>

        <button
          className="text-text-primary md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="flex flex-col gap-1 border-t border-border bg-background/95 px-6 py-6 md:hidden"
        >
          {links.map((link) =>
            link.groups ? (
              <div key={link.href}>
                <div className="flex items-center justify-between">
                  <Link
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="py-2 text-small font-medium text-text-secondary hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                  <button
                    aria-label={`Toggle ${link.label} submenu`}
                    onClick={() => setMobileExpanded((v) => (v === link.label ? null : link.label))}
                    className="p-2 text-text-secondary"
                  >
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-150 ${mobileExpanded === link.label ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {mobileExpanded === link.label && (
                  <div className="nav-dropdown-scrollbar mb-2 ml-3 flex max-h-[55vh] flex-col gap-1 overflow-y-auto border-l border-accent/35 pl-3">
                    {link.groups.map((group, index) => (
                      <div key={group.heading ?? `ungrouped-${index}`}>
                        <MenuSection group={group} index={index} onChildClick={() => setOpen(false)} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setOpen(false)}
                className="py-2 text-small font-medium text-text-secondary hover:text-text-primary"
              >
                {link.label}
              </Link>
            )
          )}
          {site.githubUrl && (
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center gap-2 text-small font-medium text-text-secondary hover:text-text-primary"
            >
              <Github size={18} /> GitHub
            </a>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}

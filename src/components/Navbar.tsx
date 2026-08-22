import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Github, Menu, X } from "lucide-react";
import { site } from "../data/site.ts";
import { researchAreas } from "../data/research.ts";
import { labTools } from "../data/labTools.ts";

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

const labGroups = toGroups([
  ...labTools.map((tool) => ({ heading: null, label: tool.name, href: `/lab/${tool.slug}` })),
  { heading: null, label: "Quantum Lab 3D", href: "/quantum-lab-3d.html", external: true },
]);

const links: NavLink[] = [
  { label: "Research", href: "/research", groups: researchGroups },
  { label: "Solutions", href: "/solutions" },
  { label: "Lab", href: "/lab", groups: labGroups },
  { label: "Publications", href: "/publications" },
  { label: "About", href: "/about" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

function DropdownChild({ child, onClick }: { child: NavChild; onClick?: () => void }) {
  const className =
    "block rounded-md px-3 py-2 text-small text-text-secondary transition-colors duration-150 hover:bg-surface hover:text-text-primary";
  if (child.external) {
    return (
      <a key={child.href} href={child.href} className={className} onClick={onClick}>
        {child.label}
      </a>
    );
  }
  return (
    <Link key={child.href} to={child.href} className={className} onClick={onClick}>
      {child.label}
    </Link>
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
                  className={`flex items-center gap-1 px-4 py-2 text-small font-medium transition-colors duration-150 ${
                    isActive(link.href)
                      ? "text-accent"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`transition-transform duration-150 ${openDropdown === link.label ? "rotate-180" : ""}`}
                  />
                </Link>

                {openDropdown === link.label && (
                  <div
                    className="absolute left-1/2 top-full w-[300px] -translate-x-1/2 pt-3"
                    onMouseEnter={() => openNow(link.label)}
                    onMouseLeave={closeSoon}
                  >
                    <div className="rounded-lg border border-border bg-background/95 p-2 backdrop-blur-md">
                      <div className="max-h-[70vh] overflow-y-auto">
                        {link.groups.map((group, index) => (
                          <div key={group.heading ?? `ungrouped-${index}`}>
                            {group.heading === null && index > 0 && (
                              <div className="my-2 border-t border-border" />
                            )}
                            {group.heading && (
                              <p className="px-3 pb-1 pt-3 font-mono text-mono-label uppercase text-text-muted first:pt-1">
                                {group.heading}
                              </p>
                            )}
                            {group.items.map((child) => (
                              <DropdownChild key={child.href} child={child} />
                            ))}
                          </div>
                        ))}
                      </div>
                      <Link
                        to={link.href}
                        className="mt-1 block rounded-md border-t border-border px-3 pt-3 pb-1 font-mono text-mono-label uppercase text-accent transition-colors duration-150 hover:text-accent-hover"
                      >
                        View all {link.label.toLowerCase()} &rarr;
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
                  <div className="mb-2 ml-3 flex flex-col gap-1 border-l border-border pl-3">
                    {link.groups.map((group, index) => (
                      <div key={group.heading ?? `ungrouped-${index}`}>
                        {group.heading === null && index > 0 && (
                          <div className="my-1.5 border-t border-border" />
                        )}
                        {group.heading && (
                          <p className="pb-1 pt-2 font-mono text-mono-label uppercase text-text-muted first:pt-0">
                            {group.heading}
                          </p>
                        )}
                        {group.items.map((child) => (
                          <DropdownChild
                            key={child.href}
                            child={child}
                            onClick={() => !child.external && setOpen(false)}
                          />
                        ))}
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

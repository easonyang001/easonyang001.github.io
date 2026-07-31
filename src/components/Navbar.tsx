import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Github, Menu, X } from "lucide-react";
import { site } from "../data/site.ts";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Research", href: "/research" },
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "People", href: "/people" },
  { label: "News", href: "/news" },
  { label: "Digest", href: "/digest" },
  { label: "Lab", href: "/lab" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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
          {links.map((link) => (
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
          ))}
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
          className="flex flex-col gap-4 border-t border-border bg-background/95 px-6 py-6 md:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className="text-small font-medium text-text-secondary hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          {site.githubUrl && (
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-small font-medium text-text-secondary hover:text-text-primary"
            >
              <Github size={18} /> GitHub
            </a>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}

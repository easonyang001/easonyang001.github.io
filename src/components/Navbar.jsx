import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Menu, X } from "lucide-react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Research", href: "#research" },
  { label: "Projects", href: "#projects" },
  { label: "Publications", href: "#publications" },
  { label: "People", href: "#people" },
  { label: "News", href: "#news" },
  { label: "Contact", href: "#contact" },
];

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 44 44" fill="none" className="shrink-0">
      <circle cx="22" cy="22" r="3.5" fill="#2563EB" />
      <ellipse cx="22" cy="22" rx="18" ry="7.5" stroke="#2563EB" strokeWidth="1.6" />
      <ellipse
        cx="22"
        cy="22"
        rx="18"
        ry="7.5"
        stroke="#2563EB"
        strokeWidth="1.6"
        transform="rotate(60 22 22)"
      />
      <ellipse
        cx="22"
        cy="22"
        rx="18"
        ry="7.5"
        stroke="#2563EB"
        strokeWidth="1.6"
        transform="rotate(120 22 22)"
      />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-background/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 transition-all duration-300 md:px-10 lg:px-16 ${
          scrolled ? "py-4" : "py-6"
        }`}
      >
        <a href="#home" className="flex items-center gap-2.5 text-base font-bold tracking-widest text-text-primary">
          <LogoMark />
          MRAMA
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
              <span
                className={`absolute inset-x-4 -bottom-0.5 h-px bg-accent transition-transform duration-300 ${
                  active === link.href ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </a>
          ))}
          <a
            href="https://github.com/easonyang001"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="ml-3 text-text-secondary transition-colors hover:text-text-primary"
          >
            <Github size={19} />
          </a>
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
          className="flex flex-col gap-4 border-t border-line bg-background/95 px-6 py-6 md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/easonyang001"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
          >
            <Github size={18} /> GitHub
          </a>
        </motion.div>
      )}
    </motion.header>
  );
}

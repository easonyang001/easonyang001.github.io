import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Github, MapPin } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="section-container border-t border-border">
      <SectionHeading index="06" eyebrow="Contact" title="Contact" />

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
              <Mail size={18} />
            </div>
            <div>
              <p className="font-mono text-mono-label uppercase text-text-muted">Email</p>
              <p className="text-body text-text-primary">contact@mrama-institute.org</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
              <Github size={18} />
            </div>
            <div>
              <p className="font-mono text-mono-label uppercase text-text-muted">GitHub</p>
              <a
                href="https://github.com/easonyang001"
                target="_blank"
                rel="noreferrer"
                className="text-body text-text-primary transition-colors duration-150 hover:text-accent"
              >
                github.com/easonyang001
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
              <MapPin size={18} />
            </div>
            <div>
              <p className="font-mono text-mono-label uppercase text-text-muted">Location</p>
              <p className="text-body text-text-primary">Taiwan</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.06, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="glass-card space-y-4 p-8"
        >
          <div>
            <label htmlFor="name" className="text-small text-text-secondary">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-small text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-small text-text-secondary">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              required
              className="mt-1 w-full rounded-md border border-border bg-surface px-4 py-2 text-small text-text-primary outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/50"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-accent px-6 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
          >
            {submitted ? "Message Sent" : "Send Message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}

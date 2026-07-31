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
    <section id="contact" className="section-container border-t border-line">
      <SectionHeading index="06" eyebrow="Contact" title="Contact" />

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                Email
              </p>
              <p className="text-text-primary">contact@mrama-institute.org</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Github size={20} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                GitHub
              </p>
              <a
                href="https://github.com/easonyang001"
                target="_blank"
                rel="noreferrer"
                className="text-text-primary transition-colors hover:text-accent"
              >
                github.com/easonyang001
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-text-secondary">
                Location
              </p>
              <p className="text-text-primary">Taiwan</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          onSubmit={handleSubmit}
          className="glass-card space-y-4 p-6"
        >
          <div>
            <label htmlFor="name" className="text-xs font-medium text-text-secondary">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-line bg-background/60 px-4 py-2 text-sm text-text-primary outline-none transition-colors duration-300 focus:border-accent focus:ring-1 focus:ring-accent/40"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-xs font-medium text-text-secondary">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-line bg-background/60 px-4 py-2 text-sm text-text-primary outline-none transition-colors duration-300 focus:border-accent focus:ring-1 focus:ring-accent/40"
            />
          </div>
          <div>
            <label htmlFor="message" className="text-xs font-medium text-text-secondary">
              Message
            </label>
            <textarea
              id="message"
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-line bg-background/60 px-4 py-2 text-sm text-text-primary outline-none transition-colors duration-300 focus:border-accent focus:ring-1 focus:ring-accent/40"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-text-primary transition-transform duration-300 hover:scale-[1.02]"
          >
            {submitted ? "Message Sent" : "Send Message"}
          </button>
        </motion.form>
      </div>
    </section>
  );
}

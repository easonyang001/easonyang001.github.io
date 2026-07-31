import { motion } from "framer-motion";
import { people } from "../data/people.js";
import SectionHeading from "./SectionHeading.jsx";

export default function People() {
  return (
    <section id="people" className="section-container border-t border-border">
      <SectionHeading index="04" eyebrow="People" title="People" />

      <div className="mt-12 flex flex-wrap gap-6">
        {people.map((person, i) => (
          <motion.div
            key={person.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: "easeOut" }}
            className="glass-card w-full max-w-xs p-8"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-subtle text-h4 text-accent">
              {person.avatarInitials}
            </div>
            <h3 className="mt-5 text-h3 text-text-primary">{person.name}</h3>
            <p className="mt-1 text-small font-medium text-accent">{person.role}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {person.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-md border border-border px-2 py-1 font-mono text-mono-label uppercase text-text-secondary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

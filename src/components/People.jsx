import { motion } from "framer-motion";
import { people } from "../data/people.js";

export default function People() {
  return (
    <section id="people" className="section-container">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="section-heading"
      >
        People
      </motion.h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person, i) => (
          <motion.div
            key={person.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="glass-card p-6 text-center transition-shadow hover:shadow-glow"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-xl font-bold text-accent">
              {person.avatarInitials}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-text-primary">
              {person.name}
            </h3>
            <p className="mt-1 text-sm font-medium text-accent">{person.role}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {person.interests.map((interest) => (
                <span
                  key={interest}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-text-secondary"
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: people.length * 0.05, ease: "easeOut" }}
          className="glass-card flex flex-col items-center justify-center border-dashed p-6 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-white/20 text-2xl text-text-secondary">
            +
          </div>
          <p className="mt-5 text-sm font-medium text-text-secondary">
            Future members will be featured here.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

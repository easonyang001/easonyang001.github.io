import { motion } from "framer-motion";
import { people } from "../data/people.js";
import SectionHeading from "./SectionHeading.jsx";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import TiltedCard from "./reactbits/TiltedCard.jsx";

export default function People() {
  return (
    <section id="people" className="section-container border-t border-line">
      <SectionHeading index="04" eyebrow="People" title="People" />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((person, i) => (
          <motion.div
            key={person.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
            whileHover={{ y: -6 }}
          >
            <TiltedCard maxTilt={6}>
              <SpotlightCard
                className="glass-card h-full p-6 text-center hover:border-accent/30 hover:shadow-card-hover"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/5 text-xl font-bold text-text-primary ring-1 ring-inset ring-accent/30">
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
                      className="rounded-full border border-line px-3 py-1 text-xs text-text-secondary"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </TiltedCard>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: people.length * 0.05, ease: "easeOut" }}
          className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line p-6 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-line text-2xl text-text-secondary">
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

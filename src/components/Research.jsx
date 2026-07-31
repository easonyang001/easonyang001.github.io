import { motion } from "framer-motion";
import { researchAreas } from "../data/research.js";
import SectionHeading from "./SectionHeading.jsx";
import SpotlightCard from "./reactbits/SpotlightCard.jsx";
import TiltedCard from "./reactbits/TiltedCard.jsx";

export default function Research() {
  return (
    <section id="research" className="section-container border-t border-line">
      <SectionHeading
        index="01"
        eyebrow="Research"
        title="Research Areas"
        description="Core disciplines that define our research program, from foundational quantum information theory to applied intelligent optimization."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {researchAreas.map((area, i) => {
          const Icon = area.icon;
          return (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
              whileHover={{ y: -6 }}
              className="group"
            >
              <TiltedCard maxTilt={6}>
                <SpotlightCard className="glass-card h-full p-6 hover:border-accent/30 hover:shadow-card-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-text-primary">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {area.description}
                  </p>
                </SpotlightCard>
              </TiltedCard>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

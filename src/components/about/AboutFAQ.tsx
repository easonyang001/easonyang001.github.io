import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { site } from "../../data/site.ts";

const FAQ_ITEMS = [
  { question: "Is Mrama a university?", answer: "No. Mrama is an independent research institute, not affiliated with any university." },
  {
    question: "Is Mrama legally registered?",
    answer: `Not yet. Mrama is currently an independent, self-funded research project based in ${site.location}, not a registered legal entity.`,
  },
  {
    question: "Can I collaborate?",
    answer: "Yes. Researchers, engineers, and organizations interested in quantum optimization or related areas are welcome to reach out.",
  },
  {
    question: "Can students join?",
    answer: "Yes. Students interested in contributing to research or open-source work are welcome to get in touch.",
  },
  {
    question: "How is Mrama funded?",
    answer: "Mrama is currently self-funded by its founder. It does not receive external grants, venture funding, or institutional backing at this stage.",
  },
  {
    question: "Where is Mrama based?",
    answer: `Mrama is based in ${site.location}. Collaboration is remote-friendly and not limited by location.`,
  },
  {
    question: "How can I get in touch?",
    answer: "Reach out through the Contact page, by email, or on GitHub — see the links in the footer.",
  },
];

export default function AboutFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-container border-t border-border">
      <p className="section-kicker">FAQ</p>
      <h2 className="mt-4 text-h2 text-text-primary">Common questions</h2>

      <div className="mt-10 max-w-prose divide-y divide-border border-t border-border">
        {FAQ_ITEMS.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={item.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="text-body text-text-primary">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                />
              </button>
              {open && <p className="pb-5 text-small text-text-secondary">{item.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

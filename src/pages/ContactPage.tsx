import { ArrowRight, BookOpen, BriefcaseBusiness, Code2, FileText, GraduationCap, Lightbulb, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell.tsx";
import ContactInfo from "../components/ContactInfo.tsx";
import { site } from "../data/site.ts";

const INQUIRY_TYPES = [
  {
    icon: MessagesSquare,
    title: "General inquiry",
    description: "Questions about Mrama Institute, current work, public materials, or where to direct a request.",
  },
  {
    icon: GraduationCap,
    title: "Student message",
    description: "Include your background, interests, availability, and a link to your portfolio, GitHub, or CV.",
  },
  {
    icon: Code2,
    title: "Code or lab issue",
    description: "Share the page, expected behavior, actual behavior, browser, screenshots, or a reproducible example.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Project request",
    description: "Describe the problem, constraints, timeline, decision owner, and what outcome would be useful.",
  },
];

const MESSAGE_GUIDE = [
  "Who you are and how you found Mrama Institute.",
  "The topic, project, or problem you want to discuss.",
  "What kind of collaboration or response would be useful.",
  "Any links, papers, repositories, deadlines, or context we should review.",
];

const QUICK_LINKS = [
  { label: "Research Areas", href: "/research", icon: BookOpen },
  { label: "Interactive Lab", href: "/lab", icon: Lightbulb },
  { label: "Open Source", href: "/opensource", icon: Code2 },
  { label: "Publications", href: "/publications", icon: FileText },
];

export default function ContactPage() {
  return (
    <PageShell
      title="Send the right message"
      description="Use this page for direct contact, specific requests, bug reports, project inquiries, and follow-up conversations."
      path="/contact"
    >
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-12">
          <section>
            <div className="grid gap-4 sm:grid-cols-2">
              {INQUIRY_TYPES.map(({ icon: Icon, title, description }) => (
                <article key={title} className="glass-card p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-accent-subtle text-accent">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-h3 text-text-primary">{title}</h2>
                  <p className="mt-2 text-small text-text-secondary">{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-8 border-t border-border pt-12 lg:grid-cols-2">
            <div>
              <p className="text-small font-medium text-text-muted">What to include</p>
              <h2 className="mt-4 text-h2 text-text-primary">Make the next step obvious.</h2>
              <p className="mt-4 text-body text-text-secondary">
                Contact works best when it is practical. Keep the message brief, but make the request,
                context, and desired response clear.
              </p>
            </div>

            <ol className="space-y-4">
              {MESSAGE_GUIDE.map((item, index) => (
                <li key={item} className="flex gap-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border font-mono text-small text-accent">
                    {index + 1}
                  </span>
                  <p className="text-body text-text-secondary">{item}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="border-t border-border pt-12">
            <p className="text-small font-medium text-text-muted">Email format</p>
            <div className="mt-4 rounded-md border border-border bg-readout-bg p-5 font-mono text-small text-text-secondary">
              <p>Subject: [Request type] - [topic]</p>
              <br />
              <p>Hello Mrama Institute,</p>
              <br />
              <p>
                I am reaching out about [specific topic]. The context is [one-sentence summary].
                The useful next step would be [reply / call / review / direction].
              </p>
              <br />
              <p>Useful links: [paper / repository / portfolio / brief]</p>
              <p>Timeline: [optional]</p>
              <br />
              <p>Best,</p>
              <p>[name]</p>
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <div className="glass-card p-6">
            <p className="eyebrow">Direct contact</p>
            <div className="mt-6">
              <ContactInfo />
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="eyebrow">Response window</p>
            <p className="mt-4 text-body text-text-primary">Usually within 3-5 business days.</p>
            <p className="mt-2 text-small text-text-secondary">
              Time-sensitive requests should include the date, event, or decision deadline near the
              top of the message.
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="eyebrow">Explore first</p>
            <div className="mt-4 divide-y divide-border">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  to={href}
                  className="flex items-center justify-between gap-3 py-3 text-small text-text-secondary transition-colors duration-150 hover:text-accent"
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon size={15} />
                    {label}
                  </span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>

          {site.location && (
            <div className="border-t border-border pt-6">
              <p className="eyebrow">Base</p>
              <p className="mt-3 text-small text-text-secondary">
                Mrama Institute is based in {site.location} and works with collaborators remotely.
              </p>
            </div>
          )}
        </aside>
      </div>
    </PageShell>
  );
}

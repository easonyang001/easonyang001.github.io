import { Link } from "react-router-dom";

const CHANNELS = [
  { label: "Publications", description: "Peer-reviewed papers and preprints.", href: "/publications" },
  { label: "Open Source", description: "Code released alongside published results.", href: "/opensource" },
  { label: "Lab", description: "Interactive demos of core methods.", href: "/lab" },
];

export default function AboutOpenScience() {
  return (
    <section className="section-container border-t border-border">
      <p className="section-kicker">Open Science</p>
      <h2 className="mt-4 text-h2 text-text-primary">Published in the open</h2>
      <p className="mt-4 max-w-prose text-body-lg text-text-secondary">
        Papers, code, and working demos are released publicly so results can be checked and built on.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CHANNELS.map((channel) => (
          <Link key={channel.label} to={channel.href} className="glass-card p-6">
            <h3 className="text-h3 text-text-primary">{channel.label}</h3>
            <p className="mt-2 text-small text-text-secondary">{channel.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

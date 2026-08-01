import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="section-container">
      <div className="max-w-prose">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-h2 text-text-primary">Page not found</h1>
        <p className="mt-4 text-body-lg text-text-secondary">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-md bg-accent px-8 py-3 text-small font-medium text-text-primary transition-colors duration-150 hover:bg-accent-hover"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}

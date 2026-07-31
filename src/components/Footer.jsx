export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-background">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm font-bold tracking-widest text-text-primary">MRAMA</p>
            <p className="mt-1 text-xs text-text-secondary">
              Mrama Institute for Quantum Information and Intelligence
            </p>
          </div>
          <p className="font-mono text-xs text-text-secondary">
            &copy; 2026 Mrama Institute. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

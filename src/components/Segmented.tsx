import type { ReactNode } from "react";

export function Segmented({ children }: { children: ReactNode }) {
  return <div className="flex overflow-hidden rounded-panel border border-border">{children}</div>;
}

export function SegmentedButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 whitespace-nowrap border-r border-border px-2 py-2 text-small font-medium transition-colors duration-150 last:border-r-0 ${
        active ? "bg-accent-subtle text-accent" : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

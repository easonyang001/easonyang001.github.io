interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="border-t border-border py-12">
      <p className="text-body-lg text-text-primary">{title}</p>
      <p className="mt-2 text-small text-text-secondary">{description}</p>
    </div>
  );
}

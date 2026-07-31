interface LossCurveProps {
  lossHistory: number[];
}

export default function LossCurve({ lossHistory }: LossCurveProps) {
  const width = 400;
  const height = 100;

  if (lossHistory.length < 2) {
    return <div style={{ height }} className="flex items-center text-small text-text-muted">Train to see the loss curve.</div>;
  }

  const max = Math.max(...lossHistory, 0.01);
  const points = lossHistory
    .map((loss, i) => {
      const x = (i / (lossHistory.length - 1)) * width;
      const y = height - (loss / max) * (height - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" role="img" aria-label="Training loss curve">
      <polyline points={points} fill="none" stroke="#8B5CF6" strokeWidth="1.5" />
    </svg>
  );
}

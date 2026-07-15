export function MetricTile({
  label,
  value,
  unit,
  sublabel,
  accentColor,
}: {
  label: string;
  value: string;
  unit?: string;
  sublabel?: string;
  accentColor?: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-border bg-surface p-3">
      <span className="text-xs text-subtle">{label}</span>
      <span className="mt-1 flex items-baseline gap-1">
        <span
          className="text-2xl font-semibold leading-none"
          style={accentColor ? { color: accentColor } : undefined}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
      </span>
      {sublabel && <span className="mt-1 text-xs text-subtle">{sublabel}</span>}
    </div>
  );
}

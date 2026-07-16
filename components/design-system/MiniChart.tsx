export interface MiniChartProps {
  type?: "bars" | "line" | "ring";
  data?: number[];
  highlightIndex?: number;
  color?: string;
  trackColor?: string;
  height?: number;
  value?: number;
  ringLabel?: string;
}

/**
 * MiniChart renders a compact data visualization sized to sit inside a
 * MetricCard: capsule bar chart, sparkline, or ring progress.
 */
export function MiniChart({
  type = "bars",
  data = [],
  highlightIndex,
  color = "var(--color-lime)",
  trackColor = "rgba(255,255,255,0.18)",
  height = 64,
  value,
  ringLabel,
}: MiniChartProps) {
  if (type === "ring") {
    const pct = Math.max(0, Math.min(100, value ?? 0));
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: height, height }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: `conic-gradient(${color} ${pct * 3.6}deg, ${trackColor} 0deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "72%",
              height: "72%",
              borderRadius: "50%",
              background: "var(--bg-card-dark)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "var(--text-stat-m)",
              color: "var(--text-inverse)",
            }}
          >
            {ringLabel ?? `${pct}%`}
          </div>
        </div>
      </div>
    );
  }

  if (type === "line") {
    const w = 100;
    const h = 100;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data
      .map((d, i) => {
        const x = (i / (data.length - 1 || 1)) * w;
        const y = h - ((d - min) / range) * h;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height }}>
        <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }

  // bars (default) — rounded capsule bars, Blixby-style
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, width: "100%" }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${Math.max(10, (d / max) * 100)}%`,
            borderRadius: "var(--radius-pill)",
            background: i === highlightIndex ? color : trackColor,
          }}
        />
      ))}
    </div>
  );
}

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface MetricCardProps {
  /** Background treatment. Use dark/teal/forest/lime/coral as accent "hero" cards, light as the default neutral card. */
  variant?: "light" | "dark" | "teal" | "forest" | "lime" | "coral";
  /** Small leading icon (18-20px). */
  icon?: ReactNode;
  /** Short metric name, e.g. "Heart Rate". */
  label: string;
  /** The headline stat, e.g. 101 or "7,435". */
  value: string | number;
  /** Unit suffix rendered smaller next to the value, e.g. "bpm", "kg", "%". */
  unit?: string;
  /** Optional pill status label, e.g. "High HR", "Stable". */
  tagLabel?: string;
  tagTone?: "positive" | "warning" | "info" | "neutral";
  /** Small caption under the content, e.g. "Updated 5 min ago". */
  footer?: string;
  /** Optional slot for a MiniChart or any custom content (sparkline, ring, list). */
  chart?: ReactNode;
  size?: "sm" | "md" | "lg";
  onClick?: MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
  className?: string;
}

const VARIANTS: Record<NonNullable<MetricCardProps["variant"]>, CSSProperties> = {
  light: { background: "var(--bg-surface)", color: "var(--text-primary)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" },
  dark: { background: "var(--bg-card-dark)", color: "var(--text-inverse)", border: "none", boxShadow: "var(--shadow-card-dark)" },
  teal: { background: "var(--bg-card-teal)", color: "var(--text-inverse)", border: "none", boxShadow: "var(--shadow-card-dark)" },
  forest: { background: "var(--bg-card-forest)", color: "var(--text-inverse)", border: "none", boxShadow: "var(--shadow-card-dark)" },
  lime: { background: "var(--bg-card-lime)", color: "var(--text-on-lime)", border: "none", boxShadow: "var(--shadow-card)" },
  coral: { background: "var(--bg-card-coral)", color: "var(--text-on-coral)", border: "none", boxShadow: "var(--shadow-card)" },
};

const TAG_TONES: Record<NonNullable<MetricCardProps["tagTone"]>, CSSProperties> = {
  positive: { background: "var(--status-positive-bg)", color: "var(--status-positive-fg)" },
  warning: { background: "var(--status-warning-bg)", color: "var(--status-warning-fg)" },
  info: { background: "var(--status-info-bg)", color: "var(--status-info-fg)" },
  neutral: { background: "var(--status-neutral-bg)", color: "var(--status-neutral-fg)" },
};

/**
 * MetricCard — the core building block of the dashboard. Shows one metric
 * (label + big value + optional unit), an optional icon, an optional status
 * tag, an optional chart/content slot, and an optional footer caption.
 */
export function MetricCard({
  variant = "light",
  icon,
  label,
  value,
  unit,
  tagLabel,
  tagTone = "neutral",
  footer,
  chart,
  size = "md",
  onClick,
  style,
  className,
}: MetricCardProps) {
  const v = VARIANTS[variant] ?? VARIANTS.light;
  const tagStyle = TAG_TONES[tagTone] ?? TAG_TONES.neutral;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        ...v,
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
        justifyContent: "space-between",
        minHeight: size === "sm" ? "128px" : size === "lg" ? "200px" : "164px",
        cursor: onClick ? "pointer" : "default",
        fontFamily: "var(--font-body)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--space-2)", rowGap: "var(--space-1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", opacity: 0.85 }}>
          {icon ? <span style={{ display: "flex", width: 18, height: 18, flexShrink: 0 }}>{icon}</span> : null}
          <span style={{ font: "var(--text-label)" }}>{label}</span>
        </div>
        {tagLabel ? (
          <span
            style={{
              ...tagStyle,
              font: "var(--text-caption)",
              letterSpacing: "var(--tracking-caption)",
              padding: "5px 10px",
              borderRadius: "var(--radius-pill)",
              whiteSpace: "nowrap",
            }}
          >
            {tagLabel}
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
        <span style={{ font: "var(--text-stat-xl)" }}>{value}</span>
        {unit ? <span style={{ font: "var(--text-body)", opacity: 0.75 }}>{unit}</span> : null}
      </div>

      {chart ? <div style={{ flex: 1, minHeight: 0 }}>{chart}</div> : null}

      {footer ? <div style={{ font: "var(--text-caption)", opacity: 0.65 }}>{footer}</div> : null}
    </div>
  );
}

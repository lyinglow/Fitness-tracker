import type { ReactNode } from "react";

export interface StatusTagProps {
  label: string;
  tone?: "positive" | "warning" | "info" | "neutral";
  icon?: ReactNode;
}

const TONES: Record<NonNullable<StatusTagProps["tone"]>, { background: string; color: string }> = {
  positive: { background: "var(--status-positive-bg)", color: "var(--status-positive-fg)" },
  warning: { background: "var(--status-warning-bg)", color: "var(--status-warning-fg)" },
  info: { background: "var(--status-info-bg)", color: "var(--status-info-fg)" },
  neutral: { background: "var(--status-neutral-bg)", color: "var(--status-neutral-fg)" },
};

/**
 * StatusTag is a small capsule label used to annotate a metric with state
 * (e.g. "High HR", "Stable Weight", "Gaining Muscle").
 */
export function StatusTag({ label, tone = "neutral", icon }: StatusTagProps) {
  const t = TONES[tone] ?? TONES.neutral;
  return (
    <span
      style={{
        ...t,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        font: "var(--text-caption)",
        letterSpacing: "var(--tracking-caption)",
        padding: "5px 10px",
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
      }}
    >
      {icon ? <span style={{ display: "flex", width: 12, height: 12 }}>{icon}</span> : null}
      {label}
    </span>
  );
}

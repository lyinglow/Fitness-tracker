export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "light" | "dark";
}

/**
 * SectionHeader introduces a group of cards on the dashboard: a title, an
 * optional subtitle/timestamp, and an optional trailing text action.
 */
export function SectionHeader({ title, subtitle, actionLabel, onAction, variant = "light" }: SectionHeaderProps) {
  const isDark = variant === "dark";
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-4)" }}>
      <div>
        <div style={{ font: "var(--text-h1)", color: isDark ? "var(--text-inverse)" : "var(--text-primary)" }}>{title}</div>
        {subtitle ? (
          <div style={{ font: "var(--text-body-sm)", color: isDark ? "var(--gray-400)" : "var(--text-secondary)", marginTop: "var(--space-1)" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
      {actionLabel ? (
        <button
          onClick={onAction}
          style={{
            border: "none",
            background: "none",
            padding: 0,
            font: "var(--text-label)",
            color: "var(--accent-primary)",
            cursor: "pointer",
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

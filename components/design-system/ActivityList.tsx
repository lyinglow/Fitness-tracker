import type { ReactNode } from "react";

export interface ActivityListItem {
  icon?: ReactNode;
  label: string;
  meta?: string;
  value?: string;
}

export interface ActivityListProps {
  items?: ActivityListItem[];
  variant?: "light" | "dark";
  dividers?: boolean;
}

/**
 * ActivityList renders a vertical list of rows — an activity feed, workout
 * log, or agenda — each with an icon, label + meta text, and a trailing value.
 */
export function ActivityList({ items = [], variant = "light", dividers = true }: ActivityListProps) {
  const isDark = variant === "dark";
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) 0",
            borderBottom: dividers && i < items.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "var(--border-subtle)"}` : "none",
          }}
        >
          {item.icon ? (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: isDark ? "rgba(255,255,255,0.08)" : "var(--bg-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ width: 18, height: 18, display: "flex" }}>{item.icon}</span>
            </div>
          ) : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: "var(--text-body)", color: isDark ? "var(--text-inverse)" : "var(--text-primary)" }}>{item.label}</div>
            {item.meta ? (
              <div style={{ font: "var(--text-caption)", color: isDark ? "var(--gray-400)" : "var(--text-muted)", marginTop: 2 }}>{item.meta}</div>
            ) : null}
          </div>
          {item.value ? (
            <div style={{ font: "var(--text-label)", color: isDark ? "var(--text-inverse)" : "var(--text-primary)", whiteSpace: "nowrap" }}>{item.value}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

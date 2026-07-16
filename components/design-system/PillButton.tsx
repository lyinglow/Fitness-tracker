import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export interface PillButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "accent";
  size?: "sm" | "md";
  active?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}

const VARIANTS: Record<NonNullable<PillButtonProps["variant"]>, CSSProperties> = {
  primary: { background: "var(--color-ink)", color: "var(--text-inverse)" },
  secondary: { background: "var(--bg-surface-2)", color: "var(--text-primary)" },
  ghost: { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-strong)" },
  accent: { background: "var(--color-lime)", color: "var(--text-on-lime)" },
};

/**
 * PillButton is the fully-rounded button/filter-chip used throughout the
 * dashboard (segmented filters, quick actions, CTAs).
 */
export function PillButton({ variant = "primary", size = "md", active = false, icon, children, onClick, style }: PillButtonProps) {
  const base = VARIANTS[variant] ?? VARIANTS.primary;
  const activeStyle: CSSProperties = active ? { background: "var(--color-ink)", color: "var(--text-inverse)", border: "none" } : {};
  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        ...activeStyle,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        border: base.border ?? "none",
        borderRadius: "var(--radius-pill)",
        padding: size === "sm" ? "8px 16px" : "12px 22px",
        font: size === "sm" ? "var(--text-body-sm)" : "var(--text-label)",
        cursor: "pointer",
        transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
    >
      {icon ? <span style={{ display: "flex", width: 16, height: 16 }}>{icon}</span> : null}
      {children}
    </button>
  );
}

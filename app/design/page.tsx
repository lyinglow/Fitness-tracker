"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardTemplate } from "@/components/design-system/DashboardTemplate";
import { DashboardTemplateDesktop } from "@/components/design-system/DashboardTemplateDesktop";

export default function DesignPreviewPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div data-theme={theme} style={{ background: "var(--bg-app)", minHeight: "100vh" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "var(--space-4)", padding: "14px var(--gutter-page)" }}>
        <Link href="/" style={{ font: "var(--text-label)", color: "var(--text-secondary)", fontFamily: "var(--font-body)" }}>
          ← Live dashboard
        </Link>
        <button
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          style={{
            border: "1px solid var(--border-strong)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            borderRadius: 999,
            padding: "8px 18px",
            font: "var(--text-label)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Switch to {theme === "light" ? "dark" : "light"} mode
        </button>
      </div>

      <div className="md:hidden">
        <DashboardTemplate />
      </div>
      <div className="hidden md:block">
        <DashboardTemplateDesktop />
      </div>
    </div>
  );
}

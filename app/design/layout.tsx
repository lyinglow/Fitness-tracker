import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./tokens.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-plus-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fitness Dashboard — Design Preview",
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${plusJakarta.variable} ${inter.variable}`}>{children}</div>;
}

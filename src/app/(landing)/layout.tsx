import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MASS 2K26 — The Ultimate Cultural Experience",
  description:
    "MASS 2K26 is the most anticipated cultural extravaganza — live performances, art showcases, competitions, workshops, and more. Register now.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

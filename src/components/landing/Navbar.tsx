"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/#home" },
  { name: "About", href: "/#about" },
  { name: "Events", href: "/events" },
  { name: "Timeline", href: "/#events" },
  { name: "Coordinators", href: "/coordinators" },
  { name: "Rules", href: "/rules" },
  { name: "FAQ", href: "/faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href.startsWith("/") && !href.startsWith("/#") && pathname === href;

  return (
    <>
      {/* Top fuchsia accent bar */}
      <div className="fixed top-0 left-0 right-0 z-[101] h-[2px] bg-fuchsia-500" />

      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-[2px] left-0 right-0 z-[100] transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_2px_32px_rgba(0,0,0,0.6)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4 md:h-16">
            {/* ── Logo ── */}
            <Link
              href="/"
              className="group flex flex-shrink-0 items-center gap-2.5"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-lg ring-1 ring-fuchsia-500/40 transition group-hover:ring-fuchsia-400/70 sm:h-9 sm:w-9">
                <Image
                  src="/logo.png"
                  alt="MASS 2K26"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-[15px] font-extrabold tracking-wide text-white sm:text-base">
                MASS <span className="text-fuchsia-400">2K26</span>
              </span>
            </Link>

            {/* ── Desktop links ── */}
            <div className="hidden items-center gap-0.5 md:flex">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                const isPageLink =
                  link.href.startsWith("/") && !link.href.startsWith("/#");
                const Comp = isPageLink ? Link : "a";
                return (
                  <Comp
                    key={link.name}
                    href={link.href}
                    className={`relative px-3.5 py-2 text-sm font-medium transition-colors duration-150 rounded-lg ${
                      active
                        ? "text-white"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-white/8 ring-1 ring-white/10"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 36,
                        }}
                      />
                    )}
                    <span className="relative">{link.name}</span>
                  </Comp>
                );
              })}
            </div>

            {/* ── Desktop CTA ── */}
            <div className="hidden md:block">
              <Link
                href="/login"
                className="rounded-full bg-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_16px_rgba(217,70,239,0.35)] transition hover:bg-fuchsia-400 hover:shadow-[0_0_20px_rgba(217,70,239,0.5)] active:scale-95"
              >
                Login
              </Link>
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 text-neutral-300 transition hover:border-white/20 hover:text-white active:scale-90 md:hidden"
            >
              <span
                className={`absolute block h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? "translate-y-0 rotate-45" : "-translate-y-[5px]"
                }`}
              />
              <span
                className={`absolute block h-[1.5px] rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? "w-0 opacity-0" : "w-4 opacity-100"
                }`}
              />
              <span
                className={`absolute block h-[1.5px] w-4 rounded-full bg-current transition-all duration-300 ${
                  mobileOpen ? "translate-y-0 -rotate-45" : "translate-y-[5px]"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[98] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-down drawer */}
            <motion.div
              key="drawer"
              ref={menuRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed left-3 right-3 top-[calc(2px+3.75rem)] z-[99] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 shadow-[0_8px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl md:hidden"
            >
              {/* Subtle fuchsia glow at top */}
              <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

              <nav className="px-2 py-3">
                {navLinks.map((link, i) => {
                  const active = isActive(link.href);
                  const isPageLink =
                    link.href.startsWith("/") && !link.href.startsWith("/#");
                  const Comp = isPageLink ? Link : "a";
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.2 }}
                    >
                      <Comp
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-colors ${
                          active
                            ? "bg-fuchsia-500/10 text-fuchsia-300"
                            : "text-neutral-300 hover:bg-white/[0.05] hover:text-white active:bg-white/10"
                        }`}
                      >
                        {link.name}
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                        )}
                      </Comp>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Bottom CTA */}
              <div className="border-t border-white/[0.06] px-3 py-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-fuchsia-500 py-3 text-[15px] font-semibold text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition hover:bg-fuchsia-400 active:scale-[0.98]"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

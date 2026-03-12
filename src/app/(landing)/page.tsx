"use client";

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  Playfair_Display,
} from "next/font/google";
import {
  ArrowRight,
  Calendar,
  PartyPopper,
  Shield,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollCardSec from "@/components/landing/ScrollCardSec";
import TabCards from "@/components/landing/TabCards";
import CTASection from "@/components/landing/CTASection";
import CoordinatorsSection from "@/components/landing/coordinators";
import FAQSection from "@/components/landing/faqsection";
import LiveStats from "@/components/landing/LiveStats";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800"],
});

const heroLetterStyles = [
  {
    font: cinzelDecorative.className,
    className: "-rotate-3 scale-y-[1.06]",
  },
  {
    font: cormorantGaramond.className,
    className: "translate-y-[0.04em] rotate-2 scale-[1.08]",
  },
  {
    font: playfairDisplay.className,
    className: "-rotate-2 scale-x-[0.96]",
  },
  {
    font: cinzelDecorative.className,
    className: "translate-y-[-0.03em] rotate-1 scale-y-[1.1]",
  },
  {
    font: cormorantGaramond.className,
    className: "-rotate-1 scale-[1.03]",
  },
];

function StylizedWord({
  text,
  accent = false,
}: {
  text: string;
  accent?: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-end justify-center gap-[0.02em] sm:gap-[0.03em]">
      {text.split("").map((letter, index) => {
        const style = heroLetterStyles[index % heroLetterStyles.length];

        return (
          <motion.span
            key={`${text}-${index}-${letter}`}
            initial={{ opacity: 0, y: 28, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.45 + index * 0.08, duration: 0.55 }}
            whileHover={{
              y: -4,
              rotate: index % 2 === 0 ? -4 : 4,
              scale: 1.05,
            }}
            className={`${style.font} ${style.className} inline-block px-[0.01em] ${accent ? "text-fuchsia-400" : "text-white"}`}
            style={{
              textShadow: accent
                ? "0 0 22px rgba(217,70,239,0.35)"
                : "0 0 18px rgba(255,255,255,0.12)",
            }}
          >
            {letter}
          </motion.span>
        );
      })}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Departments marquee                                                */
/* ------------------------------------------------------------------ */
function DeptMarquee() {
  const depts = [
    "CSE",
    "IT",
    "AI & DS",
    "MECH",
    "BME",
    "AGRI",
    "ECE",
    "AI & ML",
  ];

  return (
    <section className="relative py-10 overflow-hidden border-y border-white/5">
      <div className="flex animate-marquee gap-12 items-center">
        {[...depts, ...depts].map((d, i) => (
          <span
            key={i}
            className="text-white/30 text-sm font-semibold tracking-[0.2em] uppercase whitespace-nowrap select-none"
          >
            ◆ {d}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick-link cards — solid colors                                    */
/* ------------------------------------------------------------------ */
function QuickLinks() {
  const links = [
    {
      icon: Calendar,
      label: "Events",
      desc: "15+ events to participate",
      href: "/events",
      color: "bg-rose-500",
      hover: "hover:bg-rose-600",
    },
    {
      icon: Shield,
      label: "Rules",
      desc: "Guidelines & discipline",
      href: "/rules",
      color: "bg-amber-500",
      hover: "hover:bg-amber-600",
    },
    {
      icon: HelpCircle,
      label: "FAQ",
      desc: "Questions answered",
      href: "/faq",
      color: "bg-cyan-500",
      hover: "hover:bg-cyan-600",
    },
    {
      icon: PartyPopper,
      label: "Register",
      desc: "Secure your spot",
      href: "/login",
      color: "bg-fuchsia-500",
      hover: "hover:bg-fuchsia-600",
    },
  ];

  return (
    <section className="relative py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  href={link.href}
                  className={`block p-4 md:p-5 rounded-2xl ${link.color} ${link.hover} text-white group active:scale-[0.97] transition-all duration-200 shadow-lg`}
                >
                  <Icon className="w-7 h-7 md:w-8 md:h-8 mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                  <p className="font-bold text-sm md:text-base">{link.label}</p>
                  <p className="text-white/70 text-[11px] md:text-xs mt-0.5 leading-tight">
                    {link.desc}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroImgScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.15]);
  const heroImgOpacity = useTransform(scrollYProgress, [0, 0.25], [0.6, 0.12]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 80]);

  return (
    <main className="relative bg-[hsl(240,10%,3.9%)] min-h-screen overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-fuchsia-500 z-[200] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navigation */}
      <Navbar />

      {/* ===================== HERO SECTION ===================== */}
      <section
        id="home"
        className="relative min-h-[100svh] flex items-center justify-center overflow-hidden"
      >
        {/* Background image with parallax */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ scale: heroImgScale, opacity: heroImgOpacity }}
        >
          <Image
            src="/gallery/bg-2.jpeg"
            alt="MASS 2K26 Event"
            fill
            className="object-cover object-center scale-110"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.45)_72%)]" />
        </motion.div>

        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Solid colour accent blobs (no gradients) */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-fuchsia-500/8 blur-[120px]"
            animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-40 -right-20 w-[32rem] h-[32rem] rounded-full bg-cyan-500/8 blur-[120px]"
            animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.08, 0.05] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY }}
          className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mx-auto px-5 pt-28 sm:pt-24 pb-12"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-fuchsia-400 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm"
          >
            
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="text-[3.8rem] sm:text-[5.8rem] md:text-[7.4rem] lg:text-[8.8rem] font-black tracking-[0.02em] leading-[0.88]"
          >
            <span className="block">
              <StylizedWord text="MASS" />
            </span>
            <span className="block mt-1 sm:mt-2">
              <StylizedWord text="2K26" accent />
            </span>
          </motion.h1>

          {/* Date pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 px-5 py-2 rounded-full bg-fuchsia-500 text-white font-bold text-xs sm:text-sm tracking-wider shadow-lg shadow-fuchsia-500/30"
          >
            28 MARCH 2026 · PPG IT COLLEGE
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-5 text-sm sm:text-base text-neutral-400 max-w-md leading-relaxed"
          >
            
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-fuchsia-500 hover:bg-fuchsia-600 active:scale-[0.97] text-white font-semibold text-sm transition-all shadow-lg shadow-fuchsia-500/25 text-center"
            >
              Login Now
            </Link>
            {/* <Link
              href="/events"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/15 text-neutral-300 hover:text-white hover:border-white/30 active:scale-[0.97] transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              View Events <ArrowRight className="w-4 h-4" />
            </Link> */}
          </motion.div>

          {/* Scroll chevron */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-14 sm:mt-16"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <ChevronDown className="w-5 h-5 text-white/20" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===================== Live Stats ===================== */}
      <LiveStats />

      {/* ===================== Quick Links ===================== */}
      <QuickLinks />

      {/* ===================== About — TabCards ===================== */}
      <TabCards />

      {/* ===================== Schedule ===================== */}
      <ScrollCardSec />

      {/* ===================== Departments ===================== */}
      <DeptMarquee />

      {/* ===================== Coordinators ===================== */}
      <CoordinatorsSection />

      {/* ===================== FAQ ===================== */}
      {/* <FAQSection /> */}

      {/* ===================== CTA ===================== */}
      {/* <CTASection /> */}

      {/* ===================== Footer ===================== */}
      <Footer />
    </main>
  );
}

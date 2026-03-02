"use client";

import React from "react";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { LampContainer } from "@/components/ui/lamp";
import { MovingBorderButton } from "@/components/ui/moving-border";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import HighlightsCards from "@/components/landing/HighlightsCards";
import ScrollCardSec from "@/components/landing/ScrollCardSec";
import TabCards from "@/components/landing/TabCards";
import GridImages from "@/components/landing/GridImages";
import CTASection from "@/components/landing/CTASection";
import Sliders from "@/components/landing/Sliders";
import MusicCD from "@/components/landing/MusicCD";
import CoordinatorsSection from "@/components/landing/coordinators";

/* ------------------------------------------------------------------ */
/*  Floating particles background                                      */
/* ------------------------------------------------------------------ */
function ParticlesBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-500/20"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
            x: [
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
              `${Math.random() * 100}%`,
            ],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Gradient mesh background for sections                              */
/* ------------------------------------------------------------------ */
function GridPattern() {
  return (
    <div
      className="absolute inset-0 opacity-[0.02] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Stats counter section                                              */
/* ------------------------------------------------------------------ */
function StatsSection() {
  const stats = [
    { value: "20+", label: "Events" },
    { value: "500+", label: "Participants" },
    { value: "2", label: "Days" },
    { value: "₹1L+", label: "Prize Pool" },
  ];

  return (
    <section className="relative py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-neutral-400 text-sm mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sponsors / Partners marquee                                        */
/* ------------------------------------------------------------------ */
function SponsorsMarquee() {
  const sponsors = [
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
    <section className="relative py-12 overflow-hidden border-y border-white/5">
      <div className="flex animate-marquee gap-16 items-center">
        {[...sponsors, ...sponsors].map((name, i) => (
          <span
            key={i}
            className="text-neutral-600 text-lg font-medium whitespace-nowrap select-none"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Landing Page                                                  */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();

  return (
    <main className="relative bg-[hsl(240,10%,3.9%)] min-h-screen overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 z-[200] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Background effects */}
      <ParticlesBackground />
      <GridPattern />

      {/* Navigation */}
      <Navbar />

      {/* ===================== HERO — Lamp Section ===================== */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center"
      >
        <LampContainer className="min-h-screen ">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center justify-center text-center w-full max-w-5xl mx-auto px-4"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-6 backdrop-blur-sm shadow-lg shadow-purple-500/10"
            >
              The Cultural Event of the Year
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold tracking-tight leading-none">
              <span className="bg-gradient-to-b from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent drop-shadow-2xl">
                MASS
              </span>{" "}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl">
                2K26
              </span>
            </h1>

            {/* Decorative divider */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "8rem" }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-5"
            />

            {/* Subtitle */}
            <p className="mt-5 text-sm md:text-base text-neutral-400 max-w-xl leading-relaxed px-4">
              Immerse yourself in the ultimate cultural extravaganza live
              performances, electrifying competitions, art showcases, and
              unforgettable moments.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <MovingBorderButton
                  as="div"
                  borderRadius="1.75rem"
                  className="px-8 py-3 font-semibold text-white"
                  containerClassName="h-13"
                  duration={3000}
                >
                  Login Now
                </MovingBorderButton>
              </Link>
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 flex flex-col items-center gap-2 text-neutral-600 text-xs"
            >
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5"
              >
                <div className="w-1 h-2 rounded-full bg-purple-500/60" />
              </motion.div>
              <span>Scroll to explore</span>
            </motion.div>
          </motion.div>
        </LampContainer>
      </section>

      {/* ===================== Stats ===================== */}
      {/* <StatsSection /> */}

      {/* ===================== Slider ===================== */}
      <Sliders />

      {/* ===================== About — TabCards ===================== */}
      <TabCards />

      {/* ===================== Highlights ===================== */}
      {/* <HighlightsCards /> */}

      {/* ===================== Schedule ===================== */}
      <ScrollCardSec />

      {/* ===================== Sponsors ===================== */}
      <SponsorsMarquee />

      {/* ===================== Coordinators ===================== */}
      <CoordinatorsSection />

      {/* ===================== Gallery ===================== */}
      {/* <GridImages /> */}

      {/* ===================== CTA ===================== */}
      <CTASection />

      {/* ===================== Footer ===================== */}
      <Footer />

      {/* ===================== Music CD Player ===================== */}
      {/* <MusicCD /> */}
    </main>
  );
}

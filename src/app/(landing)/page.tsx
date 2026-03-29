"use client";

import React from "react";
import { motion, useScroll } from "framer-motion";
import Link from "next/link";
import { Calendar, PartyPopper, Shield, HelpCircle } from "lucide-react";

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/hero";
import Footer from "@/components/landing/Footer";
import ScrollCardSec from "@/components/landing/ScrollCardSec";
import TabCards from "@/components/landing/TabCards";
import CTASection from "@/components/landing/CTASection";
import CoordinatorsSection from "@/components/landing/coordinators";
import FAQSection from "@/components/landing/faqsection";
import LiveStats from "@/components/landing/LiveStats";

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
      <section id="home" className="relative min-h-[100svh] overflow-hidden">
        <Hero />
      </section>

      {/* ===================== Live Stats ===================== */}
      <LiveStats />

      {/* ===================== Quick Links ===================== */}
      {/* <QuickLinks /> */}

      {/* ===================== About — TabCards ===================== */}
      <TabCards />

      {/* ===================== Schedule ===================== */}
      {/* <ScrollCardSec /> */}

      {/* ===================== Departments ===================== */}
      <DeptMarquee />

      {/* ===================== Coordinators ===================== */}
      {/* <CoordinatorsSection /> */}

      {/* ===================== FAQ ===================== */}
      {/* <FAQSection /> */}

      {/* ===================== CTA ===================== */}
      {/* <CTASection /> */}

      {/* ===================== Footer ===================== */}
      <Footer />
    </main>
  );
}

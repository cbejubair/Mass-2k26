"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * Festival-inspired geometric decorations and floating event name watermarks.
 * Placed behind content for visual identity without affecting readability.
 */

/* ── Geometric triangle/diamond shapes (like the Electrisize festival) ── */
export function GeometricDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-left triangles */}
      <svg
        className="absolute -top-10 -left-10 w-60 h-60 opacity-[0.06]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <polygon points="0,0 200,0 0,200" fill="url(#grad1)" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top-right triangles */}
      <svg
        className="absolute -top-10 -right-10 w-60 h-60 opacity-[0.06]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <polygon points="200,0 200,200 0,0" fill="url(#grad2)" />
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Mid-left diamond */}
      <svg
        className="absolute top-1/3 -left-20 w-40 h-40 opacity-[0.04]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon points="50,0 100,50 50,100 0,50" fill="url(#grad3)" />
        <defs>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-right triangle cluster */}
      <svg
        className="absolute bottom-20 -right-16 w-48 h-48 opacity-[0.05]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <polygon points="200,200 0,200 200,0" fill="url(#grad4)" />
        <defs>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>

      {/* Mid-right diamond */}
      <svg
        className="absolute top-2/3 -right-12 w-32 h-32 opacity-[0.04]"
        viewBox="0 0 100 100"
        fill="none"
      >
        <polygon points="50,0 100,50 50,100 0,50" fill="url(#grad5)" />
        <defs>
          <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ── Floating event-name watermarks ── */
const eventNames = [
  "SOLO DANCE",
  "GROUP DANCE",
  "SINGING",
  "INSTRUMENTAL",
  "DJ NIGHT",
  "KARAOKE",
  "DRAMA",
  "FASHION SHOW",
  "BEATBOX",
  "STANDUP",
  "RAP BATTLE",
  "MIME",
  "MUSIC NIGHT",
  "ART EXPO",
  "PHOTOGRAPHY",
];

export function EventWatermarks() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {eventNames.map((name, i) => (
        <motion.div
          key={name}
          className="absolute whitespace-nowrap text-white/[0.015] font-black tracking-[0.3em]"
          style={{
            top: `${(i * 7.2) % 100}%`,
            left: `${(i * 17 + 5) % 100}%`,
            fontSize: `${Math.random() * 1.5 + 1}rem`,
            transform: `rotate(${-15 + (i % 3) * 15}deg)`,
          }}
          animate={{
            x: [0, 30, 0, -30, 0],
            opacity: [0.015, 0.03, 0.015],
          }}
          transition={{
            duration: 20 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {name}
        </motion.div>
      ))}
    </div>
  );
}

/* ── Colorful confetti dots ── */
export function ConfettiDots() {
  const colors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-emerald-500",
    "bg-blue-500",
    "bg-orange-500",
    "bg-pink-500",
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1.5 h-1.5 rounded-full ${colors[i % colors.length]} opacity-0`}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, -200],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 0.4, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* ── Combined background (use this in place of ParticlesBackground) ── */
export default function FestivalBackground() {
  return (
    <>
      <GeometricDecorations />
      <EventWatermarks />
      <ConfettiDots />
    </>
  );
}

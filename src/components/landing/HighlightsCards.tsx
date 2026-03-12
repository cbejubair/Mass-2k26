"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, Palette, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

const highlights = [
  {
    icon: Music,
    title: "Live Music",
    description:
      "Electrifying performances from incredible artists and bands that will make you groove all night.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Palette,
    title: "Art & Culture",
    description:
      "Immerse yourself in stunning art exhibitions, cultural showcases, and creative workshops.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Users,
    title: "Dance Battle",
    description:
      "Watch jaw-dropping dance crews compete head-to-head in an epic dance showdown.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "Drama & Theatre",
    description:
      "Experience powerful theatrical performances that will leave you spellbound and inspired.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Trophy,
    title: "Competitions",
    description:
      "From quiz bowls to coding challenges, put your skills to the test and win amazing prizes.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: Zap,
    title: "Tech Expo",
    description:
      "Explore cutting-edge technology, innovative projects, and futuristic demonstrations.",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function HighlightsCards() {
  return (
    <section id="highlights" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Event <span className="text-fuchsia-400">Highlights</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            A jam-packed lineup of events that will keep you on the edge of your
            seat
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative rounded-2xl border border-white/10 bg-[hsl(240,10%,5.9%)] p-8 overflow-hidden h-full">
                <GlowingEffect
                  spread={40}
                  glow={false}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={2}
                />
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

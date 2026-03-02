"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  {
    id: "about",
    label: "About",
    content: {
      title: "What is MASS 2K26?",
      description:
        "MASS is your stage to shine! Whether you love to Dance, Sing, Act, or Speak, or have any other unique talent to showcase, this is your moment to captivate the audience. Step up, express yourself, and be part of an electrifying celebration of creativity and passion. Don’t just be a spectator participate, perform, and make your mark! Unleash your potential, embrace the spotlight, and let MASS be the platform where your talent takes center stage!",
      stats: [
        { label: "Events", value: "20+" },
        { label: "Participants", value: "500+" },
        { label: "Days", value: "2" },
        { label: "Prizes", value: "₹1L+" },
      ],
    },
  },
  {
    id: "venue",
    label: "Venue",
    content: {
      title: "Where It Happens",
      description:
        "Held across the sprawling campus grounds, MASS 2K26 transforms every corner into a stage. From the grand auditorium to the open-air arena, every venue is designed to deliver an immersive experience. Multiple stages ensure simultaneous events keep the energy flowing non-stop.",
      stats: [
        { label: "Stages", value: "4" },
        { label: "Venues", value: "6" },
        { label: "Capacity", value: "2000+" },
        { label: "Area", value: "10 Acres" },
      ],
    },
  },
  {
    id: "register",
    label: "Register",
    content: {
      title: "Join the Fest",
      description:
        "Registration is open for all events. Whether you're a performer, artist, techie, or spectator, there's something for everyone. Secure your spot now and be part of the biggest cultural event of the year. Early registrations get exclusive perks and priority access.",
      stats: [
        { label: "Categories", value: "6" },
        { label: "Team Size", value: "1-5" },
        { label: "Entry", value: "Free" },
        { label: "Deadline", value: "TBA" },
      ],
    },
  },
];

export default function TabCards() {
  const [activeTab, setActiveTab] = useState("about");
  const activeContent = tabs.find((t) => t.id === activeTab)!.content;

  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Discover{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              MASS 2K26
            </span>
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-purple-600 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-[hsl(240,10%,5.9%)] p-8 md:p-12"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {activeContent.title}
            </h3>
            <p className="text-neutral-400 leading-relaxed text-lg mb-10">
              {activeContent.description}
            </p>

            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {activeContent.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-xl bg-white/5"
                >
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-neutral-400 text-sm mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div> */}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

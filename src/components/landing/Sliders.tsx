"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    title: "Experience the Magic",
    subtitle:
      "MASS 2K26 brings together the best performers from across the region",
    gradient: "from-purple-600/20 via-transparent to-indigo-600/20",
  },
  {
    title: "Compete & Conquer",
    subtitle:
      "Show your skills in thrilling competitions and win amazing prizes",
    gradient: "from-pink-600/20 via-transparent to-rose-600/20",
  },
  {
    title: "Create Memories",
    subtitle: "Two days of non-stop entertainment that you'll remember forever",
    gradient: "from-blue-600/20 via-transparent to-cyan-600/20",
  },
  {
    title: "Unite Through Arts",
    subtitle:
      "Music, dance, drama, art — every form of creative expression celebrated",
    gradient: "from-amber-600/20 via-transparent to-orange-600/20",
  },
];

export default function Sliders() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const goTo = (index: number) => {
    setCurrent(index);
    startAutoPlay();
  };

  const prev = () => goTo((current - 1 + slides.length) % slides.length);
  const next = () => goTo((current + 1) % slides.length);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-white/10 bg-[hsl(240,10%,5.9%)] overflow-hidden h-[300px] md:h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 md:px-16 bg-gradient-to-br ${slides[current].gradient}`}
            >
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-4xl font-bold text-white mb-4"
              >
                {slides[current].title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-neutral-400 text-base md:text-lg max-w-xl"
              >
                {slides[current].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 transition z-10"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current
                    ? "bg-fuchsia-500 w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

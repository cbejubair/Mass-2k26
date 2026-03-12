"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Ticket, Calendar, BookOpen, Shield, Star } from "lucide-react";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      <motion.div
        style={{ scale, opacity }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Ready to Be Part of{" "}
            <span className="text-fuchsia-400">Something Epic?</span>
          </h2>

          <p className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto mb-8">
            Don&apos;t miss out on the cultural event of the year. Register now
            and secure your spot at MASS 2K26.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-lg shadow-fuchsia-500/25"
            >
              <Ticket size={18} />
              Register Now
            </Link>
            <Link
              href="/events"
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/10 text-neutral-400 hover:text-white hover:border-white/25 transition-all text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97]"
            >
              <Calendar size={16} /> Explore Events
            </Link>
          </div>

          {/* Quick link cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg sm:max-w-2xl mx-auto">
            <Link
              href="/events"
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-rose-500/30 hover:bg-rose-500/5 transition-all group active:scale-[0.97]"
            >
              <BookOpen className="w-5 h-5 text-rose-400 mb-2 mx-auto" />
              <p className="text-white text-sm font-medium">Events</p>
              <p className="text-neutral-600 text-xs">15+ events</p>
            </Link>
            <Link
              href="/rules"
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group active:scale-[0.97]"
            >
              <Shield className="w-5 h-5 text-amber-400 mb-2 mx-auto" />
              <p className="text-white text-sm font-medium">Rules</p>
              <p className="text-neutral-600 text-xs">Guidelines</p>
            </Link>
            <Link
              href="/faq"
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all group active:scale-[0.97]"
            >
              <Star className="w-5 h-5 text-cyan-400 mb-2 mx-auto" />
              <p className="text-white text-sm font-medium">FAQ</p>
              <p className="text-neutral-600 text-xs">Get answers</p>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

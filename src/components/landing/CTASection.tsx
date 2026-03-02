"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Ticket, Star } from "lucide-react";
import { MovingBorderButton } from "@/components/ui/moving-border";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section ref={ref} className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

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
          

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Ready to Be Part of{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Something Epic?
            </span>
          </h2>

          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Don&apos;t miss out on the cultural event of the year. Register now
            and secure your spot at MASS 2K26.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <MovingBorderButton
                as="div"
                borderRadius="1.75rem"
                className="px-8 py-4 font-semibold text-base"
                containerClassName="h-14"
                duration={3000}
              >
                <Ticket size={18} className="mr-2" />
                Register Now
              </MovingBorderButton>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

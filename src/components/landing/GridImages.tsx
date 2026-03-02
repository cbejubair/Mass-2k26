"use client";

import React from "react";
import { motion } from "framer-motion";

const images = [
  { src: "/logo.png", alt: "MASS Event 1", span: "col-span-2 row-span-2" },
  { src: "/logo.png", alt: "MASS Event 2", span: "col-span-1 row-span-1" },
  { src: "/logo.png", alt: "MASS Event 3", span: "col-span-1 row-span-1" },
  { src: "/logo.png", alt: "MASS Event 4", span: "col-span-1 row-span-2" },
  { src: "/logo.png", alt: "MASS Event 5", span: "col-span-1 row-span-1" },
  { src: "/logo.png", alt: "MASS Event 6", span: "col-span-1 row-span-1" },
];

export default function GridImages() {
  return (
    <section id="gallery" className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Event{" "}
            <span className="bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Gallery
            </span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Moments captured from our past events
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className={`${img.span} relative group rounded-2xl overflow-hidden cursor-pointer`}
            >
              {/* Gradient placeholder (replace with actual images) */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[hsl(240,10%,8%)] to-indigo-900/40" />

              {/* Center logo as placeholder */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-16 h-16 object-contain"
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-all duration-300" />

              {/* Grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(139,92,246,0.3) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

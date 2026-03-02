"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Pause, Play } from "lucide-react";

export default function MusicCD() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const rotation = useRef(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        rotation.current = (rotation.current + 0.5) % 360;
        const el = document.getElementById("music-cd-disc");
        if (el) {
          el.style.transform = `rotate(${rotation.current}deg)`;
        }
        animRef.current = requestAnimationFrame(animate);
      };
      animRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animRef.current);
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 50 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      >
        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-2xl shadow-purple-500/30 flex items-center justify-center group"
        >
          {/* CD Disc visual */}
          <div
            id="music-cd-disc"
            className="absolute inset-1 rounded-full border-2 border-white/10"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3), rgba(139,92,246,0.3), rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {isPlaying ? (
              <Pause size={18} className="text-white" />
            ) : (
              <Play size={18} className="text-white ml-0.5" />
            )}
          </div>

          {/* Pulse ring when playing */}
          {isPlaying && (
            <>
              <span className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
              <span className="absolute -inset-1 rounded-full border border-purple-500/20 animate-pulse" />
            </>
          )}
        </motion.button>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-xs text-neutral-400"
        >
          <Music size={12} className="text-purple-400" />
          {isPlaying ? "Now Playing" : "Play Music"}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

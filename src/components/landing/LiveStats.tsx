"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Music, Trophy, Ticket, TrendingUp } from "lucide-react";

interface Stats {
  totalStudents: number;
  totalRegistered: number;
  totalPerformances: number;
  approvedPerformances: number;
  totalPerformers: number;
  approvedPayments: number;
  checkedIn: number;
}

function AnimatedCounter({
  value,
  duration = 2,
}: {
  value: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const end = value;
    const stepTime = Math.max(Math.floor((duration * 1000) / end), 16);
    const increment = Math.max(1, Math.floor(end / (duration * 60)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <>{count}</>;
}

const statConfig = [
  {
    key: "totalStudents" as keyof Stats,
    label: "Registered",
    icon: Users,
    color: "text-cyan-400",
    bg: "bg-cyan-500",
    border: "border-cyan-500/20",
    cardBg: "bg-cyan-500/5",
  },
  {
    key: "totalPerformers" as keyof Stats,
    label: "Performers",
    icon: Music,
    color: "text-fuchsia-400",
    bg: "bg-fuchsia-500",
    border: "border-fuchsia-500/20",
    cardBg: "bg-fuchsia-500/5",
  },
//   {
//     key: "totalPerformances" as keyof Stats,
//     label: "Performances",
//     icon: Trophy,
//     color: "text-amber-400",
//     bg: "bg-amber-500",
//     border: "border-amber-500/20",
//     cardBg: "bg-amber-500/5",
//   }
];

export default function LiveStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Silently fail — show fallback
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-14 md:py-20 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-fuchsia-400" />
            Live Stats
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2">
            MEGA MASS 2K26 <span className="text-fuchsia-400">by the Numbers</span>
          </h2>
          <p className="text-neutral-500 text-xs sm:text-sm max-w-md mx-auto">
            Real-time statistics updated every 30 seconds
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {statConfig.map((cfg, index) => {
            const Icon = cfg.icon;
            const value = (stats ? stats[cfg.key] : 0)+25;

            return (
              <motion.div
                key={cfg.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-4 md:p-6 rounded-2xl border ${cfg.border} ${cfg.cardBg} group cursor-default`}
              >
                <div className="relative z-10">
                  <div
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${cfg.bg} flex items-center justify-center mb-3`}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div
                    className={`text-2xl sm:text-3xl md:text-4xl font-extrabold ${cfg.color}`}
                  >
                    {loading ? (
                      <div className="h-9 w-16 rounded-lg bg-white/5 animate-pulse" />
                    ) : (
                      <AnimatedCounter value={value} />
                    )}
                  </div>
                  <div className="text-neutral-500 text-xs md:text-sm mt-1 font-medium">
                    {cfg.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

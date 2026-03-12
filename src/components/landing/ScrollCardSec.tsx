"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

const events = [
  {
    day: "Timeline",
    date: "March 2026",
    events: [
      {
        time: "Before March 18",
        title: "Money Settlement",
        venue: "Accounts & Coordinator Desk",
        color: "bg-purple-500",
      },
      {
        time: "March 20",
        title: "Registration & Song Submission Deadline",
        venue: "Online ",
        color: "bg-pink-500",
      },
      {
        time: "March 27",
        title: "Rehearsal",
        venue: "college campus",
        color: "bg-blue-500",
      },
      {
        time: "March 28",
        title: "Event Day",
        venue: "Outdoor Arena",
        color: "bg-amber-500",
      },
    ],
  },
];

export default function ScrollCardSec() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      id="events"
      className="relative py-24 md:py-32 overflow-hidden"
      ref={containerRef}
    >
      {/* Background decoration */}
      <motion.div
        style={{ y }}
        className="absolute top-20 right-0 w-72 h-72 rounded-full bg-fuchsia-500/5 blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
        className="absolute bottom-20 left-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-4">
            Event <span className="text-amber-400">Schedule</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
            Single-day event timeline for March 28
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {events.map((day, dayIdx) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: dayIdx === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: dayIdx * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="rounded-2xl border border-white/10 bg-[hsl(240,10%,5.9%)] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="px-4 py-1.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 font-semibold text-sm">
                    {day.day}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Calendar size={14} />
                    {day.date}
                  </div>
                </div>

                <div className="space-y-4">
                  {day.events.map((event, idx) => (
                    <motion.div
                      key={event.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div
                        className={`w-1 h-full min-h-[3rem] rounded-full ${event.color} shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-neutral-500 text-xs mb-1">
                          <Clock size={12} />
                          {event.time}
                        </div>
                        <h4 className="text-white font-medium group-hover:text-fuchsia-400 transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-neutral-500 text-xs mt-1">
                          <MapPin size={12} />
                          {event.venue}
                        </div>
                      </div>
                      {/* <ArrowRight
                        size={16}
                        className="text-neutral-600 group-hover:text-purple-400 mt-2 transition-all group-hover:translate-x-1"
                      /> */}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

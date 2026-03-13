"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FestivalBackground from "@/components/landing/FestivalBackground";
import EventCards from "@/components/events/event-cards";

/* ------------------------------------------------------------------ */
/*  Event Data                                                         */
/* ------------------------------------------------------------------ */
type EventCategory = "dance" | "music" | "drama" | "art" | "fun";

interface FestEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  teamSize: string;
  duration: string;
  prize: string;
  imageSrc: string;
}

const events: FestEvent[] = [
  {
    id: "solo-dance",
    title: "Solo Dance",
    category: "dance",
    description:
      "Showcase your individual dance talent. Any style — classical, western, folk, freestyle. Impress the judges with your moves!",
    teamSize: "1",
    duration: "3-5 min",
    prize: "₹5,000",
    imageSrc:
      "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "group-dance",
    title: "Group Dance",
    category: "dance",
    description:
      "Assemble your crew and light up the stage! Coordination, costumes, and choreography — let your team energy electrify the crowd.",
    teamSize: "4-15",
    duration: "5-8 min",
    prize: "₹10,000",
    imageSrc:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "solo-singing",
    title: "Solo Singing",
    category: "music",
    description:
      "Got vocals? Take the mic and sing your heart out. Any language, any genre — from melody to rap, we want to hear it all.",
    teamSize: "1",
    duration: "3-5 min",
    prize: "₹5,000",
    imageSrc:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "instrumental",
    title: "Instrumental",
    category: "music",
    description:
      "Let your instrument do the talking. Guitar, keyboard, drums, flute, violin — solo or fusion, just make it memorable.",
    teamSize: "1-4",
    duration: "3-6 min",
    prize: "₹5,000",
    imageSrc:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "mime",
    title: "Mime / Silent Act",
    category: "drama",
    description:
      "Express without words. Let your body language, expressions, and creativity convey the story in complete silence.",
    teamSize: "1-5",
    duration: "3-6 min",
    prize: "₹3,000",
    imageSrc:
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "dj-night",
    title: "DJ Night",
    category: "fun",
    description:
      "The grand finale! Professional DJ, LED lights, smoke machines, and the entire crowd going wild. This is what MASS 2K26 is all about.",
    teamSize: "All",
    duration: "3-4 hours",
    prize: "—",
    imageSrc:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1400&q=80",
  },
];

const categories: {
  id: EventCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All Events" },
  { id: "dance", label: "Dance" },
  { id: "music", label: "Music" },
  { id: "drama", label: "Drama" },
  { id: "art", label: "Art" },
  { id: "fun", label: "Fun & Specials" },
];

/* ------------------------------------------------------------------ */
/*  Events Page                                                        */
/* ------------------------------------------------------------------ */
export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  const filteredEvents = events.filter((e) => {
    const matchCategory =
      activeCategory === "all" || e.category === activeCategory;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const stackItems = filteredEvents.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    imageSrc: event.imageSrc,
    category: event.category,
    teamSize: event.teamSize,
    duration: event.duration,
    prize: event.prize,
    ctaLabel: "View rules in Rules page",
    href: "/rules",
  }));

  return (
    <main className="relative bg-[hsl(240,10%,3.9%)] min-h-screen overflow-x-hidden">
      <FestivalBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-96 h-96 bg-fuchsia-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link> */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4">
              Event <span className="text-fuchsia-400">Lineup</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mb-8">
              {events.length} events across dance, music, drama, art, and more.
              Find your stage and register to perform!
            </p>
          </motion.div>

          {/* Search */}
          {/* <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            />
          </div> */}

          {/* Category tabs */}
          {/* <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  activeCategory === cat.id
                    ? "bg-white/10 border-white/20 text-white shadow-sm"
                    : "border-white/5 text-neutral-500 hover:text-neutral-300 hover:border-white/15"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div> */}
        </div>
      </section>

      {/* Events Stack */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {stackItems.length > 0 ? <EventCards items={stackItems} /> : null}

          {stackItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">
                No events found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

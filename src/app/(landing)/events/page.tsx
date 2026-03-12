"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Music,
  Mic2,
  Drama,
  Palette,
  Camera,
  Guitar,
  PartyPopper,
  Sparkles,
  Users,
  Clock,
  Trophy,
  ArrowLeft,
  Search,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FestivalBackground from "@/components/landing/FestivalBackground";

/* ------------------------------------------------------------------ */
/*  Event Data                                                         */
/* ------------------------------------------------------------------ */
type EventCategory = "dance" | "music" | "drama" | "art" | "literary" | "fun";

interface FestEvent {
  id: string;
  title: string;
  category: EventCategory;
  description: string;
  teamSize: string;
  duration: string;
  prize: string;
  rules: string[];
  icon: React.ElementType;
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
    rules: [
      "Song must be submitted 3 days prior",
      "No vulgarity or offensive content",
      "Props allowed with prior approval",
      "Time limit strictly enforced",
    ],
    icon: Sparkles,
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
    rules: [
      "Minimum 4, maximum 15 participants",
      "Music track must be pre-submitted",
      "Costumes and props allowed",
      "DJ mashups and medleys encouraged",
    ],
    icon: Users,
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
    rules: [
      "Karaoke track or live instrument accompaniment",
      "No playback singing allowed",
      "Any language accepted",
      "Original compositions earn bonus points",
    ],
    icon: Mic2,
  },
  {
    id: "group-singing",
    title: "Group Singing / Band",
    category: "music",
    description:
      "Form a band or choir and create magic. Harmonies, instruments, and stage presence — show us what your team is made of.",
    teamSize: "2-8",
    duration: "5-8 min",
    prize: "₹8,000",
    rules: [
      "Instruments must be self-arranged",
      "At least 2 vocalists required",
      "Sound check slot will be allotted",
      "No pre-recorded backing tracks",
    ],
    icon: Music,
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
    rules: [
      "Bring your own instruments",
      "Fusion of instruments allowed",
      "No backing tracks",
      "Amplifiers provided for guitar",
    ],
    icon: Guitar,
  },
  {
    id: "karaoke",
    title: "Karaoke",
    category: "music",
    description:
      "Pick your favourite song from our list and sing along! It's fun, it's casual, and the crowd is your judge.",
    teamSize: "1",
    duration: "3 min",
    prize: "₹2,000",
    rules: [
      "Song selected from provided karaoke list",
      "No external tracks",
      "Audience engagement encouraged",
      "Judged on entertainment value",
    ],
    icon: Mic2,
  },
  {
    id: "skit-drama",
    title: "Skit / Drama",
    category: "drama",
    description:
      "Tell a story on stage. Comedy, social message, or pure drama — your team has the spotlight to captivate the audience.",
    teamSize: "3-10",
    duration: "8-12 min",
    prize: "₹8,000",
    rules: [
      "Theme can be chosen freely",
      "Props and costumes allowed",
      "No offensive or political content",
      "Script synopsis must be pre-submitted",
    ],
    icon: Drama,
  },
  {
    id: "standup-comedy",
    title: "Stand-Up Comedy",
    category: "drama",
    description:
      "Make the crowd laugh! Original jokes, observational humor, college life comedy — the stage is yours to own.",
    teamSize: "1",
    duration: "5-7 min",
    prize: "₹3,000",
    rules: [
      "Original content only",
      "No personal attacks or bullying",
      "College-friendly humor",
      "Audience reaction matters",
    ],
    icon: PartyPopper,
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
    rules: [
      "No dialogue or sound effects",
      "Background music allowed",
      "Face paint and costumes encouraged",
      "Story clarity is key judging criteria",
    ],
    icon: Drama,
  },
  {
    id: "fashion-show",
    title: "Fashion Show",
    category: "fun",
    description:
      "Walk the ramp with style! Theme-based fashion, traditional or contemporary — bring your A-game to the catwalk.",
    teamSize: "5-12",
    duration: "8-10 min",
    prize: "₹8,000",
    rules: [
      "Theme must be pre-declared",
      "Costumes and makeup self-arranged",
      "Choreography matters as much as outfits",
      "No inappropriate attire",
    ],
    icon: Sparkles,
  },
  {
    id: "beatbox",
    title: "Beatbox Battle",
    category: "music",
    description:
      "Drop beats with nothing but your mouth. Solo or battle format — show us your rhythm, bass, and vocal percussion skills.",
    teamSize: "1",
    duration: "3 min per round",
    prize: "₹3,000",
    rules: [
      "No external instruments or effects",
      "Battle rounds: 1v1 elimination",
      "Audience vote counts in finals",
      "Loop pedals not allowed",
    ],
    icon: Mic2,
  },
  {
    id: "rap-battle",
    title: "Rap Battle",
    category: "music",
    description:
      "Bars, flow, and wordplay. Freestyle or prepared — step into the cypher and prove you've got the sharpest lyrics.",
    teamSize: "1",
    duration: "2-3 min per round",
    prize: "₹3,000",
    rules: [
      "No personal attacks on opponents",
      "Any language accepted",
      "Freestyle rounds in finals",
      "Beat will be provided",
    ],
    icon: Mic2,
  },
  {
    id: "photography",
    title: "Photography Contest",
    category: "art",
    description:
      "Capture the fest through your lens. On-the-spot photography challenge with a surprise theme revealed on event day.",
    teamSize: "1",
    duration: "Full day",
    prize: "₹3,000",
    rules: [
      "DSLR or mobile phone allowed",
      "No pre-shot images",
      "Theme announced on event day",
      "Basic editing allowed, no compositing",
    ],
    icon: Camera,
  },
  {
    id: "art-expo",
    title: "Art Expo / Painting",
    category: "art",
    description:
      "Canvas, colors, and creativity. Participate in live art creation or submit your masterpiece for the art exhibition.",
    teamSize: "1",
    duration: "2-3 hours",
    prize: "₹3,000",
    rules: [
      "Art materials self-arranged",
      "Canvas provided for live art",
      "Theme announced on spot",
      "Digital art submissions allowed",
    ],
    icon: Palette,
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
    rules: [
      "Entry via QR code only",
      "Song requests can be submitted in advance",
      "Follow safety guidelines",
      "Have the time of your life!",
    ],
    icon: Music,
  },
];

const categories: {
  id: EventCategory | "all";
  label: string;
  color: string;
}[] = [
  { id: "all", label: "All Events", color: "from-white to-gray-300" },
  { id: "dance", label: "Dance", color: "from-rose-400 to-pink-500" },
  { id: "music", label: "Music", color: "from-cyan-400 to-blue-500" },
  { id: "drama", label: "Drama", color: "from-amber-400 to-orange-500" },
  { id: "art", label: "Art", color: "from-emerald-400 to-green-500" },
  {
    id: "fun",
    label: "Fun & Specials",
    color: "from-fuchsia-400 to-purple-500",
  },
];

const categoryColors: Record<
  EventCategory,
  { gradient: string; bg: string; border: string; text: string }
> = {
  dance: {
    gradient: "from-rose-500 to-pink-600",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    text: "text-rose-400",
  },
  music: {
    gradient: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },
  drama: {
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  art: {
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },
  literary: {
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
  },
  fun: {
    gradient: "from-fuchsia-500 to-purple-600",
    bg: "bg-fuchsia-500/10",
    border: "border-fuchsia-500/20",
    text: "text-fuchsia-400",
  },
};

/* ------------------------------------------------------------------ */
/*  Event Card Component                                               */
/* ------------------------------------------------------------------ */
function EventCard({ event, index }: { event: FestEvent; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const colors = categoryColors[event.category];
  const Icon = event.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className={`relative rounded-2xl border ${colors.border} ${colors.bg} backdrop-blur-sm overflow-hidden group hover:border-opacity-50 transition-all duration-300`}
    >
      {/* Top color band */}
      <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />

      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shrink-0 shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight">
              {event.title}
            </h3>
            <span
              className={`text-xs font-semibold ${colors.text} uppercase tracking-wide`}
            >
              {event.category}
            </span>
          </div>
        </div>

        <p className="text-neutral-400 text-sm leading-relaxed mb-4">
          {event.description}
        </p>

        {/* Quick Info */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Users className="w-3.5 h-3.5" />
            <span>{event.teamSize}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{event.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Trophy className="w-3.5 h-3.5" />
            <span>{event.prize}</span>
          </div>
        </div>

        {/* Expand Rules */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`text-xs font-semibold ${colors.text} hover:underline transition-colors`}
        >
          {expanded ? "Hide Rules ▲" : "View Rules ▼"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <ul className="mt-3 space-y-1.5">
                {event.rules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-neutral-500"
                  >
                    <span
                      className={`mt-0.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.gradient} shrink-0`}
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Events Page                                                        */
/* ------------------------------------------------------------------ */
export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState<EventCategory | "all">(
    "all",
  );
  const [search, setSearch] = useState("");

  const filtered = events.filter((e) => {
    const matchCategory =
      activeCategory === "all" || e.category === activeCategory;
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

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
          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((event, i) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
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

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, Search, HelpCircle } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FestivalBackground from "@/components/landing/FestivalBackground";

/* ------------------------------------------------------------------ */
/*  FAQ Data (organized by category)                                   */
/* ------------------------------------------------------------------ */
interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: FAQItem[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "general",
    title: "General",
    icon: "🎪",
    color: "from-fuchsia-500 to-purple-600",
    items: [
      {
        q: "What is MASS 2K26?",
        a: "MASS 2K26 is the grand intra-college cultural fest featuring live performances, competitions, DJ night, art showcases, and much more. It's the biggest cultural celebration of the year!",
      },
      {
        q: "When and where is the event?",
        a: "MASS 2K26 is scheduled for March 28, 2026, at the PPG IT College campus grounds. The event runs from morning until night with the DJ Night as the grand finale.",
      },
      {
        q: "Is attendance compulsory?",
        a: "Participation is optional, but whether attendance is compulsory will be announced officially by the management.",
      },
      {
        q: "Who can participate?",
        a: "All currently enrolled students of the college can participate. Some events are open to all years while others may have specific requirements.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment & Registration",
    icon: "💰",
    color: "from-emerald-500 to-green-600",
    items: [
      {
        q: "What will the ₹500 budget be used for?",
        a: "Stage setup, LED wall, DJ, professional lighting, sound system, videography, photography, and event production.",
      },
      {
        q: "₹500 is too much considering exam fees and other payments.",
        a: "Compared to most colleges (₹1000–₹1500 range), ₹500 is relatively moderate given the scale and production quality planned for MASS 2K26.",
      },
      {
        q: "Why can't it be reduced further?",
        a: "Reducing contribution directly reduces stage quality, lighting, DJ scale, and guest possibility. The budget directly impacts the overall experience level.",
      },
      {
        q: "I cannot pay via GPay or UPI. What can I do?",
        a: "Transfer money through a trusted person (friend/parent/guardian) and upload screenshot proof via the portal.",
      },
      {
        q: "What if I pay but the event is cancelled?",
        a: "A refund policy will be clearly communicated before final confirmation of the event.",
      },
    ],
  },
  {
    id: "performances",
    title: "Performances & Events",
    icon: "🎤",
    color: "from-cyan-500 to-blue-600",
    items: [
      {
        q: "How do I register for a performance?",
        a: "Log in to the portal, navigate to the Performance section, select your event type, fill in details about your team (if applicable), and submit. Your coordinator will verify the registration.",
      },
      {
        q: "Can I participate in multiple events?",
        a: "Yes! You can register for multiple performances. However, ensure there are no scheduling conflicts on the event day.",
      },
      {
        q: "Will rehearsal time affect academic sessions?",
        a: "Practice is allowed only with department OD (on-duty) approval. Coordinate with your class coordinator.",
      },
      {
        q: "Can we request specific songs for the DJ?",
        a: "Song suggestions may be collected from students before the final playlist is locked in.",
      },
      {
        q: "Is DJ confirmed?",
        a: "Yes. A well-qualified DJ has been requested and the booking process is ongoing.",
      },
    ],
  },
  {
    id: "logistics",
    title: "Logistics & Safety",
    icon: "🛡️",
    color: "from-amber-500 to-orange-600",
    items: [
      {
        q: "How will entry be controlled?",
        a: "A QR-based scanning system will be used for validated students — accessible through the portal. Each student gets a unique QR code after payment verification.",
      },
      {
        q: "What safety measures will be taken for a night event?",
        a: "Security staff, controlled entry via QR scanning, and proper lighting will be in place throughout the venue.",
      },
      {
        q: "If the event ends at 9 PM, will transport be provided?",
        a: "If approved, transport feasibility will depend on student count and logistics. Survey data will help determine this.",
      },
      {
        q: "What about long-distance day scholars?",
        a: "Survey data will determine whether college transport is arranged for long-distance students.",
      },
      {
        q: "Will there be dress code restrictions?",
        a: "Final guidelines will be announced by management. No strict restrictions are expected.",
      },
      {
        q: "Will food stalls be available?",
        a: "Yes, planning for paid food stalls inside campus. Lunch/dinner is not included in the registration fee.",
      },
    ],
  },
  {
    id: "media",
    title: "Media & Coverage",
    icon: "📸",
    color: "from-rose-500 to-pink-600",
    items: [
      {
        q: "Will photography and videography be professional?",
        a: "Yes. Full professional media coverage is planned for the event. Photos and videos will be shared post-event.",
      },
      {
        q: "Will there be a celebrity?",
        a: "If budget allows. Most recognized celebrities charge ₹1.5–2 lakh per day minimum. Updates will be shared as confirmed.",
      },
      {
        q: "Will strict discipline rules apply?",
        a: "Basic safety and management rules will apply throughout the event. Detailed guidelines are available in the Rules & Discipline section.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Item Component                                                 */
/* ------------------------------------------------------------------ */
function FAQItemCard({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      viewport={{ once: true }}
      className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
        open
          ? "border-fuchsia-500/30 bg-fuchsia-950/20"
          : "border-white/5 bg-white/[0.02] hover:border-white/10"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-neutral-200 leading-snug">
          {item.q}
        </span>
        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-white/10 text-fuchsia-400">
          {open ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm text-neutral-400 leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Page                                                           */
/* ------------------------------------------------------------------ */
export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(
      (cat) =>
        (activeCategory === "all" || cat.id === activeCategory) &&
        cat.items.length > 0,
    );

  const totalItems = filteredCategories.reduce(
    (sum, c) => sum + c.items.length,
    0,
  );

  return (
    <main className="relative bg-[hsl(240,10%,3.9%)] min-h-screen overflow-x-hidden">
      <FestivalBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-1/3 w-96 h-96 bg-purple-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs mb-4">
              <HelpCircle className="w-3.5 h-3.5" /> {totalItems} Questions
              Answered
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              Frequently Asked{" "}
              <span className="text-fuchsia-400">Questions</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-xl">
              Everything you need to know about MASS 2K26 — organized by topic
              for easy browsing.
            </p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md mt-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-fuchsia-500/50 transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                activeCategory === "all"
                  ? "bg-white/10 border-white/20 text-white"
                  : "border-white/5 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              All Topics
            </button>
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                  activeCategory === cat.id
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/5 text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {cat.icon} {cat.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="relative pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {filteredCategories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-lg`}
                >
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">{cat.title}</h2>
                  <p className="text-neutral-500 text-xs">
                    {cat.items.length} questions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {cat.items.map((item, i) => (
                  <FAQItemCard key={i} item={item} index={i} />
                ))}
              </div>
            </motion.div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">
                No questions match your search.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

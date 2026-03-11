"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
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
    q: "Will there be a celebrity?",
    a: "If budget allows. Most recognized celebrities charge ₹1.5–2 lakh per day minimum.",
  },
  {
    q: "Will lunch or dinner be provided?",
    a: "Not planned for this year. Focus is on stage production and entertainment.",
  },
  {
    q: "Will food stalls be available?",
    a: "Yes, planning for paid food stalls inside campus.",
  },
  {
    q: "I cannot pay via GPay or UPI. What can I do?",
    a: "Transfer money through a trusted person (friend/parent/guardian) and upload screenshot proof via the portal.",
  },
  {
    q: "What if I pay but the event is cancelled?",
    a: "A refund policy will be clearly communicated before final confirmation of the event.",
  },
  {
    q: "If Annual Day is on the same date, what is the college contribution?",
    a: "Management contribution details will be clarified officially before event finalization.",
  },
  {
    q: "If the event ends at 9 PM, will transport be provided?",
    a: "If approved, transport feasibility will depend on student count and logistics.",
  },
  {
    q: "What about long-distance day scholars?",
    a: "Survey data will determine whether college transport is arranged for long-distance students.",
  },
  {
    q: "Is attendance compulsory?",
    a: "Participation is optional, but whether attendance is compulsory will be announced officially.",
  },
  {
    q: "Is DJ confirmed?",
    a: "Yes. A well-qualified DJ has been requested and the booking process is ongoing.",
  },
  {
    q: "Will there be dress code restrictions?",
    a: "Final guidelines will be announced by management. No strict restrictions are expected.",
  },
  {
    q: "What safety measures will be taken for a night event?",
    a: "Security staff, controlled entry via QR scanning, and proper lighting will be in place.",
  },
  {
    q: "Will photography and videography be professional?",
    a: "Yes. Full professional media coverage is planned for the event.",
  },
  {
    q: "Can we request specific songs for the DJ?",
    a: "Song suggestions may be collected from students before the final playlist is locked in.",
  },
  {
    q: "Will rehearsal time affect academic sessions?",
    a: "Practice is allowed only with department OD (on-duty) approval.",
  },
  {
    q: "How will entry be controlled?",
    a: "A QR-based scanning system will be used for validated students — accessible through the portal.",
  },
  {
    q: "Will there be strict discipline rules?",
    a: "Basic safety and management rules will apply throughout the event.",
  },
];

function FAQItem({
  item,
  index,
}: {
  item: { q: string; a: string };
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      viewport={{ once: true }}
      className={`rounded-xl border transition-colors duration-200 overflow-hidden ${
        open
          ? "border-purple-500/40 bg-purple-950/20"
          : "border-white/5 bg-white/[0.02] hover:border-white/10"
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-start gap-3">
          <span className="mt-0.5 min-w-[1.5rem] text-xs font-mono text-purple-500/60 select-none">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-medium text-neutral-200 leading-snug">
            {item.q}
          </span>
        </span>
        <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border border-white/10 text-purple-400">
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
            <p className="px-5 pb-4 pl-14 text-sm text-neutral-400 leading-relaxed">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-24">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[400px] rounded-full bg-purple-900/10 blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs mb-4">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-neutral-500 max-w-md mx-auto">
            Everything students want to know about MASS 2K26 — answered
            honestly.
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-2">
          {faqs.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

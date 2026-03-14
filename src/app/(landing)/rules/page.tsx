"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Ban,
  Clock,
  Users,
  Phone,
  Shirt,
  Camera,
  Volume2,
  Flame,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FestivalBackground from "@/components/landing/FestivalBackground";

/* ------------------------------------------------------------------ */
/*  Rules & Guidelines Data                                            */
/* ------------------------------------------------------------------ */
interface RuleSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgColor: string;
  rules: string[];
}

const ruleSections: RuleSection[] = [
  {
    id: "entry",
    title: "Entry & Access",
    icon: Shield,
    color: "from-cyan-500 to-blue-600",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    rules: [
      "Entry is permitted ONLY through a valid QR code generated via the MASS 2K26 portal",
      "QR code will be activated only after payment verification by your class coordinator",
      "Each QR code is unique and non-transferable — sharing or duplicating will lead to disqualification",
      "Entry and exit times will be recorded through QR scanning",
      "Lost or invalid QR codes must be reported to the nearest coordinator immediately",
      "Re-entry is allowed but must be scanned each time",
    ],
  },
  {
    id: "discipline",
    title: "Discipline & Conduct",
    icon: AlertTriangle,
    color: "from-amber-500 to-orange-600",
    borderColor: "border-amber-500/20",
    bgColor: "bg-amber-500/5",
    rules: [
      "All participants must behave respectfully towards fellow students, staff, and event volunteers",
      "Any form of ragging, bullying, harassment, or discrimination will result in immediate removal from the event",
      "Verbal or physical altercations will lead to disciplinary action by the college management",
      "Students are expected to follow instructions from coordinators and security personnel",
      "Damage to college property, stage equipment, or event infrastructure will be penalized",
      "Students found intoxicated or under the influence of any substance will be escorted out immediately",
    ],
  },
  {
    id: "prohibited",
    title: "Prohibited Items & Actions",
    icon: Ban,
    color: "from-rose-500 to-red-600",
    borderColor: "border-rose-500/20",
    bgColor: "bg-rose-500/5",
    rules: [
      "Alcohol, drugs, cigarettes, and any intoxicating substances are STRICTLY PROHIBITED",
      "Weapons, sharp objects, firecrackers, and hazardous materials are not allowed",
      "No outside food or beverages (food stalls will be available on campus)",
      "Illegal activities of any kind will result in immediate involvement of authorities",
      "No unauthorized drones, recording equipment, or streaming devices",
      "Use of laser pointers toward the stage is strictly prohibited",
    ],
  },
  {
    id: "performances",
    title: "Performance Rules",
    icon: Volume2,
    color: "from-fuchsia-500 to-purple-600",
    borderColor: "border-fuchsia-500/20",
    bgColor: "bg-fuchsia-500/5",
    rules: [
      "All performances must be registered and approved through the portal before the deadline",
      "Music tracks / karaoke files must be submitted at least 3 days before the event",
      "Maximum song/performance duration is 5 minutes",
      "Repeated songs are not allowed",
      "Performance songs allowed on a first-come, first-served basis",
      "Group dance teams must have a minimum of 3 and a maximum of 15 members",
      "Costumes and props are the sole responsibility of the performance team",
      "Mandatory rehearsal will be conducted before the event",
      "Performance time limits will be strictly enforced — exceeding time leads to point deduction",
      "Content must be college-appropriate — no vulgar, offensive, or politically provocative material",
      "Props and costumes are allowed but must be approved by the event committee in advance",
      "Performers must report to the backstage area 30 minutes before their scheduled slot",
      "Sound check slots will be allotted — attendance is mandatory",
      "Any changes in team composition must be reported to the coordinator 24 hours prior",
    ],
  },
  {
    id: "timing",
    title: "Timing & Schedule",
    icon: Clock,
    color: "from-emerald-500 to-green-600",
    borderColor: "border-emerald-500/20",
    bgColor: "bg-emerald-500/5",
    rules: [
      "The event begins sharp at the announced time — late arrivals may miss their slots",
      "Event schedule is final and will not be rearranged for individual convenience",
      "Breaks will be announced — use break time for refreshments",
      "The DJ Night is the closing event — ensure you complete check-out by the announced time",
      "Transport arrangements (if applicable) will follow a strict departure schedule",
    ],
  },
  {
    id: "dresscode",
    title: "Dress Code",
    icon: Shirt,
    color: "from-blue-500 to-indigo-600",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    rules: [
      "General dress code: Smart casual or ethnic wear is recommended",
      "Performance costumes can be specific to the act but must remain decent",
      "No offensive or provocative clothing with inappropriate messages or symbols",
      "College ID card must be carried at all times during the event",
      "Footwear appropriate for outdoor events is recommended",
    ],
  },
  {
    id: "safety",
    title: "Safety & Emergency",
    icon: Flame,
    color: "from-orange-500 to-red-600",
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
    rules: [
      "First-aid stations will be set up across the venue",
      "Emergency exits will be clearly marked — familiarize yourself on arrival",
      "In case of medical emergency, contact the nearest coordinator or security personnel",
      "Fire extinguishers and safety equipment will be available at all key locations",
      "Follow all safety announcements and evacuation procedures if announced",
      "Report suspicious activity to security immediately",
    ],
  },
  {
    id: "media",
    title: "Photography & Media",
    icon: Camera,
    color: "from-pink-500 to-rose-600",
    borderColor: "border-pink-500/20",
    bgColor: "bg-pink-500/5",
    rules: [
      "Official photography and videography will be handled by the designated media team",
      "Personal photography is allowed but must not disrupt performances or other attendees",
      "Flash photography during performances is discouraged",
      "By attending the event, you consent to being photographed/recorded for official event coverage",
      "Unauthorized live streaming of performances is prohibited",
    ],
  },
  {
    id: "coordinators",
    title: "Coordinator Responsibilities",
    icon: Users,
    color: "from-violet-500 to-purple-600",
    borderColor: "border-violet-500/20",
    bgColor: "bg-violet-500/5",
    rules: [
      "Class coordinators are the primary contact for all queries relating to their class/section",
      "Payment verification is done ONLY through the assigned class coordinator",
      "Coordinators must ensure their class students have completed registration before the deadline",
      "Performance slot allotment and schedule changes must be routed through the overall coordinators",
      "Emergency situations must be reported to staff coordinators immediately",
    ],
  },
];

const emergencyContacts = [
  { name: "Event Control Room", phone: "+91 84384 33361" },
  { name: "Staff Coordinator", phone: "TBA" },
  { name: "Overall Student Coordinator", phone: "TBA" },
];

/* ------------------------------------------------------------------ */
/*  Rules Page                                                         */
/* ------------------------------------------------------------------ */
export default function RulesPage() {
  return (
    <main className="relative bg-[hsl(240,10%,3.9%)] min-h-screen overflow-x-hidden">
      <FestivalBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-96 h-96 bg-amber-500/6 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-rose-500/6 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-4">
              <Shield className="w-3.5 h-3.5" /> Official Guidelines
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
              Rules & <span className="text-amber-400">Discipline</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl">
              Please read and follow these guidelines to ensure a safe,
              enjoyable, and memorable MASS 2K26 for everyone.
            </p>
          </motion.div>

          {/* Quick alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-300 font-semibold text-sm">Important</p>
              <p className="text-neutral-400 text-sm mt-1">
                Violation of any rules may result in removal from the event and
                further disciplinary action by the college management. All
                decisions by the organizing committee are final.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rules Sections */}
      <section className="relative pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quick navigation */}
          <div className="flex flex-wrap gap-2 mb-12">
            {ruleSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/5 text-neutral-500 hover:text-white hover:border-white/15 transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {ruleSections.map((section, sectionIdx) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.id}
                  id={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: sectionIdx * 0.05 }}
                  viewport={{ once: true }}
                  className={`rounded-2xl border ${section.borderColor} ${section.bgColor} overflow-hidden`}
                >
                  {/* Color band */}
                  <div className={`h-1 bg-gradient-to-r ${section.color}`} />

                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-white font-bold text-xl">
                        {section.title}
                      </h2>
                    </div>

                    <ul className="space-y-3">
                      {section.rules.map((rule, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
                          <span className="text-neutral-300 text-sm leading-relaxed">
                            {rule}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">
                  Emergency Contacts
                </h2>
                <p className="text-neutral-500 text-xs">
                  For urgent help during the event
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.name}
                  className="p-4 rounded-xl border border-white/5 bg-black/20"
                >
                  <p className="text-white font-semibold text-sm">
                    {contact.name}
                  </p>
                  <p className="text-rose-400 text-sm mt-1">{contact.phone}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Acknowledgment */}
      <section className="relative pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
          >
            <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl mx-auto">
              By registering and attending MASS 2K26, you acknowledge that you
              have read, understood, and agree to comply with all the rules and
              guidelines stated above. The organizing committee reserves the
              right to modify rules as needed. Any updates will be communicated
              through the official portal.
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

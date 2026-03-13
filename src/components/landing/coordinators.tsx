"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Phone, ChevronDown, Star } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & Data                                                       */
/* ------------------------------------------------------------------ */

type OverallPerson = {
  name: string;
  role: string;
  phone: string;
  photo: string;
};
type ClassCoord = { year: string; name: string; phone: string; photo: string };
type DeptData = {
  dept: string;
  color: string;
  ring: string;
  coords: ClassCoord[];
};

const overallCoordinators: {
  staff: OverallPerson[];
  students: OverallPerson[];
} = {
  staff: [
    {
      name: "Mr. Nithya Prakash",
      role: "Staff Coordinator",
      phone: "",
      photo: "/coordinator/boy.jpeg",
    },
    {
      name: "TBA",
      role: "Staff Coordinator",
      phone: "",
      photo: "/coordinator/boy.jpeg",
    },
  ],
  students: [
    {
      name: "TBA",
      role: "Overall Student Coordinator",
      phone: "",
      photo: "/coordinator/boy.jpeg",
    },
    {
      name: "TBA",
      role: "Overall Student Coordinator",
      phone: "",
      photo: "/coordinator/girl.jpeg",
    },
    {
      name: "TBA",
      role: "Overall Student Coordinator",
      phone: "",
      photo: "/coordinator/boy.jpeg",
    },
  ],
};

const departments: DeptData[] = [
  {
    dept: "CSE",
    color: "from-violet-500 to-purple-600",
    ring: "ring-violet-500/30",
    coords: [
      {
        year: "I - A",
        name: "Kopisha",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "I - B",
        name: "Naveen",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "I - B",
        name: "Vinil Raj",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "II - A",
        name: "Thavasi",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "II - B",
        name: "Jubair",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "III",
        name: "Sandhiya",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "IV",
        name: "Abishek",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
    ],
  },
  {
    dept: "ECE",
    color: "from-blue-500 to-cyan-500",
    ring: "ring-blue-500/30",
    coords: [
      {
        year: "I",
        name: "Thiraneesh",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "II",
        name: "Sree Sakthi",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "III",
        name: "Nakshatra",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      { year: "IV", name: "TBA", phone: "", photo: "/coordinator/boy.jpeg" },
    ],
  },
  {
    dept: "BME",
    color: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/30",
    coords: [
      {
        year: "I",
        name: "Prasanna",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      { year: "II", name: "David", phone: "", photo: "/coordinator/boy.jpeg" },
      {
        year: "III",
        name: "Tameema",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      { year: "IV", name: "Harish", phone: "", photo: "/coordinator/boy.jpeg" },
    ],
  },
  {
    dept: "AGRI",
    color: "from-lime-500 to-green-600",
    ring: "ring-lime-500/30",
    coords: [
      {
        year: "I",
        name: "Sano Jervin",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "II",
        name: "Somaprabha",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "III",
        name: "Nisha",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "IV",
        name: "Jaya Sounthari",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
    ],
  },
  {
    dept: "MECH",
    color: "from-orange-500 to-red-500",
    ring: "ring-orange-500/30",
    coords: [
      { year: "I", name: "Avinash", phone: "", photo: "/coordinator/boy.jpeg" },
      {
        year: "II",
        name: "Dharshan Sir",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "III",
        name: "Antony Abishek",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "IV",
        name: "Gubendran",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
    ],
  },
  {
    dept: "IT",
    color: "from-pink-500 to-rose-500",
    ring: "ring-pink-500/30",
    coords: [
      {
        year: "I - A",
        name: "Subash",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "I - B",
        name: "Santhosh",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "II",
        name: "Abishek",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "III",
        name: "Naveen",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "IV",
        name: "Aswin Pal",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
    ],
  },
  {
    dept: "AI & DS",
    color: "from-fuchsia-500 to-purple-500",
    ring: "ring-fuchsia-500/30",
    coords: [
      {
        year: "I",
        name: "Keerthana",
        phone: "",
        photo: "/coordinator/girl.jpeg",
      },
      {
        year: "II",
        name: "Gokul & Vedha Nayaki",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "III",
        name: "Vishal",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
      {
        year: "IV",
        name: "Sanjeev",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
    ],
  },
  {
    dept: "AI & ML",
    color: "from-amber-500 to-yellow-500",
    ring: "ring-amber-500/30",
    coords: [
      { year: "I", name: "Pranesh", phone: "", photo: "/coordinator/boy.jpeg" },
      { year: "II", name: "Aadhi", phone: "", photo: "/coordinator/boy.jpeg" },
      {
        year: "III",
        name: "Pradeep",
        phone: "",
        photo: "/coordinator/boy.jpeg",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string) {
  if (!name || name === "TBA") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function Avatar({
  name,
  gradient,
  photo,
  size = "md",
}: {
  name: string;
  gradient: string;
  photo?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-24 h-24 text-2xl"
      : size === "md"
        ? "w-14 h-14 text-lg"
        : "w-9 h-9 text-xs";

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt={name}
        className={`${dim} rounded-full object-cover shadow-lg ring-2 ring-white/20 shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-white/10 shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

function CallButton({ phone }: { phone: string }) {
  if (!phone) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 border border-dashed border-white/15 text-neutral-600 select-none">
        <Phone className="w-3 h-3" />
        Add number
      </span>
    );
  }
  return (
    <a
      href={`tel:${phone}`}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-200 active:scale-95"
    >
      <Phone className="w-3 h-3" />
      {phone}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Overall Coordinator Card                                           */
/* ------------------------------------------------------------------ */
function OverallCard({
  name,
  role,
  phone,
  photo,
  index,
  accent,
  isStaff,
}: OverallPerson & {
  index: number;
  accent: string;
  isStaff: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      viewport={{ once: true }}
      className="relative flex flex-col items-center gap-5 p-7 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 group overflow-hidden"
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${accent} blur-3xl`}
        style={{ opacity: 0, filter: "blur(60px)", transform: "scale(1.5)" }}
      />
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-[0.035] transition-opacity duration-500 bg-gradient-to-br ${accent}`}
      />

      {/* Top band */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent} opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
      />

      {isStaff && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <Star className="w-3 h-3 text-yellow-400/80 fill-yellow-400/60" />
            <span className="text-[9px] text-yellow-400/70 font-semibold uppercase tracking-wide">
              Staff
            </span>
          </div>
        </div>
      )}

      {/* Avatar with ring */}
      <div className={`rounded-full p-0.5 bg-gradient-to-br ${accent}`}>
        <div className="rounded-full p-0.5 bg-[hsl(240,10%,3.9%)]">
          <Avatar name={name} gradient={accent} photo={photo} size="lg" />
        </div>
      </div>

      <div className="text-center space-y-1.5 z-10">
        <p className="text-white font-bold text-base leading-tight">{name}</p>
        <p className="text-neutral-500 text-[11px]">{role}</p>
      </div>

      <CallButton phone={phone} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Department accordion card                                          */
/* ------------------------------------------------------------------ */
function DeptCard({
  dept,
  color,
  ring,
  coords,
  index,
}: DeptData & { index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      viewport={{ once: true }}
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden transition-all duration-300 ${
        open ? `ring-1 ${ring}` : ""
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-[10px] font-extrabold shadow-md shrink-0`}
          >
            {dept.length <= 3 ? dept : dept.split(" ")[0]}
          </span>
          <div className="text-left">
            <p className="text-white font-semibold text-sm">{dept}</p>
            <p className="text-neutral-500 text-xs">
              {coords.length} coordinator{coords.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mini avatar stack preview */}
          <div className="hidden sm:flex -space-x-2">
            {coords.slice(0, 3).map((c, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-black`}
              >
                {getInitials(c.name)}
              </div>
            ))}
            {coords.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[9px] font-bold text-neutral-400 ring-2 ring-black">
                +{coords.length - 3}
              </div>
            )}
          </div>

          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors" />
          </motion.div>
        </div>
      </button>

      {/* Expanded rows */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {coords.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 pl-3 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-colors"
                >
                  <Avatar
                    name={c.name}
                    gradient={color}
                    photo={c.photo}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate leading-tight">
                      {c.name}
                    </p>
                    <p
                      className={`text-[10px] font-semibold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
                    >
                      Year {c.year}
                    </p>
                  </div>

                  <CallButton phone={c.phone} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Coordinators Section                                          */
/* ------------------------------------------------------------------ */
export default function CoordinatorsSection() {
  const [activeTab, setActiveTab] = useState<"all" | string>("all");

  const tabs = ["all", ...departments.map((d) => d.dept)];
  const filtered =
    activeTab === "all"
      ? departments
      : departments.filter((d) => d.dept === activeTab);
  const totalCoords = departments.reduce((a, d) => a + d.coords.length, 0);

  return (
    <section id="coordinators" className="relative py-24">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-fuchsia-500/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs font-medium mb-4">
            <Users className="w-3.5 h-3.5" />
            Meet the Team
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Event <span className="text-fuchsia-400">Coordinators</span>
          </h2>
          <p className="mt-4 text-neutral-500 text-sm max-w-xl mx-auto leading-relaxed">
            The dedicated student &amp; staff coordinators making MASS 2K26
            happen — across all 8 departments.
          </p>

          {/* Stats strip */}
          {/* <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            {[
              { value: "3", label: "Staff" },
              { value: "3", label: "Student Overall" },
              { value: String(totalCoords), label: "Class Coords" },
              { value: "8", label: "Departments" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-neutral-600 text-[10px] mt-0.5 uppercase tracking-wide">
                  {s.label}
                </p>
              </div>
            ))}
          </div> */}
        </motion.div>

        {/* ── Staff Coordinators ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs uppercase tracking-widest text-neutral-600 font-semibold whitespace-nowrap">
              Staff Coordinators
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-fit">
              {overallCoordinators.staff.map((c, i) => (
                <OverallCard
                  key={i}
                  index={i}
                  name={c.name}
                  role={c.role}
                  phone={c.phone}
                  photo={c.photo}
                  accent="from-purple-500 to-indigo-600"
                  isStaff={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Overall Student Coordinators ── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5 mt-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-xs uppercase tracking-widest text-neutral-600 font-semibold whitespace-nowrap">
              Overall Student Coordinators
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {overallCoordinators.students.map((c, i) => (
              <OverallCard
                key={i}
                index={i}
                name={c.name}
                role={c.role}
                phone={c.phone}
                photo={c.photo}
                accent="from-pink-500 to-fuchsia-600"
                isStaff={false}
              />
            ))}
          </div>
        </div>

        {/* ── Class-wise section header ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs uppercase tracking-widest text-neutral-600 font-semibold whitespace-nowrap">
            Class-wise Coordinators · {totalCoords} Classes
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* ── Department filter tabs ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                activeTab === tab
                  ? "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300"
                  : "border-white/10 text-neutral-500 hover:text-neutral-300 hover:border-white/20"
              }`}
            >
              {tab === "all" ? "All Depts" : tab}
            </motion.button>
          ))}
        </div>

        {/* ── Department accordion cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((d, i) => (
              <DeptCard key={d.dept} index={i} {...d} />
            ))}
          </AnimatePresence>
        </div>

        {/* ── Bottom hint ── */}
        {/* <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center text-neutral-700 text-xs"
        >
          Tap a{" "}
          <span className="text-green-500/70 font-semibold">phone number</span>{" "}
          to call directly · Click a department card to expand coordinators
        </motion.p> */}
      </div>
    </section>
  );
}

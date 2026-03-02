"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Globe, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-black border-t border-white/10">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="MASS 2K26"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                MASS 2K26
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mt-4">
              The ultimate cultural extravaganza. Experience art, music, dance,
              and creativity under one roof.
            </p>
            {/* <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-purple-500/20 text-neutral-400 hover:text-purple-400 transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-purple-500/20 text-neutral-400 hover:text-purple-400 transition-all"
              >
                <Youtube size={18} />
              </a>
              <a
                href="#"
                className="p-2 rounded-full bg-white/5 hover:bg-purple-500/20 text-neutral-400 hover:text-purple-400 transition-all"
              >
                <Globe size={18} />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "About", "Events", "Highlights", "Gallery"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-neutral-400 hover:text-purple-400 text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-white font-semibold mb-4">Events</h3>
            <ul className="space-y-3">
              {[
                "Music Night",
                "Group Dance",
                "Solo Dance",
                "Kerokee",
                "Instrumental",
              ].map((item) => (
                <li key={item}>
                  <span className="text-neutral-400 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <MapPin size={16} className="text-purple-400 shrink-0" />
                PPG it College Ground
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Mail size={16} className="text-purple-400 shrink-0" />
                fineartsclub@ppg.edu.in
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Phone size={16} className="text-purple-400 shrink-0" />
                +91 84384 33361
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            Made with <span className="text-purple-400">♥</span> by the Abishek & Team.
          </p>
        </div>
      </div>
    </footer>
  );
}

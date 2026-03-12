"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube, Globe, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="relative bg-black border-t border-white/10">
      {/* Solid accent top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-fuchsia-500" />

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
              <span className="text-xl font-bold text-white">
                MASS <span className="text-fuchsia-400">2K26</span>
              </span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mt-4">
              The ultimate cultural extravaganza. Experience art, music, dance,
              and creativity under one roof.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Events", href: "/events" },
                { name: "Rules & Discipline", href: "/rules" },
                { name: "FAQ", href: "/faq" },
                { name: "Login / Register", href: "/login" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-neutral-400 hover:text-fuchsia-400 text-sm transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-white font-semibold mb-4">Events</h3>
            <ul className="space-y-3">
              {[
                "Solo Dance",
                "Group Dance",
                "Solo Singing",
                "Karaoke",
                "DJ Night",
                "Skit / Drama",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/events"
                    className="text-neutral-400 hover:text-cyan-400 text-sm transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <MapPin size={16} className="text-rose-400 shrink-0" />
                PPG IT College Ground
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Mail size={16} className="text-cyan-400 shrink-0" />
                fineartsclub@ppg.edu.in
              </li>
              <li className="flex items-center gap-3 text-neutral-400 text-sm">
                <Phone size={16} className="text-amber-400 shrink-0" />
                +91 84384 33361
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            Made with <span className="text-rose-400">♥</span> by Abishek &
            Team.
          </p>
          <div className="flex items-center gap-4 text-neutral-500 text-xs">
            <Link href="/rules" className="hover:text-white transition-colors">
              Rules
            </Link>
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/events" className="hover:text-white transition-colors">
              Events
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

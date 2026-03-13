"use client";

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { SpecialText } from "@/components/ui/special-text";

export default function DemoOne() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden pt-24 sm:pt-28">
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <WebGLShader />

      <div className="relative z-10 mx-auto w-full max-w-3xl border border-[#27272a] p-2">
        <main className="relative overflow-hidden border border-[#27272a] py-10">
          <div className="mb-3 flex items-center justify-center gap-2 text-white">
            <h1 className="text-center text-7xl font-extrabold tracking-tighter md:text-[clamp(2rem,8vw,7rem)]">
              <SpecialText
                className="!h-auto !leading-none text-[clamp(2rem,8vw,7rem)] font-extrabold tracking-tighter"
                inView
              >
                MASS 2k26
              </SpecialText>
            </h1>
          </div>
          <p className="px-6 text-center text-xs text-white/60 md:text-sm lg:text-lg">
            Join PPG IT College for Mega Mass 2k26 — a day packed with
            electrifying performances, fun competitions, and unforgettable
            campus vibes.
          </p>
          <div className="my-8 flex items-center justify-center gap-1">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p className="text-xs text-green-500">𝙈𝙀𝙂𝘼 𝙈𝘼𝙎𝙎 2𝙆26 𝙞𝙨 𝙇𝙤𝙖𝙙𝙞𝙣𝙜</p>
          </div>

          <div className="flex justify-center">
            <LiquidButton className="rounded-full border text-white" size="xl">
              Login Now
            </LiquidButton>
          </div>
        </main>
      </div>
    </div>
  );
}

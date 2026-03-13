"use client";

import { Clock, Trophy, Users } from "lucide-react";

import { CardStack, CardStackItem } from "@/components/ui/card-stack";

type EventCardItem = CardStackItem & {
  teamSize: string;
  duration: string;
  prize: string;
  category: string;
};

type EventCardsProps = {
  items: EventCardItem[];
};

export default function EventCards({ items }: EventCardsProps) {
  return (
    <div className="w-full">
      <CardStack
        items={items}
        initialIndex={0}
        autoAdvance
        intervalMs={2400}
        pauseOnHover
        showDots
        maxVisible={5}
        cardWidth={560}
        cardHeight={360}
        className="mx-auto max-w-6xl"
        renderCard={(item, state) => (
          <div className="relative h-full w-full overflow-hidden rounded-2xl">
            <div className="absolute inset-0">
              {item.imageSrc ? (
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-800 text-sm text-neutral-400">
                  No image
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
              <div className="mb-3 inline-flex w-fit rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/85">
                {item.category}
              </div>

              <h3 className="text-xl font-bold text-white md:text-2xl">
                {item.title}
              </h3>

              {item.description ? (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80 md:text-[15px]">
                  {item.description}
                </p>
              ) : null}

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/80 md:max-w-md">
                <div className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/35 px-2 py-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>{item.teamSize}</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/35 px-2 py-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{item.duration}</span>
                </div>
                {/* <div className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/35 px-2 py-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>{item.prize}</span>
                </div> */}
              </div>

              {item.ctaLabel && state.active ? (
                <span className="mt-4 inline-flex w-fit rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  {item.ctaLabel}
                </span>
              ) : null}
            </div>
          </div>
        )}
      />
    </div>
  );
}

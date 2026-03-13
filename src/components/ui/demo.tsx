"use client";

import { CardStack, CardStackItem } from "@/components/ui/card-stack";

const items: CardStackItem[] = [
  {
    id: 1,
    title: "Luxury Performance",
    description: "Experience the thrill of precision engineering",
    imageSrc:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    href: "https://www.ruixen.com/",
  },
  {
    id: 2,
    title: "Elegant Design",
    description: "Where beauty meets functionality",
    imageSrc:
      "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
    href: "https://www.ruixen.com/",
  },
  {
    id: 3,
    title: "Power & Speed",
    description: "Unleash the true potential of the road",
    imageSrc:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    href: "https://www.ruixen.com/",
  },
  {
    id: 4,
    title: "Timeless Craftsmanship",
    description: "Built with passion, driven by excellence",
    imageSrc:
      "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&w=1200&q=80",
    href: "https://www.ruixen.com/",
  },
  {
    id: 5,
    title: "Future of Mobility",
    description: "Innovation that moves you forward",
    imageSrc:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
    href: "https://www.ruixen.com/",
  },
];

export default function CardStackDemoPage() {
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-5xl p-8">
        <CardStack
          items={items}
          initialIndex={0}
          autoAdvance
          intervalMs={2000}
          pauseOnHover
          showDots
        />
      </div>
    </div>
  );
}

"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
  className?: string;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    disabled = false,
    movementDuration = 2,
    borderWidth = 1,
    className,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        const element = containerRef.current;
        const { left, top, width, height } = element.getBoundingClientRect();

        if (e && "clientX" in e) {
          const mouseX = e.clientX - left;
          const mouseY = e.clientY - top;

          const centerX = width / 2;
          const centerY = height / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2),
          );

          const maxDistance = Math.sqrt(
            Math.pow(width / 2, 2) + Math.pow(height / 2, 2),
          );

          const inactiveRadius = maxDistance * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--glow-opacity", "0");
            return;
          }

          const isNear =
            mouseX >= -proximity &&
            mouseX <= width + proximity &&
            mouseY >= -proximity &&
            mouseY <= height + proximity;

          if (isNear) {
            element.style.setProperty("--glow-x", `${mouseX}px`);
            element.style.setProperty("--glow-y", `${mouseY}px`);
            element.style.setProperty("--glow-opacity", "1");
          } else {
            element.style.setProperty("--glow-opacity", "0");
          }
        }
      },
      [inactiveZone, proximity],
    );

    useEffect(() => {
      if (disabled) return;

      const handleReset = () => {
        if (containerRef.current) {
          containerRef.current.style.setProperty("--glow-opacity", "0");
        }
      };

      document.addEventListener("mousemove", handleMove as EventListener);
      document.addEventListener("mouseleave", handleReset);

      return () => {
        document.removeEventListener("mousemove", handleMove as EventListener);
        document.removeEventListener("mouseleave", handleReset);
      };
    }, [handleMove, disabled]);

    return (
      <div
        ref={containerRef}
        style={
          {
            "--glow-x": "50%",
            "--glow-y": "50%",
            "--glow-opacity": "0",
            "--glow-spread": `${spread}px`,
            "--glow-blur": `${blur}px`,
            "--glow-movement-duration": `${movementDuration}s`,
            "--glow-border-width": `${borderWidth}px`,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          className,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[inherit] transition-opacity duration-300",
            glow ? "opacity-100" : "opacity-[var(--glow-opacity)]",
          )}
          style={{
            background: `radial-gradient(circle at var(--glow-x) var(--glow-y), ${
              variant === "white"
                ? "rgba(255,255,255,0.15)"
                : "rgba(139,92,246,0.3)"
            } 0%, ${
              variant === "white"
                ? "rgba(255,255,255,0.06)"
                : "rgba(139,92,246,0.1)"
            } var(--glow-spread), transparent 80%)`,
          }}
        />
        <div
          className={cn(
            "absolute inset-0 rounded-[inherit] transition-opacity duration-300",
            glow ? "opacity-100" : "opacity-[var(--glow-opacity)]",
          )}
          style={{
            background: `radial-gradient(circle at var(--glow-x) var(--glow-y), ${
              variant === "white"
                ? "rgba(255,255,255,0.2)"
                : "rgba(139,92,246,0.4)"
            } 0%, transparent 40%)`,
            filter: `blur(var(--glow-blur))`,
          }}
        />
        <div
          className={cn(
            "absolute inset-[var(--glow-border-width)] rounded-[inherit]",
            "bg-[hsl(240,10%,5.9%)]",
          )}
        />
      </div>
    );
  },
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };

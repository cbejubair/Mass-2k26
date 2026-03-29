"use client";

import { useEffect, useState } from "react";
import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedbackPopupProps {
  storageKey: string;
  title?: string;
  description?: string;
}

export default function FeedbackPopup({
  storageKey,
  title = "MASS 2K26 Feedback",
  description = "Share your event experience. Your response helps us improve the next edition.",
}: FeedbackPopupProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (!dismissed) {
        setOpen(true);
      }
    } catch {
      setOpen(false);
    }
  }, [storageKey]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      try {
        localStorage.setItem(storageKey, "dismissed");
      } catch {
        // Ignore storage write failures.
      }
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="group gap-2 border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.1)] transition-all duration-200 hover:border-fuchsia-400/50 hover:bg-fuchsia-500/20 hover:text-fuchsia-200 hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]"
        onClick={() => setOpen(true)}
      >
        <MessageSquareHeart className="h-4 w-4 transition-transform group-hover:scale-110" />
        Open Feedback Form
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-6xl w-[96vw] overflow-hidden border-white/[0.1] bg-[#0a0a0a]/95 p-0 shadow-[0_8px_48px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {/* Fuchsia accent glow at top */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />

          <DialogHeader className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-4">
            <DialogTitle className="flex items-center gap-2.5 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/15 ring-1 ring-fuchsia-500/30">
                <MessageSquareHeart className="h-4 w-4 text-fuchsia-400" />
              </div>
              {title}
            </DialogTitle>
            <DialogDescription className="text-neutral-500">
              {description}
            </DialogDescription>
          </DialogHeader>

          <div className="h-[78vh] bg-[hsl(240,10%,3.9%)]">
            <iframe
              title="MASS 2K26 Feedback Form"
              src="/feedback?embedded=1"
              className="h-full w-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

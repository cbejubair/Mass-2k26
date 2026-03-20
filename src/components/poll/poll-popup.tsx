"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  BarChart3,
  Clock3,
  ExternalLink,
  Disc3,
  Check,
} from "lucide-react";

type PollPhase = "before" | "open" | "closed";

type PollOption = {
  id: string;
  label: string;
  instagramUrl?: string | null;
  votes: number;
  percentage: number;
};

type PollResponse = {
  phase: PollPhase;
  startAt: string;
  endAt: string;
  hasVoted: boolean;
  selectedOptionId: string | null;
  totalVotes: number;
  options: PollOption[];
};

function formatDateTime(value: string) {
  const dt = new Date(value);
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PollPopup() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [poll, setPoll] = useState<PollResponse | null>(null);

  const fetchPoll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/poll/current", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load poll");
        return;
      }
      setPoll(data);
      if (data.selectedOptionId) {
        setSelectedOptionId(data.selectedOptionId);
      }
    } catch {
      setError("Failed to load poll");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoll();
  }, []);

  useEffect(() => {
    const handleOpenPoll = () => {
      setOpen(true);
      fetchPoll();
    };

    window.addEventListener("open-dj-poll", handleOpenPoll);
    return () => {
      window.removeEventListener("open-dj-poll", handleOpenPoll);
    };
  }, []);

  const canVote = useMemo(() => {
    return poll?.phase === "open" && !poll?.hasVoted;
  }, [poll]);

  const selectedOption = useMemo(() => {
    if (!poll || !selectedOptionId) return null;
    return (
      poll.options.find((option) => option.id === selectedOptionId) || null
    );
  }, [poll, selectedOptionId]);

  const submitVote = async () => {
    if (!selectedOptionId || !canVote) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/poll/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId: selectedOptionId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit vote");
        return;
      }

      await fetchPoll();
    } catch {
      setError("Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-blue-500" />
            Day Event DJ Poll
          </DialogTitle>
          <DialogDescription>
            Choose your DJ for the day event. Voting is open on 23rd from 10:00
            AM to 6:00 PM. After 6:00 PM, only ranked results are shown.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !poll ? (
          <p className="text-sm text-red-400">Unable to load poll data.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1">
                <Clock3 className="h-3 w-3" />
                Starts: {formatDateTime(poll.startAt)}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock3 className="h-3 w-3" />
                Ends: {formatDateTime(poll.endAt)}
              </Badge>
              {poll.phase === "closed" && (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">
                  Results Published
                </Badge>
              )}
            </div>

            {poll.phase === "before" && (
              <p className="text-sm text-muted-foreground">
                Poll is not open yet. It will open at 10:00 AM on 23rd.
              </p>
            )}

            {poll.phase === "open" && poll.hasVoted && (
              <p className="text-sm text-emerald-400">
                Your vote has been submitted. Results will be visible after 6:00
                PM.
              </p>
            )}

            {canVote && selectedOption && (
              <div className="rounded-xl border border-blue-500/35 bg-blue-500/10 px-3.5 py-3">
                <p className="text-[11px] uppercase tracking-wider text-blue-300/90">
                  Selected DJ
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-100">
                  {selectedOption.label}
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              {poll.options.slice(0, 5).map((option, idx) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!canVote}
                    onClick={() => setSelectedOptionId(option.id)}
                    aria-pressed={isSelected}
                    className={`w-full text-left rounded-xl border px-3.5 py-3 transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]"
                        : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
                    } ${
                      !canVote
                        ? "cursor-default"
                        : "cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-blue-400 bg-blue-500 text-white"
                                : "border-white/25"
                            }`}
                          >
                            {isSelected ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-transparent" />
                            )}
                          </span>
                          <p className="text-sm font-semibold">
                            {idx + 1}. {option.label}
                          </p>
                        </div>
                        {isSelected && canVote && (
                          <p className="text-[11px] text-blue-300">
                            Tap Submit Vote to confirm selection
                          </p>
                        )}
                        {option.instagramUrl && (
                          <a
                            href={option.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200 underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Instagram Profile{" "}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      {poll.phase === "closed" && (
                        <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                          {option.votes} votes ({option.percentage}%)
                        </span>
                      )}
                    </div>
                    {poll.phase === "closed" && (
                      <div className="mt-2.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {poll.phase === "closed" && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Ranked results by votes. Total votes: {poll.totalVotes}
              </div>
            )}

            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        )}

        <DialogFooter>
          {canVote ? (
            <Button
              onClick={submitVote}
              disabled={submitting || !selectedOptionId}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Vote
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

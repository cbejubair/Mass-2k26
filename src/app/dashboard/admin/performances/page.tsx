"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Music,
  Play,
  Pause,
  PhoneCall,
  Headphones,
  Square,
} from "lucide-react";

interface TeamMember {
  register_number: string;
  name: string;
  department: string;
  year: string;
  class_section: string;
}

interface Performance {
  id: string;
  performance_type: string;
  participants_count: number;
  leader_name: string;
  is_team: boolean;
  team_members: TeamMember[];
  special_requirements: string | null;
  music_file_url: string | null;
  approval_status: string;
  users: {
    name: string;
    register_number: string;
    department: string;
    mobile_number?: string | null;
  };
}

function toTelHref(phoneNumber: string): string {
  const normalized = phoneNumber.replace(/[^+\d]/g, "");
  return `tel:${normalized}`;
}

export default function AdminPerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [progressPct, setProgressPct] = useState(0);
  const [currentSec, setCurrentSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      const res = await fetch("/api/performances/submit");
      const data = await res.json();
      setPerformances(data.performances || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, status: string) => {
    setActing(id);
    try {
      await fetch("/api/performances/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performanceId: id, status }),
      });
      fetchPerformances();
    } catch {
      alert("Failed");
    } finally {
      setActing(null);
    }
  };

  const handleAudioToggle = (perf: Performance) => {
    if (!perf.music_file_url) return;

    if (playingId === perf.id && audioEl) {
      audioEl.pause();
      setPlayingId(null);
      setProgressPct(0);
      setCurrentSec(0);
      setDurationSec(0);
      return;
    }

    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }

    const next = new Audio(perf.music_file_url);

    next.onloadedmetadata = () => {
      setDurationSec(Number.isFinite(next.duration) ? next.duration : 0);
    };

    next.ontimeupdate = () => {
      const duration = Number.isFinite(next.duration) ? next.duration : 0;
      const current = Number.isFinite(next.currentTime) ? next.currentTime : 0;
      setCurrentSec(current);
      setDurationSec(duration);
      if (duration > 0) {
        setProgressPct((current / duration) * 100);
      }
    };

    next.play().catch(() => {
      setPlayingId(null);
    });

    next.onended = () => {
      setPlayingId(null);
      setProgressPct(0);
      setCurrentSec(0);
      setDurationSec(0);
    };

    setAudioEl(next);
    setPlayingId(perf.id);
  };

  const stopAllAudio = () => {
    if (audioEl) {
      audioEl.pause();
      audioEl.currentTime = 0;
    }
    setPlayingId(null);
    setProgressPct(0);
    setCurrentSec(0);
    setDurationSec(0);
  };

  const formatTime = (seconds: number): string => {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const mm = Math.floor(safe / 60)
      .toString()
      .padStart(2, "0");
    const ss = (safe % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, [audioEl]);

  const filtered =
    filter === "all"
      ? performances
      : performances.filter((p) => p.approval_status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-emerald-500/10 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Performance Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review submissions, preview music tracks, and manage approvals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="w-fit">
              {filtered.length} Shown / {performances.length} Total
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={stopAllAudio}
              disabled={!playingId}
              className="h-8"
            >
              <Square className="h-3.5 w-3.5 mr-1.5" />
              Stop All
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize rounded-full"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((perf) => (
          <Card key={perf.id} className="border-border/80 bg-card/70 backdrop-blur-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold">{perf.performance_type}</h3>
                    <Badge
                      variant={
                        perf.approval_status === "approved"
                          ? "default"
                          : perf.approval_status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {perf.approval_status}
                    </Badge>
                    {perf.is_team && (
                      <Badge variant="secondary" className="text-xs">
                        Team Entry
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <p>
                      <span className="opacity-70">By:</span> {perf.users?.name}{" "}
                      ({perf.users?.register_number})
                    </p>
                    <p>
                      <span className="opacity-70">Leader:</span>{" "}
                      {perf.leader_name} |{" "}
                      <span className="opacity-70">Participants:</span>{" "}
                      {perf.participants_count}
                    </p>
                    <p>
                      <span className="opacity-70">Department:</span>{" "}
                      {perf.users?.department}
                    </p>

                    {perf.users?.mobile_number && (
                      <div className="pt-1">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <a href={toTelHref(perf.users.mobile_number)}>
                            <PhoneCall className="h-3.5 w-3.5 mr-1.5" />
                            Quick Call
                          </a>
                        </Button>
                      </div>
                    )}

                    {perf.is_team &&
                      perf.team_members &&
                      perf.team_members.length > 0 && (
                        <div className="mt-2 rounded-md border border-border bg-muted/30 p-2">
                          <p className="text-xs font-semibold mb-1">
                            Team Members:
                          </p>
                          <div className="space-y-1">
                            {perf.team_members.map(
                              (m: TeamMember, idx: number) => (
                                <p key={idx} className="text-xs">
                                  {m.name} ({m.register_number})
                                  {m.department &&
                                    ` — ${m.department} ${m.year} ${m.class_section}`}
                                </p>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    {perf.special_requirements && (
                      <p>
                        <span className="opacity-70">Requirements:</span>{" "}
                        {perf.special_requirements}
                      </p>
                    )}
                    {perf.music_file_url && (
                      <div className="pt-2 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs"
                          onClick={() => handleAudioToggle(perf)}
                        >
                          {playingId === perf.id ? (
                            <>
                              <Pause className="h-3.5 w-3.5 mr-1.5" /> Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-3.5 w-3.5 mr-1.5" /> Play
                            </>
                          )}
                        </Button>

                        <a
                          href={perf.music_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
                        >
                          <Music className="h-3.5 w-3.5" /> Download Music Track
                        </a>

                        {playingId === perf.id && (
                          <span className="inline-flex items-center text-emerald-400 text-xs">
                            <Headphones className="h-3.5 w-3.5 mr-1" />
                            Playing...
                          </span>
                        )}
                        </div>

                        {playingId === perf.id && (
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150"
                                style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>{formatTime(currentSec)}</span>
                              <div className="flex items-end gap-0.5 h-3">
                                {[0, 1, 2, 3, 4, 5].map((bar) => (
                                  <span
                                    key={bar}
                                    className="w-0.5 bg-cyan-300/80 rounded-sm animate-pulse"
                                    style={{
                                      height: `${40 + ((bar * 11) % 55)}%`,
                                      animationDelay: `${bar * 90}ms`,
                                    }}
                                  />
                                ))}
                              </div>
                              <span>{formatTime(durationSec)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {perf.approval_status === "pending" && (
                  <div className="flex w-full lg:w-auto gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 lg:flex-none text-green-400 border-green-500/50 hover:bg-green-500/10"
                      onClick={() => handleApproval(perf.id, "approved")}
                      disabled={acting === perf.id}
                    >
                      {acting === perf.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 lg:flex-none text-red-400 border-red-500/50 hover:bg-red-500/10"
                      onClick={() => handleApproval(perf.id, "rejected")}
                      disabled={acting === perf.id}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No performances found
        </p>
      )}
    </div>
  );
}

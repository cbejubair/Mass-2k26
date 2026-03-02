"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Music } from "lucide-react";

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
  };
}

export default function AdminPerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">
          Performance Management
        </h1>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((perf) => (
          <Card key={perf.id}>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
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
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="opacity-70">By:</span> {perf.users?.name}{" "}
                      ({perf.users?.register_number})
                    </p>
                    <p>
                      <span className="opacity-70">Leader:</span>{" "}
                      {perf.leader_name} |{" "}
                      <span className="opacity-70">Participants:</span>{" "}
                      {perf.participants_count}
                      {perf.is_team && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Team
                        </Badge>
                      )}
                    </p>
                    <p>
                      <span className="opacity-70">Department:</span>{" "}
                      {perf.users?.department}
                    </p>
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
                      <a
                        href={perf.music_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Music className="h-3.5 w-3.5" /> Download Music Track
                      </a>
                    )}
                  </div>
                </div>

                {perf.approval_status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-400 border-green-500/50 hover:bg-green-500/10"
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
                      className="text-red-400 border-red-500/50 hover:bg-red-500/10"
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

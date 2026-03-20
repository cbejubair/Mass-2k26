"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Disc3, RefreshCw, ExternalLink, Users } from "lucide-react";

type PollPhase = "before" | "open" | "closed";

type PollOption = {
  id: string;
  label: string;
  instagramUrl?: string | null;
  votes: number;
  percentage: number;
};

type PollSubmission = {
  id: string;
  createdAt: string;
  optionId: string;
  user: {
    name?: string;
    register_number?: string;
    department?: string;
    year?: string;
    class_section?: string;
    role?: string;
  } | null;
};

type PollResultResponse = {
  phase: PollPhase;
  startAt: string;
  endAt: string;
  summary: {
    totalVotes: number;
    eligibleVoters: number;
    submissionRate: number;
  };
  options: PollOption[];
  submissions: PollSubmission[];
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminPollResultsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PollResultResponse | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/poll/admin/results", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load poll results");
        setData(null);
        return;
      }
      setData(json);
    } catch {
      setError("Failed to load poll results");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const optionNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const option of data?.options || []) {
      map.set(option.id, option.label);
    }
    return map;
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">No poll data available.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-blue-500" />
            DJ Poll Results
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Poll window: {formatDateTime(data.startAt)} to{" "}
            {formatDateTime(data.endAt)}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={load} className="gap-1.5">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Poll Status</p>
            <p className="text-lg font-semibold capitalize">{data.phase}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Submissions</p>
            <p className="text-lg font-semibold">{data.summary.totalVotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Submission Rate</p>
            <p className="text-lg font-semibold">
              {data.summary.submissionRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ranked DJ Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.options.map((option, index) => (
            <div
              key={option.id}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    {index + 1}. {option.label}
                  </p>
                  {option.instagramUrl && (
                    <a
                      href={option.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex mt-0.5 items-center gap-1 text-xs text-blue-300 hover:text-blue-200 underline"
                    >
                      Instagram <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {option.votes} votes ({option.percentage}%)
                </Badge>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Submission Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            <div className="max-h-[420px] overflow-auto divide-y divide-white/10">
              {data.submissions.map((row) => (
                <div
                  key={row.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {row.user?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.user?.register_number || "N/A"}
                      {row.user?.department ? ` · ${row.user.department}` : ""}
                      {row.user?.year ? ` · ${row.user.year}` : ""}
                      {row.user?.class_section
                        ? ` ${row.user.class_section}`
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-foreground">
                      {optionNameById.get(row.optionId) || "Unknown Option"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

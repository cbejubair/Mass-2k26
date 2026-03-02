"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Clock, Drama, Wrench } from "lucide-react";

interface AgendaItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  assigned_performance_id: string | null;
  stage_requirements: string | null;
  performance_registrations?: {
    performance_type: string;
    leader_name: string;
    users: { name: string };
  };
}

interface Performance {
  id: string;
  performance_type: string;
  leader_name: string;
  users: {
    name: string;
    register_number: string;
  };
}

export default function AdminAgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    startTime: "",
    endTime: "",
    description: "",
    assignedPerformanceId: "",
    stageRequirements: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agendaRes, perfRes] = await Promise.all([
        fetch("/api/agenda").then((r) => r.json()),
        fetch("/api/performances/submit").then((r) => r.json()),
      ]);
      setAgenda(agendaRes.agenda || []);
      setPerformances(
        (perfRes.performances || []).filter(
          (p: Performance & { approval_status: string }) =>
            p.approval_status === "approved",
        ),
      );
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error +
            (data.conflicts ? ` (${data.conflicts.join(", ")})` : ""),
        );
        return;
      }

      setShowForm(false);
      setFormData({
        title: "",
        startTime: "",
        endTime: "",
        description: "",
        assignedPerformanceId: "",
        stageRequirements: "",
      });
      fetchData();
    } catch {
      setError("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this agenda item?")) return;
    try {
      await fetch(`/api/agenda?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      alert("Failed to delete");
    }
  };

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
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Agenda Planner</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Schedule and manage event timeline
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ Add Slot"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Assign Performance (optional)</Label>
                  <select
                    value={formData.assignedPerformanceId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assignedPerformanceId: e.target.value,
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">None</option>
                    {performances.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.performance_type} - {p.leader_name} ({p.users?.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="min-h-[60px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label>Stage Requirements</Label>
                <Input
                  value={formData.stageRequirements}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stageRequirements: e.target.value,
                    })
                  }
                  placeholder="e.g., Mic, Projector, Speakers..."
                />
              </div>

              <Button type="submit">Save Agenda Slot</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {agenda.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="text-center min-w-[80px]">
                <p className="text-primary font-mono text-sm">
                  {new Date(item.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-muted-foreground text-xs">to</p>
                <p className="text-primary font-mono text-sm">
                  {new Date(item.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
                {item.performance_registrations && (
                  <p className="text-sm text-purple-400 mt-1 flex items-center gap-1.5">
                    <Drama className="h-3.5 w-3.5" />{" "}
                    {item.performance_registrations.performance_type} by{" "}
                    {item.performance_registrations.leader_name}
                  </p>
                )}
                {item.stage_requirements && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Wrench className="h-3 w-3" /> {item.stage_requirements}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {agenda.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No agenda items yet. Add your first slot!
        </p>
      )}
    </div>
  );
}

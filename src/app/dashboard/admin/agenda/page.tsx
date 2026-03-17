"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2, Drama, Wrench, Edit2 } from "lucide-react";

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
  approval_status: "approved" | "pending" | "rejected";
  users: {
    name: string;
    register_number: string;
  } | null;
}

export default function AdminAgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [performanceSearch, setPerformanceSearch] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    startTime: "",
    duration: 10,
    description: "",
    assignedPerformanceId: "",
    stageRequirements: "",
  });
  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setFetchError("");
    try {
      const [agendaResp, perfResp] = await Promise.all([
        fetch("/api/agenda"),
        fetch("/api/performances/submit"),
      ]);

      const [agendaRes, perfRes] = await Promise.all([
        agendaResp.json(),
        perfResp.json(),
      ]);

      if (!agendaResp.ok) {
        throw new Error(agendaRes.error || "Failed to load agenda");
      }
      if (!perfResp.ok) {
        throw new Error(perfRes.error || "Failed to load performances");
      }

      setAgenda(agendaRes.agenda || []);
      setPerformances((perfRes.performances || []) as Performance[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch";
      setFetchError(msg);
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredPerformances = performances.filter((p) => {
    const q = performanceSearch.toLowerCase().trim();
    if (!q) return true;
    const text = [
      p.performance_type,
      p.leader_name,
      p.users?.name || "",
      p.users?.register_number || "",
      p.approval_status,
    ]
      .join(" ")
      .toLowerCase();
    return text.includes(q);
  });

  const handleAssignPerformance = (perfId: string) => {
    const perf = performances.find((p) => p.id === perfId);
    if (!perf) {
      setFormData({ ...formData, assignedPerformanceId: "" });
      return;
    }

    // Auto-fill based on performance
    setFormData({
      ...formData,
      assignedPerformanceId: perfId,
      title: `${perf.performance_type} by ${perf.leader_name}`,
      description: `Performance type: ${perf.performance_type}`,
      duration: formData.duration || 10,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const start = new Date(formData.startTime);
      const end = new Date(start.getTime() + formData.duration * 60000); // Add duration in minutes

      const payload = {
        ...formData,
        endTime: end.toISOString(),
      };

      const method = formData.id ? "PUT" : "POST";
      const res = await fetch("/api/agenda", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        id: "",
        title: "",
        startTime: "",
        duration: 10,
        description: "",
        assignedPerformanceId: "",
        stageRequirements: "",
      });
      fetchData();
    } catch {
      setError("Network error");
    }
  };

  const handleEdit = (item: AgendaItem) => {
    // Calculate duration in minutes
    const start = new Date(item.start_time);
    const end = new Date(item.end_time);
    const duration = Math.round((end.getTime() - start.getTime()) / 60000);

    // Format start time for input type="datetime-local" (YYYY-MM-DDTHH:mm)
    const localStartTime = new Date(
      start.getTime() - start.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setFormData({
      id: item.id,
      title: item.title,
      startTime: localStartTime,
      duration,
      description: item.description || "",
      assignedPerformanceId: item.assigned_performance_id || "",
      stageRequirements: item.stage_requirements || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFormData((f) => ({
                ...f,
                title: "DJ Performance",
                duration: 30,
              }));
              setShowForm(true);
            }}
          >
            + Add DJ
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setFormData((f) => ({
                ...f,
                title: "Filler / Game",
                duration: 15,
              }));
              setShowForm(true);
            }}
          >
            + Add Filler
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (showForm) {
                setFormData({
                  id: "",
                  title: "",
                  startTime: "",
                  duration: 10,
                  description: "",
                  assignedPerformanceId: "",
                  stageRequirements: "",
                });
              }
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Cancel" : "+ Add Slot"}
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {fetchError}
        </div>
      )}

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
                  <Input
                    value={performanceSearch}
                    onChange={(e) => setPerformanceSearch(e.target.value)}
                    placeholder="Search performance, leader, student..."
                  />
                  <select
                    value={formData.assignedPerformanceId}
                    onChange={(e) => handleAssignPerformance(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">None</option>
                    {filteredPerformances.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.approval_status.toUpperCase()}] {p.performance_type}{" "}
                        - {p.leader_name}
                        {p.users?.name ? ` (${p.users.name})` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredPerformances.length} of{" "}
                    {performances.length} registered performances.
                  </p>
                </div>
                {/* <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div> */}
                <div className="space-y-2">
                  <Label>Duration (Minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    className="w-full"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value) || 0,
                      })
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

              <Button type="submit">
                {formData.id ? "Update Agenda Slot" : "Save Agenda Slot"}
              </Button>
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
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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

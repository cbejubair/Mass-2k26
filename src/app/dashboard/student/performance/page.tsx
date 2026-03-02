"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  Music,
  Plus,
  X,
  UserPlus,
  ExternalLink,
  Pencil,
} from "lucide-react";

interface TeamMemberResolved {
  register_number: string;
  name: string;
  department: string;
  year: string;
  class_section: string;
}

interface StudentPerformance {
  id: string;
  performance_type: string;
  participants_count: number;
  leader_name: string;
  is_team: boolean;
  team_members: TeamMemberResolved[];
  special_requirements: string | null;
  music_file_url: string | null;
  approval_status: string;
}

const badgeVariant = (status: string) =>
  status === "approved"
    ? "default"
    : status === "rejected"
      ? "destructive"
      : ("secondary" as const);

export default function PerformancePage() {
  const [performances, setPerformances] = useState<StudentPerformance[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [performanceType, setPerformanceType] = useState("");
  const [participantsCount, setParticipantsCount] = useState("1");
  const [leaderName, setLeaderName] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [isTeam, setIsTeam] = useState(false);
  const [memberRegNo, setMemberRegNo] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [resolvedMembers, setResolvedMembers] = useState<TeamMemberResolved[]>(
    [],
  );
  const [lookupLoading, setLookupLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const performanceTypes = [
    "Solo Singing",
    "Group Singing",
    "Solo Dance",
    "Group Dance",
    "Stand-up Comedy",
    "Skit/Drama",
    "Instrumental",
    "Beat Boxing",
    "Rap/Poetry",
    "Other",
  ];

  const fetchPerformances = async () => {
    try {
      const res = await fetch("/api/performances/submit");
      const data = await res.json();
      setPerformances(data.performances || []);
      if ((data.performances || []).length > 0 && !editingId) {
        setShowForm(false);
      }
    } catch {
      setPerformances([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformances();
  }, []);

  const resetForm = () => {
    setPerformanceType("");
    setParticipantsCount("1");
    setLeaderName("");
    setSpecialRequirements("");
    setMusicFile(null);
    setIsTeam(false);
    setMemberRegNo("");
    setTeamMembers([]);
    setResolvedMembers([]);
    setError("");
  };

  const handleNewPerformance = () => {
    setEditingId(null);
    setSuccess(false);
    setSuccessMessage("");
    resetForm();
    setShowForm(true);
  };

  const handleEditPerformance = (performance: StudentPerformance) => {
    setEditingId(performance.id);
    setPerformanceType(performance.performance_type || "");
    setParticipantsCount(String(performance.participants_count || 1));
    setLeaderName(performance.leader_name || "");
    setSpecialRequirements(performance.special_requirements || "");
    setIsTeam(!!performance.is_team);
    const members = performance.team_members || [];
    setResolvedMembers(members);
    setTeamMembers(members.map((member) => member.register_number));
    setMemberRegNo("");
    setMusicFile(null);
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    setShowForm(true);
  };

  const addTeamMember = async () => {
    const regNo = memberRegNo.trim().toUpperCase();
    if (!regNo) return;
    if (teamMembers.includes(regNo)) {
      setError("Member already added");
      return;
    }

    setLookupLoading(true);
    setError("");

    try {
      // Lookup user by register number via a simple fetch
      const res = await fetch(
        `/api/register/lookup?regNo=${encodeURIComponent(regNo)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setTeamMembers((prev) => [...prev, regNo]);
          setResolvedMembers((prev) => [...prev, data.user]);
          setMemberRegNo("");
          // Auto-update participants count
          setParticipantsCount(String(teamMembers.length + 2)); // +1 leader +1 new
          return;
        }
      }
      // If not found, add with "Unknown"
      setTeamMembers((prev) => [...prev, regNo]);
      setResolvedMembers((prev) => [
        ...prev,
        {
          register_number: regNo,
          name: "Not found",
          department: "",
          year: "",
          class_section: "",
        },
      ]);
      setMemberRegNo("");
      setParticipantsCount(String(teamMembers.length + 2));
    } catch {
      setError("Failed to lookup member");
    } finally {
      setLookupLoading(false);
    }
  };

  const removeMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
    setResolvedMembers((prev) => prev.filter((_, i) => i !== index));
    setParticipantsCount(String(Math.max(1, teamMembers.length)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setSuccessMessage("");

    try {
      const formData = new FormData();
      if (editingId) {
        formData.append("performanceId", editingId);
      }
      formData.append("performanceType", performanceType);
      formData.append("participantsCount", participantsCount);
      formData.append("leaderName", leaderName);
      formData.append("specialRequirements", specialRequirements);
      formData.append("isTeam", String(isTeam));
      if (isTeam && teamMembers.length > 0) {
        formData.append("teamMembers", JSON.stringify(teamMembers));
      }
      if (musicFile) {
        formData.append("musicFile", musicFile);
      }

      const res = await fetch("/api/performances/submit", {
        method: editingId ? "PUT" : "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setSuccessMessage(
        editingId
          ? "Performance updated successfully. Status moved to pending review."
          : "Performance registered successfully.",
      );
      resetForm();
      setEditingId(null);
      await fetchPerformances();
      setShowForm(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Performance Registration
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register, update, and manage your performances for MASS 2K26
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto shrink-0"
          onClick={handleNewPerformance}
        >
          <Plus className="h-4 w-4" /> New Performance (Team Mate)
        </Button>
      </div>

      {performances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registered Performances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {performances.map((performance) => (
              <div
                key={performance.id}
                className="rounded-lg border border-border p-4 bg-muted/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {performance.performance_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Leader: {performance.leader_name} • Participants:{" "}
                      {performance.participants_count}
                    </p>
                  </div>
                  <Badge variant={badgeVariant(performance.approval_status)}>
                    {performance.approval_status}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Team:</span>{" "}
                    {performance.is_team ? "Yes" : "No"}
                  </p>
                  {performance.is_team &&
                    performance.team_members?.length > 0 && (
                      <p>
                        <span className="text-muted-foreground">
                          Team Members:
                        </span>{" "}
                        {performance.team_members
                          .map(
                            (member) =>
                              `${member.name} (${member.register_number})`,
                          )
                          .join(", ")}
                      </p>
                    )}
                  {performance.special_requirements && (
                    <p>
                      <span className="text-muted-foreground">
                        Requirements:
                      </span>{" "}
                      {performance.special_requirements}
                    </p>
                  )}
                  {performance.music_file_url ? (
                    <a
                      href={performance.music_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Song Attached <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Song: Not attached</p>
                  )}
                </div>

                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditPerformance(performance)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Update
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMessage}
                </div>
              )}

              <div className="space-y-2">
                <Label>Performance Type</Label>
                <Select
                  value={performanceType}
                  onValueChange={setPerformanceType}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {performanceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Leader/Performer Name</Label>
                <Input
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Primary performer name"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="isTeam"
                  checked={isTeam}
                  onCheckedChange={(v) => {
                    setIsTeam(!!v);
                    if (!v) {
                      setTeamMembers([]);
                      setResolvedMembers([]);
                      setParticipantsCount("1");
                    }
                  }}
                />
                <Label htmlFor="isTeam">This is a team performance</Label>
              </div>

              {isTeam && (
                <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Team Members
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Add team members by register number. Details will be
                    auto-filled.
                  </p>

                  <div className="flex gap-2">
                    <Input
                      value={memberRegNo}
                      onChange={(e) => setMemberRegNo(e.target.value)}
                      placeholder="Enter register number..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTeamMember();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addTeamMember}
                      disabled={lookupLoading}
                      className="shrink-0"
                    >
                      {lookupLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {resolvedMembers.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {resolvedMembers.map((member, idx) => (
                        <div
                          key={`${member.register_number}-${idx}`}
                          className="flex items-center justify-between rounded-md border border-border bg-background p-2.5 text-sm"
                        >
                          <div>
                            <span className="font-medium">{member.name}</span>
                            <span className="text-muted-foreground ml-2">
                              ({member.register_number})
                            </span>
                            {member.department && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {member.department} {member.year}{" "}
                                {member.class_section}
                              </Badge>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="text-muted-foreground hover:text-red-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Number of Participants</Label>
                <Input
                  type="number"
                  value={participantsCount}
                  onChange={(e) => setParticipantsCount(e.target.value)}
                  min="1"
                  max="50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Special Requirements</Label>
                <Textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Equipment, stage setup, etc..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Song / Music Track (if applicable)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="musicFile"
                  />
                  <label htmlFor="musicFile" className="cursor-pointer">
                    {musicFile ? (
                      <div>
                        <p className="text-primary">
                          <Music className="h-4 w-4 inline mr-1" />
                          {musicFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(musicFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Music className="h-8 w-8 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click to upload music track
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Max 20MB, MP3/WAV
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                {editingId && (
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing song file.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : editingId ? (
                    "Update Performance"
                  ) : (
                    "Register Performance"
                  )}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleNewPerformance}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!showForm && performances.length > 0 && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Use <span className="font-medium text-foreground">Update</span> on
            any item above, or click{" "}
            <span className="font-medium text-foreground">
              New Performance (Team Mate)
            </span>
            to add another entry.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";

const ROLE_DETAILS = [
  {
    key: "finance-coordinator",
    title: "Finance Coordinator",
    points: [
      "Track student payments (UPI records).",
      "Maintain income and expense sheets.",
      "Coordinate vendor payments.",
      "Ensure transparent budgeting and final settlement.",
    ],
  },
  {
    key: "multimedia-team",
    title: "Multimedia Team (Videography & Photography)",
    points: [
      "Capture promotional content before the event.",
      "Cover performances, crowd moments, and backstage.",
      "Create reels, event highlights, and after-movie videos.",
      "Manage event social media visuals.",
    ],
  },
  {
    key: "emcee-mc-department",
    title: "Emcee (MC) Department",
    points: [
      "Anchor the event and engage the audience.",
      "Coordinate event flow with the technical and performance teams.",
      "Maintain energy and smooth transitions between programs.",
      "Follow the scripted timeline of the event.",
    ],
  },
  {
    key: "event-day-volunteers",
    title: "Event Day Volunteers",
    points: [
      "Assist participants and guests.",
      "Manage crowd movement and seating.",
      "Support backstage coordination.",
      "Help handle unexpected situations calmly.",
    ],
  },
  {
    key: "food-refreshment-volunteers",
    title: "Food & Refreshment Volunteers",
    points: [
      "Coordinate with food vendors.",
      "Manage distribution counters.",
      "Ensure hygiene and proper serving.",
      "Monitor food stock and avoid wastage.",
    ],
  },
  {
    key: "technical-team",
    title: "Technical Team",
    points: [
      "Assist with stage setup and equipment arrangement.",
      "Monitor sound systems, microphones, DJ setup, and lighting.",
      "Coordinate with performers for technical requirements.",
      "Ensure smooth execution without technical interruptions.",
    ],
  },
  {
    key: "registration-entry-management",
    title: "Registration & Entry Management Team",
    points: [
      "Verify student registrations and payment confirmation.",
      "Manage entry points and crowd control at gates.",
      "Distribute passes/wristbands if required.",
      "Maintain attendance and entry records.",
    ],
  },
] as const;

export default function RegisterPage() {
  const [supportStatus, setSupportStatus] = useState(false);
  const [willingToCoordinate, setWillingToCoordinate] = useState(false);
  const [interestedRoles, setInterestedRoles] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const toggleRole = (role: string) => {
    setInterestedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportStatus,
          willingToCoordinate,
          interestedRoles,
          remarks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/student"), 2000);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <CheckCircle2 className="h-12 w-12 text-green-400 mb-4" />
        <h2 className="text-xl font-bold">Form Submitted Successfully!</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          Event Coordinator Willingness Form
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Express your interest in coordinating MASS 2K26
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Checkbox
                id="support"
                checked={supportStatus}
                onCheckedChange={(v) => setSupportStatus(!!v)}
              />
              <Label htmlFor="support">I support the MASS 2K26 event</Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="coordinate"
                checked={willingToCoordinate}
                onCheckedChange={(v) => setWillingToCoordinate(!!v)}
              />
              <Label htmlFor="coordinate">
                I am willing to help coordinate
              </Label>
            </div>

            {willingToCoordinate && (
              <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/30">
                <Label className="text-sm font-semibold">
                  Coordinator Roles (select all that apply)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Choose roles you are willing to take. Responsibilities are
                  listed under each role.
                </p>
                <div className="space-y-3">
                  {ROLE_DETAILS.map((role) => (
                    <div
                      key={role.key}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`role-${role.key}`}
                          checked={interestedRoles.includes(role.title)}
                          onCheckedChange={() => toggleRole(role.title)}
                        />
                        <div className="space-y-2">
                          <Label
                            htmlFor={`role-${role.key}`}
                            className="text-sm font-semibold cursor-pointer"
                          >
                            {role.title}
                          </Label>
                          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                            {role.points.map((point) => (
                              <li key={point}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Selected: {interestedRoles.length}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Remarks (optional)</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any additional comments..."
                className="min-h-[80px]"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Willingness Form"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

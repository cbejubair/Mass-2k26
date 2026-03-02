"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type RadioOption = { value: string; label: string };

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
            value === opt.value
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-primary h-4 w-4"
          />
          <span className="text-sm">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function ScaleSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-12 w-12 rounded-xl border-2 text-lg font-bold transition-all ${
            value === n
              ? "border-primary bg-primary text-primary-foreground scale-110"
              : "border-border hover:border-primary/50 text-muted-foreground"
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function SurveyPage() {
  const [timingPreference, setTimingPreference] = useState("");
  const [transportFeasibility, setTransportFeasibility] = useState("");
  const [comfortLevel, setComfortLevel] = useState("");
  const [safetyMeasures, setSafetyMeasures] = useState("");
  const [atmospherePreference, setAtmospherePreference] = useState("");
  const [supportScore, setSupportScore] = useState(0);
  const [challenges, setChallenges] = useState("");
  const [creativeSuggestions, setCreativeSuggestions] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existing, setExisting] = useState(false);

  useEffect(() => {
    fetch("/api/survey")
      .then((r) => r.json())
      .then((data) => {
        if (data.feedback) {
          const f = data.feedback;
          setTimingPreference(f.timing_preference || "");
          setTransportFeasibility(f.transport_feasibility || "");
          setComfortLevel(f.comfort_level || "");
          setSafetyMeasures(f.safety_measures || "");
          setAtmospherePreference(f.atmosphere_preference || "");
          setSupportScore(f.support_score || 0);
          setChallenges(f.challenges || "");
          setCreativeSuggestions(f.creative_suggestions || "");
          setExisting(true);
        }
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !timingPreference ||
      !transportFeasibility ||
      !comfortLevel ||
      !atmospherePreference ||
      !supportScore
    ) {
      setError("Please answer all required questions");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timingPreference,
          transportFeasibility,
          comfortLevel,
          safetyMeasures,
          atmospherePreference,
          supportScore: String(supportScore),
          challenges,
          creativeSuggestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setExisting(true);
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
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold">MASS 2K26 Survey</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Help us plan a better event. Your responses are confidential.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            {existing
              ? "Survey updated successfully!"
              : "Thank you for your response!"}
          </div>
        )}

        {/* Q1: Event Timing Preference */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Event Timing Preference *
            </Label>
            <p className="text-sm text-muted-foreground">
              Which plan do you prefer for MASS 2K26?
            </p>
            <RadioGroup
              name="timing"
              value={timingPreference}
              onChange={setTimingPreference}
              options={[
                { value: "plan_a", label: "Plan A — Event until 8:00 PM" },
                { value: "plan_b", label: "Plan B — Event until 5:00 PM" },
              ]}
            />
          </CardContent>
        </Card>

        {/* Q2: Transportation */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Transportation Feasibility *
            </Label>
            <p className="text-sm text-muted-foreground">
              If Plan A (8:00 PM) is selected, can you arrange your own
              transportation?
            </p>
            <RadioGroup
              name="transport"
              value={transportFeasibility}
              onChange={setTransportFeasibility}
              options={[
                { value: "yes", label: "Yes, I will arrange" },
                { value: "no", label: "No, I cannot" },
                {
                  value: "need_college_transport",
                  label: "I may need college-arranged transport",
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Q3: Comfort Level */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Safety & Comfort *
            </Label>
            <p className="text-sm text-muted-foreground">
              Do you feel comfortable attending an event that ends at 8:00 PM?
            </p>
            <RadioGroup
              name="comfort"
              value={comfortLevel}
              onChange={setComfortLevel}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                {
                  value: "depends",
                  label: "Depends on transport/security",
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Q4: Safety Measures */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Safety Measures Expected
            </Label>
            <p className="text-sm text-muted-foreground">
              What safety measures do you expect if the event runs till 8:00 PM?
            </p>
            <Textarea
              value={safetyMeasures}
              onChange={(e) => setSafetyMeasures(e.target.value)}
              placeholder="e.g., security, lighting, female safety support, transport coordination..."
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Q5: Atmosphere */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Crowd & Energy Expectation *
            </Label>
            <p className="text-sm text-muted-foreground">
              Which atmosphere do you prefer?
            </p>
            <RadioGroup
              name="atmosphere"
              value={atmospherePreference}
              onChange={setAtmospherePreference}
              options={[
                { value: "daytime", label: "Daytime cultural fest" },
                { value: "night_concert", label: "Night concert-style event" },
                {
                  value: "balanced",
                  label: "Balanced (Day programs + Evening finale)",
                },
              ]}
            />
          </CardContent>
        </Card>

        {/* Q6: Support Score */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Final Opinion Weight *
            </Label>
            <p className="text-sm text-muted-foreground">
              On a scale of 1–5, how strongly do you support conducting the
              event until 8:00 PM?
            </p>
            <div className="flex justify-between text-xs text-muted-foreground px-1 mb-1">
              <span>Strongly oppose</span>
              <span>Strongly support</span>
            </div>
            <ScaleSelector value={supportScore} onChange={setSupportScore} />
          </CardContent>
        </Card>

        {/* Q7: Challenges */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">Open Response</Label>
            <p className="text-sm text-muted-foreground">
              Do you foresee any challenges? (Transportation, safety,
              discipline, academic schedule, noise, etc.)
            </p>
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Your thoughts..."
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Q8: Creative Suggestions */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <Label className="text-base font-semibold">
              Creative Suggestions
            </Label>
            <p className="text-sm text-muted-foreground">
              Do you have any practical ideas to improve execution quality,
              safety, or engagement?
            </p>
            <Textarea
              value={creativeSuggestions}
              onChange={(e) => setCreativeSuggestions(e.target.value)}
              placeholder="Your ideas..."
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : existing ? (
            "Update Survey Response"
          ) : (
            "Submit Survey"
          )}
        </Button>
      </form>
    </div>
  );
}

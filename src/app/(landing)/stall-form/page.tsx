"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Store } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FestivalBackground from "@/components/landing/FestivalBackground";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StallType = "food" | "product" | "";

interface StallFormState {
  applicantName: string;
  phoneNumber: string;
  email: string;
  stallType: StallType;
  stallBrandName: string;
  itemsToSell: string;
  memberCount: string;
  cookingOnSite: boolean;
  powerRequired: boolean;
  expectedSpace: string;
  previousExperience: string;
  specialRequirements: string;
  acceptedTerms: boolean;
}

const initialState: StallFormState = {
  applicantName: "",
  phoneNumber: "",
  email: "",
  stallType: "",
  stallBrandName: "",
  itemsToSell: "",
  memberCount: "",
  cookingOnSite: false,
  powerRequired: false,
  expectedSpace: "",
  previousExperience: "",
  specialRequirements: "",
  acceptedTerms: false,
};

function boolLabel(value: boolean): string {
  return value ? "Yes" : "No";
}

export default function StallFormPage() {
  const [form, setForm] = useState<StallFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const stallTypeLabel = useMemo(() => {
    if (form.stallType === "food") return "Food Stall";
    if (form.stallType === "product") return "Product Stall";
    return "-";
  }, [form.stallType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.applicantName.trim() ||
      !form.phoneNumber.trim() ||
      !form.email.trim() ||
      !form.stallType ||
      !form.stallBrandName.trim() ||
      !form.itemsToSell.trim() ||
      !form.memberCount.trim() ||
      !form.expectedSpace.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (!form.acceptedTerms) {
      setError("You must accept the stall terms before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/stalls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit stall application.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative bg-[hsl(240,10%,3.9%)] min-h-screen overflow-x-hidden">
      <FestivalBackground />
      <Navbar />

      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-96 h-96 bg-fuchsia-500/8 rounded-full blur-[120px]" />
          <div className="absolute top-32 right-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-500 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-6"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
              <Store className="h-8 w-8 text-fuchsia-400" />
              Stall Application Form
            </h1>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
              Share your interest in placing your food or product stall on event day.
              Submit complete details for the stall production team.
            </p>
          </motion.div>

          {success ? (
            <Card className="border-emerald-500/30 bg-emerald-500/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" /> Application Submitted
                </CardTitle>
                <CardDescription className="text-emerald-100/80">
                  Your stall application has been recorded successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-emerald-100/90 space-y-2">
                <p>
                  <strong>Name:</strong> {form.applicantName}
                </p>
                <p>
                  <strong>Phone:</strong> {form.phoneNumber}
                </p>
                <p>
                  <strong>Email:</strong> {form.email}
                </p>
                <p>
                  <strong>Stall Type:</strong> {stallTypeLabel}
                </p>
                <p>
                  <strong>Stall/Brand:</strong> {form.stallBrandName}
                </p>
                <p>
                  <strong>Member Count:</strong> {form.memberCount}
                </p>
                <p>
                  <strong>Cooking On Site:</strong> {boolLabel(form.cookingOnSite)}
                </p>
                <p>
                  <strong>Power Required:</strong> {boolLabel(form.powerRequired)}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Vendor Details</CardTitle>
                <CardDescription className="text-neutral-400">
                  Fields marked with * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Applicant Name *</label>
                      <Input
                        value={form.applicantName}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, applicantName: e.target.value }))
                        }
                        placeholder="Enter applicant name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Phone Number *</label>
                      <Input
                        value={form.phoneNumber}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                        }
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Email *</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Stall Type *</label>
                      <Select
                        value={form.stallType}
                        onValueChange={(value: StallType) =>
                          setForm((prev) => ({ ...prev, stallType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select stall type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="product">Product</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Stall/Brand Name *</label>
                      <Input
                        value={form.stallBrandName}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, stallBrandName: e.target.value }))
                        }
                        placeholder="Enter stall or brand name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Member Count *</label>
                      <Input
                        type="number"
                        min={1}
                        value={form.memberCount}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, memberCount: e.target.value }))
                        }
                        placeholder="Number of members on stall"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-300">Items to Sell *</label>
                    <Textarea
                      value={form.itemsToSell}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, itemsToSell: e.target.value }))
                      }
                      placeholder="List food/product items you plan to sell"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Cooking on Site?</label>
                      <Select
                        value={form.cookingOnSite ? "yes" : "no"}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            cookingOnSite: value === "yes",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-neutral-300">Power/Electricity Needed?</label>
                      <Select
                        value={form.powerRequired ? "yes" : "no"}
                        onValueChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            powerRequired: value === "yes",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-300">Expected Space Needed *</label>
                    <Input
                      value={form.expectedSpace}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, expectedSpace: e.target.value }))
                      }
                      placeholder="Example: 10x10 ft"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-300">Previous Stall Experience</label>
                    <Textarea
                      value={form.previousExperience}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, previousExperience: e.target.value }))
                      }
                      placeholder="Share your previous event/stall experience"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-neutral-300">Special Requirements</label>
                    <Textarea
                      value={form.specialRequirements}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, specialRequirements: e.target.value }))
                      }
                      placeholder="Any additional requirement for setup"
                      rows={2}
                    />
                  </div>

                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-100 space-y-2">
                    <p className="font-semibold">Mandatory Stall Terms</p>
                    <p>
                      The stall production team will provide only a tent and one table.
                    </p>
                    <p>
                      All cooking accessories and equipment must be brought by the stall holder.
                    </p>
                    <p>
                      The management and the Fine Arts Club Student Committee are not responsible for any loss or damage to the equipment brought by stall holders.
                    </p>
                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.acceptedTerms}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            acceptedTerms: e.target.checked,
                          }))
                        }
                        className="mt-0.5"
                      />
                      <span>I agree to the above terms and conditions. *</span>
                    </label>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </span>
                    ) : (
                      "Submit Stall Application"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

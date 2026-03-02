"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Shield, Loader2, AlertCircle } from "lucide-react";

const DASHBOARD_PATHS: Record<string, string> = {
  admin: "/dashboard/admin",
  class_coordinator: "/dashboard/coordinator",
  student: "/dashboard/student",
};

export default function LoginPage() {
  // Student state
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [classSection, setClassSection] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [needsDetails, setNeedsDetails] = useState(false);

  // Admin state
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Common state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleStudentLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const body: Record<string, string> = {
          loginType: "student",
          registerNumber,
        };

        if (needsDetails) {
          body.name = studentName;
          body.department = department;
          body.year = year;
          body.classSection = classSection;
          body.mobileNumber = mobileNumber;
        }

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "same-origin",
        });

        const data = await res.json();

        if (!res.ok) {
          if (data.needsDetails) {
            setNeedsDetails(true);
            setLoading(false);
            return;
          }
          setError(data.error || "Login failed");
          setLoading(false);
          return;
        }

        setRedirecting(true);
        window.location.href = DASHBOARD_PATHS.student;
      } catch {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    },
    [
      registerNumber,
      needsDetails,
      studentName,
      department,
      year,
      classSection,
      mobileNumber,
    ],
  );

  const handleAdminLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loginType: "admin",
            username: adminUsername,
            password: adminPassword,
          }),
          credentials: "same-origin",
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login failed");
          setLoading(false);
          return;
        }

        setRedirecting(true);
        const path = DASHBOARD_PATHS[data.user.role] || "/dashboard/admin";
        window.location.href = path;
      } catch {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    },
    [adminUsername, adminPassword],
  );

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Taking you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f] relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-900/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-900/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-950/10 blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* College Logo + Event Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
              <Image
                src="/logo.png"
                alt="College Logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-violet-400 to-purple-300 bg-clip-text text-transparent">
              MASS 2K26
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Annual Cultural Fest &mdash; Event Management System
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="student"
          className="w-full"
          onValueChange={() => setError("")}
        >
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 rounded-xl p-1 h-auto">
            <TabsTrigger
              value="student"
              className="gap-2 rounded-lg py-2 text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <GraduationCap className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="gap-2 rounded-lg py-2 text-sm data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Shield className="h-4 w-4" />
              Admin / Co-ordinator
            </TabsTrigger>
          </TabsList>

          {/* ============ STUDENT TAB ============ */}
          <TabsContent value="student" className="mt-3">
            <Card className="border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-purple-950/20">
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-lg">Student Access</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Enter your register number to continue. New students will be
                  asked for additional details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-500/30 p-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="regNum"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      Register Number
                    </Label>
                    <Input
                      id="regNum"
                      value={registerNumber}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);
                        setRegisterNumber(value);
                        setNeedsDetails(false);
                        setError("");
                      }}
                      placeholder="e.g. 712525000000"
                      pattern="7125\d{8}"
                      required
                      autoComplete="username"
                      maxLength={12}
                      className="bg-white/5 border-white/10 focus:border-purple-500/60 focus:ring-purple-500/20 placeholder:text-muted-foreground/50 h-10"
                    />
                    <p className="text-[11px] text-muted-foreground/60">
                      Must start with 7125 (12 digits total)
                    </p>
                  </div>

                  {needsDetails && (
                    <div className="space-y-3 rounded-xl border border-purple-500/20 bg-purple-950/20 p-4">
                      <p className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                        New student — fill your details
                      </p>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="name"
                          className="text-xs text-muted-foreground"
                        >
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Your full name"
                          required
                          className="bg-white/5 border-white/10 focus:border-purple-500/60 h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="dept"
                            className="text-xs text-muted-foreground"
                          >
                            Department
                          </Label>
                          <Select
                            value={department}
                            onValueChange={setDepartment}
                            required
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-10">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "CSE",
                                "ECE",
                                "MECH",
                                "IT",
                                "AIDS",
                                "AIML",
                                "AGRI",
                                "BME",
                              ].map((d) => (
                                <SelectItem key={d} value={d}>
                                  {d}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="year"
                            className="text-xs text-muted-foreground"
                          >
                            Year
                          </Label>
                          <Select value={year} onValueChange={setYear} required>
                            <SelectTrigger className="bg-white/5 border-white/10 h-10">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {["I", "II", "III", "IV"].map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="section"
                            className="text-xs text-muted-foreground"
                          >
                            Class Section
                          </Label>
                          <Select
                            value={classSection}
                            onValueChange={setClassSection}
                            required
                            defaultValue="A"
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-10">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {["A", "B"].map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                  {s === "A" && " (use A if single)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label
                            htmlFor="mobile"
                            className="text-xs text-muted-foreground"
                          >
                            Mobile Number
                          </Label>
                          <Input
                            id="mobile"
                            value={mobileNumber}
                            onChange={(e) => {
                              const value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              setMobileNumber(value);
                            }}
                            placeholder="10 digits"
                            required
                            type="tel"
                            maxLength={10}
                            className="bg-white/5 border-white/10 focus:border-purple-500/60 h-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40 transition-all h-10"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : needsDetails ? (
                      "Create Account & Continue"
                    ) : (
                      "Continue with Register Number"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ ADMIN / STAFF TAB ============ */}
          <TabsContent value="admin" className="mt-3">
            <Card className="border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl shadow-purple-950/20">
              <CardHeader className="pb-4 space-y-1">
                <CardTitle className="text-lg">
                  Admin / Coordinator Login
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  Sign in with your credentials provided by the system
                  administrator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-950/40 border border-red-500/30 p-3 text-sm text-red-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="adminUser"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      User ID
                    </Label>
                    <Input
                      id="adminUser"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Register Number / User ID"
                      required
                      autoComplete="username"
                      className="bg-white/5 border-white/10 focus:border-purple-500/60 focus:ring-purple-500/20 placeholder:text-muted-foreground/50 h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="adminPass"
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      Password
                    </Label>
                    <Input
                      id="adminPass"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="bg-white/5 border-white/10 focus:border-purple-500/60 focus:ring-purple-500/20 placeholder:text-muted-foreground/50 h-10"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg shadow-purple-900/40 transition-all h-10"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <p className="text-center text-[11px] text-muted-foreground/50">
          MASS 2K26 &bull; Powered by the Cultural Committee
        </p>
      </div>
    </div>
  );
}

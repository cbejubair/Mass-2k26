"use client";

import { useState, useCallback } from "react";
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
import { GraduationCap, Shield, Loader2 } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">
            Taking you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-purple-950/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            MASS 2K26
          </h1>
          <p className="text-muted-foreground">Event Management System</p>
        </div>

        <Tabs
          defaultValue="student"
          className="w-full"
          onValueChange={() => setError("")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              Student
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Shield className="h-4 w-4" />
              Admin / Co-ordinator
            </TabsTrigger>
          </TabsList>

          {/* ============ STUDENT TAB ============ */}
          <TabsContent value="student">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Student Access</CardTitle>
                <CardDescription>
                  Enter your register number to continue. New students will be
                  asked for additional details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="regNum">Register Number</Label>
                    <Input
                      id="regNum"
                      value={registerNumber}
                      onChange={(e) => {
                        setRegisterNumber(e.target.value);
                        setNeedsDetails(false);
                        setError("");
                      }}
                      placeholder="e.g. 22CS101"
                      required
                      autoComplete="username"
                    />
                  </div>

                  {needsDetails && (
                    <div className="space-y-3 rounded-lg border border-border p-4">
                      <p className="text-sm text-muted-foreground font-medium">
                        New student — please fill your details:
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="dept">Department</Label>
                          <Select
                            value={department}
                            onValueChange={setDepartment}
                            required
                          >
                            <SelectTrigger>
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
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Select value={year} onValueChange={setYear} required>
                            <SelectTrigger>
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
                        <div className="space-y-2">
                          <Label htmlFor="section">Class</Label>
                          <Select
                            value={classSection}
                            onValueChange={setClassSection}
                            required
                            defaultValue="A"
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {["A", "B"].map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                  {s === "A" && " (single class use A)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mobile">Mobile Number</Label>
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
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
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
          <TabsContent value="admin">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Admin / Coordinator Login</CardTitle>
                <CardDescription>
                  Sign in with your credentials provided by the system
                  administrator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {error && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="adminUser">User ID</Label>
                    <Input
                      id="adminUser"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Register Number / User ID"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminPass">Password</Label>
                    <Input
                      id="adminPass"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
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
      </div>
    </div>
  );
}

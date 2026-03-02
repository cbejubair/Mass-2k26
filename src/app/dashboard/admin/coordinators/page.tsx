"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Plus, Trash2, UserPlus } from "lucide-react";

interface Coordinator {
  id: string;
  register_number: string;
  name: string;
  department: string;
  year: string;
  class_section: string;
  role: string;
}

export default function AdminCoordinatorsPage() {
  const departmentOptions = [
    "CSE",
    "ECE",
    "EEE",
    "MECH",
    "CIVIL",
    "IT",
    "AIDS",
  ];
  const yearOptions = ["I", "II", "III", "IV"];

  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    registerNumber: "",
    name: "",
    mobileNumber: "",
    department: "",
    year: "",
    classSection: "",
    password: "",
  });

  useEffect(() => {
    fetchCoordinators();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const res = await fetch("/api/admin/coordinators");
      const data = await res.json();
      setCoordinators(data.coordinators || []);
    } catch {
      console.error("Failed to fetch coordinators");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/coordinators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create coordinator");
        return;
      }

      setSuccess(`Coordinator ${formData.name} created successfully!`);
      setFormData({
        registerNumber: "",
        name: "",
        mobileNumber: "",
        department: "",
        year: "",
        classSection: "",
        password: "",
      });
      setShowForm(false);
      fetchCoordinators();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Remove this coordinator? Their account will revert to student role.",
      )
    )
      return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/coordinators?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchCoordinators();
        setSuccess("Coordinator removed");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove");
      }
    } catch {
      setError("Network error");
    } finally {
      setDeleting(null);
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
          <h1 className="text-xl sm:text-2xl font-bold">Class Coordinators</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage class coordinator accounts
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <UserPlus className="h-4 w-4" /> Add Coordinator
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Coordinator</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Register Number</Label>
                  <Input
                    value={formData.registerNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registerNumber: e.target.value,
                      })
                    }
                    placeholder="e.g., 2024CSE001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value })
                    }
                    placeholder="e.g., 9876543210"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) =>
                      setFormData({ ...formData, year: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class Section</Label>
                  <Input
                    value={formData.classSection}
                    onChange={(e) =>
                      setFormData({ ...formData, classSection: e.target.value })
                    }
                    placeholder="e.g., A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Login password"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Create Coordinator
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Register No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Section</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coordinators.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm">
                  {c.register_number}
                </TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.department}</TableCell>
                <TableCell>{c.year}</TableCell>
                <TableCell>{c.class_section}</TableCell>
                <TableCell>
                  <Badge variant="default">Coordinator</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                  >
                    {deleting === c.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {coordinators.length === 0 && !showForm && (
        <p className="text-center text-muted-foreground py-8">
          No coordinators yet. Create your first class coordinator!
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  payment_status: string;
  screenshot_url: string;
  created_at?: string;
}

interface Student {
  id: string;
  register_number: string;
  name: string;
  department?: string;
  year?: string;
  class_section?: string;
  payments: Payment[];
  event_registrations: {
    support_status: boolean;
    willing_to_coordinate: boolean;
    interested_roles: string[];
  }[];
  performance_registrations: {
    performance_type: string;
    approval_status: string;
  }[];
  entry_qr: {
    is_active: boolean;
    checked_in_at: string | null;
    checked_out_at: string | null;
  }[];
}

interface ClassScope {
  department: string | null;
  year: string | null;
  classSection: string | null;
  label: string;
}

export default function CoordinatorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [classScope, setClassScope] = useState<ClassScope | null>(null);

  const fetchStudents = () => {
    setLoading(true);
    fetch("/api/coordinator/students")
      .then((r) => r.json())
      .then((data) => {
        setStudents(data.students || []);
        if (data.classScope) setClassScope(data.classScope);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleVerify = async (paymentId: string, status: string) => {
    setVerifying(paymentId);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });
      if (res.ok) fetchStudents();
    } catch {
      alert("Failed to verify payment");
    } finally {
      setVerifying(null);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number?.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingCount = students.filter(
    (s) => s.payments?.[0]?.payment_status === "pending",
  ).length;

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
          <h1 className="text-xl sm:text-2xl font-bold">Class Students</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {classScope
              ? `Class: ${classScope.label} — ${students.length} student(s)`
              : `${students.length} student(s)`}
          </p>
        </div>
        <Input
          type="text"
          placeholder="Search by name or register number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      {pendingCount > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Pending Payment Approvals</p>
              <p className="font-semibold text-amber-400">
                {pendingCount} student(s) awaiting approval
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead>Register No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Willing</TableHead>
              <TableHead>Interested Roles</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Approve / Reject</TableHead>
              <TableHead>Performances</TableHead>
              <TableHead>QR</TableHead>
              <TableHead>Entry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => {
              const payment = student.payments?.[0];
              const reg = student.event_registrations?.[0];
              const qr = student.entry_qr?.[0];

              return (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-sm">
                    {student.register_number}
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Badge variant={reg ? "default" : "secondary"}>
                      {reg ? "Done" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reg ? (
                      <Badge
                        variant={
                          reg.willing_to_coordinate ? "default" : "secondary"
                        }
                      >
                        {reg.willing_to_coordinate ? "Yes" : "No"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {reg?.interested_roles?.length ? (
                      <span className="text-xs text-muted-foreground max-w-[220px] block truncate">
                        {reg.interested_roles.join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment ? (
                      <span className="font-medium">₹{payment.amount}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment?.screenshot_url ? (
                      <a
                        href={payment.screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment ? (
                      <Badge
                        variant={
                          payment.payment_status === "approved"
                            ? "default"
                            : payment.payment_status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {payment.payment_status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {payment?.payment_status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-400 border-green-500/50 hover:bg-green-500/10 text-xs h-7"
                          onClick={() => handleVerify(payment.id, "approved")}
                          disabled={verifying === payment.id}
                        >
                          {verifying === payment.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/50 hover:bg-red-500/10 text-xs h-7"
                          onClick={() => handleVerify(payment.id, "rejected")}
                          disabled={verifying === payment.id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {student.performance_registrations?.length || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={qr?.is_active ? "default" : "secondary"}>
                      {qr?.is_active ? "Active" : "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {qr?.checked_in_at ? (
                      <Badge variant="default">
                        {qr?.checked_out_at ? "Out" : "In"}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No students found
        </p>
      )}
    </div>
  );
}

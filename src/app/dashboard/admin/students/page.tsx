"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, Download } from "lucide-react";

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
  department: string;
  year: string;
  class_section: string;
  mobile_number: string;
  event_registrations: {
    support_status: boolean;
    willing_to_coordinate: boolean;
    interested_roles: string[];
    remarks: string | null;
  }[];
  payments: Payment[];
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [remarkModal, setRemarkModal] = useState<{
    studentId: string;
    name: string;
  } | null>(null);
  const [remark, setRemark] = useState("");

  const fetchStudents = () => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((data) => setStudents(data.students || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const uniqueDepts = Array.from(new Set(students.map((s) => s.department)))
    .filter((d): d is string => Boolean(d))
    .sort();
  const uniqueYears = Array.from(new Set(students.map((s) => s.year)))
    .filter((y): y is string => Boolean(y))
    .sort();
  const uniqueSections = Array.from(
    new Set(students.map((s) => s.class_section)),
  )
    .filter((c): c is string => Boolean(c))
    .sort();

  const filtered = students.filter((s) => {
    const query = search.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(query) ||
      s.register_number?.toLowerCase().includes(query) ||
      s.department?.toLowerCase().includes(query);

    const matchesDept = deptFilter === "all" || s.department === deptFilter;
    const matchesYear = yearFilter === "all" || s.year === yearFilter;
    const matchesSection =
      sectionFilter === "all" || s.class_section === sectionFilter;

    return matchesSearch && matchesDept && matchesYear && matchesSection;
  });

  const exportExcel = () => {
    import("xlsx").then((XLSX) => {
      const rows = filtered.map((s, i) => {
        const reg = s.event_registrations?.[0];
        const pay = s.payments?.[0];
        const qr = s.entry_qr?.[0];
        return {
          "S.No": i + 1,
          "Register No": s.register_number || "",
          Name: s.name,
          Department: s.department || "",
          Year: s.year || "",
          Section: s.class_section || "",
          Registered: reg ? "Yes" : "No",
          Willing: reg?.willing_to_coordinate ? "Yes" : "No",
          "Interested Roles": reg?.interested_roles?.join(", ") || "",
          "Payment Amount": pay ? `₹${pay.amount}` : "N/A",
          "Payment Status": pay?.payment_status || "N/A",
          Performances: s.performance_registrations?.length || 0,
          "Entry Status": qr?.checked_in_at
            ? qr?.checked_out_at
              ? "Out"
              : "In"
            : "Not Entered",
          Remarks: reg?.remarks || "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "students.xlsx");
    });
  };

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

  const handleAddRemark = async () => {
    if (!remarkModal || !remark.trim()) return;

    try {
      await fetch("/api/admin/remarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: remarkModal.studentId,
          remarks: remark,
        }),
      });
      setRemarkModal(null);
      setRemark("");
      fetchStudents();
    } catch {
      alert("Failed");
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
        <h1 className="text-xl sm:text-2xl font-bold">
          All Students ({students.length})
        </h1>
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <Input
            type="text"
            placeholder="Search name, register no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={exportExcel}
            disabled={filtered.length === 0}
            className="flex-shrink-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {uniqueDepts.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {uniqueYears.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sectionFilter} onValueChange={setSectionFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sections</SelectItem>
            {uniqueSections.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
        <Table className="min-w-[1200px]">
          <TableHeader>
            <TableRow>
              <TableHead>Register No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Year/Sec</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Willing</TableHead>
              <TableHead>Interested Roles</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Screenshot</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Approve / Reject</TableHead>
              <TableHead>Performances</TableHead>
              <TableHead>QR</TableHead>
              <TableHead>Entry</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const reg = s.event_registrations?.[0];
              const pay = s.payments?.[0];
              const qr = s.entry_qr?.[0];

              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">
                    {s.register_number}
                  </TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.department}</TableCell>
                  <TableCell>
                    {s.year} {s.class_section}
                  </TableCell>
                  <TableCell>
                    <Badge variant={reg ? "default" : "secondary"}>
                      {reg ? "Yes" : "No"}
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
                    {pay ? (
                      <span className="font-medium">₹{pay.amount}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pay?.screenshot_url ? (
                      <a
                        href={pay.screenshot_url}
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
                    {pay ? (
                      <Badge
                        variant={
                          pay.payment_status === "approved"
                            ? "default"
                            : pay.payment_status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {pay.payment_status}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {pay?.payment_status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-400 border-green-500/50 hover:bg-green-500/10 text-xs h-7"
                          onClick={() => handleVerify(pay.id, "approved")}
                          disabled={verifying === pay.id}
                        >
                          {verifying === pay.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 border-red-500/50 hover:bg-red-500/10 text-xs h-7"
                          onClick={() => handleVerify(pay.id, "rejected")}
                          disabled={verifying === pay.id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {s.performance_registrations?.length || 0}
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
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7"
                      onClick={() =>
                        setRemarkModal({ studentId: s.id, name: s.name })
                      }
                    >
                      📝 Remark
                    </Button>
                    {reg?.remarks && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">
                        {reg.remarks}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Remark Modal */}
      {remarkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="font-semibold mb-3">
              Add Remark for {remarkModal.name}
            </h3>
            <Textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="min-h-[80px] mb-3"
              placeholder="Enter remark..."
            />
            <div className="flex gap-2">
              <Button onClick={handleAddRemark} className="flex-1">
                Save
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setRemarkModal(null);
                  setRemark("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No students found
        </p>
      )}
    </div>
  );
}

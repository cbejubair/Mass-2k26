"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface StudentWillingness {
  id: string;
  register_number: string | null;
  name: string;
  department: string | null;
  year: string | null;
  class_section: string | null;
  event_registrations: {
    support_status: boolean;
    willing_to_coordinate: boolean;
    interested_roles: string[];
    remarks: string | null;
  }[];
}

export default function AdminWillingnessPage() {
  const [students, setStudents] = useState<StudentWillingness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/students")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          throw new Error(data.error || "Failed to load students");
        }
        return data;
      })
      .then((data) => setStudents(data.students || []))
      .catch((err) => {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load data",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Students who submitted willingness form
  const submitted = students.filter(
    (student) => (student.event_registrations?.length || 0) > 0,
  );
  const willingCount = submitted.filter(
    (student) => student.event_registrations?.[0]?.willing_to_coordinate,
  ).length;

  const filtered = submitted.filter((student) => {
    const reg = student.event_registrations?.[0];
    const roles = reg?.interested_roles?.join(" ") || "";

    const query = search.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      (student.register_number || "").toLowerCase().includes(query) ||
      (student.department || "").toLowerCase().includes(query) ||
      roles.toLowerCase().includes(query)
    );
  });

  const exportExcel = () => {
    const rows = filtered.map((student, i) => {
      const reg = student.event_registrations[0];
      return {
        "S.No": i + 1,
        "Register No": student.register_number || "",
        Name: student.name,
        Department: student.department || "",
        Year: student.year || "",
        Section: student.class_section || "",
        "Supports Event": reg.support_status ? "Yes" : "No",
        "Interested Roles": reg.interested_roles?.join(", ") || "",
        Remarks: reg.remarks || "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Willing Coordinators");
    XLSX.writeFile(wb, "willing_coordinators.xlsx");
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
          <h1 className="text-xl sm:text-2xl font-bold">Willingness Details</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {submitted.length} submitted • {willingCount} willing to coordinate
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search name, register no, department, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72"
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

      <div className="rounded-lg border border-border overflow-x-auto">
        {loadError && (
          <p className="px-4 py-3 text-sm text-red-400 border-b border-red-500/20 bg-red-500/10">
            {loadError}
          </p>
        )}
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead>Register No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Dept</TableHead>
              <TableHead>Year/Sec</TableHead>
              <TableHead>Support</TableHead>
              <TableHead>Willing</TableHead>
              <TableHead>Interested Roles</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => {
              const reg = student.event_registrations[0];
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-mono text-sm">
                    {student.register_number || "-"}
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.department || "-"}</TableCell>
                  <TableCell>
                    {student.year || "-"} {student.class_section || ""}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={reg.support_status ? "default" : "secondary"}
                    >
                      {reg.support_status ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        reg.willing_to_coordinate ? "default" : "secondary"
                      }
                    >
                      {reg.willing_to_coordinate ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reg.interested_roles?.length ? (
                      <span className="text-xs text-muted-foreground max-w-[260px] block truncate">
                        {reg.interested_roles.join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {reg.remarks ? (
                      <span className="text-xs text-muted-foreground max-w-[220px] block truncate">
                        {reg.remarks}
                      </span>
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
          No willingness records found
        </p>
      )}
    </div>
  );
}

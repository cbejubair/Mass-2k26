"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface StudentWillingness {
  id: string;
  register_number: string;
  name: string;
  department: string;
  year: string;
  class_section: string;
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

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((data) => setStudents(data.students || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const withForm = students.filter(
    (student) => student.event_registrations?.[0],
  );

  const filtered = withForm.filter((student) => {
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

  const willingCount = withForm.filter(
    (student) => student.event_registrations?.[0]?.willing_to_coordinate,
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
          <h1 className="text-xl sm:text-2xl font-bold">Willingness Details</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {withForm.length} form(s) submitted • {willingCount} willing to
            coordinate
          </p>
        </div>
        <Input
          type="text"
          placeholder="Search name, register no, department, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80"
        />
      </div>

      <div className="rounded-lg border border-border overflow-x-auto">
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
                    {student.register_number}
                  </TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>
                    {student.year} {student.class_section}
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

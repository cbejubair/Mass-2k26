"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

type BreakdownRow = {
  studentCount: number;
  paidCount: number;
  approvedRevenue: number;
  pendingCount: number;
};

type DepartmentRow = BreakdownRow & { department: string };
type YearRow = BreakdownRow & { year: string };
type ClassRow = BreakdownRow & {
  department: string;
  year: string;
  classSection: string;
};

type CoordinatorRow = {
  id: string;
  name: string;
  registerNumber: string | null;
  mobileNumber: string;
  department: string;
  year: string;
  classSection: string;
  studentsInClass: number;
  verifiedCount: number;
  approvedCount: number;
  rejectedCount: number;
};

type PendingPayment = {
  id: string;
  amount: number;
  paymentMode: string | null;
  transactionRef: string | null;
  screenshotUrl: string | null;
  createdAt: string | null;
  student: {
    name: string;
    registerNumber: string | null;
    department: string;
    year: string;
    classSection: string;
  };
  classCoordinator: {
    name: string;
    registerNumber: string | null;
    mobileNumber: string;
  } | null;
};

type LoginRow = {
  userId: string;
  name: string;
  registerNumber: string | null;
  department: string;
  year: string;
  classSection: string;
  ipAddress: string | null;
  loggedInAt: string;
};

type TrackingResponse = {
  overview: {
    totalStudents: number;
    totalApprovedPayments: number;
    approvedRevenueTotal: number;
    pendingPayments: number;
    pendingAmountTotal: number;
    totalStudentLogins: number;
    todayStudentLogins: number;
  };
  departmentWise: DepartmentRow[];
  yearWise: YearRow[];
  classWise: ClassRow[];
  classCoordinators: CoordinatorRow[];
  pendingPayments: PendingPayment[];
  recentStudentLogins: LoginRow[];
};

const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

export default function AdminTrackingDashboard() {
  const [data, setData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [loginSearch, setLoginSearch] = useState("");
  const [paymentSearch, setPaymentSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/tracking", { cache: "no-store" });
      const body = await res.json();
      if (res.ok) {
        setData(body as TrackingResponse);
      }
    } catch {
      console.error("Failed to fetch tracking dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const verifyPayment = async (
    paymentId: string,
    status: "approved" | "rejected",
  ) => {
    setVerifyingId(paymentId);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error || "Failed to update payment");
        return;
      }

      await fetchData();
    } catch {
      alert("Failed to update payment");
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredLogins = useMemo(() => {
    if (!data) return [];
    const query = loginSearch.trim().toLowerCase();
    if (!query) return data.recentStudentLogins;
    return data.recentStudentLogins.filter(
      (row) =>
        row.name.toLowerCase().includes(query) ||
        (row.registerNumber || "").toLowerCase().includes(query) ||
        row.department.toLowerCase().includes(query),
    );
  }, [data, loginSearch]);

  const filteredPendingPayments = useMemo(() => {
    if (!data) return [];
    const query = paymentSearch.trim().toLowerCase();
    if (!query) return data.pendingPayments;
    return data.pendingPayments.filter(
      (row) =>
        row.student.name.toLowerCase().includes(query) ||
        (row.student.registerNumber || "").toLowerCase().includes(query) ||
        row.student.department.toLowerCase().includes(query) ||
        (row.transactionRef || "").toLowerCase().includes(query),
    );
  }, [data, paymentSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Unable to load tracking dashboard
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Tracking Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Department-wise, class-wise, year-wise student and finance tracking
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Students"
          value={data.overview.totalStudents}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Approved Payments"
          value={data.overview.totalApprovedPayments}
          icon="💳"
          color="green"
        />
        <StatCard
          title="Approved Revenue"
          value={(formatCurrency((data.overview.totalApprovedPayments)*500))}
          icon="₹"
          color="amber"
        />
        <StatCard
          title="Pending Payments"
          value={data.overview.pendingPayments}
          icon="⏳"
          color="indigo"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency((data.overview.pendingPayments)*500)}
          icon="₹"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Department-wise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.departmentWise.map((row) => (
              <div key={row.department} className="rounded-md border p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{row.department}</p>
                  <Badge variant="secondary">{row.studentCount} students</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid {row.paidCount} • Pending {row.pendingCount} • Revenue{" "}
                  {formatCurrency(row.approvedRevenue)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Year-wise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.yearWise.map((row) => (
              <div key={row.year} className="rounded-md border p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">Year {row.year}</p>
                  <Badge variant="secondary">{row.studentCount} students</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid {row.paidCount} • Pending {row.pendingCount} • Revenue{" "}
                  {formatCurrency(row.approvedRevenue)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Class-wise</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-auto space-y-2">
            {data.classWise.map((row) => (
              <div
                key={`${row.department}-${row.year}-${row.classSection}`}
                className="rounded-md border p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">
                    {row.department} • {row.year}-{row.classSection}
                  </p>
                  <Badge variant="secondary">{row.studentCount}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Paid {row.paidCount} • Pending {row.pendingCount} • Revenue{" "}
                  {formatCurrency(row.approvedRevenue)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pending Payment Verification & Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search pending payments by name, reg no, department, txn ref"
            value={paymentSearch}
            onChange={(event) => setPaymentSearch(event.target.value)}
          />
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[1150px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department/Class</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Details</TableHead>
                  <TableHead>Class Coordinator</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPendingPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{payment.student.name}</p>
                        <p className="text-muted-foreground font-mono text-xs">
                          {payment.student.registerNumber || "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.student.department} • {payment.student.year}-
                      {payment.student.classSection}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <p className="capitalize">
                        {payment.paymentMode || "upi"}
                      </p>
                      <p className="font-mono">
                        {payment.transactionRef || "-"}
                      </p>
                      <p>
                        {payment.createdAt
                          ? new Date(payment.createdAt).toLocaleString()
                          : "-"}
                      </p>
                      {payment.screenshotUrl && (
                        <a
                          href={payment.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline"
                        >
                          View Screenshot
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.classCoordinator ? (
                        <>
                          <p className="font-medium">
                            {payment.classCoordinator.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {payment.classCoordinator.registerNumber || "-"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.classCoordinator.mobileNumber}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Not Assigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={verifyingId === payment.id}
                          onClick={() => verifyPayment(payment.id, "approved")}
                        >
                          {verifyingId === payment.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Approve"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={verifyingId === payment.id}
                          onClick={() => verifyPayment(payment.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPendingPayments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No pending payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Coordinator Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[950px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Coordinator</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.classCoordinators.map((coordinator) => (
                  <TableRow key={coordinator.id}>
                    <TableCell>
                      <p className="font-medium">{coordinator.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {coordinator.registerNumber || "-"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {coordinator.department} • {coordinator.year}-
                      {coordinator.classSection}
                    </TableCell>
                    <TableCell>{coordinator.mobileNumber}</TableCell>
                    <TableCell>{coordinator.studentsInClass}</TableCell>
                    <TableCell>{coordinator.verifiedCount}</TableCell>
                    <TableCell>{coordinator.approvedCount}</TableCell>
                    <TableCell>{coordinator.rejectedCount}</TableCell>
                  </TableRow>
                ))}
                {data.classCoordinators.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No class coordinators found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle className="text-base">Student Login Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Search logins by name, register no, department"
            value={loginSearch}
            onChange={(event) => setLoginSearch(event.target.value)}
          />
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Register No</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year/Class</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Logged In At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogins.map((login) => (
                  <TableRow key={`${login.userId}-${login.loggedInAt}`}>
                    <TableCell>{login.name}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {login.registerNumber || "-"}
                    </TableCell>
                    <TableCell>{login.department}</TableCell>
                    <TableCell>
                      {login.year}-{login.classSection}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {login.ipAddress || "-"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {new Date(login.loggedInAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLogins.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No login records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Users,
  CreditCard,
  ScanLine,
  Download,
  Disc3,
} from "lucide-react";
import Link from "next/link";

interface ClassStats {
  totalStudents: number;
  totalRegistered: number;
  willingCount: number;
  totalPaid: number;
  pendingPayments: number;
  totalPerformances: number;
}

interface CoordinatorScope {
  department: string | null;
  year: string | null;
  classSection: string | null;
  label: string;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function CoordinatorDashboard() {
  const [stats, setStats] = useState<ClassStats>({
    totalStudents: 0,
    totalRegistered: 0,
    willingCount: 0,
    totalPaid: 0,
    pendingPayments: 0,
    totalPerformances: 0,
  });
  const [loading, setLoading] = useState(true);
  const [classScope, setClassScope] = useState<CoordinatorScope | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>({
    totalPayments: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/coordinator/stats");
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.classScope) setClassScope(data.classScope);
        if (data.paymentSummary) setPaymentSummary(data.paymentSummary);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Coordinator Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage students within your assigned routing scope
        </p>
        {classScope && (
          <div className="mt-2">
            <Badge variant="secondary">Scope: {classScope.label}</Badge>
          </div>
        )}
        <div className="mt-3">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => window.dispatchEvent(new Event("open-dj-poll"))}
          >
            <Disc3 className="h-4 w-4" /> Show DJ Poll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Willing Students"
          value={stats.willingCount}
          subtitle={`${stats.totalRegistered} forms submitted`}
          icon="📝"
          color="indigo"
        />
        <StatCard
          title="Scoped Students"
          value={stats.totalStudents}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Paid Students"
          value={stats.totalPaid}
          icon="💳"
          color="green"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          subtitle={`₹${paymentSummary.pendingAmount.toLocaleString()} pending amount`}
          icon="⏳"
          color="amber"
        />
        <StatCard
          title="Performances"
          value={stats.totalPerformances}
          icon="🎭"
          color="purple"
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Total Payment Entries</p>
              <p className="text-lg font-semibold">
                {paymentSummary.totalPayments}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold">
                ₹{paymentSummary.totalAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Pending Approval Amount</p>
              <p className="text-lg font-semibold text-amber-400">
                ₹{paymentSummary.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        <Button asChild size="sm">
          <Link href="/dashboard/coordinator/students">
            <Users className="h-4 w-4" /> View Students
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/dashboard/coordinator/payments">
            <CreditCard className="h-4 w-4" /> Review Payments
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/dashboard/coordinator/scanner">
            <ScanLine className="h-4 w-4" /> QR Scanner
          </Link>
        </Button>
        <Button
          size="sm"
          onClick={() => {
            window.location.href = "/api/export/coordinator";
          }}
        >
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>
    </div>
  );
}

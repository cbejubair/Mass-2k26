"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CoordinatorStats {
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
  accessLevel: string;
}

interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function CoordinatorStatsPage() {
  const [stats, setStats] = useState<CoordinatorStats | null>(null);
  const [scope, setScope] = useState<CoordinatorScope | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/coordinator/stats");
        const data = await res.json();
        setStats(data.stats || null);
        setScope(data.classScope || null);
        setPaymentSummary(data.paymentSummary || null);
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

  if (!stats) {
    return (
      <p className="text-sm text-muted-foreground">Unable to load stats.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Coordinator Stats</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Analytics for your coordinator routing scope.
        </p>
        {scope && (
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary">Scope: {scope.label}</Badge>
            <Badge variant="outline" className="capitalize">
              {scope.accessLevel}
            </Badge>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Students"
          value={stats.totalStudents}
          icon="👥"
          color="purple"
        />
        <StatCard
          title="Registered"
          value={stats.totalRegistered}
          icon="📝"
          color="indigo"
        />
        <StatCard
          title="Willing"
          value={stats.willingCount}
          icon="🤝"
          color="green"
        />
        <StatCard
          title="Paid"
          value={stats.totalPaid}
          icon="💳"
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats.pendingPayments}
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

      {paymentSummary && (
        <Card>
          <CardContent className="p-5">
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-muted-foreground">Payment Entries</p>
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
                <p className="text-muted-foreground">Pending Amount</p>
                <p className="text-lg font-semibold text-amber-400">
                  ₹{paymentSummary.pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

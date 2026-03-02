"use client";

import { useEffect, useState } from "react";
import QRDisplay from "@/components/qr/QRDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  AlertTriangle,
  Lock,
  LogIn,
  LogOut,
  History,
} from "lucide-react";

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface ScanLog {
  action: "check_in" | "check_out";
  entry_number: number;
  scanned_at: string;
}

export default function QRTicketPage() {
  const [qr, setQr] = useState<{
    qr_token: string;
    is_active: boolean;
    checked_in_at: string | null;
    checked_out_at: string | null;
    total_entries: number;
    scan_logs: ScanLog[];
  } | null>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    registerNumber: string;
  }>({ name: "", registerNumber: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQR() {
      try {
        const res = await fetch("/api/qr/generate", { method: "POST" });
        const data = await res.json();
        if (data.qr) {
          setQr(data.qr);
        } else if (data.error) {
          setError(data.error);
        } else {
          setError("QR ticket is not available yet");
        }
      } catch {
        setError("Failed to load QR ticket");
      } finally {
        setLoading(false);
      }
    }
    setUserInfo({ name: "Student", registerNumber: "" });
    fetchQR();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isInsideNow = !!qr?.checked_in_at && !qr?.checked_out_at;
  const entryCount = qr?.total_entries ?? 0;
  const logs = qr?.scan_logs ?? [];

  // Group logs by entry_number for display
  const entryCycles = Array.from(new Set(logs.map((l) => l.entry_number))).sort(
    (a, b) => a - b,
  );

  return (
    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold">QR Ticket</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your entry pass for MASS 2K26
        </p>
      </div>

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-3" />
            <p className="text-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Complete your registration and get payment approved to generate
              your QR ticket.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Inactive */}
      {qr && !qr.is_active && (
        <Card>
          <CardContent className="p-6 text-center">
            <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground">QR ticket is currently inactive</p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact admin if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active QR */}
      {qr && qr.is_active && (
        <>
          {/* Status banner */}
          <div
            className={`rounded-xl border px-4 py-3 flex items-center gap-3 text-sm font-medium ${
              isInsideNow
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {isInsideNow ? (
              <LogIn className="w-4 h-4 flex-shrink-0" />
            ) : (
              <LogOut className="w-4 h-4 flex-shrink-0" />
            )}
            <span>
              {isInsideNow
                ? `Currently inside — ${ordinal(entryCount)} entry since ${new Date(qr.checked_in_at!).toLocaleTimeString()}`
                : entryCount > 0
                  ? `Currently outside — ${entryCount} entr${entryCount === 1 ? "y" : "ies"} recorded`
                  : "Not yet checked in"}
            </span>
          </div>

          {/* QR code */}
          <Card>
            <CardContent className="p-6">
              <QRDisplay
                token={qr.qr_token}
                studentName={userInfo.name}
                registerNumber={userInfo.registerNumber}
              />
            </CardContent>
          </Card>

          {/* Entry history */}
          {logs.length > 0 && (
            <Card className="border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Entry History
                  <Badge variant="outline" className="ml-auto text-xs">
                    {entryCount} {entryCount === 1 ? "entry" : "entries"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <Separator className="bg-white/5" />
              <CardContent className="px-4 py-2 divide-y divide-white/5">
                {entryCycles.map((cycle) => {
                  const checkIn = logs.find(
                    (l) => l.entry_number === cycle && l.action === "check_in",
                  );
                  const checkOut = logs.find(
                    (l) => l.entry_number === cycle && l.action === "check_out",
                  );
                  return (
                    <div key={cycle} className="py-3 space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {ordinal(cycle)} Entry
                      </p>
                      {checkIn && (
                        <div className="flex items-center gap-2 text-xs">
                          <LogIn className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span className="text-emerald-400">Entered</span>
                          <span className="text-muted-foreground ml-auto">
                            {new Date(checkIn.scanned_at).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {checkOut && (
                        <div className="flex items-center gap-2 text-xs">
                          <LogOut className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="text-blue-400">Exited</span>
                          <span className="text-muted-foreground ml-auto">
                            {new Date(checkOut.scanned_at).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {checkIn && !checkOut && (
                        <div className="flex items-center gap-2 text-xs text-emerald-400/70">
                          <span className="w-3.5" />
                          <span>Still inside</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import QRScanner from "@/components/qr/QRScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogIn,
  LogOut,
} from "lucide-react";

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface ScanResult {
  valid: boolean;
  action: string;
  message: string;
  entryNumber?: number;
  student?: {
    name: string;
    register_number: string;
    department: string;
    year: string;
    class_section: string;
  };
}

export default function CoordinatorScannerPage() {
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleScanResult = (result: ScanResult) => {
    setLastResult(result);
    setScanHistory((prev) => [result, ...prev].slice(0, 20));
  };

  const getIcon = (action: string, large = false) => {
    const cls = large ? "h-10 w-10" : "h-4 w-4";
    if (action === "checked_in")
      return <LogIn className={`${cls} text-green-400`} />;
    if (action === "checked_out")
      return <LogOut className={`${cls} text-blue-400`} />;
    if (action === "already_done")
      return <AlertTriangle className={`${cls} text-amber-400`} />;
    return <XCircle className={`${cls} text-red-400`} />;
  };

  const getTitle = (action: string, entryNumber?: number) => {
    if (action === "checked_in")
      return entryNumber && entryNumber > 1
        ? `${ordinal(entryNumber).toUpperCase()} ENTRY — IN`
        : "CHECKED IN";
    if (action === "checked_out")
      return entryNumber
        ? `${ordinal(entryNumber).toUpperCase()} ENTRY — OUT`
        : "CHECKED OUT";
    if (action === "already_done") return "ALREADY COMPLETE";
    return "ENTRY DENIED";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">QR Scanner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Scan student QR codes for check-in / check-out
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <QRScanner onScanResult={handleScanResult} />
        </CardContent>
      </Card>

      {lastResult && (
        <Card
          className={`border-2 ${
            lastResult.action === "checked_in"
              ? "border-green-500/50 bg-green-500/5"
              : lastResult.action === "checked_out"
                ? "border-blue-500/50 bg-blue-500/5"
                : lastResult.action === "already_done"
                  ? "border-amber-500/50 bg-amber-500/5"
                  : "border-red-500/50 bg-red-500/5"
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {getIcon(lastResult.action, true)}
              <div>
                <h3 className="font-bold text-lg">
                  {getTitle(lastResult.action, lastResult.entryNumber)}
                </h3>
                {lastResult.entryNumber &&
                  lastResult.entryNumber > 1 &&
                  lastResult.action === "checked_in" && (
                    <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Re-entry #{lastResult.entryNumber}
                    </span>
                  )}
                <p className="text-sm text-muted-foreground">
                  {lastResult.message}
                </p>
                {lastResult.student && (
                  <div className="mt-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      {lastResult.student.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Reg No:</span>{" "}
                      {lastResult.student.register_number}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Dept:</span>{" "}
                      {lastResult.student.department} {lastResult.student.year}{" "}
                      {lastResult.student.class_section}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scanHistory.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Scans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scanHistory.slice(1).map((result, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 sm:gap-3 p-2 bg-secondary/50 rounded-lg text-sm"
              >
                {getIcon(result.action)}
                <span>{result.student?.name || "Unknown"}</span>
                <span className="text-muted-foreground">
                  {result.student?.register_number}
                </span>
                {result.entryNumber && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                    {ordinal(result.entryNumber)} entry
                  </span>
                )}
                <span className="ml-auto text-muted-foreground">
                  {result.action === "checked_in"
                    ? "IN"
                    : result.action === "checked_out"
                      ? "OUT"
                      : result.message}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

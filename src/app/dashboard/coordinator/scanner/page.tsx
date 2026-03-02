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

interface ScanResult {
  valid: boolean;
  action: string;
  message: string;
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

  const getTitle = (action: string) => {
    if (action === "checked_in") return "CHECKED IN";
    if (action === "checked_out") return "CHECKED OUT";
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
                  {getTitle(lastResult.action)}
                </h3>
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
                <span className="ml-auto text-muted-foreground">
                  {result.message}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

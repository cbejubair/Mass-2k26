"use client";

import { useState } from "react";
import QRScanner from "@/components/qr/QRScanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
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

export default function AdminScannerPage() {
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);
  const [checkOutCount, setCheckOutCount] = useState(0);

  const handleScanResult = (result: ScanResult) => {
    setLastResult(result);
    setScanHistory((prev) => [result, ...prev].slice(0, 50));
    if (result.action === "checked_in") setCheckInCount((c) => c + 1);
    if (result.action === "checked_out") setCheckOutCount((c) => c + 1);
  };

  const getResultStyle = (action: string) => {
    if (action === "checked_in") return "border-green-500/50 bg-green-500/5";
    if (action === "checked_out") return "border-blue-500/50 bg-blue-500/5";
    if (action === "already_done") return "border-amber-500/50 bg-amber-500/5";
    return "border-red-500/50 bg-red-500/5";
  };

  const getResultIcon = (action: string) => {
    if (action === "checked_in")
      return <LogIn className="h-12 w-12 text-green-400" />;
    if (action === "checked_out")
      return <LogOut className="h-12 w-12 text-blue-400" />;
    if (action === "already_done")
      return <AlertTriangle className="h-12 w-12 text-amber-400" />;
    return <XCircle className="h-12 w-12 text-red-400" />;
  };

  const getResultTitle = (action: string) => {
    if (action === "checked_in") return "CHECKED IN";
    if (action === "checked_out") return "CHECKED OUT";
    if (action === "already_done") return "ALREADY COMPLETE";
    return "ENTRY DENIED";
  };

  const getHistoryIcon = (action: string) => {
    if (action === "checked_in")
      return <LogIn className="h-4 w-4 text-green-400" />;
    if (action === "checked_out")
      return <LogOut className="h-4 w-4 text-blue-400" />;
    if (action === "already_done")
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Entry Gate Scanner</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Scan QR codes for check-in / check-out
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="text-center px-4 sm:px-5 py-2 sm:py-3">
            <p className="text-2xl font-bold text-green-400">{checkInCount}</p>
            <p className="text-xs text-muted-foreground">Check-ins</p>
          </Card>
          <Card className="text-center px-4 sm:px-5 py-2 sm:py-3">
            <p className="text-2xl font-bold text-blue-400">{checkOutCount}</p>
            <p className="text-xs text-muted-foreground">Check-outs</p>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <QRScanner onScanResult={handleScanResult} />
        </CardContent>
      </Card>

      {lastResult && (
        <Card
          className={`border-2 transition-all ${getResultStyle(lastResult.action)}`}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {getResultIcon(lastResult.action)}
              <div>
                <h3 className="font-bold text-xl">
                  {getResultTitle(lastResult.action)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {lastResult.message}
                </p>
                {lastResult.student && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">Name:</span>{" "}
                      <span className="font-semibold">
                        {lastResult.student.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Reg No:</span>{" "}
                      {lastResult.student.register_number}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Dept:</span>{" "}
                      {lastResult.student.department}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Class:</span>{" "}
                      {lastResult.student.year}{" "}
                      {lastResult.student.class_section}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Scan History ({scanHistory.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {scanHistory.map((result, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 sm:gap-3 p-2.5 bg-secondary/50 rounded-lg text-sm"
              >
                {getHistoryIcon(result.action)}
                <span className="font-medium">
                  {result.student?.name || "Unknown"}
                </span>
                <span className="text-muted-foreground">
                  {result.student?.register_number}
                </span>
                <span className="text-muted-foreground">
                  {result.student?.department}
                </span>
                <span className="ml-auto text-muted-foreground text-xs">
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

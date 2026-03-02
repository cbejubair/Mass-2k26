"use client";

import { useEffect, useState } from "react";
import QRDisplay from "@/components/qr/QRDisplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Lock,
  LogIn,
  LogOut,
} from "lucide-react";

export default function QRTicketPage() {
  const [qr, setQr] = useState<{
    qr_token: string;
    is_active: boolean;
    checked_in_at: string | null;
    checked_out_at: string | null;
  } | null>(null);
  const [userInfo, setUserInfo] = useState<{
    name: string;
    registerNumber: string;
  }>({
    name: "",
    registerNumber: "",
  });
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

  const isCheckedIn = !!qr?.checked_in_at;
  const isCheckedOut = !!qr?.checked_out_at;

  return (
    <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold">QR Ticket</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your entry pass for MASS 2K26
        </p>
      </div>

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

      {qr && qr.is_active && (
        <Card>
          <CardContent className="p-6">
            {isCheckedIn && isCheckedOut ? (
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto" />
                <h3 className="font-semibold text-lg">Visit Complete</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4 text-green-400" />
                    Checked in: {new Date(qr.checked_in_at!).toLocaleString()}
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <LogOut className="h-4 w-4 text-blue-400" />
                    Checked out: {new Date(qr.checked_out_at!).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : isCheckedIn ? (
              <div className="text-center space-y-3">
                <LogIn className="h-10 w-10 text-green-400 mx-auto" />
                <h3 className="font-semibold text-lg">Checked In</h3>
                <p className="text-muted-foreground text-sm">
                  Since: {new Date(qr.checked_in_at!).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Show this QR again at the exit gate for check-out.
                </p>
                <div className="pt-2">
                  <QRDisplay
                    token={qr.qr_token}
                    studentName={userInfo.name}
                    registerNumber={userInfo.registerNumber}
                  />
                </div>
              </div>
            ) : (
              <QRDisplay
                token={qr.qr_token}
                studentName={userInfo.name}
                registerNumber={userInfo.registerNumber}
              />
            )}
          </CardContent>
        </Card>
      )}

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
    </div>
  );
}

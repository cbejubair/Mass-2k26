"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";

interface QRDisplayProps {
  token: string;
  studentName: string;
  registerNumber: string;
}

export default function QRDisplay({
  token,
  studentName,
  registerNumber,
}: QRDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (canvasRef.current && token) {
      const url = `${window.location.origin}/api/qr/verify?token=${token}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 280,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      }).catch(() => setError("Failed to generate QR code"));
    }
  }, [token]);

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-xl">
        <canvas ref={canvasRef} />
      </div>
      <div className="text-center">
        <p className="font-semibold">{studentName}</p>
        <p className="text-sm text-muted-foreground">{registerNumber}</p>
        {/* <p className="text-xs text-muted-foreground mt-2 font-mono break-all max-w-xs">
          Token: {token}
        </p> */}
      </div>
    </div>
  );
}

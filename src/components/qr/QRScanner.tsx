"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Upload,
  Camera,
  CameraOff,
  SwitchCamera,
  Aperture,
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

interface QRScannerProps {
  onScanResult: (result: ScanResult) => void;
}

/** Check if we're in a secure context (HTTPS or localhost) */
function isSecureContext(): boolean {
  if (typeof window === "undefined") return false;
  // window.isSecureContext is the standard check
  if (window.isSecureContext !== undefined) return window.isSecureContext;
  // Fallback: check protocol
  const proto = window.location.protocol;
  const host = window.location.hostname;
  return (
    proto === "https:" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]"
  );
}

/** Check if camera streaming API is available */
function isCameraApiAvailable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

export default function QRScanner({ onScanResult }: QRScannerProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [showCamera, setShowCamera] = useState(false); // controls container visibility
  const [useBackCamera, setUseBackCamera] = useState(true);
  const [hasCamera, setHasCamera] = useState<boolean | null>(null); // null = unknown

  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>("");
  const cooldownRef = useRef(false);
  const mountedRef = useRef(true);

  const cameraContainerId = "qr-camera-reader";
  const fileContainerId = "qr-file-reader";

  // Detect camera availability on mount
  useEffect(() => {
    mountedRef.current = true;

    if (isCameraApiAvailable()) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoCams = devices.filter((d) => d.kind === "videoinput");
          if (mountedRef.current) setHasCamera(videoCams.length > 0);
        })
        .catch(() => {
          if (mountedRef.current) setHasCamera(false);
        });
    } else {
      setHasCamera(false);
    }

    return () => {
      mountedRef.current = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              scanner.clear();
            } catch {
              /* noop */
            }
          });
        scannerRef.current = null;
      }
    };
  }, []);

  const extractToken = (value: string) => {
    try {
      const url = new URL(value);
      const tokenParam = url.searchParams.get("token");
      if (tokenParam) return tokenParam;
    } catch {
      // not a URL
    }
    return value;
  };

  const verifyToken = useCallback(
    async (input: string) => {
      const cleanToken = extractToken(input).trim();
      if (!cleanToken) return;

      try {
        const res = await fetch("/api/qr/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: cleanToken }),
        });

        const data = await res.json();
        if (mountedRef.current) {
          onScanResult(data);
        }
      } catch {
        if (mountedRef.current) {
          onScanResult({
            valid: false,
            action: "invalid",
            message: "Network error. Please try again.",
          });
        }
      }
    },
    [onScanResult],
  );

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
      } catch {
        /* noop */
      }
      try {
        scanner.clear();
      } catch {
        /* noop */
      }
      scannerRef.current = null;
    }
    if (mountedRef.current) {
      setCameraActive(false);
      setShowCamera(false);
    }
  }, []);

  const startCamera = useCallback(
    async (backCam: boolean) => {
      // Pre-flight checks
      if (!isSecureContext()) {
        setScanError(
          "Camera requires HTTPS. Your page is served over HTTP — " +
            "please access this page via HTTPS, or use the Quick Scan button below to take a photo.",
        );
        setCameraStarting(false);
        return;
      }
      if (!isCameraApiAvailable()) {
        setScanError(
          "Camera API not available in this browser. " +
            "Use the Quick Scan button below to take a photo, or try Chrome/Safari.",
        );
        setCameraStarting(false);
        return;
      }

      setCameraStarting(true);
      setScanError("");

      // Stop existing scanner
      await stopCamera();

      // Make container visible FIRST, then wait for DOM to paint
      setShowCamera(true);
      await new Promise((r) => setTimeout(r, 200));

      // Ensure the container element exists and is empty
      const container = document.getElementById(cameraContainerId);
      if (!container) {
        setScanError("Camera container not ready. Please try again.");
        setCameraStarting(false);
        setShowCamera(false);
        return;
      }
      container.innerHTML = "";

      // Request camera permission explicitly first (important for iOS)
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: backCam
            ? { facingMode: { ideal: "environment" } }
            : { facingMode: { ideal: "user" } },
          audio: false,
        });
        tempStream.getTracks().forEach((t) => t.stop());
      } catch (permErr) {
        const msg =
          permErr instanceof Error ? permErr.message : String(permErr);
        if (
          msg.includes("NotAllowedError") ||
          msg.includes("Permission") ||
          msg.includes("denied")
        ) {
          setScanError(
            "Camera permission denied. Please allow camera access in your browser/device settings, then try again.",
          );
        } else if (msg.includes("NotFoundError")) {
          setScanError(
            "No camera found. Use the Quick Scan button to capture from gallery.",
          );
        } else {
          setScanError(`Camera error: ${msg}`);
        }
        setCameraStarting(false);
        setShowCamera(false);
        return;
      }

      // Now enumerate devices to find the right camera
      let cameraDeviceId: string | undefined;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        if (backCam) {
          const backDevice = videoDevices.find((d) =>
            /back|rear|environment/i.test(d.label),
          );
          cameraDeviceId =
            backDevice?.deviceId ||
            videoDevices[videoDevices.length - 1]?.deviceId;
        } else {
          const frontDevice = videoDevices.find((d) =>
            /front|user|facetime/i.test(d.label),
          );
          cameraDeviceId = frontDevice?.deviceId || videoDevices[0]?.deviceId;
        }
      } catch {
        // If enumeration fails, we'll rely on facingMode
      }

      const qrboxFunction = (vw: number, vh: number) => {
        const size = Math.min(vw, vh, 250);
        return { width: Math.max(size, 150), height: Math.max(size, 150) };
      };

      const onSuccess = async (decodedText: string) => {
        if (cooldownRef.current || decodedText === lastScannedRef.current) {
          return;
        }
        lastScannedRef.current = decodedText;
        cooldownRef.current = true;

        await verifyToken(decodedText);

        setTimeout(() => {
          cooldownRef.current = false;
          lastScannedRef.current = "";
        }, 3000);
      };

      const onError = () => {
        // No QR found in frame — expected, silently ignore
      };

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        // Strategy 1: Use deviceId if we found one
        if (cameraDeviceId) {
          container.innerHTML = "";
          const scanner = new Html5Qrcode(cameraContainerId, {
            verbose: false,
          });
          scannerRef.current = scanner;

          try {
            await scanner.start(
              { deviceId: { exact: cameraDeviceId } },
              { fps: 10, qrbox: qrboxFunction, disableFlip: false },
              onSuccess,
              onError,
            );
            if (mountedRef.current) {
              setCameraActive(true);
              setCameraStarting(false);
            }
            return;
          } catch {
            try {
              scanner.clear();
            } catch {
              /* noop */
            }
            container.innerHTML = "";
          }
        }

        // Strategy 2: Use facingMode
        {
          const scanner = new Html5Qrcode(cameraContainerId, {
            verbose: false,
          });
          scannerRef.current = scanner;

          try {
            await scanner.start(
              { facingMode: backCam ? "environment" : "user" },
              { fps: 10, qrbox: qrboxFunction, disableFlip: false },
              onSuccess,
              onError,
            );
            if (mountedRef.current) {
              setCameraActive(true);
              setCameraStarting(false);
            }
            return;
          } catch {
            try {
              scanner.clear();
            } catch {
              /* noop */
            }
            container.innerHTML = "";
          }
        }

        // Strategy 3: Any camera at all
        {
          const scanner = new Html5Qrcode(cameraContainerId, {
            verbose: false,
          });
          scannerRef.current = scanner;

          await scanner.start(
            { facingMode: "user" },
            { fps: 10, qrbox: qrboxFunction, disableFlip: false },
            onSuccess,
            onError,
          );
          if (mountedRef.current) {
            setCameraActive(true);
          }
        }
      } catch (err) {
        console.error("Camera start failed:", err);
        if (mountedRef.current) {
          setScanError(
            "Could not start camera. Use the Quick Scan button to take a photo instead.",
          );
          setCameraActive(false);
          setShowCamera(false);
        }
      } finally {
        if (mountedRef.current) {
          setCameraStarting(false);
        }
      }
    },
    [verifyToken, stopCamera],
  );

  const toggleCamera = useCallback(async () => {
    if (cameraActive) {
      await stopCamera();
    } else {
      await startCamera(useBackCamera);
    }
  }, [cameraActive, useBackCamera, startCamera, stopCamera]);

  const switchCamera = useCallback(async () => {
    const newBack = !useBackCamera;
    setUseBackCamera(newBack);
    if (cameraActive) {
      await startCamera(newBack);
    }
  }, [cameraActive, useBackCamera, startCamera]);

  /** Quick scan: opens native camera on mobile (works over HTTP too) */
  const handleQuickCapture = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setScanError("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const fileEl = document.getElementById(fileContainerId);
      if (fileEl) fileEl.innerHTML = "";
      const scanner = new Html5Qrcode(fileContainerId);
      const decodedText = await scanner.scanFile(file, true);
      try {
        scanner.clear();
      } catch {
        /* noop */
      }
      await verifyToken(decodedText);
    } catch {
      onScanResult({
        valid: false,
        action: "invalid",
        message:
          "No QR code found in the photo. Please try again with a clearer image.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setScanError("");

    try {
      await verifyToken(token);
    } catch {
      setScanError("Unable to verify token. Please try again.");
    } finally {
      setLoading(false);
      setToken("");
    }
  };

  const handleFileScan = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setScanError("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const fileEl = document.getElementById(fileContainerId);
      if (fileEl) fileEl.innerHTML = "";
      const scanner = new Html5Qrcode(fileContainerId);
      const decodedText = await scanner.scanFile(file, true);
      try {
        scanner.clear();
      } catch {
        /* noop */
      }
      await verifyToken(decodedText);
    } catch {
      onScanResult({
        valid: false,
        action: "invalid",
        message: "Unable to read QR from image. Upload a clear QR image.",
      });
      setScanError("Could not detect QR code in the uploaded file.");
    } finally {
      setLoading(false);
    }
  };

  const handleTokenInput = (value: string) => {
    setToken(extractToken(value));
  };

  const cameraSupported = isSecureContext() && isCameraApiAvailable();

  return (
    <div className="space-y-4">
      {/* Hidden container for file/photo scanning */}
      <div id={fileContainerId} className="hidden" />

      {/*
        Quick Scan button — uses native camera via <input capture>.
        Works on HTTP, iOS Safari, Android Chrome, etc.
        This is the most reliable mobile scanning method.
      */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Quick Scan (Recommended on Mobile)
        </Label>
        <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors p-6">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              void handleQuickCapture(e.target.files?.[0] || null);
              e.currentTarget.value = "";
            }}
          />
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Aperture className="h-6 w-6 text-primary" />
          )}
          <span className="text-sm font-medium text-primary">
            {loading ? "Scanning..." : "Tap to Open Camera & Scan QR"}
          </span>
        </label>
        <p className="text-xs text-muted-foreground text-center">
          Opens your camera to take a photo of the QR code — works on all
          devices
        </p>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">
            or use live camera
          </span>
        </div>
      </div>

      {/* Live Camera Scanner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            Live Scanner
            {!cameraSupported && (
              <span className="ml-2 text-xs font-normal text-amber-400">
                (Requires HTTPS)
              </span>
            )}
          </Label>
          <div className="flex gap-2">
            {cameraActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={switchCamera}
                className="h-8 gap-1.5 text-xs"
              >
                <SwitchCamera className="h-3.5 w-3.5" />
                Flip
              </Button>
            )}
            <Button
              type="button"
              variant={cameraActive ? "destructive" : "default"}
              size="sm"
              onClick={toggleCamera}
              disabled={cameraStarting || (!cameraSupported && !cameraActive)}
              className="h-8 gap-1.5 text-xs"
            >
              {cameraStarting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Starting...
                </>
              ) : cameraActive ? (
                <>
                  <CameraOff className="h-3.5 w-3.5" />
                  Stop
                </>
              ) : (
                <>
                  <Camera className="h-3.5 w-3.5" />
                  Start Live
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Placeholder when camera is off */}
        {!showCamera && !cameraStarting && (
          <div className="h-32 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <div className="text-center text-muted-foreground space-y-1">
              <Camera className="h-8 w-8 mx-auto opacity-30" />
              <p className="text-xs">
                {cameraSupported
                  ? "Start live scanner for continuous auto-scanning"
                  : "HTTPS required for live camera scanning"}
              </p>
            </div>
          </div>
        )}

        {/* Loading spinner */}
        {cameraStarting && (
          <div className="h-48 flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Requesting camera access...
              </p>
            </div>
          </div>
        )}

        {/*
          Camera render target.
          ALWAYS rendered (not display:none) — use opacity+height to
          hide when inactive so html5-qrcode can measure the element.
        */}
        <div
          id={cameraContainerId}
          style={{
            width: "100%",
            minHeight: showCamera ? 300 : 0,
            height: showCamera ? "auto" : 0,
            overflow: "hidden",
            opacity: cameraActive ? 1 : 0,
            position: showCamera ? "relative" : "absolute",
            pointerEvents: cameraActive ? "auto" : "none",
          }}
          className="rounded-lg bg-black"
        />

        {cameraActive && (
          <p className="text-xs text-green-400 text-center animate-pulse">
            Point camera at QR code — auto-captures on detection
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">
            other options
          </span>
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-sm">Upload QR Image</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              void handleFileScan(e.target.files?.[0] || null);
              e.currentTarget.value = "";
            }}
            disabled={loading}
            className="text-sm"
          />
          <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Manual Token Entry */}
      <div className="space-y-2">
        <Label className="text-sm">Enter QR Token or paste URL</Label>
        <div className="flex gap-2">
          <Input
            value={token}
            onChange={(e) => handleTokenInput(e.target.value)}
            className="flex-1 text-sm"
            placeholder="Paste token UUID or scan URL..."
            onKeyDown={(e) => e.key === "Enter" && handleManualVerify()}
          />
          <Button
            onClick={handleManualVerify}
            disabled={loading || !token.trim()}
            size="sm"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
          </Button>
        </div>
      </div>

      {scanError && (
        <div className="rounded-md bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-sm text-red-400">{scanError}</p>
        </div>
      )}
    </div>
  );
}

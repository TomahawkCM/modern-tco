/**
 * QR Scanner Component (L-011)
 *
 * Scans QR codes for LAN sync pairing.
 * Uses html5-qrcode for camera access and QR detection.
 */

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, CameraOff, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import type { PairingQRData } from "@/lib/lan-sync";
import { decodePairingQR, isPairingQRExpired } from "@/lib/lan-sync";

// ============================================================================
// Types
// ============================================================================

export interface QRScannerProps {
  /** Callback when valid QR code is scanned */
  onScan: (data: PairingQRData) => void;
  /** Callback for scan errors */
  onError?: (error: string) => void;
  /** Callback when scanner is ready */
  onReady?: () => void;
  /** Seniors mode for larger text/buttons */
  seniorsMode?: boolean;
  /** Custom class name */
  className?: string;
}

type ScannerState = "idle" | "requesting" | "scanning" | "success" | "error";

interface CameraError {
  type: "permission_denied" | "no_camera" | "in_use" | "unknown";
  message: string;
}

// ============================================================================
// Component
// ============================================================================

export function QRScanner({
  onScan,
  onError,
  onReady,
  seniorsMode = false,
  className = "",
}: QRScannerProps) {
  const tAria = useTranslations("aria");
  const t = useTranslations("qrScanner");

  // Refs
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // State
  const [state, setState] = useState<ScannerState>("idle");
  const [cameraError, setCameraError] = useState<CameraError | null>(null);
  const [scannedData, setScannedData] = useState<PairingQRData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Start scanner
  const startScanner = useCallback(async () => {
    if (!scannerRef.current) return;

    setIsLoading(true);
    setState("requesting");
    setCameraError(null);

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      // Clean up previous instance
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // Ignore stop errors
        }
      }

      // Create new scanner instance
      const scanner = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = scanner;

      // Start scanning
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Ignore scan errors (no QR detected)
        }
      );

      setState("scanning");
      setIsLoading(false);
      onReady?.();
    } catch (err: any) {
      setIsLoading(false);
      handleCameraError(err);
    }
  }, [onReady]);

  // Handle successful scan
  const handleSuccessfulScan = useCallback(
    async (decodedText: string) => {
      // Stop scanner immediately
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // Ignore stop errors
        }
      }

      // Parse QR data
      const data = decodePairingQR(decodedText);

      if (!data) {
        setState("error");
        const errorMsg = t("invalidQrFormat");
        setCameraError({
          type: "unknown",
          message: errorMsg,
        });
        onError?.(errorMsg);
        return;
      }

      // Check expiry
      if (isPairingQRExpired(data)) {
        setState("error");
        const errorMsg = t("qrExpired");
        setCameraError({
          type: "unknown",
          message: errorMsg,
        });
        onError?.(errorMsg);
        return;
      }

      // Success!
      setState("success");
      setScannedData(data);
      onScan(data);
    },
    [onScan, onError]
  );

  // Handle camera errors
  const handleCameraError = useCallback(
    (err: any) => {
      setState("error");
      let error: CameraError;

      if (err.name === "NotAllowedError" || err.message?.includes("Permission denied")) {
        error = {
          type: "permission_denied",
          message: t("permissionDenied"),
        };
      } else if (
        err.name === "NotFoundError" ||
        err.message?.includes("Requested device not found")
      ) {
        error = {
          type: "no_camera",
          message: t("noCamera"),
        };
      } else if (
        err.name === "NotReadableError" ||
        err.message?.includes("Could not start video source")
      ) {
        error = {
          type: "in_use",
          message: t("cameraInUse"),
        };
      } else {
        error = {
          type: "unknown",
          message: err.message || t("cameraFailed"),
        };
      }

      setCameraError(error);
      onError?.(error.message);
    },
    [onError]
  );

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // Ignore stop errors
      }
      html5QrCodeRef.current = null;
    }
    setState("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Retry scanning
  const retryScanning = useCallback(() => {
    setCameraError(null);
    setScannedData(null);
    startScanner();
  }, [startScanner]);

  // Render success state
  if (state === "success" && scannedData) {
    return (
      <Card className={`${className} border-green-500`}>
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-green-500" />
          <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>{t("deviceFound")}</CardTitle>
          <CardDescription className={seniorsMode ? "text-lg" : ""}>
            {t("readyToConnect", { deviceName: scannedData.deviceName })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-center">
          <p className={`text-muted-foreground ${seniorsMode ? "text-lg" : "text-sm"}`}>
            IP: {scannedData.ip}:{scannedData.port}
          </p>
          <p className={`text-muted-foreground ${seniorsMode ? "text-lg" : "text-sm"}`}>
            Code: {scannedData.code}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (state === "error" && cameraError) {
    return (
      <Card className={className}>
        <CardHeader className="text-center">
          <CameraOff className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>{t("cameraError")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("error")}</AlertTitle>
            <AlertDescription className={seniorsMode ? "text-lg" : ""}>
              {cameraError.message}
            </AlertDescription>
          </Alert>

          {cameraError.type === "permission_denied" && (
            <div className={`text-muted-foreground ${seniorsMode ? "text-lg" : "text-sm"}`}>
              <p className="mb-2 font-medium">{t("howToEnableCamera")}</p>
              <ol className="list-inside list-decimal space-y-1">
                <li>{t("cameraStep1")}</li>
                <li>{t("cameraStep2")}</li>
                <li>{t("cameraStep3")}</li>
                <li>{t("cameraStep4")}</li>
              </ol>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <Button variant="outline" size={seniorsMode ? "lg" : "default"} onClick={retryScanning}>
              <RefreshCw className={`me-2 ${seniorsMode ? "h-5 w-5" : "h-4 w-4"}`} />
              {t("tryAgain")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render idle state (start button)
  if (state === "idle") {
    return (
      <Card className={className}>
        <CardHeader className="text-center">
          <Camera className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
          <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>{t("scanQrCode")}</CardTitle>
          <CardDescription className={seniorsMode ? "text-lg" : ""}>
            {t("scanDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            size={seniorsMode ? "lg" : "default"}
            onClick={startScanner}
            className={seniorsMode ? "px-8 py-6 text-lg" : ""}
          >
            <Camera className={`me-2 ${seniorsMode ? "h-6 w-6" : "h-4 w-4"}`} />
            {t("startCamera")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render scanning state
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>
          {isLoading ? t("startingCamera") : t("pointAtQrCode")}
        </CardTitle>
        <CardDescription className={seniorsMode ? "text-lg" : ""}>
          {isLoading ? t("allowCameraAccess") : t("positionQrCode")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scanner viewport */}
        <div
          ref={scannerRef}
          id="qr-reader"
          className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-black"
          role="region"
          aria-label={tAria("qrScannerViewport")}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Scanning indicator */}
        {state === "scanning" && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className={seniorsMode ? "text-lg" : "text-sm"}>{t("scanningForQr")}</span>
          </div>
        )}

        {/* Cancel button */}
        <div className="flex justify-center">
          <Button variant="outline" size={seniorsMode ? "lg" : "default"} onClick={stopScanner}>
            {t("cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QRScanner;

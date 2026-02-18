/**
 * QR Code Display Component (L-011)
 *
 * Displays a QR code containing pairing information for LAN sync.
 * Used by host device to allow other devices to connect.
 */

"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, Check, Wifi, Clock } from "lucide-react";
import type { PairingQRData } from "@/lib/lan-sync";
import {
  PROTOCOL_VERSION,
  DEFAULT_SYNC_PORT,
  generatePairingCode,
  encodePairingQR,
} from "@/lib/lan-sync";

// ============================================================================
// Types
// ============================================================================

export interface QRCodeDisplayProps {
  /** Device name to display */
  deviceName: string;
  /** Device ID */
  deviceId: string;
  /** Public key for ECDH (base64) */
  publicKey: string;
  /** IP address to connect to (user must provide) */
  ipAddress?: string;
  /** Port number (defaults to 8765) */
  port?: number;
  /** Callback when pairing code changes */
  onPairingCodeChange?: (code: string) => void;
  /** QR code expiry time in minutes (default: 10) */
  expiryMinutes?: number;
  /** Size of QR code in pixels */
  size?: number;
  /** Seniors mode for larger text/buttons */
  seniorsMode?: boolean;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function QRCodeDisplay({
  deviceName,
  deviceId,
  publicKey,
  ipAddress,
  port = DEFAULT_SYNC_PORT,
  onPairingCodeChange,
  expiryMinutes = 10,
  size = 200,
  seniorsMode = false,
  className = "",
}: QRCodeDisplayProps) {
  const tAria = useTranslations("aria");

  // State
  const [pairingCode, setPairingCode] = useState<string>("");
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(expiryMinutes * 60);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate new pairing code
  const regenerateCode = useCallback(() => {
    const newCode = generatePairingCode();
    setPairingCode(newCode);
    setTimestamp(Date.now());
    setTimeRemaining(expiryMinutes * 60);
    onPairingCodeChange?.(newCode);
  }, [expiryMinutes, onPairingCodeChange]);

  // Initialize pairing code
  useEffect(() => {
    regenerateCode();
  }, [regenerateCode]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-regenerate when expired
          regenerateCode();
          return expiryMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryMinutes, regenerateCode]);

  // Build QR data
  const qrData = useMemo<PairingQRData | null>(() => {
    if (!ipAddress || !pairingCode) return null;

    return {
      version: PROTOCOL_VERSION,
      ip: ipAddress,
      port,
      code: pairingCode,
      pubKey: publicKey,
      deviceName,
      timestamp,
    };
  }, [ipAddress, port, pairingCode, publicKey, deviceName, timestamp]);

  // Encoded QR string
  const qrString = useMemo(() => {
    if (!qrData) return null;
    return encodePairingQR(qrData);
  }, [qrData]);

  // Format time remaining
  const formatTimeRemaining = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Copy pairing code to clipboard
  const copyPairingCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pairingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [pairingCode]);

  // Render missing IP warning
  if (!ipAddress) {
    return (
      <Card className={`${className} border-yellow-500/50`}>
        <CardHeader>
          <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>
            <Wifi className="me-2 inline-block" />
            Network Setup Required
          </CardTitle>
          <CardDescription className={seniorsMode ? "text-lg" : ""}>
            Please enter your local IP address to enable device pairing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-muted-foreground ${seniorsMode ? "text-lg" : "text-sm"}`}>
            To find your IP address:
          </p>
          <ul
            className={`mt-2 list-inside list-disc text-muted-foreground ${seniorsMode ? "space-y-2 text-lg" : "space-y-1 text-sm"}`}
          >
            <li>
              <strong>Windows:</strong> Open CMD and type <code>ipconfig</code>
            </li>
            <li>
              <strong>Mac/Linux:</strong> Open Terminal and type <code>ifconfig</code> or{" "}
              <code>ip addr</code>
            </li>
            <li>
              <strong>Mobile:</strong> Check WiFi settings
            </li>
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>
          <Wifi className="me-2 inline-block" />
          Scan to Connect
        </CardTitle>
        <CardDescription className={seniorsMode ? "text-lg" : ""}>
          Scan this QR code with another device to pair
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4">
        {/* QR Code */}
        <div
          className="rounded-lg bg-white p-4 shadow-inner"
          role="img"
          aria-label={tAria("qrCodePairing", { code: pairingCode })}
        >
          {qrString && (
            <QRCodeSVG
              value={qrString}
              size={seniorsMode ? size * 1.25 : size}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          )}
        </div>

        {/* Pairing Code Display */}
        <div className="space-y-2 text-center">
          <p className={`text-muted-foreground ${seniorsMode ? "text-lg" : "text-sm"}`}>
            Or enter this code manually:
          </p>
          <div className="flex items-center justify-center gap-2">
            <code
              className={`rounded-lg bg-muted px-4 py-2 font-mono font-bold tracking-widest ${
                seniorsMode ? "text-3xl" : "text-2xl"
              }`}
              aria-label={tAria("pairingCode", { code: pairingCode.split("").join(" ") })}
            >
              {pairingCode}
            </code>
            <Button
              variant="outline"
              size={seniorsMode ? "lg" : "icon"}
              onClick={copyPairingCode}
              aria-label={copied ? tAria("copied") : tAria("copyPairingCode")}
            >
              {copied ? (
                <Check className={seniorsMode ? "h-6 w-6" : "h-4 w-4"} />
              ) : (
                <Copy className={seniorsMode ? "h-6 w-6" : "h-4 w-4"} />
              )}
            </Button>
          </div>
        </div>

        {/* Connection Info */}
        <div className={`text-center text-muted-foreground ${seniorsMode ? "text-lg" : "text-sm"}`}>
          <p>
            Connect to:{" "}
            <code className="rounded bg-muted px-2 py-1">
              {ipAddress}:{port}
            </code>
          </p>
          <p>Device: {deviceName}</p>
        </div>

        {/* Expiry Timer */}
        <div
          className={`flex items-center gap-2 ${
            timeRemaining < 60 ? "text-red-500" : "text-muted-foreground"
          } ${seniorsMode ? "text-lg" : "text-sm"}`}
        >
          <Clock className={seniorsMode ? "h-5 w-5" : "h-4 w-4"} />
          <span>Expires in {formatTimeRemaining(timeRemaining)}</span>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size={seniorsMode ? "lg" : "default"}
          onClick={regenerateCode}
          className={seniorsMode ? "text-lg" : ""}
        >
          <RefreshCw className={`me-2 ${seniorsMode ? "h-5 w-5" : "h-4 w-4"}`} />
          Generate New Code
        </Button>
      </CardContent>
    </Card>
  );
}

export default QRCodeDisplay;

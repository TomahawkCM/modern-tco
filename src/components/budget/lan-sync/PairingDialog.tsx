/**
 * Pairing Dialog Component (L-011)
 *
 * Main dialog for device pairing. Orchestrates QR scanning,
 * manual entry, and host mode (displaying QR for others to scan).
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wifi,
  QrCode,
  Keyboard,
  Monitor,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import type { PairingQRData, PairedDevice } from "@/lib/lan-sync";
import type { DeviceManager, LocalDeviceInfo } from "@/lib/lan-sync-devices";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { QRScanner } from "./QRScanner";
import { ManualPairingEntry } from "./ManualPairingEntry";

// ============================================================================
// Types
// ============================================================================

export interface PairingDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog closes */
  onOpenChange: (open: boolean) => void;
  /** Callback when pairing succeeds */
  onPairingSuccess: (device: PairedDevice) => void;
  /** Callback when pairing fails */
  onPairingError?: (error: string) => void;
  /** Device manager instance */
  deviceManager: DeviceManager;
  /** Seniors mode for accessibility */
  seniorsMode?: boolean;
}

type PairingMode = "scan" | "manual" | "host";
type PairingState = "idle" | "connecting" | "verifying" | "success" | "error";

interface PairingStatus {
  state: PairingState;
  message?: string;
  device?: PairedDevice;
}

// ============================================================================
// Component
// ============================================================================

export function PairingDialog({
  open,
  onOpenChange,
  onPairingSuccess,
  onPairingError,
  deviceManager,
  seniorsMode = false,
}: PairingDialogProps) {
  const t = useTranslations("pairingDialog");

  // State
  const [mode, setMode] = useState<PairingMode>("scan");
  const [status, setStatus] = useState<PairingStatus>({ state: "idle" });
  const [localDevice, setLocalDevice] = useState<LocalDeviceInfo | null>(null);
  const [localIP, setLocalIP] = useState<string>("");
  const [pairingCode, setPairingCode] = useState<string>("");

  // Initialize local device info
  useEffect(() => {
    if (!open) return;

    const initDevice = async () => {
      try {
        const device = await deviceManager.getOrCreateLocalDevice();
        setLocalDevice(device);
      } catch (err) {
        console.error("Failed to initialize local device:", err);
        setStatus({
          state: "error",
          message: t("failedToInitialize"),
        });
      }
    };

    initDevice();
  }, [open, deviceManager]);

  // Handle QR scan success
  const handleQRScan = useCallback(
    async (data: PairingQRData) => {
      setStatus({ state: "connecting", message: t("connectingToDevice") });

      try {
        // Generate a device ID from the pairing code
        const deviceId = `device-${data.code}-${Date.now()}`;

        // Save to IndexedDB using the correct method signature
        const pairedDevice = await deviceManager.addPairedDevice(
          deviceId,
          data.deviceName,
          data.pubKey
        );

        // Update with connection info
        await deviceManager.updateConnectionInfo(deviceId, data.ip, data.port);

        setStatus({
          state: "success",
          message: `Ready to connect to ${data.deviceName}`,
          device: pairedDevice,
        });

        // Notify parent
        setTimeout(() => {
          onPairingSuccess(pairedDevice);
          onOpenChange(false);
        }, 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save device";
        setStatus({ state: "error", message });
        onPairingError?.(message);
      }
    },
    [deviceManager, onPairingSuccess, onPairingError, onOpenChange]
  );

  // Handle manual entry submit
  const handleManualSubmit = useCallback(
    async (data: PairingQRData) => {
      setStatus({ state: "connecting", message: t("connectingToDevice") });

      try {
        // Generate a temporary device ID
        const deviceId = `manual-${data.code}-${Date.now()}`;

        // Save to IndexedDB with placeholder public key (will be received during handshake)
        const pairedDevice = await deviceManager.addPairedDevice(
          deviceId,
          t("pendingConnection"),
          "" // Public key will be received during handshake
        );

        // Update with connection info
        await deviceManager.updateConnectionInfo(deviceId, data.ip, data.port);

        setStatus({
          state: "success",
          message: t("deviceAdded"),
          device: pairedDevice,
        });

        // Notify parent
        setTimeout(() => {
          onPairingSuccess(pairedDevice);
          onOpenChange(false);
        }, 1500);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to save device";
        setStatus({ state: "error", message });
        onPairingError?.(message);
      }
    },
    [deviceManager, onPairingSuccess, onPairingError, onOpenChange]
  );

  // Handle pairing code change (host mode)
  const handlePairingCodeChange = useCallback((code: string) => {
    setPairingCode(code);
  }, []);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStatus({ state: "idle" });
      setMode("scan");
    }
  }, [open]);

  // Render status overlay
  const renderStatusOverlay = () => {
    if (status.state === "idle") return null;

    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
        <div className="space-y-4 p-6 text-center">
          {status.state === "connecting" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className={seniorsMode ? "text-xl" : "text-lg"}>
                {status.message || t("connecting")}
              </p>
            </>
          )}

          {status.state === "verifying" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className={seniorsMode ? "text-xl" : "text-lg"}>
                {status.message || t("verifyingConnection")}
              </p>
            </>
          )}

          {status.state === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <p className={`font-medium ${seniorsMode ? "text-xl" : "text-lg"}`}>
                {status.message || t("pairingSuccessful")}
              </p>
              {status.device && (
                <p className="text-muted-foreground">
                  {status.device.lastKnownIp}:{status.device.lastKnownPort}
                </p>
              )}
            </>
          )}

          {status.state === "error" && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className={`font-medium ${seniorsMode ? "text-xl" : "text-lg"}`}>
                {t("pairingFailed")}
              </p>
              <p className="max-w-xs text-muted-foreground">
                {status.message || t("anErrorOccurred")}
              </p>
              <Button
                variant="outline"
                onClick={() => setStatus({ state: "idle" })}
                className="mt-4"
              >
                {t("tryAgain")}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-lg ${seniorsMode ? "max-w-xl" : ""}`}
        aria-describedby="pairing-dialog-description"
      >
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${seniorsMode ? "text-2xl" : ""}`}>
            <Wifi className={seniorsMode ? "h-7 w-7" : "h-5 w-5"} />
            {t("title")}
          </DialogTitle>
          <DialogDescription
            id="pairing-dialog-description"
            className={seniorsMode ? "text-lg" : ""}
          >
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          {renderStatusOverlay()}

          <Tabs value={mode} onValueChange={(v) => setMode(v as PairingMode)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="scan" className={seniorsMode ? "py-3 text-lg" : ""}>
                <QrCode className={`me-2 ${seniorsMode ? "h-5 w-5" : "h-4 w-4"}`} />
                {t("scan")}
              </TabsTrigger>
              <TabsTrigger value="manual" className={seniorsMode ? "py-3 text-lg" : ""}>
                <Keyboard className={`me-2 ${seniorsMode ? "h-5 w-5" : "h-4 w-4"}`} />
                {t("manual")}
              </TabsTrigger>
              <TabsTrigger value="host" className={seniorsMode ? "py-3 text-lg" : ""}>
                <Monitor className={`me-2 ${seniorsMode ? "h-5 w-5" : "h-4 w-4"}`} />
                {t("host")}
              </TabsTrigger>
            </TabsList>

            {/* Scan Tab */}
            <TabsContent value="scan" className="mt-4">
              <QRScanner
                onScan={handleQRScan}
                onError={(err) => setStatus({ state: "error", message: err })}
                seniorsMode={seniorsMode}
              />
            </TabsContent>

            {/* Manual Tab */}
            <TabsContent value="manual" className="mt-4">
              <ManualPairingEntry
                onSubmit={handleManualSubmit}
                onError={(err) => setStatus({ state: "error", message: err })}
                isSubmitting={status.state === "connecting"}
                seniorsMode={seniorsMode}
              />
            </TabsContent>

            {/* Host Tab */}
            <TabsContent value="host" className="mt-4">
              {localDevice ? (
                <div className="space-y-4">
                  {!localIP && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t("ipAddressRequired")}</AlertTitle>
                      <AlertDescription className={seniorsMode ? "text-base" : ""}>
                        <p className="mb-3">{t("ipAddressDescription")}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t("ipPlaceholder")}
                            className="flex-1 rounded-md border bg-background px-3 py-2"
                            onChange={(e) => setLocalIP(e.target.value)}
                            value={localIP}
                          />
                          <Button
                            size="sm"
                            disabled={!localIP.trim()}
                            onClick={() => {
                              // Basic validation
                              if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(localIP.trim())) {
                                setLocalIP(localIP.trim());
                              }
                            }}
                          >
                            {t("set")}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <QRCodeDisplay
                    deviceName={localDevice.deviceName}
                    deviceId={localDevice.deviceId}
                    publicKey={localDevice.publicKey || ""}
                    ipAddress={localIP || undefined}
                    onPairingCodeChange={handlePairingCodeChange}
                    seniorsMode={seniorsMode}
                  />

                  {pairingCode && localIP && (
                    <Alert className="border-green-500/50">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertTitle>{t("readyForConnections")}</AlertTitle>
                      <AlertDescription className={seniorsMode ? "text-base" : ""}>
                        {t("readyDescription")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PairingDialog;

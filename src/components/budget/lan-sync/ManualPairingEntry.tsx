/**
 * Manual Pairing Entry Component (L-011)
 *
 * Fallback for entering pairing information manually when QR scanning
 * is not available or fails.
 */

"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Keyboard, AlertCircle, Loader2, CheckCircle2, HelpCircle } from "lucide-react";
import type { PairingQRData } from "@/lib/lan-sync";
import { PROTOCOL_VERSION, DEFAULT_SYNC_PORT } from "@/lib/lan-sync";

// ============================================================================
// Types
// ============================================================================

export interface ManualPairingEntryProps {
  /** Callback when valid pairing info is entered */
  onSubmit: (data: PairingQRData) => void;
  /** Callback for validation errors */
  onError?: (error: string) => void;
  /** Whether form is submitting */
  isSubmitting?: boolean;
  /** Seniors mode for larger text/buttons */
  seniorsMode?: boolean;
  /** Custom class name */
  className?: string;
}

interface FormErrors {
  ip?: string;
  port?: string;
  code?: string;
}

// ============================================================================
// Validation
// ============================================================================

const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const CODE_REGEX = /^[A-Z0-9]{6}$/;

function validateIP(ip: string): string | undefined {
  if (!ip.trim()) {
    return "IP address is required";
  }
  if (!IP_REGEX.test(ip.trim())) {
    return "Invalid IP address format (e.g., 192.168.1.100)";
  }
  return undefined;
}

function validatePort(port: string): string | undefined {
  if (!port.trim()) {
    return undefined; // Optional, will use default
  }
  const portNum = parseInt(port, 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return "Port must be between 1 and 65535";
  }
  return undefined;
}

function validateCode(code: string): string | undefined {
  if (!code.trim()) {
    return "Pairing code is required";
  }
  const normalized = code.trim().toUpperCase().replace(/\s/g, "");
  if (!CODE_REGEX.test(normalized)) {
    return "Pairing code must be 6 alphanumeric characters";
  }
  return undefined;
}

// ============================================================================
// Component
// ============================================================================

export function ManualPairingEntry({
  onSubmit,
  onError,
  isSubmitting = false,
  seniorsMode = false,
  className = "",
}: ManualPairingEntryProps) {
  // Form state
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [showHelp, setShowHelp] = useState(false);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      ip: validateIP(ip),
      port: validatePort(port),
      code: validateCode(code),
    };

    setErrors(newErrors);
    return !newErrors.ip && !newErrors.port && !newErrors.code;
  }, [ip, port, code]);

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        const errorMessages = Object.values(errors).filter(Boolean).join(", ");
        onError?.(errorMessages || "Please fix the form errors");
        return;
      }

      const pairingData: PairingQRData = {
        version: PROTOCOL_VERSION,
        ip: ip.trim(),
        port: port.trim() ? parseInt(port, 10) : DEFAULT_SYNC_PORT,
        code: code.trim().toUpperCase().replace(/\s/g, ""),
        pubKey: "", // Will be fetched from server during handshake
        deviceName: "Unknown Device", // Will be received during handshake
        timestamp: Date.now(),
      };

      onSubmit(pairingData);
    },
    [ip, port, code, errors, validateForm, onSubmit, onError]
  );

  // Handle code input with auto-uppercase
  const handleCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);
      setCode(value);
      if (errors.code) {
        setErrors((prev) => ({ ...prev, code: undefined }));
      }
    },
    [errors.code]
  );

  // Handle IP input
  const handleIpChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIp(e.target.value);
      if (errors.ip) {
        setErrors((prev) => ({ ...prev, ip: undefined }));
      }
    },
    [errors.ip]
  );

  // Handle port input
  const handlePortChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 5);
      setPort(value);
      if (errors.port) {
        setErrors((prev) => ({ ...prev, port: undefined }));
      }
    },
    [errors.port]
  );

  const inputSize = seniorsMode ? "text-lg py-3" : "";
  const labelSize = seniorsMode ? "text-lg" : "";

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <Keyboard className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
        <CardTitle className={seniorsMode ? "text-2xl" : "text-lg"}>Manual Entry</CardTitle>
        <CardDescription className={seniorsMode ? "text-lg" : ""}>
          Enter the connection details shown on the host device
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IP Address */}
          <div className="space-y-2">
            <Label htmlFor="ip-address" className={labelSize}>
              IP Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ip-address"
              type="text"
              placeholder="192.168.1.100"
              value={ip}
              onChange={handleIpChange}
              disabled={isSubmitting}
              className={`${inputSize} ${errors.ip ? "border-red-500" : ""}`}
              aria-describedby={errors.ip ? "ip-error" : undefined}
              aria-invalid={!!errors.ip}
            />
            {errors.ip && (
              <p id="ip-error" className="text-sm text-red-500" role="alert">
                {errors.ip}
              </p>
            )}
          </div>

          {/* Port */}
          <div className="space-y-2">
            <Label htmlFor="port" className={labelSize}>
              Port{" "}
              <span className="font-normal text-muted-foreground">
                (optional, default: {DEFAULT_SYNC_PORT})
              </span>
            </Label>
            <Input
              id="port"
              type="text"
              inputMode="numeric"
              placeholder={String(DEFAULT_SYNC_PORT)}
              value={port}
              onChange={handlePortChange}
              disabled={isSubmitting}
              className={`${inputSize} ${errors.port ? "border-red-500" : ""}`}
              aria-describedby={errors.port ? "port-error" : undefined}
              aria-invalid={!!errors.port}
            />
            {errors.port && (
              <p id="port-error" className="text-sm text-red-500" role="alert">
                {errors.port}
              </p>
            )}
          </div>

          {/* Pairing Code */}
          <div className="space-y-2">
            <Label htmlFor="pairing-code" className={labelSize}>
              Pairing Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pairing-code"
              type="text"
              placeholder="ABC123"
              value={code}
              onChange={handleCodeChange}
              disabled={isSubmitting}
              className={`${inputSize} font-mono tracking-widest ${
                errors.code ? "border-red-500" : ""
              }`}
              aria-describedby={errors.code ? "code-error" : "code-hint"}
              aria-invalid={!!errors.code}
              maxLength={6}
            />
            {errors.code ? (
              <p id="code-error" className="text-sm text-red-500" role="alert">
                {errors.code}
              </p>
            ) : (
              <p id="code-hint" className="text-sm text-muted-foreground">
                6-character code shown on the host device
              </p>
            )}
          </div>

          {/* Help Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            {showHelp ? "Hide Help" : "Where do I find these?"}
          </Button>

          {/* Help Content */}
          {showHelp && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>Finding Connection Details</AlertTitle>
              <AlertDescription className={seniorsMode ? "text-base" : "text-sm"}>
                <ol className="mt-2 list-inside list-decimal space-y-1">
                  <li>Open Budget App on the device you want to sync with</li>
                  <li>Go to Settings → LAN Sync</li>
                  <li>Tap &quot;Allow Connections&quot;</li>
                  <li>
                    The IP address, port, and pairing code will be displayed below the QR code
                  </li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            size={seniorsMode ? "lg" : "default"}
            className={`w-full ${seniorsMode ? "py-6 text-lg" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className={`mr-2 animate-spin ${seniorsMode ? "h-6 w-6" : "h-4 w-4"}`} />
                Connecting...
              </>
            ) : (
              <>
                <CheckCircle2 className={`mr-2 ${seniorsMode ? "h-6 w-6" : "h-4 w-4"}`} />
                Connect
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default ManualPairingEntry;

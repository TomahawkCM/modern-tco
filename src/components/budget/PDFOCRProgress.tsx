"use client";

/**
 * PDF OCR Progress Component
 * Shows real-time progress during OCR processing
 *
 * Features:
 * - Stage indicator (loading, rendering, preprocessing, ocr, parsing)
 * - Page progress bar
 * - Estimated time remaining
 * - Cancel button
 * - Retry on error
 */

import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Eye,
  Scan,
  FileSearch,
} from "lucide-react";
import type { OCRProgress } from "@/lib/parsers/pdf-ocr-parser";

interface PDFOCRProgressProps {
  progress: OCRProgress | null;
  onCancel?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
}

const stageIcons: Record<string, React.ReactNode> = {
  loading: <FileText className="h-5 w-5 animate-pulse text-blue-500" />,
  rendering: <Eye className="h-5 w-5 animate-pulse text-purple-500" />,
  preprocessing: <Scan className="h-5 w-5 animate-pulse text-orange-500" />,
  ocr: <FileSearch className="h-5 w-5 animate-pulse text-cyan-500" />,
  parsing: <Loader2 className="h-5 w-5 animate-spin text-green-500" />,
  complete: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  cancelled: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

const stageLabels: Record<string, string> = {
  loading: "Loading PDF",
  rendering: "Rendering Pages",
  preprocessing: "Enhancing Image",
  ocr: "Extracting Text",
  parsing: "Parsing Transactions",
  complete: "Complete",
  error: "Error",
  cancelled: "Cancelled",
};

const stageColors: Record<string, string> = {
  loading: "bg-blue-500",
  rendering: "bg-purple-500",
  preprocessing: "bg-orange-500",
  ocr: "bg-cyan-500",
  parsing: "bg-green-500",
  complete: "bg-green-500",
  error: "bg-red-500",
  cancelled: "bg-yellow-500",
};

export function PDFOCRProgress({
  progress,
  onCancel,
  onRetry,
  showDetails = true,
}: PDFOCRProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Track elapsed time
  useEffect(() => {
    if (
      !progress ||
      progress.stage === "complete" ||
      progress.stage === "error" ||
      progress.stage === "cancelled"
    ) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [progress?.stage]);

  // Reset elapsed time when progress resets
  useEffect(() => {
    if (progress?.stage === "loading" && progress.progress < 10) {
      setElapsedTime(0);
    }
  }, [progress]);

  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }, []);

  if (!progress) {
    return null;
  }

  const isProcessing = !["complete", "error", "cancelled"].includes(progress.stage);
  const canCancel = isProcessing && onCancel;
  const canRetry = (progress.stage === "error" || progress.stage === "cancelled") && onRetry;

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {stageIcons[progress.stage]}
            <span>OCR Processing</span>
          </div>
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stage indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{stageLabels[progress.stage]}</span>
          <span className="text-muted-foreground">{Math.round(progress.progress)}%</span>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <Progress value={progress.progress} className="h-3" />
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all ${stageColors[progress.stage]}`}
            style={{ width: `${progress.progress}%`, opacity: 0.3 }}
          />
        </div>

        {/* Page progress */}
        {progress.totalPages > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {progress.currentPage} of {progress.totalPages}
            </span>
            {isProcessing && (
              <span>
                Elapsed: {formatTime(elapsedTime)}
                {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
                  <> | ~{formatTime(progress.estimatedTimeRemaining)} remaining</>
                )}
              </span>
            )}
          </div>
        )}

        {/* Status message */}
        {showDetails && (
          <div className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {progress.message}
          </div>
        )}

        {/* Stage steps visualization */}
        <div className="flex items-center justify-between pt-2">
          {["loading", "rendering", "preprocessing", "ocr", "parsing", "complete"].map(
            (stage, index) => {
              const stages = [
                "loading",
                "rendering",
                "preprocessing",
                "ocr",
                "parsing",
                "complete",
              ];
              const currentIndex = stages.indexOf(progress.stage);
              const isActive = index === currentIndex;
              const isComplete = index < currentIndex || progress.stage === "complete";
              const isError = progress.stage === "error" && index === currentIndex;

              return (
                <div key={stage} className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all duration-300 ${isComplete ? "bg-green-500 text-white" : ""} ${isActive && !isError ? "bg-primary text-primary-foreground ring-2 ring-primary/30" : ""} ${isError ? "bg-red-500 text-white" : ""} ${!isComplete && !isActive && !isError ? "bg-muted text-muted-foreground" : ""} `}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : isError ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="mt-1 text-center text-[10px] text-muted-foreground">
                    {stage === "preprocessing"
                      ? "Enhance"
                      : stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </span>
                </div>
              );
            }
          )}
        </div>

        {/* Error/Retry section */}
        {canRetry && (
          <div className="flex flex-col items-center gap-3 border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              {progress.stage === "error"
                ? "OCR processing failed. Would you like to try again?"
                : "OCR was cancelled. Would you like to restart?"}
            </p>
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry OCR
            </Button>
          </div>
        )}

        {/* Success section */}
        {progress.stage === "complete" && (
          <div className="flex items-center gap-2 pt-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">OCR completed successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Minimal inline progress indicator
 */
export function PDFOCRProgressInline({
  progress,
  onCancel,
}: {
  progress: OCRProgress | null;
  onCancel?: () => void;
}) {
  if (!progress) return null;

  const isProcessing = !["complete", "error", "cancelled"].includes(progress.stage);

  return (
    <div className="flex items-center gap-3 text-sm">
      {stageIcons[progress.stage]}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="truncate font-medium">{progress.message}</span>
          <span className="ml-2 text-muted-foreground">{Math.round(progress.progress)}%</span>
        </div>
        <Progress value={progress.progress} className="h-1.5" />
      </div>
      {isProcessing && onCancel && (
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-6 w-6">
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export default PDFOCRProgress;

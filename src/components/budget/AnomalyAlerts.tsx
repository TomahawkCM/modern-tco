/**
 * Anomaly Alerts Component
 * Displays unusual spending pattern alerts with user feedback
 */

import { AlertTriangle, X, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { storeAnomalyFeedback, getAnomalyFeedback } from "@/lib/budget-db";
import type { AnomalyAlert } from "@/lib/analytics/anomaly-detector";

interface AnomalyAlertsProps {
  alerts: AnomalyAlert[];
  onDismiss?: (transactionId: string) => void;
  onFeedback?: (transactionId: string, wasExpected: boolean) => void;
  maxDisplay?: number;
}

export function AnomalyAlerts({
  alerts,
  onDismiss,
  onFeedback,
  maxDisplay = 5,
}: AnomalyAlertsProps) {
  const locale = useLocale();
  const tAria = useTranslations("aria");
  const [feedbackMap, setFeedbackMap] = useState<Map<string, boolean>>(new Map());

  // Load existing feedback - use stable reference for alerts
  // Using JSON.stringify of alert IDs to prevent infinite loop when alerts array is recreated
  const alertIds = alerts.map((a) => a.transaction.id).join(",");

  useEffect(() => {
    async function loadFeedback() {
      const feedbackPromises = alerts.map(async (alert) => {
        const feedback = await getAnomalyFeedback(alert.transaction.id);
        return feedback ? ([alert.transaction.id, feedback.wasExpected] as const) : null;
      });

      const results = await Promise.all(feedbackPromises);
      const map = new Map<string, boolean>();
      results.forEach((result) => {
        if (result) {
          map.set(result[0], result[1]);
        }
      });
      setFeedbackMap(map);
    }

    if (alerts.length > 0) {
      loadFeedback();
    }
  }, [alertIds]);

  async function handleFeedback(alert: AnomalyAlert, wasExpected: boolean) {
    try {
      await storeAnomalyFeedback(
        alert.transaction.id,
        alert.merchant,
        alert.category,
        alert.amount,
        wasExpected
      );

      setFeedbackMap((prev) => new Map(prev).set(alert.transaction.id, wasExpected));

      if (onFeedback) {
        onFeedback(alert.transaction.id, wasExpected);
      }
    } catch (error) {
      console.error("Error storing feedback:", error);
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  const displayedAlerts = alerts.slice(0, maxDisplay);

  const getSeverityStyles = (severity: AnomalyAlert["severity"]) => {
    switch (severity) {
      case "high":
        return {
          bg: "bg-red-50 border-red-200",
          icon: "text-red-600",
          text: "text-red-900",
          badge: "bg-red-100 text-red-800",
        };
      case "medium":
        return {
          bg: "bg-orange-50 border-orange-200",
          icon: "text-orange-600",
          text: "text-orange-900",
          badge: "bg-orange-100 text-orange-800",
        };
      case "low":
        return {
          bg: "bg-yellow-50 border-yellow-200",
          icon: "text-yellow-600",
          text: "text-yellow-900",
          badge: "bg-yellow-100 text-yellow-800",
        };
    }
  };

  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity);
        const date = new Date(alert.transaction.date);
        const formattedDate = date.toLocaleDateString(locale, {
          month: "short",
          day: "numeric",
        });

        return (
          <div key={alert.transaction.id} className={`${styles.bg} relative rounded-lg border p-4`}>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.transaction.id)}
                className="absolute end-3 top-3 text-gray-400 transition-colors hover:text-gray-600"
                aria-label={tAria("dismissAlert")}
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>
                <p className={`text-sm font-medium ${styles.text} mb-1`}>{alert.reason}</p>
                <div className="mb-3 space-y-0.5 text-xs text-gray-600">
                  <p>
                    <span className="font-medium">Merchant:</span> {alert.merchant}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> ${alert.amount.toFixed(2)}{" "}
                    (Average: ${alert.expectedRange.average.toFixed(2)})
                  </p>
                  <p>
                    <span className="font-medium">Category:</span> {alert.category}
                  </p>
                </div>

                {/* User Feedback Buttons */}
                {!feedbackMap.has(alert.transaction.id) ? (
                  <div className="flex items-center gap-2 border-t border-gray-200 pt-2">
                    <span className="text-xs text-gray-600">Was this expected?</span>
                    <button
                      onClick={() => handleFeedback(alert, true)}
                      className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-700 transition-colors hover:bg-green-100"
                      title="Mark as expected"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Expected
                    </button>
                    <button
                      onClick={() => handleFeedback(alert, false)}
                      className="flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-100"
                      title="Mark as unexpected"
                    >
                      <XCircle className="h-3 w-3" />
                      Unexpected
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-2">
                    <span className="text-xs italic text-gray-500">
                      {feedbackMap.get(alert.transaction.id)
                        ? "✓ Marked as expected"
                        : "✓ Marked as unexpected"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {alerts.length > maxDisplay && (
        <p className="text-center text-xs text-gray-500">
          +{alerts.length - maxDisplay} more anomaly{alerts.length - maxDisplay > 1 ? "ies" : "y"}
        </p>
      )}
    </div>
  );
}

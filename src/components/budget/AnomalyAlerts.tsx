/**
 * Anomaly Alerts Component
 * Displays unusual spending pattern alerts with user feedback
 */

import { AlertTriangle, X, CheckCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storeAnomalyFeedback, getAnomalyFeedback } from '@/lib/budget-db';
import type { AnomalyAlert } from '@/lib/analytics/anomaly-detector';

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
  const [feedbackMap, setFeedbackMap] = useState<Map<string, boolean>>(new Map());

  // Load existing feedback - use stable reference for alerts
  // Using JSON.stringify of alert IDs to prevent infinite loop when alerts array is recreated
  const alertIds = alerts.map(a => a.transaction.id).join(',');

  useEffect(() => {
    async function loadFeedback() {
      const feedbackPromises = alerts.map(async (alert) => {
        const feedback = await getAnomalyFeedback(alert.transaction.id);
        return feedback ? [alert.transaction.id, feedback.wasExpected] as const : null;
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
      console.error('Error storing feedback:', error);
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  const displayedAlerts = alerts.slice(0, maxDisplay);

  const getSeverityStyles = (severity: AnomalyAlert['severity']) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          badge: 'bg-red-100 text-red-800',
        };
      case 'medium':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'text-orange-600',
          text: 'text-orange-900',
          badge: 'bg-orange-100 text-orange-800',
        };
      case 'low':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-900',
          badge: 'bg-yellow-100 text-yellow-800',
        };
    }
  };

  return (
    <div className="space-y-3">
      {displayedAlerts.map((alert) => {
        const styles = getSeverityStyles(alert.severity);
        const date = new Date(alert.transaction.date);
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={alert.transaction.id}
            className={`${styles.bg} border rounded-lg p-4 relative`}
          >
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.transaction.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles.badge}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{formattedDate}</span>
                </div>
                <p className={`text-sm font-medium ${styles.text} mb-1`}>
                  {alert.reason}
                </p>
                <div className="text-xs text-gray-600 space-y-0.5 mb-3">
                  <p>
                    <span className="font-medium">Merchant:</span> {alert.merchant}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> ${alert.amount.toFixed(2)} (Average: ${alert.expectedRange.average.toFixed(2)})
                  </p>
                  <p>
                    <span className="font-medium">Category:</span> {alert.category}
                  </p>
                </div>
                
                {/* User Feedback Buttons */}
                {!feedbackMap.has(alert.transaction.id) ? (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Was this expected?</span>
                    <button
                      onClick={() => handleFeedback(alert, true)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                      title="Mark as expected"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Expected
                    </button>
                    <button
                      onClick={() => handleFeedback(alert, false)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                      title="Mark as unexpected"
                    >
                      <XCircle className="w-3 h-3" />
                      Unexpected
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500 italic">
                      {feedbackMap.get(alert.transaction.id) 
                        ? '✓ Marked as expected' 
                        : '✓ Marked as unexpected'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {alerts.length > maxDisplay && (
        <p className="text-xs text-gray-500 text-center">
          +{alerts.length - maxDisplay} more anomaly{alerts.length - maxDisplay > 1 ? 'ies' : 'y'}
        </p>
      )}
    </div>
  );
}


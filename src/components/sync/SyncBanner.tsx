import React from "react";

export default function SyncBanner({
  status,
  lastSync,
  onRetry,
  onDetails,
}: {
  status: "synced" | "syncing" | "warning" | "error";
  lastSync?: string;
  onRetry?: () => void;
  onDetails?: () => void;
}) {
  const color =
    status === "synced"
      ? "bg-green-500"
      : status === "syncing"
        ? "bg-blue-500"
        : status === "warning"
          ? "bg-orange-500"
          : "bg-red-500";
  return (
    <div
      className={`z-60 fixed right-4 top-4 ${color} flex items-center gap-3 rounded-full px-3 py-2 text-white shadow-md`}
      role="status"
      aria-live="polite"
    >
      <span className="inline-block h-2 w-2 rounded-full" />
      <span className="text-sm">
        {status === "synced"
          ? `Synced • last: ${lastSync ?? "just now"}`
          : status === "syncing"
            ? "Syncing…"
            : status === "warning"
              ? "Sync delayed"
              : "Sync failed"}
      </span>
      <div className="ml-2 flex gap-2">
        {status !== "syncing" && (
          <button onClick={onRetry} className="text-sm text-white underline">
            Retry
          </button>
        )}
        <button onClick={onDetails} className="text-sm text-white underline">
          Details
        </button>
      </div>
    </div>
  );
}

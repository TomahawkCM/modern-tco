"use client";
import React, { useContext, useEffect, useState } from "react";
import SyncBanner from "./sync/SyncBanner";
import SyncDetailsPanel from "./sync/SyncDetailsPanel";
import ConflictModal from "./sync/ConflictModal";
import CommandPalette from "./CommandPalette";
import OnboardingModal from "./onboarding/OnboardingModal";
import LANSyncContext from "@/contexts/LANSyncContext";
import { onboardingStarted, onboardingCompleted } from "@/lib/analytics/events";

export default function SyncClientWrapper() {
  // Use context directly instead of useLANSync() to avoid throwing when
  // LANSyncProvider is not in the tree (e.g. non-budget-app pages).
  const lan = useContext(LANSyncContext);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [conflict, setConflict] = useState<{ id: string } | null>(null);

  useEffect(() => {
    // Show onboarding if first run
    try {
      const first = localStorage.getItem("first_run");
      if (!first) {
        setOnboardingOpen(true);
        localStorage.setItem("first_run", "1");
        onboardingStarted();
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!onboardingOpen) {
      onboardingCompleted();
    }
  }, [onboardingOpen]);

  // Map lan state to banner props
  const health = lan?.state?.health;
  const status = health === "healthy"
    ? "synced"
    : lan?.state?.isSyncing
      ? "syncing"
      : lan?.state?.error
        ? "error"
        : "warning";
  const lastSync = lan?.state?.lastGlobalSyncAt
    ? new Date(lan.state.lastGlobalSyncAt).toLocaleString()
    : undefined;

  // Surface first alert as a conflict
  useEffect(() => {
    if (lan?.state?.alerts?.length) {
      const alert = lan.state.alerts[0];
      setConflict({ id: alert.id });
    }
  }, [lan?.state?.alerts]);

  return (
    <>
      <SyncBanner
        status={status as any}
        lastSync={lastSync}
        onRetry={() => lan?.syncAll?.()}
        onDetails={() => setDetailsOpen(true)}
      />
      {detailsOpen && (
        <SyncDetailsPanel
          onClose={() => setDetailsOpen(false)}
          history={[]}
        />
      )}
      {conflict && (
        <ConflictModal
          conflict={conflict}
          onClose={() => setConflict(null)}
          onResolveLocal={() => {
            lan?.dismissAlert?.(conflict.id);
            setConflict(null);
          }}
          onResolveRemote={() => {
            lan?.dismissAlert?.(conflict.id);
            setConflict(null);
          }}
          onMerge={() => {
            lan?.dismissAlert?.(conflict.id);
            setConflict(null);
          }}
        />
      )}
      <CommandPalette />
      <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import SyncBanner from './sync/SyncBanner';
import SyncDetailsPanel from './sync/SyncDetailsPanel';
import ConflictModal from './sync/ConflictModal';
import CommandPalette from './CommandPalette';
import OnboardingModal from './onboarding/OnboardingModal';
import { useLANSync } from '@/contexts/LANSyncContext';
import { onboardingStarted, onboardingCompleted } from '@/lib/analytics/events';

export default function SyncClientWrapper(){
  const lan = useLANSync();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [conflict, setConflict] = useState<any>(null);

  useEffect(()=>{
    // Show onboarding if first run
    try{
      const first = localStorage.getItem('first_run');
      if (!first) {
        setOnboardingOpen(true);
        localStorage.setItem('first_run', '1');
        onboardingStarted();
      }
    }catch(e){}
  },[]);

  useEffect(()=>{
    if (!onboardingOpen){ onboardingCompleted(); }
  },[onboardingOpen])

  // Map lan state to banner props
  const status = lan?.state?.connected ? 'synced' : lan?.state?.pending ? 'syncing' : lan?.state?.error ? 'error' : 'warning';
  const lastSync = lan?.state?.lastSuccessfulAt ? new Date(lan.state.lastSuccessfulAt).toLocaleString() : undefined;

  // Example conflict hook
  useEffect(()=>{
    if (lan?.state?.conflicts?.length){
      setConflict(lan.state.conflicts[0]);
    }
  },[lan?.state?.conflicts]);

  return (
    <>
      <SyncBanner status={status as any} lastSync={lastSync} onRetry={() => lan?.retry?.()} onDetails={()=>setDetailsOpen(true)} />
      {detailsOpen && <SyncDetailsPanel onClose={()=>setDetailsOpen(false)} history={lan?.getStats?.()?.history} />}
      {conflict && <ConflictModal conflict={conflict} onClose={()=>setConflict(null)} onResolveLocal={()=>{lan?.resolveConflict?.(conflict.id,'local'); setConflict(null)}} onResolveRemote={()=>{lan?.resolveConflict?.(conflict.id,'remote'); setConflict(null)}} onMerge={(m)=>{lan?.resolveConflict?.(conflict.id,'merge',m); setConflict(null)}} />
      <CommandPalette />
      <OnboardingModal open={onboardingOpen} onClose={()=>setOnboardingOpen(false)} />
    </>
  );
}

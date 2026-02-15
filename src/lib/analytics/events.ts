export const trackEvent = (name:string, props?:Record<string,any>) => {
  try{
    // Hook into existing analytics (PostHog/Segment). Fallback to console.
    // Example: window.posthog?.capture(name, props)
    if (typeof window !== 'undefined' && (window as any).posthog){
      (window as any).posthog.capture(name, props);
    } else {
      console.log('[analytics]', name, props);
    }
  }catch(e){ console.error('analytics error', e) }
};

export const onboardingStarted = () => trackEvent('onboarding_started');
export const onboardingCompleted = () => trackEvent('onboarding_completed');
export const importStarted = (format?:string) => trackEvent('import_started',{format});
export const importFailed = (reason?:string) => trackEvent('import_failed',{reason});
export const syncError = (reason?:string) => trackEvent('sync_error',{reason});
export const conflictResolved = (method?:string) => trackEvent('conflict_resolved',{method});

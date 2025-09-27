// Minimal spaced repetition utilities (SM-2 inspired)
// Used by Notes MVP to schedule reviews client-side

export type SRRating = 'again' | 'hard' | 'good' | 'easy';

export interface SRCardState {
  id: string;
  // next due time (epoch ms)
  due: number;
  // interval in days
  interval: number;
  // easiness factor
  ease: number;
  // successful repetitions
  reps: number;
  // number of lapses (failures)
  lapses: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

export function createInitialState(id: string, now: Date = new Date()): SRCardState {
  return {
    id,
    due: now.getTime(),
    interval: 0,
    ease: 2.5,
    reps: 0,
    lapses: 0,
  };
}

export function isDue(state: SRCardState, now: Date = new Date()): boolean {
  return state.due <= now.getTime();
}

export function nextDue(state: SRCardState): Date {
  return new Date(state.due);
}

export function schedule(
  state: SRCardState,
  rating: SRRating,
  now: Date = new Date()
): SRCardState {
  let ease = state.ease;
  let interval = state.interval; // days
  let reps = state.reps;
  let lapses = state.lapses;

  switch (rating) {
    case 'again': {
      // Reset repetitions; short interval, decrease ease
      reps = 0;
      lapses += 1;
      ease = Math.max(MIN_EASE, ease - 0.2);
      interval = 1; // review tomorrow
      break;
    }
    case 'hard': {
      ease = Math.max(MIN_EASE, ease - 0.15);
      if (reps <= 0) interval = 1;
      else if (reps === 1) interval = Math.max(1, Math.round(interval * 1.2));
      else interval = Math.max(1, Math.round(interval * 1.2));
      reps = Math.max(1, reps);
      break;
    }
    case 'good': {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 6;
      else interval = Math.max(1, Math.round(interval * ease));
      reps += 1;
      break;
    }
    case 'easy': {
      ease = Math.max(MIN_EASE, ease + 0.15);
      if (reps === 0) interval = 3;
      else if (reps === 1) interval = 7;
      else interval = Math.max(1, Math.round(interval * ease * 1.3));
      reps += 1;
      break;
    }
  }

  const due = now.getTime() + interval * DAY_MS;
  return { ...state, ease, interval, reps, lapses, due };
}

export function getDueQueue(states: SRCardState[], now: Date = new Date()): SRCardState[] {
  const ts = now.getTime();
  return states
    .filter((s) => s.due <= ts)
    .sort((a, b) => a.due - b.due);
}


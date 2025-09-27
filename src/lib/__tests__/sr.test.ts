import { createInitialState, schedule, isDue, getDueQueue } from "@/lib/sr";

describe("sr scheduling", () => {
  const now = new Date("2025-01-01T00:00:00Z");

  test("initial state is due now", () => {
    const s = createInitialState("n1", now);
    expect(isDue(s, now)).toBe(true);
    const q = getDueQueue([s], now);
    expect(q).toHaveLength(1);
    expect(q[0].id).toBe("n1");
  });

  test("good → sets reps and interval progression (1, then 6)", () => {
    let s = createInitialState("n2", now);
    s = schedule(s, "good", now); // first good → 1 day
    expect(s.reps).toBe(1);
    expect(s.interval).toBe(1);

    // After 1 day, good again → 6 days
    const day1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    s = schedule(s, "good", day1);
    expect(s.reps).toBe(2);
    expect(s.interval).toBe(6);
  });

  test("easy increases ease and interval more aggressively", () => {
    let s = createInitialState("n3", now);
    const ease0 = s.ease;
    s = schedule(s, "easy", now);
    expect(s.reps).toBe(1);
    expect(s.interval).toBeGreaterThanOrEqual(3);
    expect(s.ease).toBeGreaterThan(ease0);
  });

  test("again resets reps and reduces ease, due next day", () => {
    let s = createInitialState("n4", now);
    s = schedule(s, "good", now);
    const before = s.ease;
    const later = new Date(now.getTime() + 1000);
    s = schedule(s, "again", later);
    expect(s.reps).toBe(0);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBeLessThanOrEqual(before);
    expect(s.interval).toBe(1);
  });
});


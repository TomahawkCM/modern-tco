import { describe, it, expect } from 'vitest';
import { detectMilestones, NET_WORTH_MILESTONES } from '@/lib/net-worth/calculator';

describe('net-worth-calculator', () => {
  describe('detectMilestones', () => {
    it('detects when crossing 10K milestone', () => {
      const milestones = detectMilestones(12000, 8000);
      expect(milestones).toContain(10000);
    });

    it('detects when crossing 100K milestone', () => {
      const milestones = detectMilestones(105000, 95000);
      expect(milestones).toContain(100000);
    });

    it('detects multiple milestones crossed at once', () => {
      const milestones = detectMilestones(60000, 5000);
      expect(milestones).toContain(10000);
      expect(milestones).toContain(25000);
      expect(milestones).toContain(50000);
    });

    it('returns empty array when no milestones crossed', () => {
      const milestones = detectMilestones(15000, 12000);
      expect(milestones).toHaveLength(0);
    });

    it('returns empty when net worth decreases', () => {
      const milestones = detectMilestones(8000, 12000);
      expect(milestones).toHaveLength(0);
    });

    it('handles zero previous net worth', () => {
      const milestones = detectMilestones(30000, 0);
      expect(milestones).toContain(10000);
      expect(milestones).toContain(25000);
    });
  });

  describe('NET_WORTH_MILESTONES', () => {
    it('has expected milestone values', () => {
      expect(NET_WORTH_MILESTONES).toContain(10000);
      expect(NET_WORTH_MILESTONES).toContain(50000);
      expect(NET_WORTH_MILESTONES).toContain(100000);
      expect(NET_WORTH_MILESTONES).toContain(1000000);
    });

    it('is sorted ascending', () => {
      for (let i = 1; i < NET_WORTH_MILESTONES.length; i++) {
        expect(NET_WORTH_MILESTONES[i]).toBeGreaterThan(NET_WORTH_MILESTONES[i - 1]);
      }
    });
  });
});

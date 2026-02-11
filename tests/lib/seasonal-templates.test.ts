import { describe, it, expect } from 'vitest';
import { getRelevantTemplates, SEASONAL_TEMPLATES } from '@/lib/event-budgets/seasonal-templates';

describe('seasonal-templates', () => {
  describe('getRelevantTemplates', () => {
    it('returns Holiday template for November', () => {
      const templates = getRelevantTemplates(11);
      const names = templates.map((t) => t.id);
      expect(names).toContain('holiday_season');
    });

    it('returns Summer Travel template for July', () => {
      const templates = getRelevantTemplates(7);
      const names = templates.map((t) => t.id);
      expect(names).toContain('summer_travel');
    });

    it('returns Tax Season template for March', () => {
      const templates = getRelevantTemplates(3);
      const names = templates.map((t) => t.id);
      expect(names).toContain('tax_season');
    });

    it('always includes Wedding template', () => {
      for (let month = 1; month <= 12; month++) {
        const templates = getRelevantTemplates(month);
        const names = templates.map((t) => t.id);
        expect(names).toContain('wedding_event');
      }
    });

    it('returns Back to School template for August', () => {
      const templates = getRelevantTemplates(8);
      const names = templates.map((t) => t.id);
      expect(names).toContain('back_to_school');
    });

    it('does not return Holiday template for June', () => {
      const templates = getRelevantTemplates(6);
      const names = templates.map((t) => t.id);
      expect(names).not.toContain('holiday_season');
    });
  });

  describe('SEASONAL_TEMPLATES', () => {
    it('has 6 templates defined', () => {
      expect(SEASONAL_TEMPLATES).toHaveLength(6);
    });

    it('each template has categories', () => {
      for (const template of SEASONAL_TEMPLATES) {
        expect(template.categories.length).toBeGreaterThan(0);
      }
    });

    it('each template has valid month ranges', () => {
      for (const template of SEASONAL_TEMPLATES) {
        for (const month of template.relevantMonths) {
          expect(month).toBeGreaterThanOrEqual(1);
          expect(month).toBeLessThanOrEqual(12);
        }
      }
    });
  });
});

import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/budget-db";
import {
  createEventBudget,
  calculateProgress,
  getActiveEvents,
  tagTransaction,
  untagTransaction,
  deleteEventBudget,
} from "@/lib/event-budgets/event-budget-engine";
import type { Transaction } from "@/types/budget";

beforeEach(async () => {
  await db.eventBudgets.clear();
  await db.eventBudgetCategories.clear();
  await db.transactions.clear();
});

/** Helper to create a minimal transaction and store it in the DB. */
async function seedTransaction(
  overrides: Partial<Transaction> & { id: string; amount: number }
): Promise<Transaction> {
  const now = new Date();
  const tx: Transaction = {
    accountId: "acc-1",
    date: now,
    description: "Test transaction",
    category: null,
    subcategory: null,
    notes: "",
    isRecurring: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
  await db.transactions.add(tx);
  return tx;
}

describe("event-budget-engine", () => {
  // ----------------------------------------------------------------
  // createEventBudget
  // ----------------------------------------------------------------
  describe("createEventBudget", () => {
    it("stores an event budget in IndexedDB and returns the correct shape", async () => {
      const result = await createEventBudget({
        name: "Summer Vacation",
        description: "Family trip to Hawaii",
        status: "active",
        totalBudget: 5000,
        currency: "USD",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-06-14"),
      });

      // Returned object has all required fields
      expect(result.id).toMatch(/^event_/);
      expect(result.name).toBe("Summer Vacation");
      expect(result.totalBudget).toBe(5000);
      expect(result.status).toBe("active");
      expect(result.currency).toBe("USD");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Persisted in IndexedDB
      const stored = await db.eventBudgets.get(result.id);
      expect(stored).toBeDefined();
      expect(stored!.name).toBe("Summer Vacation");
      expect(stored!.totalBudget).toBe(5000);
    });

    it("creates EventBudgetCategory records when categories are provided", async () => {
      const result = await createEventBudget(
        {
          name: "Conference",
          status: "planning",
          totalBudget: 3000,
          currency: "CAD",
          startDate: new Date("2026-09-01"),
          endDate: new Date("2026-09-05"),
        },
        [
          { categoryName: "Travel", budgeted: 1200 },
          { categoryName: "Accommodation", budgeted: 1000 },
          { categoryName: "Food & Dining", budgeted: 800 },
        ]
      );

      const categories = await db.eventBudgetCategories
        .where("eventBudgetId")
        .equals(result.id)
        .toArray();

      expect(categories).toHaveLength(3);
      expect(categories.map((c) => c.categoryName).sort()).toEqual([
        "Accommodation",
        "Food & Dining",
        "Travel",
      ]);

      // Each category starts with spent = 0
      for (const cat of categories) {
        expect(cat.spent).toBe(0);
        expect(cat.eventBudgetId).toBe(result.id);
        expect(cat.id).toMatch(/^ebc_/);
      }

      // Budget totals add up
      const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
      expect(totalBudgeted).toBe(3000);
    });

    it("creates no category records when no categories are provided", async () => {
      const result = await createEventBudget({
        name: "Quick Event",
        status: "active",
        totalBudget: 500,
        currency: "USD",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-02"),
      });

      const categories = await db.eventBudgetCategories
        .where("eventBudgetId")
        .equals(result.id)
        .toArray();

      expect(categories).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------------
  // calculateProgress
  // ----------------------------------------------------------------
  describe("calculateProgress", () => {
    it("returns correct total, spent, and remaining from tagged transactions", async () => {
      const event = await createEventBudget(
        {
          name: "Wedding",
          status: "active",
          totalBudget: 10000,
          currency: "USD",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2026-07-02"),
        },
        [
          { categoryName: "Venue", budgeted: 5000 },
          { categoryName: "Catering", budgeted: 3000 },
          { categoryName: "Flowers", budgeted: 2000 },
        ]
      );

      // Seed tagged transactions (negative = expense)
      await seedTransaction({
        id: "tx-1",
        amount: -2500,
        category: "Venue",
        eventBudgetId: event.id,
      });
      await seedTransaction({
        id: "tx-2",
        amount: -1500,
        category: "Catering",
        eventBudgetId: event.id,
      });
      await seedTransaction({
        id: "tx-3",
        amount: -800,
        category: "Flowers",
        eventBudgetId: event.id,
      });

      const progress = await calculateProgress(event.id);

      expect(progress.total).toBe(10000);
      expect(progress.spent).toBe(4800);
      expect(progress.remaining).toBe(5200);
      expect(progress.byCategory).toHaveLength(3);

      const venue = progress.byCategory.find((c) => c.categoryName === "Venue");
      expect(venue!.spent).toBe(2500);
      const catering = progress.byCategory.find((c) => c.categoryName === "Catering");
      expect(catering!.spent).toBe(1500);
      const flowers = progress.byCategory.find((c) => c.categoryName === "Flowers");
      expect(flowers!.spent).toBe(800);
    });

    it("ignores positive (income) transactions when computing spent", async () => {
      const event = await createEventBudget(
        {
          name: "Fundraiser",
          status: "active",
          totalBudget: 2000,
          currency: "USD",
          startDate: new Date("2026-05-01"),
          endDate: new Date("2026-05-15"),
        },
        [{ categoryName: "Supplies", budgeted: 2000 }]
      );

      await seedTransaction({
        id: "tx-in",
        amount: 500,
        category: "Supplies",
        eventBudgetId: event.id,
      });
      await seedTransaction({
        id: "tx-out",
        amount: -300,
        category: "Supplies",
        eventBudgetId: event.id,
      });

      const progress = await calculateProgress(event.id);

      expect(progress.spent).toBe(300);
      expect(progress.remaining).toBe(1700);
    });

    it("ignores split parent transactions (isSplit = true)", async () => {
      const event = await createEventBudget(
        {
          name: "Party",
          status: "active",
          totalBudget: 1000,
          currency: "USD",
          startDate: new Date("2026-04-01"),
          endDate: new Date("2026-04-02"),
        },
        [{ categoryName: "Food & Dining", budgeted: 1000 }]
      );

      // Parent (split) should be ignored
      await seedTransaction({
        id: "tx-parent",
        amount: -400,
        category: "Food & Dining",
        eventBudgetId: event.id,
        isSplit: true,
      });
      // Children should count
      await seedTransaction({
        id: "tx-child-1",
        amount: -250,
        category: "Food & Dining",
        eventBudgetId: event.id,
      });
      await seedTransaction({
        id: "tx-child-2",
        amount: -150,
        category: "Food & Dining",
        eventBudgetId: event.id,
      });

      const progress = await calculateProgress(event.id);
      expect(progress.spent).toBe(400);
    });

    it("returns zeros for non-existent event budget", async () => {
      const progress = await calculateProgress("non-existent-id");
      expect(progress.total).toBe(0);
      expect(progress.spent).toBe(0);
      expect(progress.remaining).toBe(0);
      expect(progress.byCategory).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------------
  // getActiveEvents
  // ----------------------------------------------------------------
  describe("getActiveEvents", () => {
    it("returns only active and planning events", async () => {
      await createEventBudget({
        name: "Active Event",
        status: "active",
        totalBudget: 1000,
        currency: "USD",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-02-01"),
      });
      await createEventBudget({
        name: "Planning Event",
        status: "planning",
        totalBudget: 2000,
        currency: "USD",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-04-01"),
      });
      await createEventBudget({
        name: "Completed Event",
        status: "completed",
        totalBudget: 500,
        currency: "USD",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-02-01"),
      });
      await createEventBudget({
        name: "Cancelled Event",
        status: "cancelled",
        totalBudget: 750,
        currency: "USD",
        startDate: new Date("2025-06-01"),
        endDate: new Date("2025-07-01"),
      });

      const active = await getActiveEvents();

      expect(active).toHaveLength(2);
      const names = active.map((e) => e.name).sort();
      expect(names).toEqual(["Active Event", "Planning Event"]);
    });

    it("returns empty array when no active/planning events exist", async () => {
      await createEventBudget({
        name: "Done",
        status: "completed",
        totalBudget: 100,
        currency: "USD",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-02"),
      });

      const active = await getActiveEvents();
      expect(active).toHaveLength(0);
    });
  });

  // ----------------------------------------------------------------
  // tagTransaction / untagTransaction
  // ----------------------------------------------------------------
  describe("tagTransaction", () => {
    it("sets eventBudgetId on the transaction", async () => {
      const tx = await seedTransaction({ id: "tx-tag-1", amount: -100 });

      await tagTransaction(tx.id, "event-abc");

      const updated = await db.transactions.get(tx.id);
      expect(updated!.eventBudgetId).toBe("event-abc");
      expect(updated!.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("untagTransaction", () => {
    it("clears eventBudgetId from the transaction", async () => {
      const tx = await seedTransaction({
        id: "tx-untag-1",
        amount: -200,
        eventBudgetId: "event-xyz",
      });

      await untagTransaction(tx.id);

      const updated = await db.transactions.get(tx.id);
      expect(updated!.eventBudgetId).toBeUndefined();
    });
  });

  // ----------------------------------------------------------------
  // deleteEventBudget
  // ----------------------------------------------------------------
  describe("deleteEventBudget", () => {
    it("removes the event budget, its categories, and untags transactions", async () => {
      const event = await createEventBudget(
        {
          name: "To Delete",
          status: "active",
          totalBudget: 3000,
          currency: "USD",
          startDate: new Date("2026-01-01"),
          endDate: new Date("2026-01-31"),
        },
        [
          { categoryName: "Food", budgeted: 1500 },
          { categoryName: "Decor", budgeted: 1500 },
        ]
      );

      // Tag two transactions
      await seedTransaction({ id: "tx-d1", amount: -500, eventBudgetId: event.id });
      await seedTransaction({ id: "tx-d2", amount: -300, eventBudgetId: event.id });
      // Unrelated transaction should not be affected
      await seedTransaction({ id: "tx-other", amount: -100, eventBudgetId: "other-event" });

      await deleteEventBudget(event.id);

      // Event budget is gone
      const storedEvent = await db.eventBudgets.get(event.id);
      expect(storedEvent).toBeUndefined();

      // Categories are gone
      const cats = await db.eventBudgetCategories.where("eventBudgetId").equals(event.id).toArray();
      expect(cats).toHaveLength(0);

      // Tagged transactions have been untagged
      const tx1 = await db.transactions.get("tx-d1");
      expect(tx1!.eventBudgetId).toBeUndefined();
      const tx2 = await db.transactions.get("tx-d2");
      expect(tx2!.eventBudgetId).toBeUndefined();

      // Unrelated transaction is untouched
      const txOther = await db.transactions.get("tx-other");
      expect(txOther!.eventBudgetId).toBe("other-event");
    });
  });
});

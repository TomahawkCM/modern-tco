# S13 — Format Parser Integration (QIF, MT940, CAMT.053)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Write tests for existing QIF, MT940, CAMT.053 parsers and wire them into the import page processing logic.

**Architecture:** Parsers and format detector already exist and are complete. This session adds test coverage and import page integration so these formats actually work end-to-end.

**Tech Stack:** fast-xml-parser (CAMT.053), mt940-js (MT940), Vitest

---

## Tasks

1. Write 15 tests for QIF parser (parseQIFFile, isQIFContent, getQIFAccountType)
2. Write 4 tests for MT940 parser (isMT940Content detection)
3. Write 15 tests for CAMT.053 parser (parseCAMT053File, isCAMT053Content)
4. Wire QIF/MT940/CAMT.053 into import page processing logic
5. Update SESSION_TRACKER

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx vitest run` — all existing + new tests pass
- `npx eslint . --quiet` — 0 errors

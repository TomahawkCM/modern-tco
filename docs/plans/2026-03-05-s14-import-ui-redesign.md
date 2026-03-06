# S14 — Import UI Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the import page UI to reflect all 8 supported formats and add OCR language override for PDF imports.

**Architecture:** The import pipeline already supports CSV, OFX, QFX, PDF, QIF, MT940, CAMT.053. This session updates the UI to communicate format support to users and adds a language selector for OCR.

**Tech Stack:** React, Tailwind CSS, next-intl

---

## Tasks

1. Update upload area text to show all supported formats
2. Add OCR language override dropdown (appears when PDF detected)
3. Wire language override into OCR processing
4. Update SESSION_TRACKER and gap analysis

## Verification

- `npx tsc --noEmit` — 0 errors
- `npx vitest run` — all tests pass
- `npx eslint . --quiet` — 0 errors

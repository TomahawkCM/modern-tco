/**
 * Flashcard Public API - Non-Versioned Endpoint
 *
 * This is a compatibility layer that re-exports the v1 API.
 * The flashcardService.ts expects this path: /api/flashcards/public
 *
 * For implementation details, see: /api/v1/flashcards/public/route.ts
 */

export { GET, POST } from "@/app/api/v1/flashcards/public/route";

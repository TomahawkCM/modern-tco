/**
 * Simplified Modules Page for debugging
 */

"use client";

export default function ModulesPageSimple() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground text-center mb-8">
          Simple Modules Page Test
        </h1>
        <p className="text-foreground text-center">
          If you see this, the basic component structure works.
        </p>
      </div>
    </div>
  );
}
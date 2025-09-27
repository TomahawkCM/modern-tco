"use client";

export default function MDXTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold text-white">MDX Test Page</h1>
        <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-6">
          <p className="mb-4 text-gray-300">
            This is a simple test page to verify the application can load without MDX imports.
          </p>
          <div className="rounded border border-green-500/30 bg-green-500/20 p-4">
            <p className="text-green-200">✅ Basic page rendering works</p>
          </div>
        </div>
      </div>
    </div>
  );
}

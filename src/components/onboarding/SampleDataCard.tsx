import React from "react";

export default function SampleDataCard({ onImport }: { onImport: () => void }) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-medium">Try sample data</h3>
      <p className="mb-3 text-sm text-slate-600">
        Explore the app with example transactions and budgets. Nothing will be uploaded.
      </p>
      <button className="btn-primary" onClick={onImport}>
        Import sample data
      </button>
    </div>
  );
}

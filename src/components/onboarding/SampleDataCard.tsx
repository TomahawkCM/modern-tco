import React from 'react';

export default function SampleDataCard({ onImport }: { onImport: () => void }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-2">Try sample data</h3>
      <p className="text-sm text-slate-600 mb-3">Explore the app with example transactions and budgets. Nothing will be uploaded.</p>
      <button className="btn-primary" onClick={onImport}>Import sample data</button>
    </div>
  );
}

import React from "react";

export default function TransactionsEmpty() {
  return (
    <div className="p-6 text-center">
      <h2 className="mb-2 text-lg font-medium">No transactions yet</h2>
      <p className="mb-4 text-sm text-slate-600">
        Import a file or add a transaction manually to get started.
      </p>
      <div className="flex justify-center gap-3">
        <button className="btn-primary">Import</button>
        <button className="btn-secondary">Add transaction</button>
      </div>
    </div>
  );
}

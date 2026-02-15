import React from 'react';

export default function DashboardEmpty(){
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Welcome to your dashboard</h2>
      <p className="text-sm text-slate-600 mb-4">Start by importing your bank statement or create your first budget to see insights here.</p>
      <div className="flex justify-center gap-3">
        <button className="btn-primary">Import transactions</button>
        <button className="btn-secondary">Create budget</button>
      </div>
    </div>
  );
}

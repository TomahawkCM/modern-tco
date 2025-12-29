import { Check, X } from "lucide-react";
import { LandingCard } from "./LandingCard";

export function ComparisonTable() {
  const rows = [
    {
      feature: "Data Privacy",
      local: "100% Private (Local)",
      sync: "End-to-End Encrypted",
      cloud: "Viewable by Employees",
    },
    {
      feature: "Cost",
      local: "Free Forever",
      sync: "One-time Upgrade",
      cloud: "$100+/year Subscription",
    },
    {
      feature: "Offline Mode",
      local: true,
      sync: true,
      cloud: false,
    },
    {
      feature: "Bank Connections",
      local: "CSV / Manual Only",
      sync: "Optional (Encrypted)",
      cloud: "Mandatory Aggregation",
    },
    {
      feature: "Storage Location",
      local: "Your Device",
      sync: "Zero-Knowledge Cloud",
      cloud: "Their Database",
    },
  ];

  function renderValue(val: string | boolean) {
    if (val === true) return <Check className="mx-auto h-5 w-5 text-teal-400" />;
    if (val === false) return <X className="mx-auto h-5 w-5 text-rose-400" />;
    return <span className="text-sm">{val}</span>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-4 gap-4 border-b border-white/10 pb-4 text-center text-sm font-bold text-white">
          <div className="pl-4 text-left">Feature</div>
          <div className="text-teal-300">BudgetPro Local</div>
          <div className="text-indigo-300">BudgetPro Sync (Pro)</div>
          <div className="text-slate-500">Typical Cloud App</div>
        </div>
        <div className="space-y-4 pt-4">
          {rows.map((row) => (
            <LandingCard
              key={row.feature}
              className="grid grid-cols-4 items-center gap-4 p-4 text-center"
            >
              <div className="text-left text-sm font-medium text-slate-200">{row.feature}</div>
              <div className="text-slate-200">{renderValue(row.local)}</div>
              <div className="text-slate-200">{renderValue(row.sync)}</div>
              <div className="text-slate-400">{renderValue(row.cloud)}</div>
            </LandingCard>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg">
        <input
          aria-label="Command"
          className="w-full rounded border p-3"
          placeholder="Type an action or shortcut..."
        />
        <div className="mt-2">Try: "New transaction", "Import", "Go to Budgets"</div>
      </div>
    </div>
  );
}

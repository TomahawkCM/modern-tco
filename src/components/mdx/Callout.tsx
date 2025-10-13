import React from "react";

type CalloutType = "note" | "definition" | "info" | "try" | "warning" | "tip";

type CalloutProps = {
  type?: CalloutType;
  title?: string;
  children?: React.ReactNode;
};

const calloutStyles: Record<
  CalloutType,
  { container: string; icon: string; iconColor: string }
> = {
  note: {
    container: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
    icon: "ℹ️",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  definition: {
    container:
      "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950",
    icon: "📖",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  info: {
    container:
      "border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-950",
    icon: "💡",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  try: {
    container:
      "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
    icon: "🎯",
    iconColor: "text-green-600 dark:text-green-400",
  },
  warning: {
    container:
      "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
    icon: "⚠️",
    iconColor: "text-yellow-600 dark:text-yellow-400",
  },
  tip: {
    container:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950",
    icon: "✨",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
};

export default function Callout({
  type = "note",
  title,
  children,
}: CalloutProps) {
  const styles = calloutStyles[type];

  return (
    <aside
      className={`my-4 rounded-lg border p-4 ${styles.container}`}
      role="complementary"
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${styles.iconColor}`} aria-hidden="true">
          {styles.icon}
        </span>
        <div className="flex-1">
          {title && (
            <div
              className={`mb-2 font-semibold ${styles.iconColor}`}
              role="heading"
              aria-level={4}
            >
              {title}
            </div>
          )}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

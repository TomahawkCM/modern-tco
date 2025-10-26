import React from "react";

interface StepsProps {
  children?: React.ReactNode;
}

interface StepProps {
  children?: React.ReactNode;
}

export function Steps({ children }: StepsProps) {
  return (
    <ol className="my-6 ml-6 list-decimal space-y-3 text-muted-foreground [counter-reset:step]">
      {children}
    </ol>
  );
}

export function Step({ children }: StepProps) {
  return (
    <li className="pl-2 text-muted-foreground [&::marker]:font-semibold [&::marker]:text-cyan-400">
      {children}
    </li>
  );
}

export default Steps;

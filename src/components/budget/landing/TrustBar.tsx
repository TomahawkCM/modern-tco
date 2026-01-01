'use client';

import { LandingCard } from "@/components/budget/landing/LandingCard";
import { Section } from "@/components/budget/landing/Section";
import { useLandingContent } from "@/components/budget/landing/content";
import { Calendar, Lock, TableProperties, Zap } from "lucide-react";

export function TrustBar() {
  const content = useLandingContent();

  return (
    <Section className="border-y border-white/10 bg-[#070A12]/30">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {content.trust.map((item) => {
          const Icon =
            item.title === "Your Device, Your Data"
              ? Lock
              : item.title === "Spreadsheet Power"
                ? TableProperties
                : item.title === "Offline Speed"
                  ? Zap
                  : item.title === "Manual Rituals"
                    ? Calendar
                    : Lock;
          return (
            <LandingCard key={item.title} className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                  <Icon className="h-5 w-5 text-teal-200" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.title}</div>
                  <div className="mt-2 text-sm text-slate-400">{item.description}</div>
                </div>
              </div>
            </LandingCard>
          );
        })}
      </div>
    </Section>
  );
}

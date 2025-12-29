import { Section } from "@/components/budget/landing/Section";
import { LandingCard } from "@/components/budget/landing/LandingCard";
import Link from "next/link";

export function SecuritySection() {
  return (
    <Section className="bg-[#070A12]/25">
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Privacy-first by design
          </h2>
          <p className="mt-3 text-base text-slate-400">
            The Budget App stores your data locally (offline-ready) and gives you controls for AI
            features, exporting, and deletion.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/budget-app/settings"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-300 to-cyan-300 px-5 text-sm font-extrabold text-slate-900 transition-colors hover:from-teal-200 hover:to-cyan-200"
            >
              Privacy & settings
            </Link>
            <Link
              href="/budget-app/offline"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Offline support
            </Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Local storage",
                description:
                  "Your budget data is stored in your browser (IndexedDB) so the app stays fast and usable offline.",
              },
              {
                title: "Encryption support",
                description:
                  "The app includes an encryption layer to protect sensitive budget records when enabled.",
              },
              {
                title: "AI feature controls",
                description:
                  "Toggle AI-powered features (like anomaly detection) and manage chatbot access from settings.",
              },
              {
                title: "Export & delete",
                description:
                  "Export your data and privacy settings, or delete local data directly from the app.",
              },
            ].map((card) => (
              <LandingCard key={card.title} className="p-6">
                <div className="text-base font-semibold text-white">{card.title}</div>
                <p className="mt-2 text-sm text-slate-400">{card.description}</p>
              </LandingCard>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}



'use client';

import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle,
  Compass,
  Headphones,
  LayoutGrid,
  LifeBuoy,
  PlayCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BeginnerLayout } from '@/components/layout/BeginnerLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analytics } from '@/lib/analytics';

export default function BeginnerOnboardingPage() {
  const router = useRouter();
  useEffect(() => {
    try {
      localStorage.setItem('tanium-onboarding-viewed', 'true');
    } catch {
      // no-op in environments without localStorage
    }

    analytics.capture('beginner_onboarding_view', {
      section: 'overview',
    });
  }, []);

  return (
    <BeginnerLayout>
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
        <header className="rounded-3xl border border-cyan-900/40 bg-gradient-to-br from-gray-950 via-gray-950 to-cyan-950/40 p-8 text-left shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="w-fit border-cyan-600/40 bg-cyan-900/40 text-cyan-100">
                Start here
              </Badge>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                Welcome to your Tanium beginner path
              </h1>
              <p className="text-lg text-cyan-100/90">
                In less than ten minutes you will know exactly how this course is organised, the
                language we use, and how to earn your first win inside the Tanium console.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <Button
                size="lg"
                className="w-full justify-between gap-2 border border-white/10 bg-[#22c55e]/90 text-gray-900 hover:bg-[#22c55e] md:w-auto"
                onClick={() => {
                  analytics.capture('beginner_onboarding_cta', {
                    cta: 'jump_to_module_00',
                    location: 'hero',
                  });
                  router.push('/modules/00-tanium-platform-foundation-v2');
                }}
              >
                Jump to Module 00 <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Prefer to explore first? Scroll down for the guided tour.
              </p>
            </div>
          </div>
        </header>

        <section aria-labelledby="why-overview" className="space-y-4">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-primary" />
            <h2 id="why-overview" className="text-2xl font-semibold text-white">
              What to expect from the course
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: LayoutGrid,
                title: 'Four-part learning arc',
                description:
                  'Every module follows Why → What → How → Apply so you always know why a concept matters before touching the console.',
              },
              {
                icon: BookOpenCheck,
                title: 'Active practice everywhere',
                description:
                  'Knowledge checks, mini-practice tasks, and a checkpoint quiz keep you engaged and track your progress.',
              },
              {
                icon: LifeBuoy,
                title: 'Help when you need it',
                description:
                  'Callouts explain pitfalls, plain-language glossary terms stay nearby, and onboarding offers quick references.',
              },
            ].map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-3">
                  <item.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-base text-white">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="first-success" className="space-y-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-[#22c55e]" />
            <h2 id="first-success" className="text-2xl font-semibold text-white">
              Your "first success" path (about 12 minutes)
            </h2>
          </div>
          <ol className="space-y-4 rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/10 p-6 text-white/90">
            <li>
              <h3 className="text-lg font-semibold">1. Watch the 90-second overview</h3>
              <p className="text-sm text-white/80">
                Learn how Tanium thinks about endpoints using the city-wide radio analogy. Video
                placeholder will live here.
              </p>
              <div className="mt-3 h-32 rounded-lg border border-white/20 bg-black/20 p-4 text-sm text-white/60">
                [Video placeholder – exported from Module 00 Step 1]
              </div>
            </li>
            <li>
              <h3 className="text-lg font-semibold">2. Follow the screenshot tour</h3>
              <p className="text-sm text-white/80">
                See where to click: Interact → Question Builder → Ask Question. Screenshots slot
                into the gallery component below.
              </p>
              <div className="mt-3 flex flex-col gap-3 rounded-lg border border-white/20 bg-black/20 p-4 text-sm text-white/60 md:flex-row">
                <div className="h-28 flex-1 rounded bg-white/5" aria-hidden="true" />
                <div className="h-28 flex-1 rounded bg-white/5" aria-hidden="true" />
                <div className="h-28 flex-1 rounded bg-white/5" aria-hidden="true" />
                <span className="sr-only">Screenshot placeholders for onboarding tour</span>
              </div>
            </li>
            <li>
              <h3 className="text-lg font-semibold">3. Run your first query</h3>
              <p className="text-sm text-white/80">
                Ask "Get Computer Name from all machines" and celebrate the instant response stream.
                Module 00 Step 2 walks through each click.
              </p>
            </li>
            <li>
              <h3 className="text-lg font-semibold">4. Reinforce with two flashcards</h3>
              <p className="text-sm text-white/80">
                Jump into the spaced-repetition deck tagged <strong>foundation</strong> and review
                the vocabulary you just saw.
              </p>
            </li>
          </ol>
        </section>

        <section aria-labelledby="glossary" className="space-y-4">
          <div className="flex items-center gap-3">
            <PlayCircle className="h-6 w-6 text-cyan-300" />
            <h2 id="glossary" className="text-2xl font-semibold text-white">
              Glossary cheat sheet
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                term: 'Endpoint',
                definition:
                  'Any computer, server, or device Tanium manages. Think of it as a citizen listening to the city-wide radio.',
              },
              {
                term: 'Sensor',
                definition:
                  'A question template that asks endpoints for live data. Sensors collect, they never change things.',
              },
              {
                term: 'Package',
                definition:
                  'A checklist of actions Tanium can run on endpoints—install software, clean temp files, update settings.',
              },
              {
                term: 'Action',
                definition: 'The moment a package runs across targeted endpoints.',
              },
            ].map((item) => (
              <Card key={item.term} className="border-white/10 bg-white/5 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white">{item.term}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-cyan-500/40 bg-cyan-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-200">
                <Headphones className="h-5 w-5" />
                Accessibility note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-cyan-100/90">
                Prefer audio? Quick definitions are available as 30-second clips inside the Module
                00 flashcard deck. Screen reader users can jump straight to the{' '}
                <strong>Glossary</strong> heading in Module 00.
              </p>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="next-steps" className="space-y-4">
          <div className="flex items-center gap-3">
            <ArrowRight className="h-6 w-6 text-primary" />
            <h2 id="next-steps" className="text-2xl font-semibold text-white">
              Next steps (save this checklist)
            </h2>
          </div>
          <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
            <CardContent className="space-y-3 p-6 text-sm text-muted-foreground">
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  Bookmark this page or download the PDF (coming soon) so you always have the
                  glossary and step-by-step guide.
                </li>
                <li>
                  Set a reminder to return tomorrow—Module 00 is designed for two short sittings.
                </li>
                <li>
                  Share questions in the learner Slack channel; every onboarding question improves
                  the next iteration.
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="outline"
                  className="border-white/20 text-white"
                  onClick={() => {
                    analytics.capture('beginner_onboarding_cta', {
                      cta: 'start_module_00',
                      location: 'next_steps',
                    });
                    router.push('/modules/00-tanium-platform-foundation-v2');
                  }}
                >
                  Start Module 00
                </Button>
                <Button
                  variant="ghost"
                  className="border-white/20 text-white"
                  onClick={() => {
                    analytics.capture('beginner_onboarding_cta', {
                      cta: 'open_module_00_flashcards',
                      location: 'next_steps',
                    });
                    router.push('/flashcards?deck=module-00-v2');
                  }}
                >
                  Open Module 00 flashcards
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </BeginnerLayout>
  );
}

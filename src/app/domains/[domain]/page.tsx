"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Zap, Layers, Shield, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DomainDetails {
  title: string;
  description: string;
  examWeight: number;
  icon: LucideIcon;
  color: string;
  background: string;
  topics: string[];
  objectives: string[];
}

const DOMAIN_DETAILS: Record<string, DomainDetails> = {
  "asking-questions": {
    title: "Asking Questions",
    description:
      "Master the fundamentals of creating and executing questions in Tanium to gather real-time endpoint data.",
    examWeight: 22,
    icon: BookOpen,
    color: "text-green-400",
    background: "bg-green-900/20",
    topics: [
      "Natural language question syntax",
      "Built-in sensors versus custom sensors",
      "Question history and favorites",
      "Real-time data collection strategies",
    ],
    objectives: [
      "Create effective questions using natural language",
      "Select and customize sensors for specific data needs",
      "Manage saved questions for faster workflows",
      "Interpret collected data confidently",
    ],
  },
  "refining-targeting": {
    title: "Refining Questions & Targeting",
    description:
      "Advanced targeting techniques and question refinement strategies for precise endpoint management.",
    examWeight: 23,
    icon: Target,
    color: "text-blue-400",
    background: "bg-blue-900/20",
    topics: [
      "Dynamic computer groups",
      "Boolean filters and drill-down investigations",
      "Question chaining for deeper insights",
      "Targeting performance considerations",
    ],
    objectives: [
      "Build reliable static and dynamic computer groups",
      "Refine result sets with advanced filters",
      "Chain questions to correlate findings",
      "Optimize queries in large environments",
    ],
  },
  "taking-action": {
    title: "Taking Action",
    description:
      "Deploy packages and execute actions across your environment safely and efficiently.",
    examWeight: 15,
    icon: Zap,
    color: "text-cyan-400",
    background: "bg-cyan-900/20",
    topics: [
      "Package creation basics",
      "Action deployment workflows",
      "Scheduling and approvals",
      "Monitoring action status",
    ],
    objectives: [
      "Create parameterized packages for reuse",
      "Deploy actions with governance controls",
      "Schedule actions to reduce disruption",
      "Troubleshoot failed deployments",
    ],
  },
  "navigation-modules": {
    title: "Navigation & Module Functions",
    description:
      "Navigate the Tanium Console efficiently and leverage core modules for endpoint management.",
    examWeight: 23,
    icon: Layers,
    color: "text-yellow-400",
    background: "bg-yellow-900/20",
    topics: [
      "Console layout and customization",
      "Interact module fundamentals",
      "Asset discovery workflows",
      "Client health monitoring",
    ],
    objectives: [
      "Navigate the console with confidence",
      "Understand how core modules integrate",
      "Maintain accurate asset inventories",
      "Monitor client health across the estate",
    ],
  },
  security: {
    title: "Security & Risk",
    description: "Apply Tanium security modules to detect, investigate, and remediate threats.",
    examWeight: 9,
    icon: Shield,
    color: "text-red-400",
    background: "bg-red-900/20",
    topics: [
      "Endpoint detection and response",
      "Vulnerability assessment",
      "Threat hunting workflows",
      "Remediation best practices",
    ],
    objectives: [
      "Investigate risk signals quickly",
      "Prioritize remediation tasks",
      "Coordinate response with other teams",
      "Measure security outcomes",
    ],
  },
  troubleshooting: {
    title: "Troubleshooting",
    description: "Diagnose and resolve common Tanium platform and endpoint issues.",
    examWeight: 8,
    icon: AlertTriangle,
    color: "text-orange-400",
    background: "bg-orange-900/20",
    topics: [
      "Client connectivity",
      "Sensor health",
      "Action execution diagnostics",
      "Performance tuning",
    ],
    objectives: [
      "Resolve client check-in problems",
      "Measure sensor health to identify gaps",
      "Debug failed actions",
      "Tune platform performance",
    ],
  },
} as const;

export default function DomainPage() {
  const params = useParams<{ domain: string }>();
  const router = useRouter();
  const domainKey = params?.domain
    ? Array.isArray(params.domain)
      ? params.domain[0]
      : params.domain
    : null;

  const details = useMemo(() => {
    if (!domainKey) {
      return null;
    }
    return DOMAIN_DETAILS[domainKey] ?? null;
  }, [domainKey]);

  if (!details || !domainKey) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Domain Not Found</h1>
        <p className="text-slate-200">
          The requested domain does not exist. Please return to the dashboard and choose a supported
          study area.
        </p>
        <Button
          onClick={() => {
            router.push("/dashboard");
          }}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const Icon = details.icon;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <span className={`${details.color}`}>
              <Icon className="h-8 w-8" />
            </span>
            {details.title}
          </h1>
          <p className="text-slate-200">{details.description}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Exam Weight: {details.examWeight}%
        </Badge>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className={`border border-white/10 ${details.background}`}>
          <CardHeader>
            <CardTitle>Key Topics</CardTitle>
            <CardDescription>Focus on these areas to build core competency.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-200">
              {details.topics.map((topic) => (
                <li key={topic} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-white/10">
          <CardHeader>
            <CardTitle>Objectives</CardTitle>
            <CardDescription>Practice these outcomes to prepare for the exam.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-slate-200">
              {details.objectives.map((objective) => (
                <li key={objective} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Next Steps</h2>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/study/modules/${domainKey}`}>Explore Study Module</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/practice?domain=${domainKey}`}>Start Practice Session</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/assessments?mode=gating">View Assessment Options</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Readiness Gauge</h2>
        <div className="rounded-lg border border-white/10 p-6">
          <p className="mb-4 text-sm text-slate-200">
            Track your confidence as you master each topic. Aim for 80% or higher before moving on
            to the next domain.
          </p>
          <Progress
            value={details.examWeight}
            className="h-2"
            aria-label={`${details.title} exam weight: ${details.examWeight}% of certification exam`}
          />
        </div>
      </section>
    </div>
  );
}

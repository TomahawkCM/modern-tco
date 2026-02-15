"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Lazy load QuestionBuilder to reduce initial bundle size (saves ~150 KB)
const QuestionBuilder = dynamic(
  () =>
    import("@/components/query-builder/QuestionBuilder").then((mod) => ({
      default: mod.QuestionBuilder,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
          <p className="text-muted-foreground">Loading Query Builder...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function QueryBuilderPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-foreground">Tanium Query Builder</h1>
        <p className="text-xl text-muted-foreground">
          Learn to build Tanium queries interactively with guided assistance
        </p>
      </div>

      {/* Information Alert */}
      <Alert className="mb-6 border-blue-500 bg-primary/10">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          <strong>Interactive Learning Mode:</strong> This simulator helps you understand
          Tanium&apos;s natural language query system. Practice building queries using guided mode,
          natural language, or advanced syntax.
        </AlertDescription>
      </Alert>

      {/* Quick Start Guide */}
      <Card className="glass mb-8 border-white/10">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Start Guide</CardTitle>
          <CardDescription className="text-muted-foreground">
            Three ways to build queries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-700 bg-card/50 p-4">
              <h3 className="mb-2 font-semibold text-foreground">🖱️ Guided Mode</h3>
              <p className="text-sm text-muted-foreground">
                Use visual components to select sensors, add filters, and build queries step-by-step
                with immediate feedback.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-card/50 p-4">
              <h3 className="mb-2 font-semibold text-foreground">✨ Natural Language</h3>
              <p className="text-sm text-muted-foreground">
                Type queries in plain English like "Show me all Windows servers with high CPU usage"
                and watch them convert to Tanium syntax.
              </p>
            </div>
            <div className="rounded-lg border border-gray-700 bg-card/50 p-4">
              <h3 className="mb-2 font-semibold text-foreground">⚡ Advanced Mode</h3>
              <p className="text-sm text-muted-foreground">
                Write Tanium queries directly with syntax highlighting and validation for
                experienced users.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded border border-yellow-500/50 bg-[#f97316]/10 p-3">
            <p className="text-sm text-[#f97316]">
              <strong>Tip:</strong> Start with Natural Language mode to see how everyday questions
              translate into Tanium queries, then explore Guided mode to understand the components.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Builder Component */}
      <QuestionBuilder
        mode="natural-language"
        showResults={true}
        showHistory={true}
        onExecute={(query, result) => {
          console.log("Query executed:", query);
          console.log("Result:", result);
        }}
      />

      {/* Learning Resources */}
      <Card className="glass mt-8 border-white/10">
        <CardHeader>
          <CardTitle className="text-foreground">Learning Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-tanium-accent">•</span>
            <div>
              <p className="font-medium text-foreground">Common Sensors</p>
              <p className="text-sm text-muted-foreground">
                Computer Name, Operating System, IP Address, CPU Percent, Disk Free GB
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tanium-accent">•</span>
            <div>
              <p className="font-medium text-foreground">Filter Operators</p>
              <p className="text-sm text-muted-foreground">
                contains, equals, greater than, less than, starts with, ends with
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tanium-accent">•</span>
            <div>
              <p className="font-medium text-foreground">Aggregate Functions</p>
              <p className="text-sm text-muted-foreground">count(), min(), max(), avg(), sum()</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

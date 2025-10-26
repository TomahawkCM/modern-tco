"use client";

import { InteractiveLabSystem } from "@/components/labs/InteractiveLabSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Code, Zap, Trophy, Clock, Target } from "lucide-react";

export default function LabsPage() {
  const handleLabComplete = (labId: string, score: number) => {
    console.log(`Lab ${labId} completed with score: ${score}%`);
    // Here you would typically:
    // 1. Save completion to database
    // 2. Update progress tracking
    // 3. Award achievements/badges
    // 4. Update analytics
  };

  return (
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">Interactive Lab Exercises</h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Practice real Tanium procedures with step-by-step guided simulations
          </p>
        </div>

        {/* Lab System Features */}
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <Card className="glass border-white/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-lg bg-primary p-3">
                <Terminal className="h-8 w-8 text-foreground" />
              </div>
              <CardTitle className="text-lg text-foreground">Real Console Simulation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Practice with realistic Tanium console interfaces and workflows
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-lg bg-[#22c55e] p-3">
                <Code className="h-8 w-8 text-foreground" />
              </div>
              <CardTitle className="text-lg text-foreground">Step-by-Step Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Get instant feedback with automated validation of your inputs
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 w-fit rounded-lg bg-cyan-500 p-3">
                <Trophy className="h-8 w-8 text-foreground" />
              </div>
              <CardTitle className="text-lg text-foreground">Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Track completion times and mastery across all lab exercises
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lab System Info */}
        <Card className="glass border-primary/30 bg-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Zap className="mr-2 h-5 w-5 text-primary" />
              Lab System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Available Lab Exercises:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-[#22c55e]" />
                    <span>Natural Language Query Construction (12 min)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-[#f97316]" />
                    <span>Advanced Targeting & Refinement (15 min)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Safe Action Deployment (18 min)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span>Platform Navigation & Role Management (10 min)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-orange-400" />
                    <span>Data Export & Reporting Systems (14 min)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Features:</h4>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2 border-green-500 text-[#22c55e]">
                    Real-time Validation
                  </Badge>
                  <Badge variant="outline" className="mr-2 border-blue-500 text-primary">
                    Progress Tracking
                  </Badge>
                  <Badge variant="outline" className="mr-2 border-cyan-500 text-primary">
                    Hint System
                  </Badge>
                  <Badge variant="outline" className="mr-2 border-yellow-500 text-[#f97316]">
                    Timer & Scoring
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Lab System */}
        <InteractiveLabSystem onComplete={handleLabComplete} />
      </div>
  );
}

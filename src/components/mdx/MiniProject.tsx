"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, FileText, Target, Lightbulb, ChevronRight, Trophy } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  hints?: string[];
  validation?: string;
}

interface MiniProjectProps {
  title: string;
  description: string;
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  objectives: string[];
  tasks: ProjectTask[];
  successCriteria: string[];
}

export default function MiniProject({
  title,
  description,
  estimatedTime,
  difficulty,
  objectives,
  tasks,
  successCriteria,
}: MiniProjectProps) {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState<Set<string>>(new Set());
  const [projectComplete, setProjectComplete] = useState(false);

  const toggleTask = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);

    // Check if all tasks are complete
    if (newCompleted.size === tasks.length) {
      setProjectComplete(true);
      // Save to localStorage
      const progress = JSON.parse(localStorage.getItem("miniProjectProgress") || "{}");
      progress[title] = {
        completed: true,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("miniProjectProgress", JSON.stringify(progress));
    } else {
      setProjectComplete(false);
    }
  };

  const toggleHint = (taskId: string) => {
    const newHints = new Set(showHints);
    if (newHints.has(taskId)) {
      newHints.delete(taskId);
    } else {
      newHints.add(taskId);
    }
    setShowHints(newHints);
  };

  const progressPercentage = (completedTasks.size / tasks.length) * 100;

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "beginner":
        return "text-[#22c55e] bg-green-50";
      case "intermediate":
        return "text-yellow-600 bg-yellow-50";
      case "advanced":
        return "text-red-600 bg-red-50";
    }
  };

  return (
    <Card className="my-8 border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6 text-purple-600" />
              {title}
            </CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getDifficultyColor()}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="text-sm text-muted-foreground">⏱️ {estimatedTime}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs defaultValue="objectives" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="criteria">Success Criteria</TabsTrigger>
          </TabsList>

          <TabsContent value="objectives" className="mt-4 space-y-2">
            <h3 className="mb-3 font-semibold">Learning Objectives</h3>
            {objectives.map((objective, index) => (
              <div key={index} className="flex items-start gap-2">
                <ChevronRight className="mt-0.5 h-4 w-4 text-purple-600" />
                <span className="text-sm">{objective}</span>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <div className="space-y-4">
              <div className="mb-4">
                <Progress value={progressPercentage} className="h-2" />
                <p className="mt-1 text-sm text-muted-foreground">
                  {completedTasks.size} of {tasks.length} tasks completed
                </p>
              </div>

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-lg border p-4 transition-all ${
                    completedTasks.has(task.id) ? "border-green-300 bg-green-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={task.id}
                      checked={completedTasks.has(task.id)}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={task.id}
                        className={`cursor-pointer font-medium ${
                          completedTasks.has(task.id) ? "text-muted-foreground line-through" : ""
                        }`}
                      >
                        {task.title}
                      </label>
                      <p className="mt-1 text-sm text-gray-600">{task.description}</p>

                      {task.validation && (
                        <div className="mt-2 rounded bg-blue-50 p-2 text-sm">
                          <strong>Validation:</strong> {task.validation}
                        </div>
                      )}

                      {task.hints && task.hints.length > 0 && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHint(task.id)}
                            className="text-xs"
                          >
                            <Lightbulb className="mr-1 h-3 w-3" />
                            {showHints.has(task.id) ? "Hide" : "Show"} Hints
                          </Button>

                          {showHints.has(task.id) && (
                            <div className="mt-2 rounded-lg bg-yellow-50 p-3">
                              {task.hints.map((hint, index) => (
                                <p key={index} className="text-sm text-yellow-800">
                                  💡 {hint}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="mt-4 space-y-2">
            <h3 className="mb-3 font-semibold">Success Criteria</h3>
            {successCriteria.map((criterion, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#22c55e]" />
                <span className="text-sm">{criterion}</span>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {projectComplete && (
          <Alert className="mt-6 border-green-500 bg-green-50">
            <Trophy className="h-5 w-5 text-[#22c55e]" />
            <AlertDescription className="text-green-700">
              <strong>Congratulations!</strong> You've completed all tasks in this mini-project.
              You're ready to move on to the next module!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FileText className="h-4 w-4" />
          <span>Complete all tasks to demonstrate mastery of the module concepts</span>
        </div>
      </CardFooter>
    </Card>
  );
}

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, XCircle, Clock, Eye, Download, Calendar } from "lucide-react";
import { cn, formatTime, getScoreColor } from "@/lib/utils";
import { TCODomain } from "@/types/exam";

interface ExamResult {
  id: string;
  date: Date;
  mode: "practice" | "mock" | "review";
  domain?: TCODomain;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "completed" | "in_progress" | "abandoned";
}

// Mock data
const mockResults: ExamResult[] = [
  {
    id: "1",
    date: new Date("2024-01-15"),
    mode: "mock",
    score: 85,
    totalQuestions: 65,
    correctAnswers: 55,
    timeSpent: 3600,
    difficulty: "Intermediate",
    status: "completed",
  },
  {
    id: "2",
    date: new Date("2024-01-14"),
    mode: "practice",
    domain: TCODomain.SECURITY,
    score: 72,
    totalQuestions: 20,
    correctAnswers: 14,
    timeSpent: 900,
    difficulty: "Advanced",
    status: "completed",
  },
  {
    id: "3",
    date: new Date("2024-01-13"),
    mode: "practice",
    domain: TCODomain.FUNDAMENTALS,
    score: 95,
    totalQuestions: 15,
    correctAnswers: 14,
    timeSpent: 600,
    difficulty: "Beginner",
    status: "completed",
  },
  {
    id: "4",
    date: new Date("2024-01-12"),
    mode: "mock",
    score: 68,
    totalQuestions: 65,
    correctAnswers: 44,
    timeSpent: 4200,
    difficulty: "Intermediate",
    status: "completed",
  },
  {
    id: "5",
    date: new Date("2024-01-11"),
    mode: "practice",
    domain: TCODomain.TROUBLESHOOTING,
    score: 45,
    totalQuestions: 12,
    correctAnswers: 5,
    timeSpent: 720,
    difficulty: "Advanced",
    status: "abandoned",
  },
];

export function ResultsTable() {
  const [results] = useState<ExamResult[]>(mockResults);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.mode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === "all" || result.mode === filterMode;
    const matchesStatus = filterStatus === "all" || result.status === filterStatus;

    return matchesSearch && matchesMode && matchesStatus;
  });

  const getStatusBadge = (status: ExamResult["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Completed
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-muted-foreground">
            In Progress
          </Badge>
        );
      case "abandoned":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Abandoned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getModeBadge = (mode: ExamResult["mode"]) => {
    switch (mode) {
      case "mock":
        return <Badge variant="default">Mock Exam</Badge>;
      case "practice":
        return <Badge variant="secondary">Practice</Badge>;
      case "review":
        return <Badge variant="outline">Review</Badge>;
      default:
        return <Badge variant="outline">{mode}</Badge>;
    }
  };

  const averageScore =
    results.length > 0
      ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length)
      : 0;

  const totalQuestions = results.reduce((sum, result) => sum + result.totalQuestions, 0);
  const totalCorrect = results.reduce((sum, result) => sum + result.correctAnswers, 0);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{results.length}</div>
            <p className="text-xs text-muted-foreground">exam sessions</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-[#22c55e]" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getScoreColor(averageScore))}>
              {averageScore}%
            </div>
            <p className="text-xs text-muted-foreground">across all sessions</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Questions Answered</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalCorrect}/{totalQuestions}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalCorrect / totalQuestions) * 100)}% accuracy
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(results.reduce((sum, result) => sum + result.timeSpent, 0) / 3600)}h
            </div>
            <p className="text-xs text-muted-foreground">total study time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-foreground">Exam Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by domain or mode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass border-white/20 pl-8 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <Select value={filterMode} onValueChange={setFilterMode}>
              <SelectTrigger 
                className="glass w-full border-white/20 text-foreground sm:w-[180px]"
                aria-label="Filter exam results by mode"
              >
                <SelectValue placeholder="Filter by mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="mock">Mock Exams</SelectItem>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="glass w-full border-white/20 text-foreground sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="glass border-white/20 text-foreground hover:bg-white/10"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Results Table */}
          <div className="overflow-hidden rounded-lg border border-white/10">
            <Table>
              <TableCaption className="text-muted-foreground">
                {filteredResults.length} of {results.length} exam sessions
              </TableCaption>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Mode</TableHead>
                  <TableHead className="text-muted-foreground">Domain</TableHead>
                  <TableHead className="text-muted-foreground">Score</TableHead>
                  <TableHead className="text-muted-foreground">Questions</TableHead>
                  <TableHead className="text-muted-foreground">Time</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow
                    key={result.id}
                    className="border-white/10 text-muted-foreground hover:bg-white/5"
                  >
                    <TableCell className="font-medium">
                      {result.date.toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getModeBadge(result.mode)}</TableCell>
                    <TableCell>{result.domain ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={cn("font-medium", getScoreColor(result.score))}>
                          {result.score}%
                        </span>
                        {result.score >= 80 ? (
                          <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {result.correctAnswers}/{result.totalQuestions}
                    </TableCell>
                    <TableCell>{formatTime(result.timeSpent)}</TableCell>
                    <TableCell>{getStatusBadge(result.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:bg-white/10 hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No results match your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

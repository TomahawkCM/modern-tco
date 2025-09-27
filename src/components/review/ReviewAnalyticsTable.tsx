"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TCODomain, Difficulty } from "@/types/exam";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Server,
  Layers,
  Shield,
  Wrench,
  AlertTriangle,
  Filter,
  ChevronUp,
  ChevronDown,
  Search,
} from "lucide-react";

interface ReviewAnalyticsTableProps {
  incorrectAnswers: Array<{
    questionId: string;
    domain: TCODomain;
    difficulty: Difficulty;
    reviewed: boolean;
    timestamp: Date;
  }>;
  onDomainFilter?: (domain: TCODomain | "all") => void;
  onDifficultyFilter?: (difficulty: Difficulty | "all") => void;
}

type AnalyticsRow = {
  domain: TCODomain;
  total: number;
  reviewed: number;
  pending: number;
  percentageReviewed: number;
  byDifficulty: {
    [Difficulty.BEGINNER]: number;
    [Difficulty.INTERMEDIATE]: number;
    [Difficulty.ADVANCED]: number;
    [Difficulty.EXPERT]: number;
  };
};

type SortField = "domain" | "total" | "reviewed" | "pending" | "percentage";
type SortOrder = "asc" | "desc";

export function ReviewAnalyticsTable({
  incorrectAnswers,
  onDomainFilter,
  onDifficultyFilter,
}: ReviewAnalyticsTableProps) {
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const domainMap = new Map<TCODomain, AnalyticsRow>();

    incorrectAnswers.forEach((answer) => {
      const existing = domainMap.get(answer.domain) || {
        domain: answer.domain,
        total: 0,
        reviewed: 0,
        pending: 0,
        percentageReviewed: 0,
        byDifficulty: {
          [Difficulty.BEGINNER]: 0,
          [Difficulty.INTERMEDIATE]: 0,
          [Difficulty.ADVANCED]: 0,
          [Difficulty.EXPERT]: 0,
        },
      };

      existing.total++;
      if (answer.reviewed) {
        existing.reviewed++;
      } else {
        existing.pending++;
      }
      existing.byDifficulty[answer.difficulty]++;
      existing.percentageReviewed = Math.round((existing.reviewed / existing.total) * 100);

      domainMap.set(answer.domain, existing);
    });

    return Array.from(domainMap.values());
  }, [incorrectAnswers]);

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = analyticsData;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        row.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort data
    return [...filtered].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortField) {
        case "domain":
          aVal = a.domain;
          bVal = b.domain;
          break;
        case "total":
          aVal = a.total;
          bVal = b.total;
          break;
        case "reviewed":
          aVal = a.reviewed;
          bVal = b.reviewed;
          break;
        case "pending":
          aVal = a.pending;
          bVal = b.pending;
          break;
        case "percentage":
          aVal = a.percentageReviewed;
          bVal = b.percentageReviewed;
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }, [analyticsData, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getDomainIcon = (domain: TCODomain) => {
    const iconMap = {
      [TCODomain.ASKING_QUESTIONS]: BookOpen,
      [TCODomain.REFINING_QUESTIONS]: Server,
      [TCODomain.REFINING_TARGETING]: Server,
      [TCODomain.TAKING_ACTION]: Layers,
      [TCODomain.NAVIGATION_MODULES]: Shield,
      [TCODomain.REPORTING_EXPORT]: Wrench,
      [TCODomain.SECURITY]: Shield,
      [TCODomain.FUNDAMENTALS]: BookOpen,
      [TCODomain.TROUBLESHOOTING]: AlertTriangle,
    };
    return iconMap[domain] || BookOpen;
  };

  const getDomainColor = (domain: TCODomain) => {
    const colorMap = {
      [TCODomain.ASKING_QUESTIONS]: "text-green-400",
      [TCODomain.REFINING_QUESTIONS]: "text-blue-400",
      [TCODomain.REFINING_TARGETING]: "text-blue-400",
      [TCODomain.TAKING_ACTION]: "text-cyan-400",
      [TCODomain.NAVIGATION_MODULES]: "text-red-400",
      [TCODomain.REPORTING_EXPORT]: "text-yellow-400",
      [TCODomain.SECURITY]: "text-orange-400",
      [TCODomain.FUNDAMENTALS]: "text-cyan-400",
      [TCODomain.TROUBLESHOOTING]: "text-pink-400",
    };
    return colorMap[domain] || "text-gray-400";
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3 inline" />
    );
  };

  // Summary stats
  const totalQuestions = analyticsData.reduce((sum, row) => sum + row.total, 0);
  const totalReviewed = analyticsData.reduce((sum, row) => sum + row.reviewed, 0);
  const totalPending = analyticsData.reduce((sum, row) => sum + row.pending, 0);
  const overallPercentage = totalQuestions > 0 ? Math.round((totalReviewed / totalQuestions) * 100) : 0;

  return (
    <Card className="glass border-white/10">
      <CardHeader className="sticky top-0 z-10 glass border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Review Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search domains..."
                className="h-8 w-48 pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="outline" className="text-white">
              {totalQuestions} Total
            </Badge>
            <Badge variant="outline" className="text-green-400">
              {totalReviewed} Reviewed
            </Badge>
            <Badge variant="outline" className="text-yellow-400">
              {totalPending} Pending
            </Badge>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={overallPercentage} className="h-2" />
          <p className="mt-1 text-xs text-gray-400">{overallPercentage}% Complete</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="sticky top-24 z-9 glass">
            <TableRow className="border-white/10">
              <TableHead
                className="cursor-pointer text-white hover:text-tanium-accent"
                onClick={() => handleSort("domain")}
              >
                Domain <SortIcon field="domain" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-center text-white hover:text-tanium-accent"
                onClick={() => handleSort("total")}
              >
                Total <SortIcon field="total" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-center text-white hover:text-tanium-accent"
                onClick={() => handleSort("reviewed")}
              >
                Reviewed <SortIcon field="reviewed" />
              </TableHead>
              <TableHead
                className="cursor-pointer text-center text-white hover:text-tanium-accent"
                onClick={() => handleSort("pending")}
              >
                Pending <SortIcon field="pending" />
              </TableHead>
              <TableHead className="text-center text-white">By Difficulty</TableHead>
              <TableHead
                className="cursor-pointer text-center text-white hover:text-tanium-accent"
                onClick={() => handleSort("percentage")}
              >
                Progress <SortIcon field="percentage" />
              </TableHead>
              <TableHead className="text-center text-white">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((row) => {
              const Icon = getDomainIcon(row.domain);
              const color = getDomainColor(row.domain);
              return (
                <TableRow key={row.domain} className="border-white/10 hover:bg-white/5">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", color)} />
                      <span className="text-white">{row.domain}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-white">
                      {row.total}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-green-400">
                      {row.reviewed}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-yellow-400">
                      {row.pending}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      {row.byDifficulty[Difficulty.BEGINNER] > 0 && (
                        <Badge variant="secondary" className="bg-green-900/20 text-green-400">
                          B:{row.byDifficulty[Difficulty.BEGINNER]}
                        </Badge>
                      )}
                      {row.byDifficulty[Difficulty.INTERMEDIATE] > 0 && (
                        <Badge variant="secondary" className="bg-yellow-900/20 text-yellow-400">
                          I:{row.byDifficulty[Difficulty.INTERMEDIATE]}
                        </Badge>
                      )}
                      {row.byDifficulty[Difficulty.ADVANCED] > 0 && (
                        <Badge variant="secondary" className="bg-red-900/20 text-red-400">
                          A:{row.byDifficulty[Difficulty.ADVANCED]}
                        </Badge>
                      )}
                      {row.byDifficulty[Difficulty.EXPERT] > 0 && (
                        <Badge variant="secondary" className="bg-purple-900/20 text-purple-400">
                          E:{row.byDifficulty[Difficulty.EXPERT]}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={row.percentageReviewed} className="h-2 flex-1" />
                      <span className="text-xs text-gray-400">{row.percentageReviewed}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-tanium-accent hover:bg-tanium-accent/20"
                      onClick={() => onDomainFilter?.(row.domain)}
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      Filter
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
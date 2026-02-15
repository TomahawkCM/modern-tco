"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Copy, MoreHorizontal, Search, Filter, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { questionService } from "@/lib/questionService";
import type { Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";
import {
  TCODomain as TCODomainEnum,
  Difficulty as DifficultyEnum,
  QuestionCategory as QuestionCategoryEnum,
} from "@/types/exam";

export function QuestionList() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Sorting
  const [sortField, setSortField] = useState<"question" | "domain" | "difficulty" | "createdAt">(
    "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const allQuestions = await questionService.getAllQuestions();
      setQuestions(allQuestions);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.explanation?.toLowerCase().includes(query) ||
          q.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Domain filter
    if (domainFilter !== "all") {
      filtered = filtered.filter((q) => q.domain === domainFilter);
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((q) => q.category === categoryFilter);
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "question":
          aValue = a.question;
          bValue = b.question;
          break;
        case "domain":
          aValue = a.domain;
          bValue = b.domain;
          break;
        case "difficulty":
          aValue = a.difficulty;
          bValue = b.difficulty;
          break;
        case "createdAt":
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    questions,
    searchQuery,
    domainFilter,
    difficultyFilter,
    categoryFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedQuestions(new Set(paginatedQuestions.map((q) => q.id)));
    } else {
      setSelectedQuestions(new Set());
    }
  };

  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    const newSelected = new Set(selectedQuestions);
    if (checked) {
      newSelected.add(questionId);
    } else {
      newSelected.delete(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleEdit = (questionId: string) => {
    router.push(`/admin/questions/${questionId}/edit`);
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      await questionService.deleteQuestion(questionId);
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
      loadQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (question: Question) => {
    try {
      const duplicated: Omit<Question, "id"> = {
        ...question,
        question: `${question.question} (Copy)`,
      };
      await questionService.addQuestion(duplicated);
      toast({
        title: "Success",
        description: "Question duplicated successfully",
      });
      loadQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate question",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    if (!confirm(`Delete ${selectedQuestions.size} selected questions?`)) return;

    try {
      await Promise.all(
        Array.from(selectedQuestions).map((id) => questionService.deleteQuestion(id))
      );
      toast({
        title: "Success",
        description: `${selectedQuestions.size} questions deleted`,
      });
      setSelectedQuestions(new Set());
      loadQuestions();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some questions",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `questions-export-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Exported ${filteredQuestions.length} questions`,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Questions ({filteredQuestions.length})</CardTitle>

          {selectedQuestions.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedQuestions.size} selected
              </span>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {Object.values(TCODomainEnum).map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {Object.values(DifficultyEnum).map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      paginatedQuestions.length > 0 &&
                      paginatedQuestions.every((q) => selectedQuestions.has(q.id))
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("question")}
                >
                  Question
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("domain")}
                >
                  Domain
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("difficulty")}
                >
                  Difficulty
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("createdAt")}
                >
                  Created
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedQuestions.has(question.id)}
                      onCheckedChange={(checked) =>
                        handleSelectQuestion(question.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-md truncate font-medium">
                    {question.question}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{question.domain}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        question.difficulty === "Beginner"
                          ? "default"
                          : question.difficulty === "Intermediate"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {question.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {question.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {question.tags && question.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{question.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(question.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(question)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(question.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {paginatedQuestions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No questions found. Try adjusting your filters or create a new question.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of{" "}
              {filteredQuestions.length} questions
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

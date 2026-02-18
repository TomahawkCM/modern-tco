"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, X, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QuestionPreview } from "./QuestionPreview";
import { questionService } from "@/lib/questionService";
import type { Question, Choice, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";
import {
  TCODomain as TCODomainEnum,
  Difficulty as DifficultyEnum,
  QuestionCategory as QuestionCategoryEnum,
} from "@/types/exam";

interface QuestionEditorProps {
  questionId?: string;
  onSave?: (question: Question) => void;
  onCancel?: () => void;
}

interface ValidationError {
  field: string;
  message: string;
}

export function QuestionEditor({ questionId, onSave, onCancel }: QuestionEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState<Choice[]>([
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ]);
  const [correctAnswerId, setCorrectAnswerId] = useState<string>("");
  const [domain, setDomain] = useState<TCODomain>(TCODomainEnum.FUNDAMENTALS);
  const [difficulty, setDifficulty] = useState<Difficulty>(DifficultyEnum.INTERMEDIATE);
  const [category, setCategory] = useState<QuestionCategory>(
    QuestionCategoryEnum.PLATFORM_FUNDAMENTALS
  );
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [studyGuideRef, setStudyGuideRef] = useState("");
  const [consoleSteps, setConsoleSteps] = useState<string[]>([]);
  const [consoleStepInput, setConsoleStepInput] = useState("");

  // Validation state
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save draft
  useEffect(() => {
    if (!questionId && isDirty) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [questionText, choices, correctAnswerId, explanation, isDirty]);

  // Load existing question
  useEffect(() => {
    if (questionId) {
      loadQuestion();
    } else {
      loadDraft();
    }
  }, [questionId]);

  const loadQuestion = async () => {
    setLoading(true);
    try {
      const questions = await questionService.getAllQuestions();
      const question = questions.find((q) => q.id === questionId);

      if (question) {
        setQuestionText(question.question);
        setChoices(question.choices);
        setCorrectAnswerId(question.correctAnswerId);
        setDomain(question.domain);
        setDifficulty(question.difficulty);
        setCategory(question.category);
        setExplanation(question.explanation || "");
        setTags(question.tags || []);
        setStudyGuideRef(question.studyGuideRef || "");
        setConsoleSteps(question.consoleSteps || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load question",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = () => {
    if (typeof window !== "undefined") {
      const draft = {
        questionText,
        choices,
        correctAnswerId,
        domain,
        difficulty,
        category,
        explanation,
        tags,
        studyGuideRef,
        consoleSteps,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("question_draft", JSON.stringify(draft));
    }
  };

  const loadDraft = () => {
    if (typeof window !== "undefined") {
      const draftStr = localStorage.getItem("question_draft");
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          // Check if draft is recent (within 24 hours)
          const draftTime = new Date(draft.timestamp).getTime();
          const now = new Date().getTime();
          if (now - draftTime < 24 * 60 * 60 * 1000) {
            setQuestionText(draft.questionText || "");
            setChoices(draft.choices || choices);
            setCorrectAnswerId(draft.correctAnswerId || "");
            setDomain(draft.domain || domain);
            setDifficulty(draft.difficulty || difficulty);
            setCategory(draft.category || category);
            setExplanation(draft.explanation || "");
            setTags(draft.tags || []);
            setStudyGuideRef(draft.studyGuideRef || "");
            setConsoleSteps(draft.consoleSteps || []);

            toast({
              title: "Draft loaded",
              description: "Restored your previous work",
            });
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      }
    }
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("question_draft");
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationError[] = [];

    // Validate question text
    if (!questionText.trim()) {
      newErrors.push({ field: "question", message: "Question text is required" });
    } else if (questionText.trim().length < 10) {
      newErrors.push({
        field: "question",
        message: "Question text must be at least 10 characters",
      });
    }

    // Validate choices
    const filledChoices = choices.filter((c) => c.text.trim().length > 0);
    if (filledChoices.length !== 4) {
      newErrors.push({ field: "choices", message: "All 4 answer choices are required" });
    }

    choices.forEach((choice, index) => {
      if (choice.text.trim().length > 0 && choice.text.trim().length < 3) {
        newErrors.push({
          field: `choice-${choice.id}`,
          message: `Choice ${choice.id.toUpperCase()} is too short`,
        });
      }
    });

    // Validate correct answer
    if (!correctAnswerId) {
      newErrors.push({ field: "correctAnswer", message: "Please select the correct answer" });
    } else if (!choices.find((c) => c.id === correctAnswerId)?.text.trim()) {
      newErrors.push({ field: "correctAnswer", message: "Correct answer choice must have text" });
    }

    // Validate explanation
    if (!explanation.trim()) {
      newErrors.push({ field: "explanation", message: "Explanation is required" });
    } else if (explanation.trim().length < 20) {
      newErrors.push({
        field: "explanation",
        message: "Explanation must be at least 20 characters",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast({
        title: "Validation Failed",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const questionData: Omit<Question, "id"> = {
        question: questionText.trim(),
        choices: choices.map((c) => ({ ...c, text: c.text.trim() })),
        correctAnswerId,
        domain,
        difficulty,
        category,
        explanation: explanation.trim(),
        tags,
        studyGuideRef: studyGuideRef.trim() || undefined,
        consoleSteps: consoleSteps.length > 0 ? consoleSteps : undefined,
      };

      let savedQuestion: Question;

      if (questionId) {
        // Update existing question
        savedQuestion = await questionService.updateQuestion(questionId, questionData);
        toast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        // Create new question
        savedQuestion = await questionService.addQuestion(questionData);
        toast({
          title: "Success",
          description: "Question created successfully",
        });
        clearDraft();
      }

      if (onSave) {
        onSave(savedQuestion);
      } else {
        router.push("/admin/questions");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save question: ${error}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!confirmed) return;
    }

    if (onCancel) {
      onCancel();
    } else {
      router.push("/admin/questions");
    }
  };

  const updateChoice = (id: string, text: string) => {
    setChoices(choices.map((c) => (c.id === id ? { ...c, text } : c)));
    setIsDirty(true);
  };

  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
      setIsDirty(true);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setIsDirty(true);
  };

  const addConsoleStep = () => {
    const step = consoleStepInput.trim();
    if (step) {
      setConsoleSteps([...consoleSteps, step]);
      setConsoleStepInput("");
      setIsDirty(true);
    }
  };

  const removeConsoleStep = (index: number) => {
    setConsoleSteps(consoleSteps.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const getPreviewQuestion = (): Question => {
    return {
      id: questionId || "preview",
      question: questionText,
      choices,
      correctAnswerId,
      domain,
      difficulty,
      category,
      explanation,
      tags,
      studyGuideRef,
      consoleSteps,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {questionId ? "Edit Question" : "Create New Question"}
          </h1>
          <p className="text-muted-foreground">
            {questionId ? "Update question details" : "Add a new question to the question bank"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Question"}
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-2 font-semibold">Please fix the following errors:</div>
            <ul className="list-inside list-disc space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="mt-6 space-y-6">
          {/* Question Text */}
          <Card>
            <CardHeader>
              <CardTitle>Question Text</CardTitle>
              <CardDescription>Enter the main question text</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Enter your question here..."
                className="min-h-[120px]"
                aria-label="Question text"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {questionText.length} characters
              </div>
            </CardContent>
          </Card>

          {/* Answer Choices */}
          <Card>
            <CardHeader>
              <CardTitle>Answer Choices</CardTitle>
              <CardDescription>
                Enter all 4 answer choices and select the correct one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {choices.map((choice) => (
                <div key={choice.id} className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={correctAnswerId === choice.id}
                    onChange={() => {
                      setCorrectAnswerId(choice.id);
                      setIsDirty(true);
                    }}
                    className="mt-3"
                    aria-label={`Mark choice ${choice.id.toUpperCase()} as correct`}
                  />
                  <div className="flex-1">
                    <Label htmlFor={`choice-${choice.id}`}>
                      Choice {choice.id.toUpperCase()}
                      {correctAnswerId === choice.id && (
                        <Badge variant="default" className="ml-2 bg-green-600">
                          Correct
                        </Badge>
                      )}
                    </Label>
                    <Input
                      id={`choice-${choice.id}`}
                      value={choice.text}
                      onChange={(e) => updateChoice(choice.id, e.target.value)}
                      placeholder={`Enter choice ${choice.id.toUpperCase()}`}
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Question Metadata</CardTitle>
              <CardDescription>Categorize and classify the question</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Select
                  value={domain}
                  onValueChange={(v) => {
                    setDomain(v as TCODomain);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger id="domain">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TCODomainEnum).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => {
                    setDifficulty(v as Difficulty);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DifficultyEnum).map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) => {
                    setCategory(v as QuestionCategory);
                    setIsDirty(true);
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(QuestionCategoryEnum).map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Explanation</CardTitle>
              <CardDescription>Explain why the correct answer is correct</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={explanation}
                onChange={(e) => {
                  setExplanation(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Provide a detailed explanation of the correct answer..."
                className="min-h-[120px]"
                aria-label="Explanation"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                {explanation.length} characters
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Add tags to help categorize this question</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  aria-label="Tag input"
                />
                <Button onClick={addTag} type="button">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X
                        className="ml-1 h-3 w-3"
                        onClick={() => removeTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optional Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information (Optional)</CardTitle>
              <CardDescription>Study guide references and console procedures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="studyGuideRef">Study Guide Reference</Label>
                <Input
                  id="studyGuideRef"
                  value={studyGuideRef}
                  onChange={(e) => {
                    setStudyGuideRef(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g., Chapter 5, Section 3.2, https://..."
                />
              </div>

              <div>
                <Label>Console Steps</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={consoleStepInput}
                      onChange={(e) => setConsoleStepInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addConsoleStep())
                      }
                      placeholder="Add a console step..."
                    />
                    <Button onClick={addConsoleStep} type="button">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {consoleSteps.length > 0 && (
                    <ol className="list-inside list-decimal space-y-1 text-sm">
                      {consoleSteps.map((step, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span>{step}</span>
                          <X
                            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                            onClick={() => removeConsoleStep(index)}
                            aria-label={`Remove step ${index + 1}`}
                          />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <QuestionPreview question={getPreviewQuestion()} showMetadata />
        </TabsContent>
      </Tabs>
    </div>
  );
}

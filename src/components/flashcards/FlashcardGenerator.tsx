"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { flashcardService } from "@/services/flashcardService";
import type { FlashcardType } from "@/types/flashcard";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlashcardGeneratorProps {
  moduleId?: string;
  sectionId?: string;
  onCardCreated?: () => void;
}

export default function FlashcardGenerator({ moduleId, sectionId, onCardCreated }: FlashcardGeneratorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Form state
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [cardType, setCardType] = useState<FlashcardType>("basic");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");

  const handleManualCreate = async () => {
    if (!user?.id || !front.trim() || !back.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both front and back text for the flashcard.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const card = await flashcardService.createFlashcard(user.id, front, back, {
        type: cardType,
        moduleId,
        sectionId,
        hint: hint.trim() || undefined,
        explanation: explanation.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        source: 'manual',
      });

      if (card) {
        toast({
          title: "Flashcard created!",
          description: "Your flashcard has been added to your review queue.",
        });

        // Reset form
        setFront("");
        setBack("");
        setHint("");
        setExplanation("");
        setTags("");
        setCardType("basic");

        onCardCreated?.();
      } else {
        throw new Error("Failed to create flashcard");
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAutoGenerate = async () => {
    if (!user?.id || !moduleId) {
      toast({
        title: "Module required",
        description: "Auto-generation requires a module context.",
        variant: "destructive",
      });
      return;
    }

    setIsAutoGenerating(true);
    try {
      const cards = await flashcardService.autoGenerateFromModule(user.id, moduleId);

      toast({
        title: "Flashcards generated!",
        description: `Created ${cards.length} flashcards from module learning objectives.`,
      });

      onCardCreated?.();
    } catch (error) {
      console.error("Error auto-generating flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Flashcards
        </CardTitle>
        <CardDescription>
          Create flashcards manually or auto-generate from module content for active recall practice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-Generate Section */}
        {moduleId && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium mb-1 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Auto-Generate from Module
                </h4>
                <p className="text-sm text-muted-foreground">
                  Automatically create flashcards from all learning objectives in this module
                </p>
              </div>
              <Button
                onClick={handleAutoGenerate}
                disabled={isAutoGenerating}
                variant="secondary"
              >
                {isAutoGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate
              </Button>
            </div>
          </div>
        )}

        {/* Manual Creation Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-type">Card Type</Label>
            <Select value={cardType} onValueChange={(value) => setCardType(value as FlashcardType)}>
              <SelectTrigger id="card-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (Q&A)</SelectItem>
                <SelectItem value="concept">Concept Explanation</SelectItem>
                <SelectItem value="cloze">Cloze Deletion</SelectItem>
                <SelectItem value="code">Code Example</SelectItem>
                <SelectItem value="diagram">Diagram/Visual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="front">Front (Question)</Label>
            <Textarea
              id="front"
              placeholder="What question do you want to ask?"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">Back (Answer)</Label>
            <Textarea
              id="back"
              placeholder="What is the correct answer?"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hint">Hint (Optional)</Label>
              <Input
                id="hint"
                placeholder="Give yourself a hint..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                placeholder="e.g., sensors, queries, advanced"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              placeholder="Add additional context or explanation..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleManualCreate}
            disabled={isCreating || !front.trim() || !back.trim()}
            className="w-full"
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Flashcard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePractice } from "@/contexts/PracticeContext";
import type { Difficulty, TCODomain } from "@/types/exam";
import { Play, Target } from "lucide-react";

interface PracticeButtonProps {
  moduleId: string;
  domainEnum: TCODomain | string;
  targetTags: string[];
  objectiveIds: string[];
  difficulty: Difficulty;
  children?: React.ReactNode;
  className?: string;
}

export default function PracticeButton({
  moduleId,
  domainEnum,
  targetTags,
  objectiveIds,
  difficulty,
  children = "Start Practice Session",
  className = "",
}: PracticeButtonProps) {
  const { startModulePractice, isLoading: practiceLoading } = usePractice();
  const { user, loading: authLoading } = useAuth();

  const handleStartPractice = () => {
    startModulePractice(moduleId, {
      domain: domainEnum as unknown as TCODomain,
      questionCount: 15,
      // Additional hints can be used by session manager if supported
      // @ts-ignore keep flexible for future extensions
      targetTags,
      // @ts-ignore keep flexible for future extensions
      objectiveIds,
      // @ts-ignore keep flexible for future extensions
      difficulty,
    });
  };

  return (
    <Button
      onClick={handleStartPractice}
      disabled={authLoading || !!practiceLoading}
      className={`w-full transform rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-cyan-700 ${className}`}
      size="lg"
    >
      <div className="flex items-center gap-2">
        {authLoading || practiceLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            <span>Loading Practice...</span>
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            <span>{children}</span>
            <Target className="h-4 w-4 opacity-70" />
          </>
        )}
      </div>
    </Button>
  );
}

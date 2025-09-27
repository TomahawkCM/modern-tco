import { useAuth } from "@/contexts/AuthContext";
import { studyModulesService } from "@/lib/study-modules";
import type { StudyStatus, UserStudyProgress } from "@/types/supabase";
import { useEffect, useState } from "react";

export function useStudyProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserStudyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user progress
  useEffect(() => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        setLoading(true);
        setError(null);
        const userProgress = await studyModulesService.getUserProgress(user.id);
        setProgress(userProgress);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress");
        console.error("Error loading user progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [user]);

  // Update section progress
  const updateSectionProgress = async (
    sectionId: string,
    status: StudyStatus,
    completionPercentage?: number
  ) => {
    if (!user) return;

    try {
      const updatedProgress = await studyModulesService.updateSectionProgress(
        user.id,
        sectionId,
        status,
        completionPercentage
      );

      // Update local state
      setProgress((prev) => {
        const existingIndex = prev.findIndex((p) => p.section_id === sectionId);
        if (existingIndex >= 0) {
          const newProgress = [...prev];
          newProgress[existingIndex] = updatedProgress;
          return newProgress;
        } else {
          return [...prev, updatedProgress];
        }
      });

      return updatedProgress;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update progress";
      setError(message);
      throw new Error(message);
    }
  };

  // Get progress for a specific section
  const getSectionProgress = (sectionId: string): UserStudyProgress | null => {
    return progress.find((p) => p.section_id === sectionId) || null;
  };

  // Get progress status for a section
  const getSectionStatus = (sectionId: string): StudyStatus => {
    const sectionProgress = getSectionProgress(sectionId);
    return sectionProgress?.status || "not_started";
  };

  // Get completion percentage for a section
  const getSectionCompletion = (sectionId: string): number => {
    const sectionProgress = getSectionProgress(sectionId);
    return sectionProgress?.completion_percentage || 0;
  };

  // Check if section is completed
  const isSectionCompleted = (sectionId: string): boolean => {
    return getSectionStatus(sectionId) === "completed";
  };

  // Check if section is in progress
  const isSectionInProgress = (sectionId: string): boolean => {
    return getSectionStatus(sectionId) === "in_progress";
  };

  // Get overall progress statistics
  const getOverallStats = () => {
    const total = progress.length;
    const completed = progress.filter((p) => p.status === "completed").length;
    const inProgress = progress.filter((p) => p.status === "in_progress").length;
    const notStarted = progress.filter((p) => p.status === "not_started").length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  // Mark section as started
  const startSection = async (sectionId: string) => {
    return updateSectionProgress(sectionId, "in_progress", 0);
  };

  // Mark section as completed
  const completeSection = async (sectionId: string) => {
    return updateSectionProgress(sectionId, "completed", 100);
  };

  // Update section progress with percentage
  const updateSectionCompletion = async (sectionId: string, percentage: number) => {
    const status: StudyStatus =
      percentage >= 100 ? "completed" : percentage > 0 ? "in_progress" : "not_started";
    return updateSectionProgress(sectionId, status, percentage);
  };

  return {
    progress,
    loading,
    error,
    updateSectionProgress,
    getSectionProgress,
    getSectionStatus,
    getSectionCompletion,
    isSectionCompleted,
    isSectionInProgress,
    getOverallStats,
    startSection,
    completeSection,
    updateSectionCompletion,
  };
}

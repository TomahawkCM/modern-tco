import { useAuth } from "@/contexts/AuthContext";
import { studyModulesService } from "@/lib/study-modules";
import type { UserBookmarkWithDetails } from "@/types/supabase";
// Local alias used across UI code
type UserStudyBookmark = UserBookmarkWithDetails;
import { useEffect, useState } from "react";

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<UserBookmarkWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const loadBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);
        const userBookmarks = await studyModulesService.getUserBookmarks(user.id);
        setBookmarks(userBookmarks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load bookmarks");
        console.error("Error loading user bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };

    void loadBookmarks();
  }, [user]);

  // Add a bookmark
  const addBookmark = async (sectionId: string, moduleId: string, notes?: string) => {
    if (!user) return;

    try {
      const newBookmark = await studyModulesService.addBookmark(
        user.id,
        sectionId,
        moduleId,
        notes
      );

      // Update local state
      setBookmarks((prev) => [newBookmark, ...prev]);
      return newBookmark;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add bookmark";
      setError(message);
      throw new Error(message);
    }
  };

  // Remove a bookmark
  const removeBookmark = async (sectionId: string) => {
    if (!user) return;

    try {
      await studyModulesService.removeBookmark(user.id, sectionId);

      // Update local state
      setBookmarks((prev) => prev.filter((bookmark) => bookmark.section_id !== sectionId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to remove bookmark";
      setError(message);
      throw new Error(message);
    }
  };

  // Update bookmark notes
  const updateBookmarkNotes = async (sectionId: string, notes: string) => {
    if (!user) return;

    try {
      const updatedBookmark = await studyModulesService.updateBookmarkNotes(
        user.id,
        sectionId,
        notes
      );

      // Update local state
      setBookmarks((prev) =>
        prev.map((bookmark) => (bookmark.section_id === sectionId ? updatedBookmark : bookmark))
      );

      return updatedBookmark;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update bookmark notes";
      setError(message);
      throw new Error(message);
    }
  };

  // Check if a section is bookmarked
  const isBookmarked = (sectionId: string): boolean => {
    return bookmarks.some((bookmark) => bookmark.section_id === sectionId);
  };

  // Get bookmark for a specific section
  const getBookmark = (sectionId: string): UserStudyBookmark | null => {
    return bookmarks.find((bookmark) => bookmark.section_id === sectionId) || null;
  };

  // Toggle bookmark (add if not exists, remove if exists)
  const toggleBookmark = async (sectionId: string, moduleId: string, notes?: string) => {
    if (isBookmarked(sectionId)) {
      await removeBookmark(sectionId);
      return null;
    } else {
      return await addBookmark(sectionId, moduleId, notes);
    }
  };

  // Get bookmarks by module
  const getBookmarksByModule = (moduleId: string): UserStudyBookmark[] => {
    return bookmarks.filter((bookmark) => bookmark.module_id === moduleId);
  };

  // Get bookmarks count
  const getBookmarksCount = (): number => {
    return bookmarks.length;
  };

  // Get recent bookmarks (last 5)
  const getRecentBookmarks = (limit: number = 5): UserStudyBookmark[] => {
    return bookmarks.slice(0, limit);
  };

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    updateBookmarkNotes,
    isBookmarked,
    getBookmark,
    toggleBookmark,
    getBookmarksByModule,
    getBookmarksCount,
    getRecentBookmarks,
  };
}

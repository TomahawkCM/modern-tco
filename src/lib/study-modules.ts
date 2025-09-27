import type {
  StudyModuleWithSections,
  StudySection,
  StudySectionWithModule,
  StudyStatus,
  TCODomain,
  UserBookmarkWithDetails,
  UserStudyBookmark,
  UserStudyBookmarkInsert,
  UserStudyProgress,
  UserStudyProgressInsert,
} from "@/types/supabase";
import { Tables } from "@/types/supabase";
import { supabase } from "./supabase";

export class StudyModulesService {
  /**
   * Get all study modules with their sections
   */
  async getAllModules(): Promise<StudyModuleWithSections[]> {
    const { data, error } = await supabase
      .from("study_modules")
      .select(
        `
        *,
        sections:study_sections(*)
      `
      )
      .order("order_index");

    if (error) {
      throw new Error(`Failed to fetch study modules: ${error.message}`);
    }

    if (!data) return []; // Ensure data is not null

    return (data as (Tables<"study_modules"> & { sections: Tables<"study_sections">[] })[]).map(
      (moduleData) => {
        return {
          ...moduleData,
          learning_objectives: Array.isArray(moduleData.learning_objectives)
            ? (moduleData.learning_objectives as string[])
            : [],
          references: Array.isArray(moduleData.references)
            ? (moduleData.references as string[])
            : [],
          exam_prep:
            typeof moduleData.exam_prep === "object" && moduleData.exam_prep !== null
              ? (moduleData.exam_prep as StudyModuleWithSections["exam_prep"])
              : { description: "", exam_focus: [], practice_labs: [] },
        };
      }
    );
  }

  /**
   * Get a specific module by ID with sections
   */
  async getModuleById(moduleId: string): Promise<StudyModuleWithSections | null> {
    const { data, error } = await supabase
      .from("study_modules")
      .select(
        `
        *,
        sections:study_sections(*)
      `
      )
      .eq("id", moduleId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch module: ${error.message}`);
    }

    if (!data) return null; // Ensure data is not null

    const moduleData = data as Tables<"study_modules"> & { sections: Tables<"study_sections">[] }; // Explicitly cast data

    return {
      ...moduleData,
      learning_objectives: Array.isArray(moduleData.learning_objectives)
        ? (moduleData.learning_objectives as string[])
        : [],
      references: Array.isArray(moduleData.references) ? (moduleData.references as string[]) : [],
      exam_prep:
        typeof moduleData.exam_prep === "object" && moduleData.exam_prep !== null
          ? (moduleData.exam_prep as StudyModuleWithSections["exam_prep"])
          : { description: "", exam_focus: [], practice_labs: [] },
    };
  }

  /**
   * Get a specific module by domain
   */
  async getModuleByDomain(domain: TCODomain): Promise<StudyModuleWithSections | null> {
    const { data, error } = await supabase
      .from("study_modules")
      .select(
        `
        *,
        sections:study_sections(*)
      `
      )
      .eq("domain", domain)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch module by domain: ${error.message}`);
    }

    if (!data) return null; // Ensure data is not null

    const moduleData = data as Tables<"study_modules"> & { sections: Tables<"study_sections">[] }; // Explicitly cast data

    return {
      ...moduleData,
      learning_objectives: Array.isArray(moduleData.learning_objectives)
        ? (moduleData.learning_objectives as string[])
        : [],
      references: Array.isArray(moduleData.references) ? (moduleData.references as string[]) : [],
      exam_prep:
        typeof moduleData.exam_prep === "object" && moduleData.exam_prep !== null
          ? (moduleData.exam_prep as StudyModuleWithSections["exam_prep"])
          : { description: "", exam_focus: [], practice_labs: [] },
    };
  }

  /**
   * Get all sections for a module
   */
  async getModuleSections(moduleId: string): Promise<StudySection[]> {
    const { data, error } = await supabase
      .from("study_sections")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index");

    if (error) {
      throw new Error(`Failed to fetch module sections: ${error.message}`);
    }

    return data as StudySection[];
  }

  /**
   * Get a specific section by ID
   */
  async getSectionById(sectionId: string): Promise<StudySectionWithModule | null> {
    const { data, error } = await supabase
      .from("study_sections")
      .select(
        `
        *,
        module:study_modules(*)
      `
      )
      .eq("id", sectionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to fetch section: ${error.message}`);
    }

    if (!data) return null; // Ensure data is not null

    const sectionData = data as Tables<"study_sections"> & { module: Tables<"study_modules"> }; // Explicitly cast data

    return {
      ...sectionData,
      content:
        typeof sectionData.content === "object" && sectionData.content !== null
          ? (sectionData.content as StudySectionWithModule["content"])
          : { overview: "", key_points: [], procedures: [], troubleshooting: [], references: [] },
      key_points: Array.isArray(sectionData.key_points) ? (sectionData.key_points as string[]) : [],
      procedures: Array.isArray(sectionData.procedures) ? (sectionData.procedures as string[]) : [],
      troubleshooting: Array.isArray(sectionData.troubleshooting)
        ? (sectionData.troubleshooting as string[])
        : [],
      references: Array.isArray(sectionData.references) ? (sectionData.references as string[]) : [],
    };
  }

  /**
   * Search sections by content
   */
  async searchSections(query: string): Promise<StudySectionWithModule[]> {
    const { data, error } = await supabase
      .from("study_sections")
      .select(
        `
        *,
        module:study_modules(*)
      `
      )
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order("module_id", { ascending: true })
      .order("order_index", { ascending: true });

    if (error) {
      throw new Error(`Failed to search sections: ${error.message}`);
    }

    if (!data) return []; // Ensure data is not null

    return (data as (Tables<"study_sections"> & { module: Tables<"study_modules"> })[]).map(
      (sectionData) => {
        return {
          ...sectionData,
          content:
            typeof sectionData.content === "object" && sectionData.content !== null
              ? (sectionData.content as StudySectionWithModule["content"])
              : {
                  overview: "",
                  key_points: [],
                  procedures: [],
                  troubleshooting: [],
                  references: [],
                },
          key_points: Array.isArray(sectionData.key_points)
            ? (sectionData.key_points as string[])
            : [],
          procedures: Array.isArray(sectionData.procedures)
            ? (sectionData.procedures as string[])
            : [],
          troubleshooting: Array.isArray(sectionData.troubleshooting)
            ? (sectionData.troubleshooting as string[])
            : [],
          references: Array.isArray(sectionData.references)
            ? (sectionData.references as string[])
            : [],
        };
      }
    );
  }

  /**
   * Get user progress for all modules
   */
  async getUserProgress(userId: string): Promise<UserStudyProgress[]> {
    const { data, error } = await supabase
      .from("user_study_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch user progress: ${error.message}`);
    }

    return data as UserStudyProgress[]; // Explicitly cast data
  }

  /**
   * Update user progress for a section
   */
  async updateSectionProgress(
    userId: string,
    sectionId: string,
    status: StudyStatus,
    completionPercentage?: number
  ): Promise<UserStudyProgress> {
    // First, retrieve the section to get its module_id
    const { data: sectionData, error: sectionError } = await supabase
      .from("study_sections")
      .select("module_id")
      .eq("id", sectionId)
      .single();

    if (sectionError) {
      throw new Error(`Failed to fetch section for progress update: ${sectionError.message}`);
    }

    if (!sectionData) {
      throw new Error("Section data not found for progress update.");
    }

    const progressData: UserStudyProgressInsert = {
      user_id: userId,
      section_id: sectionId,
      module_id: (sectionData as Tables<"study_sections">).module_id,
      status,
      completion_percentage: completionPercentage || (status === "completed" ? 100 : 0),
      last_accessed: new Date().toISOString(),
      ...(status === "completed" && { completed_at: new Date().toISOString() }),
    };

    const { data, error } = await supabase
      .from("user_study_progress")
      .upsert(progressData as any, {
        onConflict: "user_id,section_id",
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }

    return data as UserStudyProgress; // Explicitly cast data
  }

  /**
   * Get user bookmarks
   */
  async getUserBookmarks(userId: string): Promise<UserBookmarkWithDetails[]> {
    const { data, error } = await supabase
      .from("user_study_bookmarks")
      .select(
        `
        *,
        section:study_sections(*),
        module:study_modules(*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch bookmarks: ${error.message}`);
    }

    if (!data) return []; // Ensure data is not null

    // Parse JSON fields within the section object of each bookmark
    return (
      data as (Tables<"user_study_bookmarks"> & {
        section: Tables<"study_sections">;
        module: Tables<"study_modules">;
      })[]
    ).map((bookmarkData) => {
      return {
        ...bookmarkData,
        section: bookmarkData.section
          ? {
              ...(bookmarkData.section as StudySection),
              content:
                typeof (bookmarkData.section as StudySection).content === "object" &&
                (bookmarkData.section as StudySection).content !== null
                  ? ((bookmarkData.section as StudySection)
                      .content as StudySectionWithModule["content"])
                  : {
                      overview: "",
                      key_points: [],
                      procedures: [],
                      troubleshooting: [],
                      references: [],
                    },
              key_points: Array.isArray((bookmarkData.section as StudySection).key_points)
                ? ((bookmarkData.section as StudySection).key_points as string[])
                : [],
              procedures: Array.isArray((bookmarkData.section as StudySection).procedures)
                ? ((bookmarkData.section as StudySection).procedures as string[])
                : [],
              troubleshooting: Array.isArray((bookmarkData.section as StudySection).troubleshooting)
                ? ((bookmarkData.section as StudySection).troubleshooting as string[])
                : [],
              references: Array.isArray((bookmarkData.section as StudySection).references)
                ? ((bookmarkData.section as StudySection).references as string[])
                : [],
            }
          : undefined,
      };
    });
  }

  /**
   * Add a bookmark
   */
  async addBookmark(
    userId: string,
    sectionId: string,
    moduleId: string,
    notes?: string
  ): Promise<UserStudyBookmark> {
    const { data, error } = await supabase
      .from("user_study_bookmarks")
      .insert({
        user_id: userId,
        section_id: sectionId,
        module_id: moduleId,
        note: notes || null,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add bookmark: ${error.message}`);
    }

    return data as UserStudyBookmark; // Explicitly cast data
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, sectionId: string): Promise<void> {
    const { error } = await supabase
      .from("user_study_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("section_id", sectionId);

    if (error) {
      throw new Error(`Failed to remove bookmark: ${error.message}`);
    }
  }

  /**
   * Update bookmark notes
   */
  async updateBookmarkNotes(
    userId: string,
    sectionId: string,
    notes: string
  ): Promise<UserStudyBookmark> {
    const { data, error } = await (supabase as any)
      .from("user_study_bookmarks")
      .update({ note: notes, updated_at: new Date().toISOString() } as any)
      .eq("user_id", userId)
      .eq("section_id", sectionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update bookmark notes: ${error.message}`);
    }

    return data as UserStudyBookmark; // Explicitly cast data
  }

  /**
   * Get study statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    totalSections: number;
    completedSections: number;
    inProgressSections: number;
    totalBookmarks: number;
    progressByModule: Record<string, { completed: number; total: number }>;
  }> {
    // Get all sections count
    const { count: totalSections } = await supabase
      .from("study_sections")
      .select("*", { count: "exact", head: true });

    // Get user progress
    const { data: progressData } = await supabase
      .from("user_study_progress")
      .select("status, section:study_sections(id, module_id)") // Include 'id' in study_sections select
      .eq("user_id", userId);

    // Get bookmarks count
    const { count: totalBookmarks } = await supabase
      .from("user_study_bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get all modules with section counts
    const { data: modules } = await supabase.from("study_modules").select(`
        id,
        title,
        sections:study_sections(id)
      `);

    const completedSections =
      progressData?.filter((p: UserStudyProgress) => p.status === "completed").length || 0; // Explicitly cast p
    const inProgressSections =
      progressData?.filter((p: UserStudyProgress) => p.status === "in_progress").length || 0; // Explicitly cast p

    // Calculate progress by module
    const progressByModule: Record<string, { completed: number; total: number }> = {};

    if (modules) {
      for (const moduleData of modules) {
        const module = moduleData as Tables<"study_modules"> & {
          sections: Tables<"study_sections">[];
        }; // Explicitly cast moduleData
        const moduleSections = module.sections || [];
        const completedInModule =
          progressData?.filter(
            (p: UserStudyProgress) =>
              p.status === "completed" &&
              moduleSections.some((s: Tables<"study_sections">) => s.id === p.section?.id) // Explicitly cast s and p.section
          ).length || 0;

        progressByModule[module.id] = {
          completed: completedInModule,
          total: moduleSections.length,
        };
      }
    }

    return {
      totalSections: totalSections || 0,
      completedSections,
      inProgressSections,
      totalBookmarks: totalBookmarks || 0,
      progressByModule,
    };
  }
}

// Export a singleton instance
export const studyModulesService = new StudyModulesService();

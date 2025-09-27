/**
 * Study Content Service - Fetches study modules and sections from Supabase
 */

import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";

type StudyModule = Database["public"]["Tables"]["study_modules"]["Row"];
type StudySection = Database["public"]["Tables"]["study_sections"]["Row"];

export interface StudyModuleWithSections extends StudyModule {
  sections?: StudySection[];
  domain_name?: string;
  difficulty_level?: string;
}

/**
 * Fetch all study modules with their sections
 */
export async function getStudyModules(): Promise<StudyModuleWithSections[]> {
  try {
    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select(
        `
        *,
        sections:study_sections(*)
      `
      )
      .order("domain");

    if (modulesError) {
      console.error("Error fetching study modules:", modulesError);
      throw modulesError;
    }

    // Transform the data to match our interface
    const modulesWithSections: StudyModuleWithSections[] =
      modules?.map((module: any) => ({
        ...(module as StudyModule),
        sections: ((module as any).sections as StudySection[]) || [],
        domain_name:
          module.domain?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) ||
          module.domain,
        difficulty_level: "Intermediate", // Default difficulty - could be computed based on content
      })) || [];

    return modulesWithSections;
  } catch (error) {
    console.error("Failed to fetch study modules:", error);
    throw new Error("Failed to load study content");
  }
}

/**
 * Fetch a specific study module by domain slug
 */
export async function getStudyModuleByDomain(
  domain: string
): Promise<StudyModuleWithSections | null> {
  try {
    const { data: module, error } = await supabase
      .from("study_modules")
      .select(
        `
        *,
        sections:study_sections(*)
      `
      )
      .eq("domain", domain)
      .order("order_index", { foreignTable: "study_sections" })
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      console.error("Error fetching study module:", error);
      throw error;
    }

    return {
      ...(module as any),
      sections: ((module as any).sections as StudySection[]) || [],
    } as StudyModuleWithSections;
  } catch (error) {
    console.error("Failed to fetch study module:", error);
    throw new Error(`Failed to load study module: ${domain}`);
  }
}

/**
 * Fetch study sections for a specific module
 */
export async function getStudySections(moduleId: string): Promise<StudySection[]> {
  try {
    const { data: sections, error } = await supabase
      .from("study_sections")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index");

    if (error) {
      console.error("Error fetching study sections:", error);
      throw error;
    }

    return sections || [];
  } catch (error) {
    console.error("Failed to fetch study sections:", error);
    throw new Error("Failed to load study sections");
  }
}

/**
 * Fetch a specific study section
 */
export async function getStudySection(sectionId: string): Promise<StudySection | null> {
  try {
    const { data: section, error } = await supabase
      .from("study_sections")
      .select("*")
      .eq("id", sectionId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching study section:", error);
      throw error;
    }

    return section as StudySection;
  } catch (error) {
    console.error("Failed to fetch study section:", error);
    throw new Error("Failed to load study section");
  }
}

/**
 * Search study content by query
 */
export async function searchStudyContent(query: string): Promise<{
  modules: StudyModule[];
  sections: StudySection[];
}> {
  try {
    // Search modules
    const { data: modules, error: modulesError } = await supabase
      .from("study_modules")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    if (modulesError) {
      console.error("Error searching modules:", modulesError);
      throw modulesError;
    }

    // Search sections
    const { data: sections, error: sectionsError } = await supabase
      .from("study_sections")
      .select("*")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

    if (sectionsError) {
      console.error("Error searching sections:", sectionsError);
      throw sectionsError;
    }

    return {
      modules: modules || [],
      sections: sections || [],
    };
  } catch (error) {
    console.error("Failed to search study content:", error);
    throw new Error("Failed to search study content");
  }
}

/**
 * Get study progress for a user (if authenticated)
 */
export async function getUserStudyProgress(userId?: string): Promise<any[]> {
  if (!userId) return [];

  try {
    const { data: progress, error } = await supabase
      .from("user_study_progress")
      .select(
        `
        *,
        module:study_modules(*),
        section:study_sections(*)
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user progress:", error);
      throw error;
    }

    return progress || [];
  } catch (error) {
    console.error("Failed to fetch user progress:", error);
    return [];
  }
}

/**
 * Update user study progress
 */
export async function updateStudyProgress(
  userId: string,
  moduleId: string,
  sectionId?: string,
  status: "not_started" | "in_progress" | "completed" | "needs_review" = "in_progress",
  timeSpent: number = 0
): Promise<void> {
  try {
    const { error } = await (supabase as any).from("user_study_progress").upsert(
      {
        user_id: userId,
        module_id: moduleId,
        section_id: sectionId,
        status,
        time_spent_minutes: timeSpent,
        completed_at: status === "completed" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      } as any,
      {
        onConflict: "user_id,module_id,section_id",
      }
    );

    if (error) {
      console.error("Error updating study progress:", error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to update study progress:", error);
    throw new Error("Failed to update study progress");
  }
}

/**
 * Fallback: Load content from local files if Supabase is unavailable
 */
export async function getLocalStudyContent(): Promise<StudyModuleWithSections[]> {
  console.warn("Falling back to local study content");

  // This would import the local MDX files as a fallback
  // For now, return empty array and log the fallback
  console.log("Local fallback not implemented yet - please migrate content to Supabase");

  return [];
}

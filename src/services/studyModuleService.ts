/**
 * Study Module Service
 * Handles all database operations for study modules and sections
 */

import { supabase } from '@/lib/supabase';
import type { TCODomain } from '@/types/exam';

export interface StudyModule {
  id: string;
  domain: string;
  title: string;
  description: string | null;
  exam_weight: number;
  estimated_time_minutes: number | null;
  learning_objectives: string[];
  references: string[];
  exam_prep: any;
  version: string;
  created_at: string;
  updated_at: string;
  order_index: number | null;
}

export interface StudySection {
  id: string;
  module_id: string;
  title: string;
  content: string;
  section_type: 'overview' | 'learning_objectives' | 'procedures' | 'troubleshooting' | 'exam_prep' | 'references';
  order_index: number;
  estimated_time_minutes: number;
  key_points: string[];
  procedures: string[];
  troubleshooting: string[];
  references: string[];
  playbook: any | null;
  created_at: string;
  updated_at: string;
}

export interface StudyProgress {
  user_id: string;
  domain: string;
  module_id?: string;
  completed_sections: string[];
  total_sections: number;
  completion_percentage: number;
  last_accessed_at: string;
}

class StudyModuleService {
  /**
   * Get all study modules from the database
   */
  async getAllModules(): Promise<StudyModule[]> {
    try {
      const { data, error } = await supabase
        .from('study_modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching study modules:', error);
        return [];
      }

      return (data as StudyModule[]) || [];
    } catch (err) {
      console.error('Unexpected error fetching modules:', err);
      return [];
    }
  }

  /**
   * Get a single module by ID
   */
  async getModuleById(id: string): Promise<StudyModule | null> {
    try {
      const { data, error } = await supabase
        .from('study_modules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching module:', error);
        return null;
      }

      return data as StudyModule;
    } catch (err) {
      console.error('Unexpected error fetching module:', err);
      return null;
    }
  }

  /**
   * Get a module by domain name
   */
  async getModuleByDomain(domain: string): Promise<StudyModule | null> {
    try {
      // Try different domain formats
      const domainVariants = [
        domain,
        domain.replace(/-/g, '_').toUpperCase(),
        domain.split('-').map((word, idx) =>
          idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      ];

      const { data, error } = await supabase
        .from('study_modules')
        .select('*')
        .in('domain', domainVariants)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching module by domain:', error);
        return null;
      }

      return data as StudyModule;
    } catch (err) {
      console.error('Unexpected error fetching module by domain:', err);
      return null;
    }
  }

  /**
   * Get all sections for a module
   */
  async getModuleSections(moduleId: string): Promise<StudySection[]> {
    try {
      const { data, error } = await supabase
        .from('study_sections')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching sections:', error);
        return [];
      }

      return (data as StudySection[]) || [];
    } catch (err) {
      console.error('Unexpected error fetching sections:', err);
      return [];
    }
  }

  /**
   * Get user progress for a module or domain
   */
  async getUserProgress(userId: string, domain?: string, moduleId?: string): Promise<StudyProgress | null> {
    try {
      let query = supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', userId);

      if (moduleId) {
        query = query.eq('module_id', moduleId);
      } else if (domain) {
        query = query.eq('domain', domain);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user progress:', error);
        return null;
      }

      return data as any;
    } catch (err) {
      console.error('Unexpected error fetching progress:', err);
      return null;
    }
  }

  /**
   * Update user progress
   */
  async updateUserProgress(progress: Partial<StudyProgress>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_study_progress')
        .upsert(progress as any, {
          onConflict: 'user_id,domain',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Error updating progress:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error updating progress:', err);
      return false;
    }
  }

  /**
   * Get modules with progress for a user
   */
  async getModulesWithProgress(userId?: string): Promise<(StudyModule & { progress?: number; completedSections?: number })[]> {
    try {
      const modules = await this.getAllModules();

      if (!userId) {
        return modules;
      }

      // Get all progress records for this user
      const { data: progressData } = await supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', userId);

      // Map progress to modules
      const modulesWithProgress = modules.map(module => {
        const progress = (progressData as any)?.find((p: any) =>
          p.module_id === module.id || p.domain === module.domain
        );

        return {
          ...module,
          progress: progress?.completion_percentage || 0,
          completedSections: progress?.completed_sections?.length || 0
        };
      });

      return modulesWithProgress;
    } catch (err) {
      console.error('Error fetching modules with progress:', err);
      return [];
    }
  }

  /**
   * Mark a section as complete
   */
  async markSectionComplete(userId: string, moduleId: string, sectionId: string): Promise<boolean> {
    try {
      // Get current progress
      const progress = await this.getUserProgress(userId, undefined, moduleId);

      // Get module info for domain
      const module = await this.getModuleById(moduleId);
      if (!module) return false;

      // Get total sections count
      const sections = await this.getModuleSections(moduleId);

      const completedSections = progress?.completed_sections || [];
      if (!completedSections.includes(sectionId)) {
        completedSections.push(sectionId);
      }

      const completionPercentage = Math.round((completedSections.length / sections.length) * 100);

      return await this.updateUserProgress({
        user_id: userId,
        module_id: moduleId,
        domain: module.domain,
        completed_sections: completedSections,
        total_sections: sections.length,
        completion_percentage: completionPercentage,
        last_accessed_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error marking section complete:', err);
      return false;
    }
  }
}

// Export singleton instance
export const studyModuleService = new StudyModuleService();
import { supabase, supabaseAdmin } from '@/lib/supabase'

export type SectionStatus = 'not_started' | 'in_progress' | 'completed'

export async function markSectionProgress(opts: {
  userId: string
  sectionId: string
  status?: SectionStatus
  completionPercentage?: number
  timeSpentMinutes?: number
}) {
  const { userId, sectionId } = opts
  const status = opts.status || 'in_progress'
  const completion = Math.max(0, Math.min(100, opts.completionPercentage ?? 50))
  const timeSpent = Math.max(0, Math.floor(opts.timeSpentMinutes ?? 1))

  const client = supabaseAdmin || supabase

  const { error } = await (client as any)
    .from('study_progress')
    .upsert(
      {
        user_id: userId,
        section_id: sectionId,
        completion_status: status,
        completion_percentage: completion,
        time_spent: timeSpent,
        last_accessed: new Date().toISOString(),
      },
      { onConflict: 'user_id,section_id' }
    )

  if (error) throw new Error(`Failed to mark section progress: ${error.message}`)
}

export async function upsertUserModuleProgress(opts: {
  userId: string
  moduleId: string
}) {
  const client = supabaseAdmin || supabase
  // Count total sections
  const { data: totalRows, error: totalErr } = await (client as any)
    .from('study_sections')
    .select('id', { count: 'exact', head: true })
    .eq('module_id', opts.moduleId)
  if (totalErr) throw new Error(`Failed to count total sections: ${totalErr.message}`)
  const total = (totalRows)?.length ?? (totalErr ? 0 : (totalErr))

  // Count completed sections for this user
  const { count: completed, error: compErr } = await (client as any)
    .from('study_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', opts.userId)
    .eq('completion_status', 'completed')
  if (compErr) throw new Error(`Failed to count completed sections: ${compErr.message}`)

  const status = completed && total ? (completed >= total ? 'completed' : 'in_progress') : 'in_progress'

  const { error: upsertErr } = await (client as any)
    .from('user_module_progress')
    .upsert(
      {
        user_id: opts.userId,
        module_id: opts.moduleId,
        completed_sections: completed || 0,
        total_sections: total || 0,
        status,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'user_id,module_id' }
    )
  if (upsertErr) throw new Error(`Failed to upsert module progress: ${upsertErr.message}`)
}


#!/usr/bin/env tsx
import path from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.join(process.cwd(), '.env.local') })

function assertEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function uuid(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function main() {
  const url = assertEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = assertEnv('SUPABASE_SERVICE_ROLE_KEY')
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // Find a module and a section
  const { data: mod, error: modErr } = await admin
    .from('study_modules')
    .select('id, domain, title')
    .order('title')
    .limit(1)
    .single()
  if (modErr) throw new Error(`Failed to get module: ${modErr.message}`)

  const { data: sec, error: secErr } = await admin
    .from('study_sections')
    .select('id, module_id, title')
    .eq('module_id', mod.id)
    .order('order_index')
    .limit(1)
    .single()
  if (secErr) throw new Error(`Failed to get section: ${secErr.message}`)

  const userId = uuid()
  console.log(`Using test user: ${userId}`)

  // Upsert user_module_progress (module-level progress)
  const { data: totalQ, error: totalErr } = await admin
    .from('study_sections')
    .select('id', { count: 'exact', head: true })
    .eq('module_id', mod.id)
  if (totalErr) throw new Error(`Failed counting sections: ${totalErr.message}`)

  // For test purposes mark 1 section completed
  const completed = 1
  const status = completed >= ((totalQ as any)?.length || 0) ? 'completed' : 'in_progress'
  const { error: umpErr } = await admin.from('user_module_progress').upsert(
    {
      user_id: userId,
      module_id: mod.id,
      completed_sections: completed || 0,
      total_sections: (totalQ as any)?.length || 0,
      status,
      last_updated: new Date().toISOString(),
    },
    { onConflict: 'user_id,module_id' }
  )
  if (umpErr) throw new Error(`Failed to upsert user_module_progress: ${umpErr.message}`)

  console.log('✅ Progress rows written successfully.')
}

main().catch((e) => {
  console.error('Progress test failed:', e?.message || e)
  process.exit(1)
})

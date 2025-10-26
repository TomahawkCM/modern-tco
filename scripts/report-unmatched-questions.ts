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

async function main() {
  const url = assertEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = assertEnv('SUPABASE_SERVICE_ROLE_KEY')
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

  // Load distinct domain/category for questions without module_id
  const { data, error } = await admin
    .from('questions')
    .select('domain, category')
    .is('module_id', null)
  if (error) throw new Error(`Failed to query questions: ${error.message}`)

  const counter: Record<string, number> = {}
  for (const row of data || []) {
    const d = ((row.domain as string) || (row.category as string) || '').toString().trim()
    if (!d) continue
    counter[d] = (counter[d] || 0) + 1
  }

  const entries = Object.entries(counter).sort((a, b) => b[1] - a[1])
  console.log('Unmatched domain/category values:')
  for (const [name, count] of entries) {
    console.log(`${count}\t${name}`)
  }
}

main().catch((e) => {
  console.error('report-unmatched-questions failed:', e?.message || e)
  process.exit(1)
})


#!/usr/bin/env tsx

import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function main() {
  const { questionService } = await import('../src/lib/questionService')
  const result = await questionService.validateQuestionDatabase()
  console.log(JSON.stringify(result, null, 2))
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

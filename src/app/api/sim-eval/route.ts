import { type NextRequest, NextResponse } from 'next/server';
import { TaniumQueryEngine } from '@/lib/tanium-query-engine';

// Initialize the query engine with sample data
const queryEngine = new TaniumQueryEngine();

type EvalPayload = {
  question?: string;
  format?: 'json' | 'csv';
  outFile?: string;
};

export async function POST(request: NextRequest) {
  // Note: This endpoint uses TypeScript TaniumQueryEngine (no Python dependency)
  // Safe to run in production on Vercel serverless

  let payload: EvalPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload?.question || typeof payload.question !== 'string') {
    return NextResponse.json({ ok: false, error: 'Question is required.' }, { status: 400 });
  }

  try {
    // Execute query using TypeScript engine
    const result = await queryEngine.query(payload.question, {
      format: payload.format ?? 'json',
      useCache: true,
      timeout: 5000
    });

    // Add saved property if this was a save operation
    if ((payload as any).save) {
      const saved = queryEngine.saveQuery(
        (payload as any).save,
        payload.question,
        `Saved at ${new Date().toISOString()}`
      );
      (result as any).saved = saved;
    }

    // Handle file output if requested
    if (payload.outFile && result.ok) {
      // For now, just add the filename to the result
      // In production, this would write to a file or cloud storage
      (result as any).outputFile = payload.outFile;
    }

    const status = result.ok === false ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Simulator invocation failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
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
    console.error('[sim-eval] Invalid JSON body');
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload?.question || typeof payload.question !== 'string') {
    console.error('[sim-eval] Missing or invalid question:', payload);
    return NextResponse.json({ ok: false, error: 'Question is required.' }, { status: 400 });
  }

  console.log('[sim-eval] Processing query:', payload.question);

  try {
    // Execute query using TypeScript engine
    const result = await queryEngine.query(payload.question, {
      format: payload.format ?? 'json',
      useCache: true,
      timeout: 5000
    });

    console.log('[sim-eval] Query result:', {
      ok: result.ok,
      hasHeaders: !!result.headers,
      headersCount: result.headers?.length,
      hasRows: !!result.rows,
      rowsCount: result.rows?.length,
      error: result.error
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
    console.error('[sim-eval] Execution error:', error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
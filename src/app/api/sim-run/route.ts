import { type NextRequest, NextResponse } from 'next/server';
import { runSimulator } from '@/lib/simulator-runner';

type RunPayload = {
  name?: string;
  format?: 'json' | 'csv';
};

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production' && process.env['ENABLE_SIMULATOR'] !== 'true') {
    return NextResponse.json(
      { ok: false, error: 'Simulator endpoints are disabled in production.' },
      { status: 501 }
    );
  }
  let payload: RunPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!payload?.name || typeof payload.name !== 'string') {
    return NextResponse.json({ ok: false, error: 'Name is required.' }, { status: 400 });
  }

  const args = ['--json', '--run-saved', payload.name];
  if (payload.format === 'csv') {
    args.push('--out', 'csv');
  }

  try {
    const result = await runSimulator(args);
    const status = result?.ok === false ? 400 : 200;
    return NextResponse.json(result, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Simulator invocation failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import { spawn, spawnSync } from 'child_process';
import path from 'path';

const envCandidates = [process.env.PYTHON_PATH, process.env.SIM_PYTHON];
const platformDefaults = process.platform === 'win32' ? ['python3', 'python', 'py'] : ['python3', 'python'];
const pythonCandidates = Array.from(
  new Set(
    [...envCandidates, ...platformDefaults]
      .filter((candidate): candidate is string => Boolean(candidate?.trim()))
      .map((candidate) => candidate.trim()),
  ),
);

const SIM_DIR = path.join(process.cwd(), 'sim');
const SIM_SCRIPT = path.join(SIM_DIR, 'tanium_simulator_v2.py');
let resolvedPythonBin: string | null = null;

function resolvePythonBinary(): string {
  if (resolvedPythonBin) {
    return resolvedPythonBin;
  }

  for (const candidate of pythonCandidates) {
    const check = spawnSync(candidate, ['--version'], { stdio: 'ignore' });
    if (!check.error && check.status === 0) {
      resolvedPythonBin = candidate;
      return candidate;
    }
  }

  throw new Error(
    'Unable to locate a Python interpreter. Install Python 3 or set the SIM_PYTHON/PYTHON_PATH environment variable.',
  );
}

function runProcess(args: string[], timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    let pythonBin: string;
    try {
      pythonBin = resolvePythonBinary();
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Python interpreter not found.'));
      return;
    }

    const child = spawn(pythonBin, [SIM_SCRIPT, ...args], {
      cwd: SIM_DIR,
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill('SIGKILL');
        reject(new Error('Simulator timed out'));
      }
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error?.code === 'ENOENT') {
        reject(
          new Error(
            `Python executable "${pythonBin}" could not be found. Install Python 3 or configure SIM_PYTHON/PYTHON_PATH.`,
          ),
        );
        return;
      }
      reject(error);
    });

    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code !== 0 && stderr) {
        reject(new Error(stderr.trim()));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export async function runSimulator(args: string[], timeoutMs?: number) {
  const output = await runProcess(args, timeoutMs);
  if (!output) {
    return { ok: false, error: 'Simulator returned no data.' };
  }
  try {
    return JSON.parse(output);
  } catch (error) {
    return { ok: false, error: 'Failed to parse simulator output.', detail: output };
  }
}

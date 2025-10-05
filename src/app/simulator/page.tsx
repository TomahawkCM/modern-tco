'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { editor as MonacoEditor, IDisposable } from 'monaco-editor';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const MonacoEditorComponent = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type SimulatorWarning = {
  message: string;
  start?: number;
  end?: number;
};

type SimulatorResult = {
  ok: boolean;
  error?: string;
  error_pos?: number;
  headers?: string[];
  rows?: Array<Array<string | number | null>>;
  warnings?: SimulatorWarning[];
  execution?: {
    scoped?: number;
    filtered?: number;
    durationMs?: number;
  };
  metadata?: {
    aggregations?: string[];
    groupBy?: string | null;
    orderBy?: string | null;
    orderDir?: string;
    limit?: number | null;
    scope?: string | null;
  };
  csv?: string;
  saved?: { name: string; question: string; savedAt?: string };
};

type SavedQuestion = {
  name: string;
  question: string;
  savedAt?: string;
};

type SimulatorExample = {
  id: string;
  title: string;
  question: string;
  domain?: string;
  difficulty?: number;
};

type SensorsCatalog = {
  sensors: Array<{ name: string; category: string; description?: string }>;
  aggregates: string[];
};

const DEFAULT_QUESTION = 'Get Computer Name from all machines';
const EVAL_DEBOUNCE_MS = 600;
const EXAM_DURATION_SECONDS = 20 * 60;

function offsetToPosition(text: string, offset: number) {
  const safeOffset = Math.max(0, Math.min(offset, text.length));
  const preceding = text.slice(0, safeOffset);
  const lines = preceding.split(/\r?\n/);
  const lineNumber = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { lineNumber, column };
}

function mmss(value: number) {
  const minutes = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes  }:${  seconds}`;
}



async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    throw new Error((data as any)?.error ?? 'Request failed');
  }
  return data;
}

type MetadataResponse = {
  ok: boolean;
  catalog: SensorsCatalog;
  examples: { examples: SimulatorExample[] };
};

type SavedResponse = {
  ok: boolean;
  saved: SavedQuestion[];
};

type EvalResponse = SimulatorResult;

export default function SimulatorPage() {
  const [question, setQuestion] = useState<string>(DEFAULT_QUESTION);
  const [result, setResult] = useState<SimulatorResult | null>(null);
  const [examples, setExamples] = useState<SimulatorExample[]>([]);
  const [sensorsCatalog, setSensorsCatalog] = useState<SensorsCatalog>({ sensors: [], aggregates: [] });
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const [examMode, setExamMode] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_DURATION_SECONDS);
  const [examAttempts, setExamAttempts] = useState(0);
  const [examWins, setExamWins] = useState(0);
  const [currentPrompt, setCurrentPrompt] = useState<SimulatorExample | null>(null);

  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const completionDisposable = useRef<IDisposable | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const applyMarkers = useCallback(
    (text: string, data: SimulatorResult | null) => {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      if (!monaco || !editor) return;
      const model = editor.getModel();
      if (!model) return;

      const markers: MonacoEditor.IMarkerData[] = [];
      if (data?.error && typeof data.error_pos === 'number') {
        const position = offsetToPosition(text, data.error_pos);
        markers.push({
          severity: monaco.MarkerSeverity.Error,
          message: data.error,
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1,
          source: 'tanium-simulator',
        });
      }
      data?.warnings?.forEach((warning) => {
        if (typeof warning.start !== 'number') return;
        const start = offsetToPosition(text, warning.start);
        const end = offsetToPosition(text, warning.end ?? warning.start + 1);
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          message: warning.message,
          startLineNumber: start.lineNumber,
          startColumn: start.column,
          endLineNumber: end.lineNumber,
          endColumn: end.column,
          source: 'tanium-simulator',
        });
      });
      monaco.editor.setModelMarkers(model, 'tanium-sim', markers);
    },
    []
  );

  useEffect(() => {
    (async () => {
      try {
        // Ensure Promise.all infers a tuple result
        const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
        const [meta, saved] = await Promise.all(
          [
            fetchJson<MetadataResponse>(`${base}/api/sim-meta`),
            fetchJson<SavedResponse>(`${base}/api/sim-saved`),
          ] as const
        );
        if (meta.ok) {
          setSensorsCatalog(meta.catalog);
          setExamples(meta.examples?.examples ?? []);
        }
        if (saved.ok) {
          setSavedQuestions(saved.saved ?? []);
        }
      } catch (error) {
        console.error('Failed to load simulator metadata', error);
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!examMode) return undefined;
    setRemainingSeconds(EXAM_DURATION_SECONDS);
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setExamMode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examMode]);

  const scheduleEvaluation = useCallback(
    (input: string, options: { immediate?: boolean; countExam?: boolean } = {}) => {
      const { immediate = false, countExam = false } = options;
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (!input.trim()) {
        setResult(null);
        setEvalError(null);
        if (editorRef.current && monacoRef.current) {
          monacoRef.current.editor.setModelMarkers(editorRef.current.getModel()!, 'tanium-sim', []);
        }
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      setIsEvaluating(true);

      const execute = async () => {
        try {
          const data = await fetchJson<EvalResponse>(
            '/api/sim-eval',
            {
              method: 'POST',
              body: JSON.stringify({ question: input }),
              signal: controller.signal,
            }
          );
          setResult(data);
          if (data.ok) {
            setEvalError(null);
            if (countExam) {
              setExamAttempts((prev) => prev + 1);
              if ((data.rows?.length ?? 0) > 0) {
                setExamWins((prev) => prev + 1);
              }
            }
          } else {
            setEvalError(data.error ?? 'Simulation failed');
          }
          applyMarkers(input, data);
        } catch (error) {
          if ((error as Error).name === 'AbortError') {
            return;
          }
          setEvalError((error as Error).message ?? 'Evaluation failed');
        } finally {
          setIsEvaluating(false);
        }
      };

      if (immediate) {
        void execute();
        return;
      }

      const timeout = setTimeout(() => {
        void execute();
      }, EVAL_DEBOUNCE_MS);
      return () => clearTimeout(timeout);
    },
    [applyMarkers]
  );

  useEffect(() => {
    if (examMode) return;
    const cleanup = scheduleEvaluation(question);
    return cleanup;
  }, [examMode, question, scheduleEvaluation]);

  const handleEditorMount = useCallback(
    (editor: MonacoEditor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      monaco.editor.setTheme('vs-dark');
      editor.focus();
    },
    []
  );

  useEffect(() => {
    const monaco = monacoRef.current;
    const {sensors} = sensorsCatalog;
    if (!monaco || sensors.length === 0) return;
    completionDisposable.current?.dispose();
    completionDisposable.current = monaco.languages.registerCompletionItemProvider('plaintext', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endLineNumber: position.lineNumber,
          endColumn: word.endColumn,
        };

        const sensorSuggestions = sensors.map((sensor) => ({
          label: sensor.name,
          kind: monaco.languages.CompletionItemKind.Field,
          insertText: sensor.name,
          detail: sensor.category,
          documentation: sensor.description,
          range,
        }));

        const aggregateSuggestions = (sensorsCatalog.aggregates ?? []).map((agg) => ({
          label: agg,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: agg,
          detail: 'Aggregate',
          range,
        }));

        return { suggestions: [...sensorSuggestions, ...aggregateSuggestions] };
      },
    });
    return () => completionDisposable.current?.dispose();
  }, [sensorsCatalog]);

  const handleExampleSelect = (example: SimulatorExample) => {
    setCurrentPrompt(example);
    setQuestion(example.question);
  };

  const handleSavedSelect = (saved: SavedQuestion) => {
    setCurrentPrompt({ id: saved.name, title: saved.name, question: saved.question });
    setQuestion(saved.question);
  };

  const handleRefreshSaved = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      const saved = await fetchJson<SavedResponse>(`${base}/api/sim-saved`);
      if (saved.ok) {
        setSavedQuestions(saved.saved ?? []);
      }
    } catch (error) {
      console.error('Failed to refresh saved questions', error);
    }
  };

  const handleSaveQuestion = async () => {
    if (!saveName.trim() || !question.trim()) return;

    // Save functionality requires Python subprocess, not available in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('Save functionality is disabled in production (requires Python)');
      alert('Save functionality is not available in production. Use query evaluation and export features instead.');
      return;
    }

    setSaving(true);
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      const response = await fetchJson<EvalResponse>(`${base}/api/sim-save`, {
        method: 'POST',
        body: JSON.stringify({ name: saveName.trim(), question }),
      });
      if (response.ok && response.saved) {
        setSaveName('');
        await handleRefreshSaved();
      }
    } catch (error) {
      console.error('Failed to save question', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      const response = await fetchJson<EvalResponse>(`${base}/api/sim-eval`, {
        method: 'POST',
        body: JSON.stringify({ question, format }),
      });
      if (format === 'csv' && response.csv) {
        const blob = new Blob([response.csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tanium-simulator.csv';
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'tanium-simulator.json';
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const startExamChallenge = () => {
    if (examples.length === 0) return;
    const random = examples[Math.floor(Math.random() * examples.length)];
    setCurrentPrompt(random);
    setQuestion(random.question);
    setExamAttempts(0);
    setExamWins(0);
    setExamMode(true);
  };

  const stopExam = () => {
    setExamMode(false);
  };

  return (
      <div className="space-y-6 text-cyan-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-cyan-200">Tanium Simulator</h1>
            <p className="text-sm text-cyan-300/70">
              Validate questions, surface warnings, and rehearse exam scenarios with live feedback.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-cyan-300/80">Exam Mode</span>
              <Switch checked={examMode} onCheckedChange={(checked) => (checked ? startExamChallenge() : stopExam())} />
            </div>
            {examMode && (
              <Badge variant="outline" className="border-amber-400/60 text-amber-200">
                {mmss(remainingSeconds)}
              </Badge>
            )}
            {isEvaluating && <Badge className="bg-cyan-500/30 text-cyan-100">Evaluating…</Badge>}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card variant="cyberpunk">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg text-cyan-100">
                Query Editor
                {currentPrompt && (
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-200">
                    {currentPrompt.title}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-cyan-500/20 bg-black/40">
                <MonacoEditorComponent
                  height="320px"
                  defaultLanguage="plaintext"
                  value={question}
                  onChange={(value) => setQuestion(value ?? '')}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    smoothScrolling: true,
                    wordWrap: 'on',
                    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-cyan-200/80">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-widest text-cyan-300/70">
                    {result?.metadata?.scope ?? 'all machines'}
                  </span>
                  {result?.metadata?.aggregations?.length ? (
                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-200">
                      Aggregates: {result.metadata.aggregations.join(', ')}
                    </Badge>
                  ) : null}
                  {evalError && (
                    <Badge variant="outline" className="border-rose-400/60 text-rose-200">
                      {evalError}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10" onClick={() => scheduleEvaluation(question, { immediate: true, countExam: examMode })}>
                    Run now
                  </Button>
                  <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10" onClick={() => handleExport('csv')}>
                    Export CSV
                  </Button>
                  <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-100 hover:bg-cyan-500/10" onClick={() => handleExport('json')}>
                    Export JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card variant="cyberpunk">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-cyan-100">Examples</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ScrollArea className="max-h-40 pr-2">
                  <div className="flex flex-col gap-2">
                    {examples.map((example) => (
                      <Button
                        key={example.id}
                        variant="outline"
                        className={cn(
                          'justify-start border-cyan-500/30 text-left text-cyan-200 hover:bg-cyan-500/10',
                          currentPrompt?.id === example.id && 'border-cyan-400 bg-cyan-500/10'
                        )}
                        onClick={() => handleExampleSelect(example)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{example.title}</span>
                          <span className="text-xs text-cyan-300/80">{example.domain} · diff {example.difficulty ?? 1}</span>
                        </div>
                      </Button>
                    ))}
                    {examples.length === 0 && <p className="text-sm text-cyan-300/70">No examples loaded.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card variant="cyberpunk">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-cyan-100">Saved Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={saveName}
                    onChange={(event) => setSaveName(event.target.value)}
                    placeholder="Name"
                    className="h-9 border-cyan-500/30 bg-black/40 text-cyan-100 placeholder:text-cyan-300/50"
                  />
                  <Button size="sm" disabled={saving || !saveName.trim() || !question.trim()} onClick={handleSaveQuestion}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
                <ScrollArea className="max-h-40 pr-2">
                  <div className="flex flex-col gap-2">
                    {savedQuestions.map((item) => (
                      <Button
                        key={item.name}
                        variant="outline"
                        className="justify-start border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/10"
                        onClick={() => handleSavedSelect(item)}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{item.name}</span>
                          {item.savedAt && <span className="text-xs text-cyan-300/70">{new Date(item.savedAt).toLocaleString()}</span>}
                        </div>
                      </Button>
                    ))}
                    {savedQuestions.length === 0 && <p className="text-sm text-cyan-300/70">No saved questions yet.</p>}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card variant="cyberpunk">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-cyan-100">Exam Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-cyan-300/80">
                <div className="flex items-center justify-between">
                  <span>Attempts</span>
                  <span className="font-semibold text-cyan-100">{examAttempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Successful runs</span>
                  <span className="font-semibold text-cyan-100">{examWins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Accuracy</span>
                  <span className="font-semibold text-cyan-100">
                    {examAttempts === 0 ? '—' : `${Math.round((examWins / examAttempts) * 100)}%`}
                  </span>
                </div>
                <Separator className="my-2 border-cyan-500/20" />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={startExamChallenge}>
                    New challenge
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-rose-400/60 text-rose-200" onClick={stopExam}>
                    End mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card variant="cyberpunk">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-cyan-100">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result?.ok && result.headers && result.rows && result.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-cyan-500/20">
                <table className="min-w-full divide-y divide-cyan-500/20 text-sm">
                  <thead className="bg-cyan-500/10">
                    <tr>
                      {result.headers.map((header) => (
                        <th key={header} className="px-4 py-2 text-left font-semibold text-cyan-100">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, index) => (
                      <tr key={index} className="border-b border-cyan-500/10 bg-black/30">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-2 text-cyan-100/90">
                            {cell ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-cyan-500/20 bg-black/30 p-6 text-sm text-cyan-300/80">
                {result?.ok ? 'No rows returned. Adjust filters or scope.' : evalError ?? 'Start typing to evaluate your question.'}
              </div>
            )}
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-4 text-sm text-cyan-200">
                <div className="text-xs uppercase tracking-wide text-cyan-300/70">Execution</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between"><span>Scoped</span><span>{result?.execution?.scoped ?? '—'}</span></div>
                  <div className="flex justify-between"><span>Filtered</span><span>{result?.execution?.filtered ?? '—'}</span></div>
                  <div className="flex justify-between"><span>Limit</span><span>{result?.metadata?.limit ?? '—'}</span></div>
                </div>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-4 text-sm text-cyan-200">
                <div className="text-xs uppercase tracking-wide text-cyan-300/70">Ordering</div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between"><span>Order by</span><span>{result?.metadata?.orderBy ?? '—'}</span></div>
                  <div className="flex justify-between"><span>Direction</span><span>{result?.metadata?.orderDir ?? '—'}</span></div>
                  <div className="flex justify-between"><span>Group by</span><span>{result?.metadata?.groupBy ?? '—'}</span></div>
                </div>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-black/30 p-4 text-sm text-cyan-200">
                <div className="text-xs uppercase tracking-wide text-cyan-300/70">Warnings</div>
                <div className="mt-2 space-y-1">
                  {result?.warnings?.length ? (
                    result.warnings.map((warning, index) => (
                      <div key={index} className="rounded border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-amber-100">
                        {warning.message}
                      </div>
                    ))
                  ) : (
                    <div className="text-cyan-300/70">No simulator warnings.</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card variant="cyberpunk">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-cyan-100">Sensors Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-64 pr-2">
                <div className="space-y-3">
                  {loadingMeta ? (
                    <p className="text-sm text-cyan-300/80">Loading sensors…</p>
                  ) : sensorsCatalog.sensors.length ? (
                    sensorsCatalog.sensors.map((sensor) => (
                      <div key={sensor.name} className="rounded border border-cyan-500/20 bg-black/30 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-cyan-100">{sensor.name}</span>
                          <Badge variant="outline" className="border-cyan-500/30 text-cyan-200">
                            {sensor.category}
                          </Badge>
                        </div>
                        {sensor.description && (
                          <p className="mt-1 text-sm text-cyan-300/80">{sensor.description}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-cyan-300/80">No sensors available.</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card variant="cyberpunk">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-cyan-100">Aggregates & Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-cyan-200">
              <div>
                <div className="text-xs uppercase tracking-wide text-cyan-300/70">Aggregates</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(sensorsCatalog.aggregates ?? []).map((agg) => (
                    <Badge key={agg} variant="outline" className="border-cyan-500/30 text-cyan-200">
                      {agg}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator className="border-cyan-500/20" />
              <ul className="list-disc space-y-1 pl-5 text-cyan-300/80">
                <li>Always scope to a group before applying heavy sensors.</li>
                <li>Use parentheses for complex boolean logic and set explicit limits for exports.</li>
                <li>Warnings flag potentially risky patterns (like numeric contains) before production runs.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

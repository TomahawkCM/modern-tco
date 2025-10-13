"use client";

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { questionBulkService, type ImportResult } from '@/lib/questionBulkService';
import type { Question } from '@/types/exam';
import { QuestionPreview } from './QuestionPreview';

type ImportStep = 'upload' | 'preview' | 'importing' | 'results';

export function BulkImporter() {
  // Step management
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');

  // File upload
  const [importType, setImportType] = useState<'csv' | 'json'>('csv');
  const [fileContent, setFileContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsed questions
  const [parsedQuestions, setParsedQuestions] = useState<Partial<Question>[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Import progress
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      handleParse(content, importType);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (!fileContent.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste your CSV or JSON content',
        variant: 'destructive',
      });
      return;
    }

    handleParse(fileContent, importType);
  };

  const handleParse = async (content: string, type: 'csv' | 'json') => {
    try {
      let result;

      if (type === 'csv') {
        result = questionBulkService.parseCSV(content);
      } else {
        result = questionBulkService.parseJSON(content);
      }

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
        toast({
          title: 'Parse Errors',
          description: `Found ${result.errors.length} parsing errors. Review and fix before importing.`,
          variant: 'destructive',
        });
        return;
      }

      setParsedQuestions(result.questions);
      setParseErrors([]);

      // Check for duplicates
      const duplicates = await questionBulkService.findDuplicates(result.questions);
      setDuplicateCount(duplicates.size);

      setCurrentStep('preview');

      toast({
        title: 'Success',
        description: `Parsed ${result.questions.length} questions successfully`,
      });
    } catch (error) {
      toast({
        title: 'Parse Failed',
        description: error instanceof Error ? error.message : 'Failed to parse file',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) return;

    setCurrentStep('importing');
    setImportProgress(0);

    const result = await questionBulkService.importQuestions(
      parsedQuestions,
      (current, total) => {
        setImportProgress((current / total) * 100);
      }
    );

    setImportResult(result);
    setCurrentStep('results');

    if (result.success) {
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${result.imported} questions`,
      });
    } else {
      toast({
        title: 'Import Completed with Errors',
        description: `Imported ${result.imported}, failed ${result.failed}`,
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTemplate = () => {
    const template = questionBulkService.generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'question-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Template Downloaded',
      description: 'Use this template to format your questions for import',
    });
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setFileContent('');
    setParsedQuestions([]);
    setParseErrors([]);
    setDuplicateCount(0);
    setImportProgress(0);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${currentStep === 'upload' ? 'text-blue-500' : 'text-muted-foreground'}`}>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-500 text-white' : 'bg-muted'}`}>
            1
          </div>
          <span className="font-medium">Upload</span>
        </div>
        <div className="w-12 h-0.5 bg-border" />
        <div className={`flex items-center gap-2 ${currentStep === 'preview' ? 'text-blue-500' : 'text-muted-foreground'}`}>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 'preview' ? 'bg-blue-500 text-white' : 'bg-muted'}`}>
            2
          </div>
          <span className="font-medium">Preview</span>
        </div>
        <div className="w-12 h-0.5 bg-border" />
        <div className={`flex items-center gap-2 ${currentStep === 'importing' || currentStep === 'results' ? 'text-blue-500' : 'text-muted-foreground'}`}>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${currentStep === 'importing' || currentStep === 'results' ? 'bg-blue-500 text-white' : 'bg-muted'}`}>
            3
          </div>
          <span className="font-medium">Import</span>
        </div>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Import Questions</CardTitle>
            <CardDescription>
              Upload a CSV or JSON file, or paste content directly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={importType} onValueChange={(value) => setImportType(value as 'csv' | 'json')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV Import
                </TabsTrigger>
                <TabsTrigger value="json">
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON Import
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <p className="font-semibold mb-2">CSV Format Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Required columns: question, choice_a, choice_b, choice_c, choice_d, correct_answer, explanation, domain, difficulty</li>
                      <li>Optional columns: category, tags, study_guide_ref, console_steps</li>
                      <li>Use pipe (|) to separate multiple tags or console steps</li>
                      <li>Download the template below for proper formatting</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <Button variant="outline" onClick={handleDownloadTemplate} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV Template
                </Button>
              </TabsContent>

              <TabsContent value="json" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <p className="font-semibold mb-2">JSON Format Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Must be a valid JSON array of question objects</li>
                      <li>Each question must include: question, choices (array), correctAnswerId, explanation, domain, difficulty</li>
                      <li>Choices must have id (a, b, c, d) and text properties</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload File</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept={importType === 'csv' ? '.csv' : '.json'}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose {importType.toUpperCase()} File
                  </Button>
                </div>
              </div>

              <div className="text-center text-muted-foreground">or</div>

              <div className="space-y-2">
                <Label htmlFor="content">Paste Content</Label>
                <Textarea
                  id="content"
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  placeholder={`Paste your ${importType.toUpperCase()} content here...`}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <Button onClick={handlePaste} disabled={!fileContent.trim()} className="w-full" size="lg">
                Parse and Preview
              </Button>
            </div>

            {parseErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Parse Errors:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {parseErrors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li>...and {parseErrors.length - 5} more errors</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Preview */}
      {currentStep === 'preview' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">{parsedQuestions.length} questions parsed</span>
                  </div>
                  {duplicateCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">{duplicateCount} duplicates (will be skipped)</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    Cancel
                  </Button>
                  <Button onClick={handleImport}>
                    Import {parsedQuestions.length - duplicateCount} Questions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {parsedQuestions.slice(0, 10).map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Badge variant="secondary">{question.domain}</Badge>
                    <Badge>{question.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <QuestionPreview
                    question={question as Question}
                    showMetadata={false}
                    showExplanation={true}
                  />
                </CardContent>
              </Card>
            ))}

            {parsedQuestions.length > 10 && (
              <Alert>
                <AlertDescription>
                  Showing first 10 of {parsedQuestions.length} questions. All questions will be imported.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {currentStep === 'importing' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <div>
                <h3 className="text-lg font-semibold">Importing Questions...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Please wait while we import your questions
                </p>
              </div>
              <Progress value={importProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {Math.round(importProgress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 'results' && importResult && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResult.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Import Successful
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Import Completed with Errors
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-3xl font-bold text-green-500">{importResult.imported}</div>
                  <div className="text-sm text-muted-foreground mt-1">Imported</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="text-3xl font-bold text-amber-500">{importResult.duplicates}</div>
                  <div className="text-sm text-muted-foreground mt-1">Duplicates Skipped</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-3xl font-bold text-red-500">{importResult.failed}</div>
                  <div className="text-sm text-muted-foreground mt-1">Failed</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">Import Errors:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm max-h-48 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <li key={index}>
                          Row {error.row}: {error.error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  Import More Questions
                </Button>
                <Button onClick={() => window.location.href = '/admin/questions'} className="flex-1">
                  View Question Bank
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

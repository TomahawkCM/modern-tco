'use client';

/**
 * YNAB Migration Wizard (Y-020)
 * Multi-step wizard for importing YNAB budget data.
 * 
 * Steps:
 * 1. File Upload - Select YNAB export file (JSON/CSV)
 * 2. Category Mapping - Map YNAB categories to our categories
 * 3. Options - Configure import settings
 * 4. Preview - Review data before import
 * 5. Importing - Progress indication
 * 6. Complete - Success/summary screen
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileUp,
  Settings,
  Eye,
  FolderTree,
  Sparkles,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSeniorsMode } from '@/hooks/useSeniorsMode';
import { ImportWizardStepper, type WizardStep } from './ImportWizardStepper';

// Types for YNAB data (from our parsers)
import type { ParsedYNABData } from '@/lib/import/ynab-parser';
import type { Category, Transaction, Account, Budget } from '@/types/budget';

// ============================================================================
// Types
// ============================================================================

export type YNABMigrationStep = 
  | 'upload'
  | 'categories'
  | 'options'
  | 'preview'
  | 'importing'
  | 'complete';

export interface YNABImportOptions {
  // Category handling
  hiddenCategoryAction: 'skip' | 'archive' | 'import';
  mergeExistingCategories: boolean;
  
  // Date filtering
  importDateRange: 'all' | 'recent' | 'custom';
  dateFrom?: Date;
  dateTo?: Date;
  
  // Budget handling
  rolloverMode: 'preserve' | 'disable' | 'auto';
  importGoals: boolean;
  
  // Account handling
  includeClosedAccounts: boolean;
  includeOffBudgetAccounts: boolean;
}

export interface CategoryMapping {
  ynabCategoryId: string;
  ynabCategoryName: string;
  ynabGroupName: string;
  mappedCategoryId: string | null;  // null = create new
  mappedCategoryName: string;
  action: 'map' | 'create' | 'skip';
}

export interface ImportPreview {
  accounts: {
    total: number;
    new: number;
    existing: number;
  };
  transactions: {
    total: number;
    new: number;
    duplicates: number;
    dateRange: { start: Date; end: Date };
  };
  categories: {
    total: number;
    mapped: number;
    created: number;
    skipped: number;
  };
  budgets: {
    months: number;
    total: number;
  };
  warnings: string[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    accounts: { imported: number; skipped: number };
    transactions: { imported: number; skipped: number };
    categories: { imported: number; skipped: number };
    budgets: { imported: number; skipped: number };
  };
  errors: string[];
  warnings: string[];
}

interface YNABMigrationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: ImportResult) => void;
  existingCategories?: Category[];
  existingAccounts?: Account[];
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_OPTIONS: YNABImportOptions = {
  hiddenCategoryAction: 'archive',
  mergeExistingCategories: true,
  importDateRange: 'all',
  rolloverMode: 'auto',
  importGoals: true,
  includeClosedAccounts: false,
  includeOffBudgetAccounts: true,
};

// ============================================================================
// Step Definitions
// ============================================================================

const STEP_ORDER: YNABMigrationStep[] = [
  'upload',
  'categories',
  'options',
  'preview',
  'importing',
  'complete',
];

function getStepIndex(step: YNABMigrationStep): number {
  return STEP_ORDER.indexOf(step);
}

function getStepLabel(step: YNABMigrationStep): string {
  switch (step) {
    case 'upload': return 'Upload';
    case 'categories': return 'Categories';
    case 'options': return 'Options';
    case 'preview': return 'Preview';
    case 'importing': return 'Importing';
    case 'complete': return 'Complete';
  }
}

function getStepDescription(step: YNABMigrationStep): string {
  switch (step) {
    case 'upload': return 'Select YNAB export file';
    case 'categories': return 'Map to existing categories';
    case 'options': return 'Configure import settings';
    case 'preview': return 'Review before import';
    case 'importing': return 'Processing your data';
    case 'complete': return 'Migration finished';
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function YNABMigrationWizard({
  isOpen,
  onClose,
  onImportComplete,
  existingCategories = [],
  existingAccounts = [],
}: YNABMigrationWizardProps) {
  const { isSeniorsMode } = useSeniorsMode();
  
  // ----------------------------------------
  // State
  // ----------------------------------------
  
  // Current step
  const [currentStep, setCurrentStep] = useState<YNABMigrationStep>('upload');
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Step 1: Upload
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedYNABData | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  
  // Step 2: Category Mapping
  const [categoryMappings, setCategoryMappings] = useState<CategoryMapping[]>([]);
  
  // Step 3: Options
  const [options, setOptions] = useState<YNABImportOptions>(DEFAULT_OPTIONS);
  
  // Step 4: Preview
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  
  // Step 5/6: Import
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // ----------------------------------------
  // Computed
  // ----------------------------------------
  
  const currentStepIndex = useMemo(() => getStepIndex(currentStep), [currentStep]);
  
  const wizardSteps: WizardStep[] = useMemo(() => {
    // Only show first 4 steps in stepper (exclude importing/complete)
    const visibleSteps: YNABMigrationStep[] = ['upload', 'categories', 'options', 'preview'];
    
    return visibleSteps.map((step, idx) => ({
      id: step,
      title: getStepLabel(step),
      description: getStepDescription(step),
      status: idx < currentStepIndex 
        ? 'complete' 
        : idx === currentStepIndex 
          ? 'current' 
          : 'pending',
    }));
  }, [currentStepIndex]);
  
  const canGoBack = useMemo(() => {
    return currentStepIndex > 0 && 
           currentStep !== 'importing' && 
           currentStep !== 'complete';
  }, [currentStepIndex, currentStep]);
  
  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'upload':
        return parsedData !== null && !isParsingFile;
      case 'categories':
        return categoryMappings.length > 0;
      case 'options':
        return true;
      case 'preview':
        return preview !== null;
      default:
        return false;
    }
  }, [currentStep, parsedData, isParsingFile, categoryMappings, preview]);

  // ----------------------------------------
  // Navigation
  // ----------------------------------------
  
  const goToStep = useCallback((step: YNABMigrationStep) => {
    setError(null);
    setCurrentStep(step);
  }, []);
  
  const goBack = useCallback(() => {
    if (!canGoBack) return;
    
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(STEP_ORDER[prevIndex]);
    }
  }, [canGoBack, currentStepIndex, goToStep]);
  
  const goNext = useCallback(() => {
    if (!canGoNext) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      goToStep(STEP_ORDER[nextIndex]);
    }
  }, [canGoNext, currentStepIndex, goToStep]);

  // ----------------------------------------
  // File Handling (Step 1)
  // ----------------------------------------
  
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setIsParsingFile(true);

    try {
      // Read file content as text
      const content = await selectedFile.text();

      // Dynamic import of parser to reduce initial bundle
      const { parseYNABFile } = await import('@/lib/import/ynab-parser');

      const data = await parseYNABFile(content, selectedFile.name);
      setParsedData(data);
      
      // Generate initial category mappings
      const mappings: CategoryMapping[] = [];
      for (const group of data.categoryGroups) {
        for (const cat of group.categories) {
          // Try to find matching existing category
          const existingMatch = existingCategories.find(
            ec => ec.name.toLowerCase() === group.name.toLowerCase() ||
                  ec.subcategories?.some(sub => 
                    sub.toLowerCase() === cat.name.toLowerCase()
                  )
          );
          
          mappings.push({
            ynabCategoryId: cat.id,
            ynabCategoryName: cat.name,
            ynabGroupName: group.name,
            mappedCategoryId: existingMatch?.id || null,
            mappedCategoryName: existingMatch?.name || group.name,
            action: existingMatch ? 'map' : 'create',
          });
        }
      }
      
      setCategoryMappings(mappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse YNAB file');
      setParsedData(null);
    } finally {
      setIsParsingFile(false);
    }
  }, [existingCategories]);
  
  const handleFileDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  }, [handleFileSelect]);

  // ----------------------------------------
  // Category Mapping (Step 2)
  // ----------------------------------------
  
  const updateCategoryMapping = useCallback((
    ynabCategoryId: string,
    updates: Partial<CategoryMapping>
  ) => {
    setCategoryMappings(prev => 
      prev.map(mapping => 
        mapping.ynabCategoryId === ynabCategoryId
          ? { ...mapping, ...updates }
          : mapping
      )
    );
  }, []);

  // ----------------------------------------
  // Preview Generation (Step 4)
  // ----------------------------------------
  
  const generatePreview = useCallback(async () => {
    if (!parsedData) return;
    
    try {
      // Calculate preview stats
      const mappedCount = categoryMappings.filter(m => m.action === 'map').length;
      const createdCount = categoryMappings.filter(m => m.action === 'create').length;
      const skippedCount = categoryMappings.filter(m => m.action === 'skip').length;
      
      // Get date range from transactions
      const dates = parsedData.transactions
        .map(t => new Date(t.date))
        .filter(d => !isNaN(d.getTime()));
      
      const warnings: string[] = [];
      
      // Check for potential issues
      const hiddenCats = parsedData.categoryGroups
        .flatMap(g => g.categories)
        .filter(c => c.hidden);
      
      if (hiddenCats.length > 0) {
        warnings.push(`${hiddenCats.length} hidden categories found - will be ${options.hiddenCategoryAction}ed`);
      }
      
      const closedAccounts = parsedData.accounts.filter(a => a.closed);
      if (closedAccounts.length > 0 && !options.includeClosedAccounts) {
        warnings.push(`${closedAccounts.length} closed accounts will be skipped`);
      }
      
      // Find duplicate transactions
      // TODO: Implement proper duplicate detection
      const duplicates = 0;
      
      setPreview({
        accounts: {
          total: parsedData.accounts.length,
          new: parsedData.accounts.length - existingAccounts.length,
          existing: existingAccounts.length,
        },
        transactions: {
          total: parsedData.transactions.length,
          new: parsedData.transactions.length - duplicates,
          duplicates,
          dateRange: {
            start: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date(),
            end: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date(),
          },
        },
        categories: {
          total: categoryMappings.length,
          mapped: mappedCount,
          created: createdCount,
          skipped: skippedCount,
        },
        budgets: {
          months: parsedData.monthlyBudgets?.length || 0,
          total: parsedData.monthlyBudgets?.reduce(
            (sum, m) => sum + (m.categories?.length || 0),
            0
          ) || 0,
        },
        warnings,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    }
  }, [parsedData, categoryMappings, options, existingAccounts]);

  // ----------------------------------------
  // Import Execution (Step 5)
  // ----------------------------------------
  
  const executeImport = useCallback(async () => {
    if (!parsedData) return;
    
    setCurrentStep('importing');
    setImportProgress(0);
    setError(null);
    
    try {
      // Import in stages with progress updates
      const stages = [
        { name: 'accounts', weight: 10 },
        { name: 'categories', weight: 20 },
        { name: 'transactions', weight: 50 },
        { name: 'budgets', weight: 20 },
      ];
      
      let totalProgress = 0;
      const stats = {
        accounts: { imported: 0, skipped: 0 },
        transactions: { imported: 0, skipped: 0 },
        categories: { imported: 0, skipped: 0 },
        budgets: { imported: 0, skipped: 0 },
      };
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // Stage 1: Import accounts
      try {
        const { transformYNABAccounts } = await import('@/lib/import/ynab-account-transformer');
        const accountResult = transformYNABAccounts(parsedData, {
          includeClosedAccounts: options.includeClosedAccounts,
          includeOffBudgetAccounts: options.includeOffBudgetAccounts,
        });
        
        // TODO: Save accounts to IndexedDB
        stats.accounts.imported = accountResult.accounts.length;
        warnings.push(...accountResult.warnings);
      } catch (err) {
        errors.push(`Account import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      totalProgress += stages[0].weight;
      setImportProgress(totalProgress);
      
      // Stage 2: Import categories
      try {
        const { transformYNABCategories } = await import('@/lib/import/ynab-category-transformer');
        const categoryResult = transformYNABCategories(parsedData, {
          hiddenCategoryAction: options.hiddenCategoryAction,
          mergeWithExisting: options.mergeExistingCategories ? existingCategories : undefined,
        });
        
        // TODO: Save categories to IndexedDB
        stats.categories.imported = categoryResult.categories.length;
        warnings.push(...categoryResult.warnings);
      } catch (err) {
        errors.push(`Category import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      totalProgress += stages[1].weight;
      setImportProgress(totalProgress);
      
      // Stage 3: Import transactions
      try {
        const { transformYNABData } = await import('@/lib/import/ynab-transaction-transformer');
        const txResult = transformYNABData(parsedData, {
          existingCategories,
        });
        
        // TODO: Save transactions to IndexedDB
        stats.transactions.imported = txResult.transactions.length;
        warnings.push(...txResult.warnings);
      } catch (err) {
        errors.push(`Transaction import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      totalProgress += stages[2].weight;
      setImportProgress(totalProgress);
      
      // Stage 4: Import budgets
      try {
        const { transformYNABBudgets } = await import('@/lib/import/ynab-budget-transformer');
        // Note: We need the category ID map from the category transformer
        // For now, using a placeholder
        const budgetResult = transformYNABBudgets(parsedData, {
          categoryIdMap: new Map(),
          rolloverMode: options.rolloverMode,
          importGoals: options.importGoals,
        });
        
        // TODO: Save budgets to IndexedDB
        stats.budgets.imported = budgetResult.budgets.length;
        warnings.push(...budgetResult.warnings);
      } catch (err) {
        errors.push(`Budget import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      totalProgress = 100;
      setImportProgress(totalProgress);
      
      // Create result
      const result: ImportResult = {
        success: errors.length === 0,
        message: errors.length === 0 
          ? 'YNAB data imported successfully!'
          : `Import completed with ${errors.length} error(s)`,
        stats,
        errors,
        warnings,
      };
      
      setImportResult(result);
      setCurrentStep('complete');
      
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setCurrentStep('preview');
    }
  }, [parsedData, options, existingCategories, onImportComplete]);

  // ----------------------------------------
  // Reset & Close
  // ----------------------------------------
  
  const resetWizard = useCallback(() => {
    setCurrentStep('upload');
    setFile(null);
    setParsedData(null);
    setIsParsingFile(false);
    setCategoryMappings([]);
    setOptions(DEFAULT_OPTIONS);
    setPreview(null);
    setImportProgress(0);
    setImportResult(null);
    setError(null);
  }, []);
  
  const handleClose = useCallback(() => {
    if (currentStep === 'importing') return; // Don't allow closing during import
    
    onClose();
    // Reset after animation
    setTimeout(resetWizard, 200);
  }, [currentStep, onClose, resetWizard]);

  // ----------------------------------------
  // Render
  // ----------------------------------------
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl border border-white/10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20">
                <Sparkles className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h2 className={cn('font-bold text-white', isSeniorsMode ? 'text-2xl' : 'text-xl')}>
                  Import from YNAB
                </h2>
                <p className="text-sm text-slate-400">
                  Migrate your budget data seamlessly
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={currentStep === 'importing'}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close wizard"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Stepper (visible except during importing/complete) */}
          {currentStep !== 'importing' && currentStep !== 'complete' && (
            <div className="px-6 pt-6 shrink-0">
              <ImportWizardStepper 
                steps={wizardSteps} 
                currentStep={currentStepIndex} 
              />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Upload */}
            {currentStep === 'upload' && (
              <UploadStep
                file={file}
                parsedData={parsedData}
                isParsingFile={isParsingFile}
                isSeniorsMode={isSeniorsMode}
                onFileDrop={handleFileDrop}
                onFileSelect={handleFileInputChange}
              />
            )}
            
            {/* Step 2: Categories */}
            {currentStep === 'categories' && (
              <CategoryMappingStep
                mappings={categoryMappings}
                existingCategories={existingCategories}
                isSeniorsMode={isSeniorsMode}
                onUpdateMapping={updateCategoryMapping}
              />
            )}
            
            {/* Step 3: Options */}
            {currentStep === 'options' && (
              <OptionsStep
                options={options}
                isSeniorsMode={isSeniorsMode}
                onUpdateOptions={setOptions}
              />
            )}
            
            {/* Step 4: Preview */}
            {currentStep === 'preview' && (
              <PreviewStep
                preview={preview}
                isSeniorsMode={isSeniorsMode}
                onGeneratePreview={generatePreview}
              />
            )}
            
            {/* Step 5: Importing */}
            {currentStep === 'importing' && (
              <ImportingStep
                progress={importProgress}
                isSeniorsMode={isSeniorsMode}
              />
            )}
            
            {/* Step 6: Complete */}
            {currentStep === 'complete' && (
              <CompleteStep
                result={importResult}
                isSeniorsMode={isSeniorsMode}
                onImportAnother={resetWizard}
                onViewTransactions={() => {
                  onClose();
                  // Navigate to transactions page - handled by parent component
                }}
              />
            )}
            
            {/* Error Display */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="flex gap-4 border-t border-white/10 p-6 shrink-0">
            {/* Back button */}
            {canGoBack && (
              <Button
                variant="outline"
                onClick={goBack}
                className={cn(
                  'flex-1 gap-2 border-white/20 text-slate-300 hover:bg-white/10',
                  isSeniorsMode && 'min-h-[52px] text-lg'
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            {/* Next/Import button */}
            {currentStep !== 'importing' && currentStep !== 'complete' && (
              <Button
                onClick={currentStep === 'preview' ? executeImport : goNext}
                disabled={!canGoNext}
                className={cn(
                  'flex-1 gap-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 disabled:opacity-50',
                  isSeniorsMode && 'min-h-[52px] text-lg'
                )}
              >
                {currentStep === 'preview' ? (
                  <>
                    <Upload className="h-4 w-4" />
                    Start Import
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            
            {/* Done button */}
            {currentStep === 'complete' && (
              <Button
                onClick={handleClose}
                className={cn(
                  'flex-1 gap-2 bg-teal-500 hover:bg-teal-600',
                  isSeniorsMode && 'min-h-[52px] text-lg'
                )}
              >
                <CheckCircle className="h-4 w-4" />
                Done
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ============================================================================
// Step Components
// ============================================================================

interface UploadStepProps {
  file: File | null;
  parsedData: ParsedYNABData | null;
  isParsingFile: boolean;
  isSeniorsMode: boolean;
  onFileDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function UploadStep({
  file,
  parsedData,
  isParsingFile,
  isSeniorsMode,
  onFileDrop,
  onFileSelect,
}: UploadStepProps) {
  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
        <h3 className="flex items-center gap-2 font-medium text-blue-400 mb-2">
          <Info className="h-5 w-5" />
          Supported Formats
        </h3>
        <ul className="text-sm text-slate-400 space-y-1 ml-7">
          <li>• <span className="text-white">YNAB API Export</span> - JSON from nYNAB</li>
          <li>• <span className="text-white">Budget.yfull / Budget.ynab4</span> - YNAB4 desktop export</li>
          <li>• <span className="text-white">CSV Export</span> - From YNAB web app</li>
        </ul>
      </div>
      
      {/* Drop Zone */}
      <label
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all',
          isParsingFile
            ? 'border-teal-500/50 bg-teal-500/5'
            : file && parsedData
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-white/20 bg-white/5 hover:border-teal-500/50 hover:bg-white/10'
        )}
        onDrop={onFileDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {isParsingFile ? (
          <Loader2 className="h-12 w-12 text-teal-400 animate-spin mb-4" />
        ) : file && parsedData ? (
          <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
        ) : (
          <Upload className="h-12 w-12 text-slate-400 mb-4" />
        )}
        
        <p className={cn('font-medium text-white', isSeniorsMode && 'text-lg')}>
          {isParsingFile 
            ? 'Parsing file...' 
            : file 
              ? file.name 
              : 'Click to select a file'
          }
        </p>
        <p className="text-sm text-slate-500 mt-2">
          or drag and drop here
        </p>
        
        <input
          type="file"
          accept=".json,.yfull,.ynab4,.csv,.tsv"
          onChange={onFileSelect}
          className="hidden"
          disabled={isParsingFile}
        />
      </label>
      
      {/* File Summary */}
      {parsedData && (
        <div className="rounded-xl bg-white/5 p-4 border border-white/10">
          <h3 className="text-sm font-medium text-slate-400 mb-3">File Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Accounts</span>
              <p className="text-white font-medium">{parsedData.accounts.length}</p>
            </div>
            <div>
              <span className="text-slate-500">Transactions</span>
              <p className="text-white font-medium">{parsedData.transactions.length.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">Categories</span>
              <p className="text-white font-medium">
                {parsedData.categoryGroups.reduce((sum, g) => sum + g.categories.length, 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Format</span>
              <p className="text-white font-medium capitalize">{parsedData.version}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface CategoryMappingStepProps {
  mappings: CategoryMapping[];
  existingCategories: Category[];
  isSeniorsMode: boolean;
  onUpdateMapping: (ynabCategoryId: string, updates: Partial<CategoryMapping>) => void;
}

function CategoryMappingStep({
  mappings,
  existingCategories,
  isSeniorsMode,
  onUpdateMapping,
}: CategoryMappingStepProps) {
  // Group by YNAB category group
  const groupedMappings = useMemo(() => {
    const groups = new Map<string, CategoryMapping[]>();
    for (const mapping of mappings) {
      const existing = groups.get(mapping.ynabGroupName) || [];
      existing.push(mapping);
      groups.set(mapping.ynabGroupName, existing);
    }
    return Array.from(groups.entries());
  }, [mappings]);

  // Calculate stats
  const stats = useMemo(() => ({
    total: mappings.length,
    create: mappings.filter(m => m.action === 'create').length,
    map: mappings.filter(m => m.action === 'map').length,
    skip: mappings.filter(m => m.action === 'skip').length,
  }), [mappings]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
        <h3 className="flex items-center gap-2 font-medium text-blue-400 mb-2">
          <FolderTree className="h-5 w-5" />
          Category Mapping
        </h3>
        <p className="text-sm text-slate-400">
          Map YNAB categories to your existing categories or create new ones.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-teal-500/10 p-3 border border-teal-500/20 text-center">
          <p className="text-2xl font-bold text-teal-400">{stats.create}</p>
          <p className="text-xs text-slate-400">Create New</p>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-3 border border-blue-500/20 text-center">
          <p className="text-2xl font-bold text-blue-400">{stats.map}</p>
          <p className="text-xs text-slate-400">Map to Existing</p>
        </div>
        <div className="rounded-lg bg-slate-500/10 p-3 border border-slate-500/20 text-center">
          <p className="text-2xl font-bold text-slate-400">{stats.skip}</p>
          <p className="text-xs text-slate-400">Skip</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        {groupedMappings.map(([groupName, items]) => (
          <div key={groupName} className="rounded-xl bg-white/5 p-4 border border-white/10">
            <h4 className={cn('font-medium text-white mb-3 flex items-center gap-2', isSeniorsMode && 'text-lg')}>
              <FolderTree className="h-4 w-4 text-teal-400" />
              {groupName}
              <span className="text-xs text-slate-500 font-normal ml-auto">
                {items.length} {items.length === 1 ? 'category' : 'categories'}
              </span>
            </h4>
            <div className="space-y-2">
              {items.map(mapping => (
                <div
                  key={mapping.ynabCategoryId}
                  className={cn(
                    'flex flex-col gap-2 p-3 rounded-lg transition-colors',
                    mapping.action === 'skip' ? 'bg-white/5 opacity-60' : 'bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      'flex-1 text-sm',
                      mapping.action === 'skip' ? 'text-slate-500 line-through' : 'text-slate-300'
                    )}>
                      {mapping.ynabCategoryName}
                    </span>
                    <select
                      value={mapping.action}
                      onChange={(e) => onUpdateMapping(mapping.ynabCategoryId, {
                        action: e.target.value as CategoryMapping['action'],
                        mappedCategoryId: e.target.value === 'create' ? null : mapping.mappedCategoryId,
                      })}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none min-w-[130px]"
                    >
                      <option value="create">Create New</option>
                      <option value="skip">Skip</option>
                      {existingCategories.length > 0 && (
                        <option value="map">Map to Existing</option>
                      )}
                    </select>
                  </div>

                  {/* Show category selector when "map" is selected */}
                  {mapping.action === 'map' && existingCategories.length > 0 && (
                    <div className="flex items-center gap-2 pl-4">
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                      <select
                        value={mapping.mappedCategoryId || ''}
                        onChange={(e) => {
                          const selected = existingCategories.find(c => c.id === e.target.value);
                          onUpdateMapping(mapping.ynabCategoryId, {
                            mappedCategoryId: e.target.value || null,
                            mappedCategoryName: selected?.name || mapping.ynabCategoryName,
                          });
                        }}
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white focus:border-teal-500 focus:outline-none"
                      >
                        <option value="">Select category...</option>
                        {existingCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Show preview for "create" action */}
                  {mapping.action === 'create' && (
                    <div className="flex items-center gap-2 pl-4 text-xs text-teal-400">
                      <Sparkles className="h-3 w-3" />
                      <span>Will create: <strong>{mapping.ynabGroupName}</strong> → {mapping.ynabCategoryName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface OptionsStepProps {
  options: YNABImportOptions;
  isSeniorsMode: boolean;
  onUpdateOptions: (options: YNABImportOptions) => void;
}

function OptionsStep({
  options,
  isSeniorsMode,
  onUpdateOptions,
}: OptionsStepProps) {
  const updateOption = <K extends keyof YNABImportOptions>(
    key: K, 
    value: YNABImportOptions[K]
  ) => {
    onUpdateOptions({ ...options, [key]: value });
  };
  
  return (
    <div className="space-y-6">
      {/* Hidden Categories */}
      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        <h3 className={cn('font-medium text-white mb-3', isSeniorsMode && 'text-lg')}>
          Hidden Categories
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          How to handle YNAB categories marked as hidden?
        </p>
        <div className="space-y-2">
          {[
            { value: 'archive', label: 'Archive', desc: 'Import as archived (recommended)' },
            { value: 'skip', label: 'Skip', desc: 'Don\'t import hidden categories' },
            { value: 'import', label: 'Import', desc: 'Import as active categories' },
          ].map(opt => (
            <label
              key={opt.value}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all',
                options.hiddenCategoryAction === opt.value
                  ? 'border-teal-500 bg-teal-500/10'
                  : 'border-white/10 hover:border-white/20'
              )}
            >
              <input
                type="radio"
                checked={options.hiddenCategoryAction === opt.value}
                onChange={() => updateOption('hiddenCategoryAction', opt.value as typeof options.hiddenCategoryAction)}
                className="h-4 w-4 text-teal-500"
              />
              <div>
                <p className="font-medium text-white">{opt.label}</p>
                <p className="text-sm text-slate-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Account Options */}
      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        <h3 className={cn('font-medium text-white mb-3', isSeniorsMode && 'text-lg')}>
          <Settings className="h-4 w-4 inline mr-2" />
          Account Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeClosedAccounts}
              onChange={(e) => updateOption('includeClosedAccounts', e.target.checked)}
              className="h-4 w-4 rounded text-teal-500"
            />
            <span className="text-slate-300">Include closed accounts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeOffBudgetAccounts}
              onChange={(e) => updateOption('includeOffBudgetAccounts', e.target.checked)}
              className="h-4 w-4 rounded text-teal-500"
            />
            <span className="text-slate-300">Include off-budget accounts</span>
          </label>
        </div>
      </div>
      
      {/* Budget Options */}
      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        <h3 className={cn('font-medium text-white mb-3', isSeniorsMode && 'text-lg')}>
          Budget Options
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.importGoals}
              onChange={(e) => updateOption('importGoals', e.target.checked)}
              className="h-4 w-4 rounded text-teal-500"
            />
            <span className="text-slate-300">Import savings goals as future purchases</span>
          </label>
        </div>
      </div>
    </div>
  );
}

interface PreviewStepProps {
  preview: ImportPreview | null;
  isSeniorsMode: boolean;
  onGeneratePreview: () => void;
}

function PreviewStep({
  preview,
  isSeniorsMode,
  onGeneratePreview,
}: PreviewStepProps) {
  // Auto-generate preview on mount
  if (!preview) {
    onGeneratePreview();
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-teal-400 mb-4" />
        <p className="text-white font-medium">Preparing preview...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20">
        <h3 className="flex items-center gap-2 font-medium text-blue-400 mb-2">
          <Eye className="h-5 w-5" />
          Import Preview
        </h3>
        <p className="text-sm text-slate-400">
          Review the data that will be imported.
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Accounts"
          value={preview.accounts.total}
          subtext={`${preview.accounts.new} new`}
        />
        <StatCard
          label="Transactions"
          value={preview.transactions.total}
          subtext={`${preview.transactions.duplicates} duplicates`}
        />
        <StatCard
          label="Categories"
          value={preview.categories.total}
          subtext={`${preview.categories.created} new, ${preview.categories.mapped} mapped`}
        />
        <StatCard
          label="Budget Months"
          value={preview.budgets.months}
          subtext={`${preview.budgets.total} allocations`}
        />
      </div>
      
      {/* Date Range */}
      <div className="rounded-xl bg-white/5 p-4 border border-white/10">
        <h3 className="text-sm font-medium text-slate-400 mb-2">Transaction Date Range</h3>
        <p className="text-white">
          {preview.transactions.dateRange.start.toLocaleDateString()} — {' '}
          {preview.transactions.dateRange.end.toLocaleDateString()}
        </p>
      </div>
      
      {/* Warnings */}
      {preview.warnings.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20">
          <h3 className="flex items-center gap-2 font-medium text-amber-400 mb-2">
            <AlertTriangle className="h-5 w-5" />
            Warnings
          </h3>
          <ul className="text-sm text-amber-300 space-y-1 ml-7">
            {preview.warnings.map((warning, idx) => (
              <li key={idx}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subtext: string;
}

function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  );
}

interface ImportingStepProps {
  progress: number;
  isSeniorsMode: boolean;
}

function ImportingStep({ progress, isSeniorsMode }: ImportingStepProps) {
  const stage = 
    progress < 10 ? 'Importing accounts...' :
    progress < 30 ? 'Importing categories...' :
    progress < 80 ? 'Importing transactions...' :
    progress < 100 ? 'Importing budgets...' :
    'Finishing up...';
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-16 w-16 animate-spin text-teal-400 mb-6" />
      <p className={cn('font-medium text-white mb-4', isSeniorsMode && 'text-lg')}>
        Importing your YNAB data...
      </p>
      
      {/* Progress Bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-sm text-slate-400 mt-2">{progress}%</p>
      </div>
      
      <p className="text-sm text-slate-500">{stage}</p>
    </div>
  );
}

interface CompleteStepProps {
  result: ImportResult | null;
  isSeniorsMode: boolean;
  onImportAnother?: () => void;
  onViewTransactions?: () => void;
}

function CompleteStep({ result, isSeniorsMode, onImportAnother, onViewTransactions }: CompleteStepProps) {
  if (!result) return null;

  const totalImported =
    result.stats.accounts.imported +
    result.stats.transactions.imported +
    result.stats.categories.imported +
    result.stats.budgets.imported;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {result.success ? (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 mb-6">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <p className={cn('font-bold text-white mb-2', isSeniorsMode ? 'text-2xl' : 'text-xl')}>
            Import Complete!
          </p>
          <p className="text-slate-400 text-center max-w-sm">
            {totalImported.toLocaleString()} items imported successfully from YNAB.
          </p>
        </>
      ) : (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20 mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-400" />
          </div>
          <p className={cn('font-bold text-white mb-2', isSeniorsMode ? 'text-2xl' : 'text-xl')}>
            Import Completed with Issues
          </p>
          <p className="text-slate-400 text-center max-w-sm mb-4">
            {result.message}
          </p>
        </>
      )}

      {/* Stats Summary */}
      <div className="w-full max-w-sm mt-6 rounded-xl bg-white/5 p-4 border border-white/10">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Accounts</span>
            <span className="text-white">{result.stats.accounts.imported}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Categories</span>
            <span className="text-white">{result.stats.categories.imported}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Transactions</span>
            <span className="text-white">{result.stats.transactions.imported.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Budgets</span>
            <span className="text-white">{result.stats.budgets.imported}</span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="w-full max-w-sm mt-4 rounded-xl bg-red-500/10 p-4 border border-red-500/20">
          <h4 className="text-sm font-medium text-red-400 mb-2">Errors</h4>
          <ul className="text-xs text-red-300 space-y-1">
            {result.errors.map((err, idx) => (
              <li key={idx}>• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      <div className="w-full max-w-sm mt-6 space-y-3">
        <p className="text-sm text-slate-400 text-center mb-3">What would you like to do next?</p>
        <div className="flex gap-3">
          {onViewTransactions && (
            <button
              onClick={onViewTransactions}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-500/20 border border-teal-500/30 p-3 text-sm font-medium text-teal-400 hover:bg-teal-500/30 transition-colors"
            >
              <Eye className="h-4 w-4" />
              View Transactions
            </button>
          )}
          {onImportAnother && (
            <button
              onClick={onImportAnother}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 p-3 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Import Another
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default YNABMigrationWizard;

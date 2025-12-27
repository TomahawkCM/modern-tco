'use client';

/**
 * Export Dialog Component (X-031)
 * Dialog for exporting budget data with optional encryption.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  FileDown,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  downloadBudgetExport,
  getExportStats,
  type ExportOptions,
} from '@/lib/export';
import { cn } from '@/lib/utils';
import { useSeniorsMode } from '@/hooks/useSeniorsMode';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { isSeniorsMode } = useSeniorsMode();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options state
  const [includeReceipts, setIncludeReceipts] = useState(false);
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordHint, setPasswordHint] = useState('');

  // Stats
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getExportStats>> | null>(null);

  // Load stats when dialog opens
  const loadStats = useCallback(async () => {
    try {
      const data = await getExportStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Handle export
  const handleExport = async () => {
    // Validate passwords if encryption enabled
    if (encrypt) {
      if (!password) {
        setError('Password is required for encryption');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
    }

    setError(null);
    setIsExporting(true);

    try {
      const options: ExportOptions = {
        includeReceipts,
        encrypt,
        password: encrypt ? password : undefined,
      };

      await downloadBudgetExport(options);
      setExportComplete(true);

      // Close after success delay
      setTimeout(() => {
        onClose();
        // Reset state
        setExportComplete(false);
        setPassword('');
        setConfirmPassword('');
        setPasswordHint('');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Load stats when opened
  if (isOpen && !stats) {
    loadStats();
  }

  // Reset on close
  const handleClose = () => {
    if (!isExporting) {
      onClose();
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setExportComplete(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg rounded-2xl bg-slate-900 shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20">
                <FileDown className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h2 className={cn('font-bold text-white', isSeniorsMode ? 'text-2xl' : 'text-xl')}>
                  Export Data
                </h2>
                <p className="text-sm text-slate-400">Download your budget data</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Stats Summary */}
            {stats && (
              <div className="rounded-xl bg-white/5 p-4">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Data Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.transactions}</p>
                    <p className="text-xs text-slate-500">Transactions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.accounts}</p>
                    <p className="text-xs text-slate-500">Accounts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.estimatedSize}</p>
                    <p className="text-xs text-slate-500">Est. Size</p>
                  </div>
                </div>
              </div>
            )}

            {/* Include Receipts Option */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={includeReceipts}
                onChange={(e) => setIncludeReceipts(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-500"
              />
              <div>
                <span className={cn('font-medium text-white', isSeniorsMode && 'text-lg')}>
                  Include Receipts
                </span>
                <p className="text-sm text-slate-400">
                  Attach receipt images (increases file size)
                </p>
              </div>
            </label>

            {/* Encryption Option */}
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={encrypt}
                  onChange={(e) => setEncrypt(e.target.checked)}
                  className="h-5 w-5 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-500"
                />
                <div>
                  <span className={cn('font-medium text-white flex items-center gap-2', isSeniorsMode && 'text-lg')}>
                    <Shield className="h-4 w-4 text-teal-400" />
                    Encrypt with Password
                  </span>
                  <p className="text-sm text-slate-400">
                    Protect your data with AES-256 encryption
                  </p>
                </div>
              </label>

              {/* Password Fields */}
              <AnimatePresence>
                {encrypt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password (min 8 characters)"
                          className={cn(
                            'w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-12 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500',
                            isSeniorsMode && 'text-lg py-4'
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm password"
                          className={cn(
                            'w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500',
                            isSeniorsMode && 'text-lg py-4'
                          )}
                        />
                      </div>
                    </div>

                    {/* Password Hint */}
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">
                        Password Hint (Optional)
                      </label>
                      <input
                        type="text"
                        value={passwordHint}
                        onChange={(e) => setPasswordHint(e.target.value)}
                        placeholder="A hint to help you remember"
                        className={cn(
                          'w-full rounded-lg border border-white/10 bg-white/5 py-3 px-4 text-white placeholder:text-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500',
                          isSeniorsMode && 'text-lg py-4'
                        )}
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        This hint will be stored unencrypted in the file
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success */}
            {exportComplete && (
              <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-green-400">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm">Export complete! Check your downloads folder.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-4 border-t border-white/10 p-6">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExporting}
              className={cn(
                'flex-1 border-white/20 text-slate-300 hover:bg-white/10',
                isSeniorsMode && 'min-h-[52px] text-lg'
              )}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || exportComplete}
              className={cn(
                'flex-1 gap-2 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600',
                isSeniorsMode && 'min-h-[52px] text-lg'
              )}
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : exportComplete ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Done!
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ExportDialog;

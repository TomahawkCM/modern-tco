'use client';

/**
 * Export/Backup Page
 * Export data to JSON/CSV and restore from backups
 */

import { useState } from 'react';
import { Download, Upload, Database, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '@/lib/budget-db';

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  async function exportToJSON() {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      // Export all data from each table
      const [accounts, transactions, categories, budgets, futurePurchases, retirementPlans, importMappings, receipts] = await Promise.all([
        db.accounts.toArray(),
        db.transactions.toArray(),
        db.categories.toArray(),
        db.budgets.toArray(),
        db.futurePurchases.toArray(),
        db.retirementPlans.toArray(),
        db.importMappings.toArray(),
        db.receipts.toArray(),
      ]);

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        accounts,
        transactions,
        categories,
        budgets,
        futurePurchases,
        retirementPlans,
        importMappings,
        receipts: receipts.map(r => ({
          ...r,
          blob: null, // Don't export blob data - too large
          thumbnail: null,
        })),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setStatusMessage('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('error');
      setStatusMessage('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  }

  async function exportTransactionsToCSV() {
    setIsExporting(true);
    setExportStatus('idle');

    try {
      const transactions = await db.transactions.toArray();

      // Create CSV header
      const headers = ['Date', 'Description', 'Category', 'Subcategory', 'Amount', 'Notes'];
      const rows = transactions.map(tx => [
        new Date(tx.date).toLocaleDateString(),
        tx.description,
        tx.category || '',
        tx.subcategory || '',
        tx.amount.toFixed(2),
        tx.notes || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setStatusMessage('Transactions exported to CSV!');
    } catch (error) {
      console.error('CSV export error:', error);
      setExportStatus('error');
      setStatusMessage('Failed to export to CSV');
    } finally {
      setIsExporting(false);
    }
  }

  async function importFromJSON(file: File) {
    setIsImporting(true);
    setImportStatus('idle');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.exportDate) {
        throw new Error('Invalid backup file format');
      }

      // Confirm before importing
      const confirmed = confirm(
        `This will replace all existing data with the backup from ${new Date(data.exportDate).toLocaleDateString()}. Continue?`
      );

      if (!confirmed) {
        setIsImporting(false);
        return;
      }

      // Clear existing data first
      await db.transaction('rw',
        db.accounts, db.transactions, db.categories,
        async () => {
          // Clear all tables
          await Promise.all([
            db.accounts.clear(),
            db.transactions.clear(),
            db.categories.clear(),
            db.budgets.clear(),
            db.futurePurchases.clear(),
            db.retirementPlans.clear(),
            db.importMappings.clear(),
            db.receipts.clear(),
          ]);

          // Import new data
          if (data.accounts?.length) await db.accounts.bulkAdd(data.accounts);
          if (data.transactions?.length) await db.transactions.bulkAdd(data.transactions);
          if (data.categories?.length) await db.categories.bulkAdd(data.categories);
          if (data.budgets?.length) await db.budgets.bulkAdd(data.budgets);
          if (data.futurePurchases?.length) await db.futurePurchases.bulkAdd(data.futurePurchases);
          if (data.retirementPlans?.length) await db.retirementPlans.bulkAdd(data.retirementPlans);
          if (data.importMappings?.length) await db.importMappings.bulkAdd(data.importMappings);
          // Note: Receipts without blob data won't be very useful, so skip them
        });

      setImportStatus('success');
      setStatusMessage('Data imported successfully! Refresh the page to see changes.');
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setStatusMessage('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      importFromJSON(file);
    }
  }

  async function clearAllData() {
    const confirmed = confirm(
      'Are you sure you want to delete ALL data? This action cannot be undone.\n\nMake sure you have exported a backup first!'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm(
      'This is your last chance. Really delete EVERYTHING?'
    );

    if (!doubleConfirm) return;

    try {
      // Clear all tables
      await Promise.all([
        db.accounts.clear(),
        db.transactions.clear(),
        db.categories.clear(),
        db.budgets.clear(),
        db.futurePurchases.clear(),
        db.retirementPlans.clear(),
        db.importMappings.clear(),
        db.receipts.clear(),
      ]);
      alert('All data has been deleted. The page will now refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export & Backup</h1>
        <p className="text-gray-600 mt-2">
          Backup your data or export to different formats
        </p>
      </div>

      {/* Status Messages */}
      {exportStatus !== 'idle' && (
        <div
          className={`p-4 rounded-lg flex items-center gap-4 ${
            exportStatus === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {exportStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}

      {importStatus !== 'idle' && (
        <div
          className={`p-4 rounded-lg flex items-center gap-4 ${
            importStatus === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {importStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Export Data</h2>

        <div className="space-y-4">
          {/* Full Backup */}
          <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-teal-500 transition-colors">
            <div className="bg-teal-50 rounded-full p-4">
              <Database className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Full Backup (JSON)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Export all data including accounts, transactions, budgets, goals, and settings
              </p>
            </div>
            <button
              onClick={exportToJSON}
              disabled={isExporting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>

          {/* Transactions CSV */}
          <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors">
            <div className="bg-green-50 rounded-full p-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Transactions (CSV)</h3>
              <p className="text-sm text-gray-600 mt-2">
                Export transactions to CSV format for use in Excel or other tools
              </p>
            </div>
            <button
              onClick={exportTransactionsToCSV}
              disabled={isExporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Import Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Data</h2>

        <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
          <div className="bg-gray-100 rounded-full p-4">
            <Upload className="w-6 h-6 text-gray-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">Restore from Backup</h3>
            <p className="text-sm text-gray-600 mt-2 mb-4">
              Import a previously exported JSON backup file
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              ⚠️ Warning: This will replace ALL existing data with the backup
            </div>
          </div>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file"
              disabled={isImporting}
            />
            <label
              htmlFor="import-file"
              className={`px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer ${
                isImporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import JSON'}
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
        <h2 className="text-xl font-semibold text-red-900 mb-4">⚠️ Danger Zone</h2>

        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Delete All Data</h3>
            <p className="text-sm text-red-700 mt-2">
              Permanently delete all accounts, transactions, budgets, and settings. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            Delete Everything
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">💡 Backup Tips</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-2">•</span>
            <span>Back up your data regularly (weekly recommended)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-2">•</span>
            <span>Store backups in a safe location (cloud storage, external drive)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-2">•</span>
            <span>Test your backups by importing them to ensure they work</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-2">•</span>
            <span>Export to CSV periodically for compatibility with other tools</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-2">•</span>
            <span>All data is stored locally in your browser's IndexedDB</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

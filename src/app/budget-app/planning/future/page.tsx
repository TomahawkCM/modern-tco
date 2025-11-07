'use client';

/**
 * Future Purchase Planner
 * Plan and track savings for future purchases
 */

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { db } from '@/lib/budget-db';
import type { FuturePurchase } from '@/types/budget';
import { differenceInDays, differenceInMonths, addMonths, format } from 'date-fns';

export default function FuturePurchasePage() {
  const [purchases, setPurchases] = useState<FuturePurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<FuturePurchase | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await db.futurePurchases.toArray();
      setPurchases(data.sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()));
    } catch (error) {
      console.error('Error loading future purchases:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function savePurchase(purchase: FuturePurchase) {
    try {
      if (editingPurchase) {
        await db.futurePurchases.update(purchase.id, { ...purchase, updatedAt: new Date() });
      } else {
        await db.futurePurchases.add(purchase);
      }
      await loadData();
      setShowModal(false);
      setEditingPurchase(null);
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Failed to save purchase');
    }
  }

  async function deletePurchase(id: string) {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      await db.futurePurchases.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase');
    }
  }

  async function toggleComplete(purchase: FuturePurchase) {
    try {
      await db.futurePurchases.update(purchase.id, {
        isCompleted: !purchase.isCompleted,
        updatedAt: new Date(),
      });
      await loadData();
    } catch (error) {
      console.error('Error updating purchase:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  const activePurchases = purchases.filter(p => !p.isCompleted);
  const completedPurchases = purchases.filter(p => p.isCompleted);
  const totalSavings = activePurchases.reduce((sum, p) => sum + p.currentSavings, 0);
  const totalTarget = activePurchases.reduce((sum, p) => sum + p.targetAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Future Purchase Planner</h1>
          <p className="text-gray-600 mt-2">Plan and track your savings goals</p>
        </div>
        <button
          onClick={() => {
            setEditingPurchase(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activePurchases.length}</p>
            </div>
            <Target className="w-12 h-12 text-teal-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Saved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Target</p>
              <p className="text-3xl font-bold text-teal-600 mt-2">
                ${totalTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Active Goals */}
      {activePurchases.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Goals</h2>
          {activePurchases.map(purchase => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onEdit={() => {
                setEditingPurchase(purchase);
                setShowModal(true);
              }}
              onDelete={() => deletePurchase(purchase.id)}
              onToggleComplete={() => toggleComplete(purchase)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Goals</h3>
          <p className="text-gray-600 mb-6">Start planning for your future purchases</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Goal
          </button>
        </div>
      )}

      {/* Completed Goals */}
      {completedPurchases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Completed Goals</h2>
          {completedPurchases.map(purchase => (
            <PurchaseCard
              key={purchase.id}
              purchase={purchase}
              onEdit={() => {
                setEditingPurchase(purchase);
                setShowModal(true);
              }}
              onDelete={() => deletePurchase(purchase.id)}
              onToggleComplete={() => toggleComplete(purchase)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <PurchaseModal
          purchase={editingPurchase}
          onSave={savePurchase}
          onClose={() => {
            setShowModal(false);
            setEditingPurchase(null);
          }}
        />
      )}
    </div>
  );
}

// Purchase Card Component
function PurchaseCard({
  purchase,
  onEdit,
  onDelete,
  onToggleComplete,
}: {
  purchase: FuturePurchase;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}) {
  const progress = (purchase.currentSavings / purchase.targetAmount) * 100;
  const remaining = purchase.targetAmount - purchase.currentSavings;
  const daysUntilTarget = differenceInDays(new Date(purchase.targetDate), new Date());
  const monthsUntilTarget = differenceInMonths(new Date(purchase.targetDate), new Date());

  // Calculate when goal will be achieved with current monthly contribution
  const monthsToGoal = purchase.monthlyContribution > 0
    ? Math.ceil(remaining / purchase.monthlyContribution)
    : null;
  const projectedDate = monthsToGoal ? addMonths(new Date(), monthsToGoal) : null;
  const canAffordByTarget = projectedDate && projectedDate <= new Date(purchase.targetDate);

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${purchase.isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-gray-900">{purchase.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[purchase.priority]}`}>
              {purchase.priority}
            </span>
            {purchase.isCompleted && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            )}
          </div>
          {purchase.description && (
            <p className="text-gray-600 mt-2">{purchase.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button onClick={onEdit} className="text-teal-600 hover:text-teal-700" title="Edit" aria-label="Edit future purchase">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="text-red-600 hover:text-red-700" title="Delete" aria-label="Delete future purchase">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            ${purchase.currentSavings.toLocaleString()} of ${purchase.targetAmount.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-teal-600">
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="text-lg font-semibold text-gray-900">${remaining.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Monthly Saving</p>
          <p className="text-lg font-semibold text-gray-900">
            ${purchase.monthlyContribution.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Target Date</p>
          <p className="text-lg font-semibold text-gray-900">
            {format(new Date(purchase.targetDate), 'MMM yyyy')}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Time Remaining</p>
          <p className="text-lg font-semibold text-gray-900">
            {monthsUntilTarget > 0 ? `${monthsUntilTarget} months` : 'Overdue'}
          </p>
        </div>
      </div>

      {/* Projection */}
      {!purchase.isCompleted && projectedDate && (
        <div className="mt-4 p-4 rounded-lg bg-gray-50">
          {canAffordByTarget ? (
            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              On track! You'll reach your goal by {format(projectedDate, 'MMMM yyyy')}
            </p>
          ) : (
            <p className="text-sm text-yellow-600 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              At current rate, you'll reach goal in {monthsToGoal} months ({format(projectedDate, 'MMM yyyy')})
            </p>
          )}
        </div>
      )}

      {/* Complete Button */}
      <div className="mt-4">
        <button
          onClick={onToggleComplete}
          className={`w-full py-2 rounded-lg font-medium transition-colors ${
            purchase.isCompleted
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {purchase.isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
      </div>
    </div>
  );
}

// Purchase Modal Component
function PurchaseModal({
  purchase,
  onSave,
  onClose,
}: {
  purchase: FuturePurchase | null;
  onSave: (purchase: FuturePurchase) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(purchase?.name || '');
  const [description, setDescription] = useState(purchase?.description || '');
  const [targetAmount, setTargetAmount] = useState(purchase?.targetAmount.toString() || '');
  const [currentSavings, setCurrentSavings] = useState(purchase?.currentSavings.toString() || '0');
  const [monthlyContribution, setMonthlyContribution] = useState(purchase?.monthlyContribution.toString() || '');
  const [targetDate, setTargetDate] = useState(
    purchase?.targetDate ? format(new Date(purchase.targetDate), 'yyyy-MM-dd') : ''
  );
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(purchase?.priority || 'medium');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const targetAmountNum = parseFloat(targetAmount);
    const currentSavingsNum = parseFloat(currentSavings);
    const monthlyContributionNum = parseFloat(monthlyContribution);

    if (isNaN(targetAmountNum) || targetAmountNum <= 0) {
      alert('Please enter a valid target amount');
      return;
    }

    if (!targetDate) {
      alert('Please select a target date');
      return;
    }

    const newPurchase: FuturePurchase = {
      id: purchase?.id || `purchase_${Date.now()}`,
      name,
      description,
      targetAmount: targetAmountNum,
      currentSavings: currentSavingsNum,
      monthlyContribution: monthlyContributionNum,
      targetDate: new Date(targetDate),
      priority,
      notes: '',
      isCompleted: purchase?.isCompleted || false,
      createdAt: purchase?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(newPurchase);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {purchase ? 'Edit Goal' : 'Add New Goal'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Car, Vacation, Home Renovation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about your goal..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Savings
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Contribution
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date *
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              {purchase ? 'Update Goal' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

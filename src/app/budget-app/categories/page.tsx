'use client';

/**
 * Categories Management Page
 * Create, edit, and manage budget categories
 */

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { db, DEFAULT_CATEGORIES } from '@/lib/budget-db';
import type { Category } from '@/types/budget';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [subcategories, setSubcategories] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('tag');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const cats = await db.categories.toArray();
      setCategories(cats.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function startEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setType(category.type);
    setSubcategories(category.subcategories.join(', '));
    setColor(category.color);
    setIcon(category.icon);
    setShowCreateForm(false);
  }

  function startCreate() {
    setEditingId(null);
    setName('');
    setType('expense');
    setSubcategories('');
    setColor('#3b82f6');
    setIcon('tag');
    setShowCreateForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowCreateForm(false);
    setName('');
    setSubcategories('');
  }

  async function saveCategory() {
    if (!name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const subcatsArray = subcategories
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (editingId) {
        // Update existing
        await db.categories.update(editingId, {
          name: name.trim(),
          type,
          subcategories: subcatsArray,
          color,
          icon,
        });
      } else {
        // Create new
        const newCategory: Category = {
          id: `cat_${Date.now()}`,
          name: name.trim(),
          type,
          subcategories: subcatsArray,
          color,
          icon,
          isDefault: false,
          order: categories.length + 1,
          createdAt: new Date(),
        };
        await db.categories.add(newCategory);
      }

      await loadCategories();
      cancelEdit();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category');
    }
  }

  async function deleteCategory(id: string) {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (category.isDefault) {
      alert('Cannot delete default categories');
      return;
    }

    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    try {
      await db.categories.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">
            Manage your budget categories and subcategories
          </p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingId) && (
        <div className="bg-white rounded-lg shadow p-6 border-2 border-teal-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Category' : 'Create Category'}
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Home Expenses"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    type === 'expense'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    type === 'income'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Subcategories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategories (comma-separated)
              </label>
              <input
                type="text"
                value={subcategories}
                onChange={(e) => setSubcategories(e.target.value)}
                placeholder="e.g., Rent, Maintenance, Insurance"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-300"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCategory}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4 inline mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories found</p>
            <button
              onClick={startCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Your First Category
            </button>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Color indicator */}
                  <div
                    className="w-4 h-4 rounded mt-2 flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{cat.name}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          cat.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cat.type}
                      </span>
                      {cat.isDefault && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          Default
                        </span>
                      )}
                    </div>

                    {cat.subcategories.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {cat.subcategories.join(' • ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!cat.isDefault && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="text-teal-600 hover:text-teal-700"
                      title="Edit" aria-label="Edit category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete" aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <p className="text-sm text-teal-800">
          <strong>Tip:</strong> Default categories cannot be edited or deleted. Create custom
          categories for your specific needs.
        </p>
      </div>
    </div>
  );
}

'use client';

/**
 * Quick Categorize Dialog - Ultra-Modern Command Palette
 * Searchable, keyboard-navigable category selection with explicit save
 */

import { useState, useCallback, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tag, ChevronRight, Check, Loader2 } from 'lucide-react';
import type { Category, Transaction } from '@/types/budget';

interface QuickCategorizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSelect: (category: string, subcategory: string | null) => Promise<void>;
  transaction: Transaction | null;
}

export function QuickCategorizeDialog({
  open,
  onOpenChange,
  categories,
  onSelect,
  transaction,
}: QuickCategorizeDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Clear state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setIsSaving(false);
    }
  }, [open]);

  const handleSelect = useCallback((category: string, subcategory: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedCategory) return;

    setIsSaving(true);
    try {
      await onSelect(selectedCategory, selectedSubcategory);
      // Parent will close dialog after successful save
    } catch (error) {
      console.error('Save failed:', error);
      setIsSaving(false);
    }
  }, [selectedCategory, selectedSubcategory, onSelect]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Add Enter key to save
  useEffect(() => {
    if (!open || !selectedCategory || isSaving) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedCategory, isSaving, handleSave]);

  const isSelected = (category: string, subcategory: string | null) => {
    return selectedCategory === category && selectedSubcategory === subcategory;
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Quick Categorize</DialogTitle>
      <CommandInput
        placeholder="Search categories..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No categories found.</CommandEmpty>

        {categories.map((cat) => (
          <CommandGroup key={cat.id} heading={cat.name}>
            {/* Main category option */}
            <CommandItem
              onSelect={() => handleSelect(cat.name, null)}
              className={`flex items-center gap-2 ${
                isSelected(cat.name, null) ? 'bg-teal-50 text-teal-900' : ''
              }`}
            >
              {isSelected(cat.name, null) ? (
                <Check className="w-4 h-4 text-teal-600" />
              ) : (
                <Tag className="w-4 h-4 text-teal-600" />
              )}
              <span className="font-medium">{cat.name}</span>
              <span className="ml-auto text-xs text-gray-500">General</span>
            </CommandItem>

            {/* Subcategories */}
            {cat.subcategories.map((sub) => (
              <CommandItem
                key={`${cat.id}-${sub}`}
                onSelect={() => handleSelect(cat.name, sub)}
                className={`flex items-center gap-2 pl-6 ${
                  isSelected(cat.name, sub) ? 'bg-teal-50 text-teal-900' : ''
                }`}
              >
                {isSelected(cat.name, sub) ? (
                  <Check className="w-3 h-3 text-teal-600" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
                <span>{sub}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>

      {/* Action buttons footer */}
      <div className="border-t border-gray-200 p-3 flex items-center justify-between bg-gray-50">
        <div className="text-xs text-gray-500">
          {selectedCategory ? (
            <span className="font-medium text-teal-700">
              {selectedCategory}
              {selectedSubcategory && ` - ${selectedSubcategory}`}
            </span>
          ) : (
            <span>Click a category to select</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {selectedCategory && (
            <span className="text-xs text-gray-400">Press ↵ Enter</span>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!selectedCategory || isSaving}
              className="h-8 bg-teal-600 hover:bg-teal-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 mr-1.5" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}

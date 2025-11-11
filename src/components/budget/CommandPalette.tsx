/**
 * Command Palette Component
 * Implements Cmd/Ctrl+K quick launcher pattern (Copilot 4.8/5 competitive benchmark)
 * Features: Navigation, Quick Actions, Theme Switching, Fuzzy Search
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Receipt,
  PieChart,
  CreditCard,
  Wallet,
  Target,
  TrendingUp,
  BarChart3,
  Camera,
  Tags,
  Upload,
  Download,
  Settings,
  Plus,
  Moon,
  Sun,
  MonitorSmartphone,
} from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Cmd/Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((callback: () => void) => {
    setOpen(false);
    callback();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation - Core Tracking */}
        <CommandGroup heading="Tracking & Analysis">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app'))}
          >
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/transactions'))}
          >
            <Receipt className="mr-2 h-4 w-4" />
            <span>Transactions</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/ocr'))}
          >
            <Camera className="mr-2 h-4 w-4" />
            <span>Scan Receipt</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/budgets'))}
          >
            <PieChart className="mr-2 h-4 w-4" />
            <span>Budgets</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/reports'))}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation - Wealth & Planning */}
        <CommandGroup heading="Wealth & Planning">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/loans'))}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Loans</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/investments'))}
          >
            <Wallet className="mr-2 h-4 w-4" />
            <span>Investments</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/planning/future'))}
          >
            <Target className="mr-2 h-4 w-4" />
            <span>Future Plans</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/planning/retirement'))}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Retirement</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Navigation - Tools & Settings */}
        <CommandGroup heading="Tools & Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/categories'))}
          >
            <Tags className="mr-2 h-4 w-4" />
            <span>Categories</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/import'))}
          >
            <Upload className="mr-2 h-4 w-4" />
            <span>Import CSV</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/export'))}
          >
            <Download className="mr-2 h-4 w-4" />
            <span>Export Data</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push('/budget-app/settings'))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => {
              router.push('/budget-app/transactions');
              // Trigger add transaction modal via URL param or event
              setTimeout(() => {
                const addButton = document.querySelector('[aria-label="Add transaction"]') as HTMLButtonElement;
                addButton?.click();
              }, 100);
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add Transaction</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              router.push('/budget-app/budgets');
              // Trigger add budget modal
              setTimeout(() => {
                const addButton = document.querySelector('[aria-label="Create budget"]') as HTMLButtonElement;
                addButton?.click();
              }, 100);
            })}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>New Budget</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Theme Switching */}
        <CommandGroup heading="Appearance">
          <CommandItem
            onSelect={() => runCommand(() => {
              // TODO: Implement theme switching when theme system is added
              console.log('Switch to Light theme');
            })}
          >
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              // TODO: Implement theme switching when theme system is added
              console.log('Switch to Dark theme');
            })}
          >
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => {
              // TODO: Implement theme switching when theme system is added
              console.log('Switch to High-Contrast theme');
            })}
          >
            <MonitorSmartphone className="mr-2 h-4 w-4" />
            <span>High-Contrast Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

'use client';

/**
 * CategoryCombobox Component
 * Searchable, responsive dropdown for category selection
 * Desktop: Popover with search
 * Mobile: Full-screen drawer with search
 */

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CategoryOption {
  value: string;
  label: string;
}

interface CategoryComboboxProps {
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function CategoryCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const selectedOption = options.find((option) => option.value === value);

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn('w-full justify-between', className)}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <OptionsList
            options={options}
            value={value}
            onChange={onChange}
            setOpen={setOpen}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <OptionsList
            options={options}
            value={value}
            onChange={onChange}
            setOpen={setOpen}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface OptionsListProps {
  options: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  setOpen: (open: boolean) => void;
}

function OptionsList({ options, value, onChange, setOpen }: OptionsListProps) {
  return (
    <Command>
      <CommandInput placeholder="Search..." className="h-9" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={(currentValue) => {
                onChange(currentValue === value ? '' : currentValue);
                setOpen(false);
              }}
            >
              {option.label}
              <Check
                className={cn(
                  'ml-auto h-4 w-4',
                  value === option.value ? 'opacity-100' : 'opacity-0'
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

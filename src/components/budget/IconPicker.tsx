"use client";

/**
 * IconPicker Component
 * Searchable icon picker using lucide-react icons
 * Displays grid of popular budget-related icons with search
 */

import { useState, useMemo } from "react";
import {
  Search,
  DollarSign,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Coffee,
  Smartphone,
  Heart,
  GraduationCap,
  Briefcase,
  Plane,
  Film,
  Music,
  Book,
  Zap,
  Droplets,
  Wifi,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Gift,
  Shirt,
  Package,
  Wrench,
  Stethoscope,
  Baby,
  Dog,
  Trees,
  Sparkles,
  Trophy,
  Target,
  Calendar,
  Tag,
  Star,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define available icons with names and categories
const BUDGET_ICONS: Array<{ name: string; Icon: LucideIcon; category: string }> = [
  { name: "dollar-sign", Icon: DollarSign, category: "Finance" },
  { name: "credit-card", Icon: CreditCard, category: "Finance" },
  { name: "piggy-bank", Icon: PiggyBank, category: "Finance" },
  { name: "trending-up", Icon: TrendingUp, category: "Finance" },
  { name: "shopping-cart", Icon: ShoppingCart, category: "Shopping" },
  { name: "package", Icon: Package, category: "Shopping" },
  { name: "shirt", Icon: Shirt, category: "Shopping" },
  { name: "gift", Icon: Gift, category: "Shopping" },
  { name: "home", Icon: Home, category: "Housing" },
  { name: "droplets", Icon: Droplets, category: "Utilities" },
  { name: "zap", Icon: Zap, category: "Utilities" },
  { name: "wifi", Icon: Wifi, category: "Utilities" },
  { name: "car", Icon: Car, category: "Transportation" },
  { name: "plane", Icon: Plane, category: "Transportation" },
  { name: "utensils", Icon: Utensils, category: "Food" },
  { name: "coffee", Icon: Coffee, category: "Food" },
  { name: "smartphone", Icon: Smartphone, category: "Technology" },
  { name: "heart", Icon: Heart, category: "Health" },
  { name: "stethoscope", Icon: Stethoscope, category: "Health" },
  { name: "graduation-cap", Icon: GraduationCap, category: "Education" },
  { name: "book", Icon: Book, category: "Education" },
  { name: "briefcase", Icon: Briefcase, category: "Work" },
  { name: "film", Icon: Film, category: "Entertainment" },
  { name: "music", Icon: Music, category: "Entertainment" },
  { name: "wrench", Icon: Wrench, category: "Maintenance" },
  { name: "baby", Icon: Baby, category: "Family" },
  { name: "dog", Icon: Dog, category: "Pets" },
  { name: "trees", Icon: Trees, category: "Environment" },
  { name: "sparkles", Icon: Sparkles, category: "Miscellaneous" },
  { name: "trophy", Icon: Trophy, category: "Miscellaneous" },
  { name: "target", Icon: Target, category: "Goals" },
  { name: "calendar", Icon: Calendar, category: "Miscellaneous" },
  { name: "tag", Icon: Tag, category: "Miscellaneous" },
  { name: "star", Icon: Star, category: "Miscellaneous" },
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
}

export function IconPicker({ value, onChange, onClose }: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return BUDGET_ICONS;

    return BUDGET_ICONS.filter(
      ({ name, category }) =>
        name.toLowerCase().includes(query) || category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get the current icon component
  const CurrentIcon = BUDGET_ICONS.find((icon) => icon.name === value)?.Icon || Tag;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Choose an Icon</h2>
              <p className="mt-1 text-base text-gray-600">
                Select an icon to represent your category
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close icon picker"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Current Selection */}
          <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-teal-200 bg-teal-50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
              <CurrentIcon className="h-7 w-7 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Current Icon</p>
              <p className="text-base font-bold text-gray-900">{value || "tag"}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-gray-200 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search icons by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-[48px] border-2 border-gray-300 py-3 pl-12 pr-4 text-base focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Icon Grid */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {filteredIcons.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
              {filteredIcons.map(({ name, Icon }) => (
                <button
                  key={name}
                  onClick={() => {
                    onChange(name);
                    onClose();
                  }}
                  className={`flex min-h-[80px] flex-col items-center gap-2 rounded-lg p-3 transition-all hover:bg-gray-100 ${
                    value === name
                      ? "bg-teal-50 ring-2 ring-teal-500 ring-offset-2"
                      : "border-2 border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  title={name}
                  aria-label={`Select ${name} icon`}
                >
                  <Icon
                    className={`h-8 w-8 ${value === name ? "text-teal-600" : "text-gray-600"}`}
                  />
                  {value === name && <Check className="h-4 w-4 text-teal-600" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Search className="mx-auto h-16 w-16 text-gray-400" />
              <p className="mt-4 text-lg font-medium text-gray-900">No icons found</p>
              <p className="mt-2 text-base text-gray-600">
                Try a different search term or browse all icons
              </p>
              <Button onClick={() => setSearchQuery("")} className="mt-4" variant="outline">
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">{BUDGET_ICONS.length} icons available</p>
            <Button onClick={onClose} variant="outline" className="min-h-[48px] px-6">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export icon map for rendering selected icons
export function getIconComponent(iconName: string): LucideIcon {
  return BUDGET_ICONS.find((icon) => icon.name === iconName)?.Icon || Tag;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  Tags,
  PieChart,
  Repeat,
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Calculator,
  Target,
  FlaskConical,
  Upload,
  Settings,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

const allItems: NavItem[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "transactions", href: "/transactions", icon: Receipt },
  { labelKey: "accounts", href: "/accounts", icon: Landmark },
  { labelKey: "categories", href: "/categories", icon: Tags },
  { labelKey: "budgets", href: "/budgets", icon: PieChart },
  { labelKey: "subscriptions", href: "/subscriptions", icon: Repeat },
  { labelKey: "loans", href: "/loans", icon: CreditCard },
  { labelKey: "investments", href: "/investments", icon: Wallet },
  { labelKey: "properties", href: "/properties", icon: Building2 },
  { labelKey: "netWorth", href: "/net-worth", icon: TrendingUp },
  { labelKey: "reports", href: "/reports", icon: BarChart3 },
  { labelKey: "insights", href: "/insights", icon: Lightbulb },
  { labelKey: "calculators", href: "/calculators", icon: Calculator },
  { labelKey: "futurePlans", href: "/planning/future", icon: Target },
  { labelKey: "scenarios", href: "/scenarios", icon: FlaskConical },
  { labelKey: "import", href: "/import", icon: Upload },
  { labelKey: "settings", href: "/settings", icon: Settings },
  { labelKey: "chat", href: "/chat", icon: MessageCircle },
];

interface MobileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSheet({ open, onOpenChange }: MobileSheetProps) {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="text-sm font-semibold">{t("brand")}</SheetTitle>
        </SheetHeader>
        <nav className="overflow-y-auto py-2">
          {allItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive(item.href)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{t(item.labelKey)}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

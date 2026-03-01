"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboardIcon,
  ReceiptIcon,
  LandmarkIcon,
  PieChartIcon,
  TagsIcon,
  RepeatIcon,
  CreditCardIcon,
  WalletIcon,
  Building2Icon,
  TrendingUpIcon,
  BarChart3Icon,
  LightbulbIcon,
  CalculatorIcon,
  TargetIcon,
  FlaskConicalIcon,
  CalendarIcon,
  UsersIcon,
  InboxIcon,
  CameraIcon,
  UploadIcon,
  DownloadIcon,
  SettingsIcon,
  MessageCircleIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  PlusIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavCommand {
  key: string;
  path: string;
  icon: LucideIcon;
}

const NAV_COMMANDS: NavCommand[] = [
  { key: "dashboard", path: "/dashboard", icon: LayoutDashboardIcon },
  { key: "transactions", path: "/transactions", icon: ReceiptIcon },
  { key: "accounts", path: "/accounts", icon: LandmarkIcon },
  { key: "budgets", path: "/budgets", icon: PieChartIcon },
  { key: "categories", path: "/categories", icon: TagsIcon },
  { key: "subscriptions", path: "/subscriptions", icon: RepeatIcon },
  { key: "loans", path: "/loans", icon: CreditCardIcon },
  { key: "investments", path: "/investments", icon: WalletIcon },
  { key: "properties", path: "/properties", icon: Building2Icon },
  { key: "netWorth", path: "/net-worth", icon: TrendingUpIcon },
  { key: "reports", path: "/reports", icon: BarChart3Icon },
  { key: "insights", path: "/insights", icon: LightbulbIcon },
  { key: "calculators", path: "/calculators", icon: CalculatorIcon },
  { key: "futurePlans", path: "/planning/future", icon: TargetIcon },
  { key: "retirement", path: "/planning/retirement", icon: TrendingUpIcon },
  { key: "paycheck", path: "/planning/paycheck", icon: CreditCardIcon },
  { key: "debtPayoff", path: "/debt-payoff", icon: CreditCardIcon },
  { key: "scenarios", path: "/scenarios", icon: FlaskConicalIcon },
  { key: "events", path: "/events", icon: CalendarIcon },
  { key: "splits", path: "/splits", icon: UsersIcon },
  { key: "review", path: "/review", icon: InboxIcon },
  { key: "fridayReview", path: "/friday-review", icon: CalendarIcon },
  { key: "ocr", path: "/ocr", icon: CameraIcon },
  { key: "import", path: "/import", icon: UploadIcon },
  { key: "export", path: "/export", icon: DownloadIcon },
  { key: "settings", path: "/settings", icon: SettingsIcon },
  { key: "chat", path: "/chat", icon: MessageCircleIcon },
];

interface ActionCommand {
  key: string;
  path: string;
  icon: LucideIcon;
}

const ACTION_COMMANDS: ActionCommand[] = [
  {
    key: "addTransaction",
    path: "/transactions?action=add",
    icon: PlusIcon,
  },
  {
    key: "addAccount",
    path: "/accounts?action=add",
    icon: PlusIcon,
  },
  {
    key: "addBudget",
    path: "/budgets?action=add",
    icon: PlusIcon,
  },
  {
    key: "importData",
    path: "/import",
    icon: UploadIcon,
  },
  {
    key: "exportData",
    path: "/export",
    icon: DownloadIcon,
  },
];

interface ThemeCommand {
  key: string;
  value: "light" | "dark" | "system";
  icon: LucideIcon;
}

const THEME_COMMANDS: ThemeCommand[] = [
  { key: "light", value: "light", icon: SunIcon },
  { key: "dark", value: "dark", icon: MoonIcon },
  { key: "system", value: "system", icon: MonitorIcon },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("commandPalette");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("placeholder")}
      description={t("noResults")}
    >
      <CommandInput placeholder={t("placeholder")} />
      <CommandList>
        <CommandEmpty>{t("noResults")}</CommandEmpty>

        {/* Navigation commands */}
        <CommandGroup heading={t("groups.navigation")}>
          {NAV_COMMANDS.map((cmd) => (
            <CommandItem
              key={cmd.key}
              value={t(`commands.${cmd.key}`)}
              onSelect={() => runCommand(() => router.push(cmd.path))}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{t(`commands.${cmd.key}`)}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Action commands */}
        <CommandGroup heading={t("groups.actions")}>
          {ACTION_COMMANDS.map((cmd) => (
            <CommandItem
              key={cmd.key}
              value={t(`actions.${cmd.key}`)}
              onSelect={() => runCommand(() => router.push(cmd.path))}
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{t(`actions.${cmd.key}`)}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Theme commands */}
        <CommandGroup heading={t("groups.theme")}>
          {THEME_COMMANDS.map((cmd) => (
            <CommandItem
              key={cmd.key}
              value={t(`theme.${cmd.key}`)}
              onSelect={() =>
                runCommand(() => {
                  // Theme switching will be wired up when a theme provider is added.
                })
              }
            >
              <cmd.icon className="mr-2 h-4 w-4" />
              <span>{t(`theme.${cmd.key}`)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

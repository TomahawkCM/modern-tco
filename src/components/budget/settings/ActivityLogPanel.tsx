"use client";

/**
 * Activity Log Panel
 * Displays activity history with filtering options
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  History,
  RefreshCw,
  Filter,
  Search,
  Loader2,
  User,
  CreditCard,
  Wallet,
  Tag,
  PiggyBank,
  LogIn,
  LogOut,
  Download,
  Upload,
  Lock,
  ArrowRightLeft,
  Clock,
} from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { getActivityLog, getActivityLogCount, formatActivityEntry } from "@/lib/activity-logger";
import type { ActivityLogEntry, ActivityLogFilter } from "@/types/profile";
import { getProfileInitials } from "@/types/profile";
import { isFeatureEnabled } from "@/config/features";
import { cn } from "@/lib/utils";

const ACTION_ICONS: Record<ActivityLogEntry["action"], React.ReactNode> = {
  create: <span className="text-green-500">+</span>,
  update: <span className="text-blue-500">~</span>,
  delete: <span className="text-red-500">-</span>,
  login: <LogIn className="h-4 w-4 text-green-500" />,
  logout: <LogOut className="h-4 w-4 text-orange-500" />,
  export: <Download className="h-4 w-4 text-blue-500" />,
  import: <Upload className="h-4 w-4 text-purple-500" />,
  pin_change: <Lock className="h-4 w-4 text-yellow-500" />,
  profile_switch: <ArrowRightLeft className="h-4 w-4 text-cyan-500" />,
};

const ENTITY_ICONS: Record<ActivityLogEntry["entityType"], React.ReactNode> = {
  profile: <User className="h-4 w-4" />,
  transaction: <CreditCard className="h-4 w-4" />,
  budget: <PiggyBank className="h-4 w-4" />,
  category: <Tag className="h-4 w-4" />,
  account: <Wallet className="h-4 w-4" />,
  subscription: <Clock className="h-4 w-4" />,
  loan: <CreditCard className="h-4 w-4" />,
  system: <History className="h-4 w-4" />,
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function ActivityLogPanel() {
  const { profiles, currentProfile } = useProfile();
  const [entries, setEntries] = useState<ActivityLogEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [filterProfileId, setFilterProfileId] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [filterEntityType, setFilterEntityType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadEntries = useCallback(async () => {
    try {
      const filter: ActivityLogFilter = {
        limit: 100,
      };

      if (filterProfileId !== "all") {
        filter.profileId = filterProfileId;
      }

      if (filterAction !== "all") {
        filter.action = filterAction as ActivityLogEntry["action"];
      }

      if (filterEntityType !== "all") {
        filter.entityType = filterEntityType as ActivityLogEntry["entityType"];
      }

      const [fetchedEntries, count] = await Promise.all([
        getActivityLog(filter),
        getActivityLogCount(filterProfileId !== "all" ? filterProfileId : undefined),
      ]);

      // Client-side search filtering
      let filtered = fetchedEntries;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = fetchedEntries.filter(
          (entry) =>
            entry.profileName.toLowerCase().includes(term) ||
            entry.entityName?.toLowerCase().includes(term) ||
            formatActivityEntry(entry).toLowerCase().includes(term)
        );
      }

      setEntries(filtered);
      setTotalCount(count);
    } catch (error) {
      console.error("[ActivityLogPanel] Error loading entries:", error);
    }
  }, [filterProfileId, filterAction, filterEntityType, searchTerm]);

  useEffect(() => {
    setIsLoading(true);
    loadEntries().finally(() => setIsLoading(false));
  }, [loadEntries]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadEntries();
    setIsRefreshing(false);
  };

  if (!isFeatureEnabled("activityLogging")) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Log
          </CardTitle>
          <CardDescription>Activity logging is not enabled.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription>
              Track changes made by all profiles ({totalCount} total entries)
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>

          <Select value={filterProfileId} onValueChange={setFilterProfileId}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All profiles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All profiles</SelectItem>
              {profiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="update">Updated</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="import">Import</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterEntityType} onValueChange={setFilterEntityType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="transaction">Transactions</SelectItem>
              <SelectItem value="budget">Budgets</SelectItem>
              <SelectItem value="account">Accounts</SelectItem>
              <SelectItem value="category">Categories</SelectItem>
              <SelectItem value="profile">Profiles</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Separator />

        {/* Activity List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <History className="mb-2 h-12 w-12 opacity-50" />
              <p>No activity found</p>
              {(filterProfileId !== "all" ||
                filterAction !== "all" ||
                filterEntityType !== "all" ||
                searchTerm) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setFilterProfileId("all");
                    setFilterAction("all");
                    setFilterEntityType("all");
                    setSearchTerm("");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => {
                const profile = profiles.find((p) => p.id === entry.profileId);

                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    {/* Profile Avatar */}
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback
                        style={{
                          backgroundColor: profile?.avatarColor || "#6b7280",
                        }}
                        className="text-xs text-white"
                      >
                        {getProfileInitials(entry.profileName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{formatActivityEntry(entry)}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ENTITY_ICONS[entry.entityType]}
                          <span className="ml-1">{entry.entityType}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Action Icon */}
                    <div className="flex-shrink-0">{ACTION_ICONS[entry.action]}</div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

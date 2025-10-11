'use client';

/**
 * Flashcard Library Component
 *
 * Browse and study curated flashcard library (500+ cards).
 * Separate from user-created flashcards, but integrates with unified review queue.
 *
 * FEATURES:
 * - Browse library by domain, difficulty, tags
 * - View progress on each card
 * - Start review sessions from library
 * - Statistics and analytics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
  FlashcardLibraryWithProgress,
  LibraryFlashcardStats,
  FlashcardLibraryDomain,
  FlashcardLibraryDifficulty,
} from '@/types/flashcard-library';
import {
  getLibraryFlashcardsWithProgress,
  getLibraryFlashcardStats,
} from '@/lib/flashcard-library-service';

interface FlashcardLibraryProps {
  userId: string;
  onStartReview?: (cardIds: string[]) => void;
}

export default function FlashcardLibrary({ userId, onStartReview }: FlashcardLibraryProps) {
  const [flashcards, setFlashcards] = useState<FlashcardLibraryWithProgress[]>([]);
  const [stats, setStats] = useState<LibraryFlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDomain, setSelectedDomain] = useState<FlashcardLibraryDomain | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    FlashcardLibraryDifficulty | 'all'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyDue, setShowOnlyDue] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);

  // Load data
  useEffect(() => {
    loadFlashcardsAndStats();
  }, [userId, selectedDomain, selectedDifficulty, searchQuery, showOnlyDue, showOnlyNew]);

  async function loadFlashcardsAndStats() {
    setLoading(true);

    const filters = {
      domains: selectedDomain !== 'all' ? [selectedDomain] : undefined,
      difficulty: selectedDifficulty !== 'all' ? [selectedDifficulty] : undefined,
      searchQuery: searchQuery || undefined,
      showOnlyDue,
      showOnlyNew,
      userId,
      limit: 50,
    };

    const [flashcardsData, statsData] = await Promise.all([
      getLibraryFlashcardsWithProgress(userId, filters),
      getLibraryFlashcardStats(userId),
    ]);

    setFlashcards(flashcardsData);
    setStats(statsData);
    setLoading(false);
  }

  const dueFlashcards = flashcards.filter((f) => f.isDue);
  const newFlashcards = flashcards.filter((f) => f.isNew);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Library Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLibraryCards || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.cardsStarted || 0} started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.cardsDueToday || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.newCardsDueToday || 0} new cards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#22c55e]">
              {stats?.overallAccuracy || 0}%
            </div>
            <Progress value={stats?.overallAccuracy || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.currentStreak || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {stats?.longestStreak || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Library</TabsTrigger>
          <TabsTrigger value="review">Start Review ({dueFlashcards.length})</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        {/* Browse Tab */}
        <TabsContent value="browse" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search flashcards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Domain Filter */}
                <Select
                  value={selectedDomain}
                  onValueChange={(value) => setSelectedDomain(value as FlashcardLibraryDomain | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    <SelectItem value="asking_questions">Asking Questions (22%)</SelectItem>
                    <SelectItem value="refining_targeting">Refining & Targeting (23%)</SelectItem>
                    <SelectItem value="taking_action">Taking Action (15%)</SelectItem>
                    <SelectItem value="navigation">Navigation (23%)</SelectItem>
                    <SelectItem value="reporting">Reporting (17%)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Difficulty Filter */}
                <Select
                  value={selectedDifficulty}
                  onValueChange={(value) =>
                    setSelectedDifficulty(value as FlashcardLibraryDifficulty | 'all')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Button
                    variant={showOnlyDue ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowOnlyDue(!showOnlyDue)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Due Only
                  </Button>
                  <Button
                    variant={showOnlyNew ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowOnlyNew(!showOnlyNew)}
                  >
                    <Brain className="h-4 w-4 mr-1" />
                    New Only
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flashcard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Loading flashcards...
              </div>
            ) : flashcards.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No flashcards found. Try adjusting your filters.
              </div>
            ) : (
              flashcards.map((item) => (
                <Card key={item.card.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm line-clamp-2">
                          {item.card.front}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {item.card.domain.replace(/_/g, ' ')}
                        </CardDescription>
                      </div>
                      <div className="ml-2">
                        {item.isNew ? (
                          <Circle className="h-5 w-5 text-primary" />
                        ) : item.isDue ? (
                          <Clock className="h-5 w-5 text-orange-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {/* Difficulty Badge */}
                    <div className="flex gap-2">
                      <Badge variant={item.card.difficulty === 'hard' ? 'destructive' : 'secondary'}>
                        {item.card.difficulty || 'medium'}
                      </Badge>
                      {item.isNew && <Badge variant="outline">New</Badge>}
                      {item.isDue && !item.isNew && (
                        <Badge variant="outline" className="text-orange-600">
                          Due
                        </Badge>
                      )}
                    </div>

                    {/* Progress Info */}
                    {item.progress && (
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Accuracy:</span>
                          <span className="font-medium">{item.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Streak:</span>
                          <span className="font-medium">{item.progress.streak}</span>
                        </div>
                        {!item.isDue && (
                          <div className="flex justify-between">
                            <span>Next review:</span>
                            <span className="font-medium">
                              {item.daysUntilReview! > 0
                                ? `${item.daysUntilReview} days`
                                : 'Today'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Start Review Session</CardTitle>
              <CardDescription>
                Review {dueFlashcards.length} cards due today ({newFlashcards.length} new)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dueFlashcards.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-[#22c55e] mx-auto mb-4" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No flashcards due for review today. Great job!
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{dueFlashcards.length}</div>
                      <div className="text-sm text-muted-foreground">Cards Due</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{newFlashcards.length}</div>
                      <div className="text-sm text-muted-foreground">New Cards</div>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      const cardIds = dueFlashcards.map((f) => f.card.id);
                      onStartReview?.(cardIds);
                    }}
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Start Review Session
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          {/* Domain Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Progress by Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.domainStats.map((domainStat) => (
                <div key={domainStat.domain} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">
                      {domainStat.domain.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">
                      {domainStat.started}/{domainStat.total} cards • {domainStat.accuracy}%
                      accuracy
                    </span>
                  </div>
                  <Progress
                    value={(domainStat.started / domainStat.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Difficulty Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Progress by Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.difficultyStats.map((difficultyStat) => (
                <div key={difficultyStat.difficulty} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{difficultyStat.difficulty}</span>
                    <span className="text-muted-foreground">
                      {difficultyStat.started}/{difficultyStat.total} cards •{' '}
                      {difficultyStat.accuracy}% accuracy
                    </span>
                  </div>
                  <Progress
                    value={(difficultyStat.started / difficultyStat.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

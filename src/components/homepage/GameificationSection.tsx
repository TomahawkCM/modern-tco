"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Crown,
  Flame,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const achievements = [
  {
    id: "first-steps",
    title: "First Steps",
    description: "Complete your first TCO module",
    icon: BookOpen,
    tier: "Bronze",
    points: 100,
    progress: 100,
    unlocked: true,
    rarity: "Common",
  },
  {
    id: "question-master",
    title: "Question Master",
    description: "Create 50 advanced Tanium questions",
    icon: Target,
    tier: "Silver",
    points: 500,
    progress: 72,
    unlocked: false,
    rarity: "Rare",
  },
  {
    id: "lab-champion",
    title: "Lab Champion",
    description: "Complete all hands-on labs with perfect scores",
    icon: Trophy,
    tier: "Gold",
    points: 1000,
    progress: 45,
    unlocked: false,
    rarity: "Epic",
  },
  {
    id: "speed-runner",
    title: "Speed Runner",
    description: "Complete any domain in under 4 hours",
    icon: Zap,
    tier: "Platinum",
    points: 1500,
    progress: 0,
    unlocked: false,
    rarity: "Legendary",
  },
];

const leaderboard = [
  { rank: 1, name: "Alex Chen", points: 12450, avatar: "AC", streak: 28, level: 42 },
  { rank: 2, name: "Sarah Kim", points: 11800, avatar: "SK", streak: 25, level: 40 },
  { rank: 3, name: "Mike Rodriguez", points: 10950, avatar: "MR", streak: 22, level: 38 },
  { rank: 4, name: "You", points: 8750, avatar: "YO", streak: 15, level: 32 },
  { rank: 5, name: "David Park", points: 8200, avatar: "DP", streak: 18, level: 31 },
];

const studyStreak = {
  current: 15,
  longest: 28,
  target: 30,
};

export function GameificationSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const getRarityVariant = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "outline";
      case "Rare":
        return "secondary";
      case "Epic":
        return "default";
      case "Legendary":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="bg-secondary/30 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge variant="outline" className="mb-4">
            <Trophy className="mr-2 h-3.5 w-3.5 text-primary" />
            Gamified Learning
          </Badge>
          <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
            Level Up Your Skills
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Earn points, unlock achievements, and compete with peers as you master the TCO
            certification. Our gamified approach makes learning engaging and tracks your progress in
            real-time.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Study Streak & Progress */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Streak</CardTitle>
                    <CardDescription>Keep the momentum going!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Streak */}
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-foreground">
                    {studyStreak.current}
                  </div>
                  <div className="text-sm text-muted-foreground">Days in a row</div>
                </div>

                {/* Streak Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Goal: {studyStreak.target} days</span>
                    <span className="font-medium text-primary">
                      {Math.round((studyStreak.current / studyStreak.target) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(studyStreak.current / studyStreak.target) * 100}
                    className="h-2"
                    aria-label={`Study streak progress: ${Math.round((studyStreak.current / studyStreak.target) * 100)}%`}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{studyStreak.longest}</div>
                    <div className="text-xs text-muted-foreground">Longest Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">8.7k</div>
                    <div className="text-xs text-muted-foreground">Total XP</div>
                  </div>
                </div>

                {/* Streak Bonus */}
                <div className="rounded-lg border bg-secondary/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      Streak Bonus Active!
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Earning 2x XP for all activities
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Achievements</CardTitle>
                      <CardDescription>Unlock badges as you progress</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80"
                    asChild
                  >
                    <Link href="/achievements">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`rounded-lg border p-4 transition-all ${
                        achievement.unlocked
                          ? "border-primary/20 bg-secondary/30"
                          : "border-border bg-card opacity-60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                            achievement.unlocked
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          <achievement.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <div className="truncate font-medium text-foreground">
                              {achievement.title}
                            </div>
                            {achievement.unlocked && (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                            )}
                          </div>
                          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                            {achievement.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <Badge
                              variant={getRarityVariant(achievement.rarity) as any}
                              className="px-1.5 py-0 text-[10px]"
                            >
                              {achievement.rarity}
                            </Badge>
                            <div className="text-xs font-medium text-muted-foreground">
                              +{achievement.points} XP
                            </div>
                          </div>

                          {!achievement.unlocked && achievement.progress > 0 && (
                            <div className="mt-2">
                              <Progress
                                value={achievement.progress}
                                className="h-1"
                                aria-label={`${achievement.title} achievement progress: ${achievement.progress}% complete`}
                              />
                              <div className="mt-1 text-right text-[10px] text-muted-foreground">
                                {achievement.progress}%
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Community Leaderboard</CardTitle>
                      <CardDescription>See how you rank among peers</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Weekly Rankings</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                        user.name === "You"
                          ? "border border-primary/20 bg-primary/5"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex h-8 w-8 items-center justify-center">
                        {user.rank <= 3 ? (
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              user.rank === 1
                                ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : user.rank === 2
                                  ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                  : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                            }`}
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <span className="font-medium text-muted-foreground">#{user.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-medium text-foreground">
                        {user.avatar}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${user.name === "You" ? "text-primary" : "text-foreground"}`}
                          >
                            {user.name}
                          </span>
                          <Badge variant="outline" className="h-5 px-1.5 py-0 text-[10px]">
                            Lvl {user.level}
                          </Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{user.points.toLocaleString()} XP</span>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            <span>{user.streak} day streak</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      {user.name !== "You" && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          <Users className="mr-2 h-3 w-3" />
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Leaderboard CTA */}
                <div className="mt-6 border-t pt-4 text-center">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Join study groups to climb the rankings faster!
                  </p>
                  <Button variant="outline" className="text-primary hover:text-primary/80" asChild>
                    <Link href="/community">
                      <Users className="mr-2 h-4 w-4" />
                      Join Community
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

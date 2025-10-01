"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Medal,
  Star,
  Zap,
  Crown,
  Target,
  Flame,
  Award,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze":
        return "from-amber-600 to-yellow-600";
      case "Silver":
        return "from-slate-400 to-slate-600";
      case "Gold":
        return "from-yellow-400 to-yellow-600";
      case "Platinum":
        return "from-cyan-400 to-blue-600";
      default:
        return "from-slate-500 to-slate-700";
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Common":
        return "text-slate-400 border-slate-500/30";
      case "Rare":
        return "text-blue-400 border-blue-500/30";
      case "Epic":
        return "text-purple-400 border-purple-500/30";
      case "Legendary":
        return "text-yellow-400 border-yellow-500/30";
      default:
        return "text-slate-400 border-slate-500/30";
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-red-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-teal-500",
      "from-purple-500 to-indigo-500",
      "from-yellow-500 to-orange-500",
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div className="bg-gradient-to-b from-transparent to-slate-900/20 px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
            <Trophy className="mr-2 h-4 w-4" />
            Gamified Learning
          </Badge>
          <h2 className="mb-6 bg-gradient-to-r from-yellow-200 via-cyan-100 to-purple-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Level Up Your Skills
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-300">
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
            <Card variant="cyberpunk" className="h-full">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Study Streak</CardTitle>
                    <CardDescription>Keep the momentum going!</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Streak */}
                <div className="text-center">
                  <div className="mb-2 text-4xl font-bold text-orange-400">
                    {studyStreak.current}
                  </div>
                  <div className="text-sm text-slate-400">Days in a row</div>
                </div>

                {/* Streak Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Goal: {studyStreak.target} days</span>
                    <span className="text-orange-400">
                      {Math.round((studyStreak.current / studyStreak.target) * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={(studyStreak.current / studyStreak.target) * 100}
                    className="h-3"
                    aria-label={`Study streak progress: ${Math.round((studyStreak.current / studyStreak.target) * 100)}%`}
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-400">{studyStreak.longest}</div>
                    <div className="text-xs text-slate-400">Longest Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">8.7k</div>
                    <div className="text-xs text-slate-400">Total XP</div>
                  </div>
                </div>

                {/* Streak Bonus */}
                <div className="rounded-lg border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">
                      Streak Bonus Active!
                    </span>
                  </div>
                  <div className="text-xs text-slate-300">Earning 2x XP for all activities</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card variant="cyberpunk" className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Achievements</CardTitle>
                      <CardDescription>Unlock badges as you progress</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/50 text-cyan-300"
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
                      className={`rounded-lg border p-4 transition-all duration-300 ${
                        achievement.unlocked
                          ? "border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-purple-900/20"
                          : "border-slate-700/50 bg-slate-800/30 opacity-75"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-12 w-12 rounded-lg bg-gradient-to-br ${getTierColor(achievement.tier)} flex flex-shrink-0 items-center justify-center`}
                        >
                          <achievement.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="truncate font-medium text-white">{achievement.title}</h4>
                            {achievement.unlocked && (
                              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-400" />
                            )}
                          </div>
                          <p className="mb-2 text-xs text-slate-400">{achievement.description}</p>

                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getRarityColor(achievement.rarity)}`}
                            >
                              {achievement.rarity}
                            </Badge>
                            <div className="text-xs font-medium text-yellow-400">
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
                              <div className="mt-1 text-xs text-slate-400">
                                {achievement.progress}% complete
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
            <Card variant="cyberpunk">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-500">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Community Leaderboard</CardTitle>
                      <CardDescription>See how you rank among peers</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                    Weekly Rankings
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-4 rounded-lg p-4 transition-all duration-300 ${
                        user.name === "You"
                          ? "border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                          : "bg-slate-800/30 hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex h-8 w-8 items-center justify-center">
                        {user.rank <= 3 ? (
                          <div
                            className={`h-6 w-6 rounded-full bg-gradient-to-br ${
                              user.rank === 1
                                ? "from-yellow-400 to-yellow-600"
                                : user.rank === 2
                                  ? "from-slate-400 to-slate-600"
                                  : "from-amber-600 to-yellow-600"
                            } flex items-center justify-center`}
                          >
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <span className="font-medium text-slate-400">#{user.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`h-10 w-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center`}
                      >
                        <span className="text-sm font-semibold text-white">{user.avatar}</span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${user.name === "You" ? "text-cyan-300" : "text-white"}`}
                          >
                            {user.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-slate-600 bg-slate-700/50 text-xs text-slate-300"
                          >
                            Level {user.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{user.points.toLocaleString()} XP</span>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-400" />
                            <span>{user.streak} day streak</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      {user.name !== "You" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Leaderboard CTA */}
                <div className="mt-6 border-t border-slate-700/50 pt-4 text-center">
                  <p className="mb-3 text-sm text-slate-400">
                    Join study groups to climb the rankings faster!
                  </p>
                  <Button
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                    asChild
                  >
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

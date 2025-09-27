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
  ArrowRight
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
    rarity: "Common"
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
    rarity: "Rare"
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
    rarity: "Epic"
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
    rarity: "Legendary"
  }
];

const leaderboard = [
  { rank: 1, name: "Alex Chen", points: 12450, avatar: "AC", streak: 28, level: 42 },
  { rank: 2, name: "Sarah Kim", points: 11800, avatar: "SK", streak: 25, level: 40 },
  { rank: 3, name: "Mike Rodriguez", points: 10950, avatar: "MR", streak: 22, level: 38 },
  { rank: 4, name: "You", points: 8750, avatar: "YO", streak: 15, level: 32 },
  { rank: 5, name: "David Park", points: 8200, avatar: "DP", streak: 18, level: 31 }
];

const studyStreak = {
  current: 15,
  longest: 28,
  target: 30
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
      "from-yellow-500 to-orange-500"
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div className="py-16 px-4 bg-gradient-to-b from-transparent to-slate-900/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
            <Trophy className="w-4 h-4 mr-2" />
            Gamified Learning
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-200 via-cyan-100 to-purple-200 bg-clip-text text-transparent">
            Level Up Your Skills
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Earn points, unlock achievements, and compete with peers as you master the TCO certification. 
            Our gamified approach makes learning engaging and tracks your progress in real-time.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Study Streak & Progress */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card variant="cyberpunk" className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
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
                  <div className="text-4xl font-bold text-orange-400 mb-2">
                    {studyStreak.current}
                  </div>
                  <div className="text-sm text-slate-400">Days in a row</div>
                </div>

                {/* Streak Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Goal: {studyStreak.target} days</span>
                    <span className="text-orange-400">{Math.round((studyStreak.current / studyStreak.target) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(studyStreak.current / studyStreak.target) * 100} 
                    className="h-3"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
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
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-400">Streak Bonus Active!</span>
                  </div>
                  <div className="text-xs text-slate-300">
                    Earning 2x XP for all activities
                  </div>
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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Achievements</CardTitle>
                      <CardDescription>Unlock badges as you progress</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-cyan-500/50 text-cyan-300" asChild>
                    <Link href="/achievements">
                      View All
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border transition-all duration-300 ${
                        achievement.unlocked
                          ? "bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-cyan-500/30"
                          : "bg-slate-800/30 border-slate-700/50 opacity-75"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTierColor(achievement.tier)} flex items-center justify-center flex-shrink-0`}>
                          <achievement.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white truncate">{achievement.title}</h4>
                            {achievement.unlocked && (
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{achievement.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                            <div className="text-xs text-yellow-400 font-medium">
                              +{achievement.points} XP
                            </div>
                          </div>

                          {!achievement.unlocked && achievement.progress > 0 && (
                            <div className="mt-2">
                              <Progress value={achievement.progress} className="h-1" />
                              <div className="text-xs text-slate-400 mt-1">
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
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
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
                      className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                        user.name === "You"
                          ? "bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30"
                          : "bg-slate-800/30 hover:bg-slate-800/50"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-8 h-8">
                        {user.rank <= 3 ? (
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                            user.rank === 1 ? "from-yellow-400 to-yellow-600" :
                            user.rank === 2 ? "from-slate-400 to-slate-600" :
                            "from-amber-600 to-yellow-600"
                          } flex items-center justify-center`}>
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">#{user.rank}</span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center`}>
                        <span className="text-white font-semibold text-sm">{user.avatar}</span>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${user.name === "You" ? "text-cyan-300" : "text-white"}`}>
                            {user.name}
                          </span>
                          <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600">
                            Level {user.level}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{user.points.toLocaleString()} XP</span>
                          <div className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-400" />
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
                          <Users className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Leaderboard CTA */}
                <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
                  <p className="text-sm text-slate-400 mb-3">
                    Join study groups to climb the rankings faster!
                  </p>
                  <Button
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10"
                    asChild
                  >
                    <Link href="/community">
                      <Users className="w-4 h-4 mr-2" />
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
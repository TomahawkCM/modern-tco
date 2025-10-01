"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Target,
  BookOpen,
  Clock,
  TrendingUp,
  Award,
  Settings,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name ?? "TCO Student",
    email: user?.email ?? "student@example.com",
    bio: "Preparing for Tanium Certified Operator certification",
    joinDate: "2024-01-15",
    studyStreak: 7,
    totalScore: 78,
    questionsCompleted: 156,
    studyTimeHours: 42,
  });

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save profile data to database
    console.log("Profile updated:", profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any unsaved changes
  };

  const achievements = [
    {
      name: "First Steps",
      description: "Completed first practice session",
      icon: Trophy,
      earned: true,
    },
    { name: "Week Warrior", description: "7-day study streak", icon: Calendar, earned: true },
    { name: "Question Master", description: "Answered 100+ questions", icon: Target, earned: true },
    {
      name: "Domain Expert",
      description: "Mastered a certification domain",
      icon: Award,
      earned: false,
    },
    { name: "Mock Master", description: "Passed a mock exam", icon: BookOpen, earned: false },
  ];

  const studyStats = [
    {
      label: "Current Streak",
      value: profileData.studyStreak,
      unit: "days",
      icon: Clock,
      color: "text-orange-400",
    },
    {
      label: "Average Score",
      value: profileData.totalScore,
      unit: "%",
      icon: TrendingUp,
      color: "text-green-400",
    },
    {
      label: "Questions Completed",
      value: profileData.questionsCompleted,
      unit: "",
      icon: Target,
      color: "text-blue-400",
    },
    {
      label: "Study Time",
      value: profileData.studyTimeHours,
      unit: "hrs",
      icon: BookOpen,
      color: "text-cyan-400",
    },
  ];

  return (
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">User Profile</h1>
          <p className="mb-6 text-xl text-gray-200">
            Track your progress and manage your study profile
          </p>
        </div>

        {/* Profile Card */}
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              {isEditing ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit Profile
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tanium-accent">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-white">Name</Label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="glass border-white/20 text-white"
                      />
                    ) : (
                      <p className="text-gray-200">{profileData.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <p className="flex items-center gap-2 text-gray-200">
                      <Mail className="h-4 w-4" />
                      {profileData.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="glass border-white/20 text-white"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-200">{profileData.bio}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="h-4 w-4" />
                  Joined{" "}
                  {new Date(profileData.joinDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Study Statistics */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              Study Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {studyStats.map((stat, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 text-center"
                >
                  <stat.icon className={cn("mx-auto mb-2 h-8 w-8", stat.color)} />
                  <div className="mb-1 text-2xl font-bold text-white">
                    {stat.value}
                    {stat.unit}
                  </div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center rounded-lg border p-4",
                    achievement.earned
                      ? "border-tanium-accent/30 bg-white/5 text-white"
                      : "border-white/10 bg-white/[0.02] text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "mr-4 flex h-12 w-12 items-center justify-center rounded-lg",
                      achievement.earned ? "bg-tanium-accent/20" : "bg-white/5"
                    )}
                  >
                    <achievement.icon
                      className={cn(
                        "h-6 w-6",
                        achievement.earned ? "text-tanium-accent" : "text-gray-400"
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium">{achievement.name}</h3>
                      {achievement.earned && (
                        <Badge
                          variant="secondary"
                          className="border-tanium-accent/30 bg-tanium-accent/20 text-tanium-accent"
                        >
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm opacity-80">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            onClick={() => router.push("/settings")}
            className="bg-tanium-accent text-white hover:bg-blue-600"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Settings
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
  );
}

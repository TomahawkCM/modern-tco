"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  getUserProfile,
  getUserStats,
  getUserAchievements,
  updateUserProfile,
} from "@/lib/profileService";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "Preparing for Tanium Certified Operator certification",
    joinDate: "",
    studyStreak: 0,
    totalScore: 0,
    questionsCompleted: 0,
    studyTimeHours: 0,
  });
  const [achievements, setAchievements] = useState<any[]>([]);

  // Fetch user profile and stats on mount
  useEffect(() => {
    async function fetchProfileData() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile
        const profile = await getUserProfile(user.id);

        // Fetch stats
        const stats = await getUserStats(user.id);

        // Fetch achievements
        const userAchievements = await getUserAchievements(user.id);

        setProfileData({
          name: profile?.name || user.user_metadata?.name || "TCO Student",
          email: profile?.email || user.email || "",
          bio: "Preparing for Tanium Certified Operator certification",
          joinDate: profile?.created_at || new Date().toISOString(),
          studyStreak: stats.studyStreak,
          totalScore: stats.totalScore,
          questionsCompleted: stats.questionsCompleted,
          studyTimeHours: stats.studyTimeHours,
        });

        setAchievements(userAchievements);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error loading profile",
          description: "Could not load your profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      const result = await updateUserProfile(user.id, {
        name: profileData.name,
        bio: profileData.bio,
      });

      if (result.success) {
        setIsEditing(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        toast({
          title: "Update failed",
          description: result.error || "Could not update profile.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload original data
    if (user?.id) {
      getUserProfile(user.id).then((profile) => {
        if (profile) {
          setProfileData((prev) => ({
            ...prev,
            name: profile.name || user.user_metadata?.name || "TCO Student",
          }));
        }
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Map icon names to components
  const iconMap: { [key: string]: any } = {
    Trophy,
    Calendar,
    Target,
    Award,
    BookOpen,
  };

  const achievementComponents = achievements.map((a) => ({
    ...a,
    icon: iconMap[a.icon] || Trophy,
  }));

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
      color: "text-[#22c55e]",
    },
    {
      label: "Questions Completed",
      value: profileData.questionsCompleted,
      unit: "",
      icon: Target,
      color: "text-primary",
    },
    {
      label: "Study Time",
      value: profileData.studyTimeHours,
      unit: "hrs",
      icon: BookOpen,
      color: "text-primary",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">User Profile</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Track your progress and manage your study profile
        </p>
      </div>

      {/* Profile Card */}
      <Card className="glass border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="border-white/20 text-foreground hover:bg-white/10"
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
            <div className="bg-tanium-accent flex h-16 w-16 items-center justify-center rounded-full">
              <User className="h-8 w-8 text-foreground" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground">Name</Label>
                  {isEditing ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="glass border-white/20 text-foreground"
                    />
                  ) : (
                    <p className="text-muted-foreground">{profileData.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Email</Label>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {profileData.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="glass border-white/20 text-foreground"
                    rows={3}
                  />
                ) : (
                  <p className="text-muted-foreground">{profileData.bio}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                className="border-white/20 text-foreground hover:bg-white/10"
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
          <CardTitle className="flex items-center gap-2 text-foreground">
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
                <div className="mb-1 text-2xl font-bold text-foreground">
                  {stat.value}
                  {stat.unit}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {achievementComponents.map((achievement, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center rounded-lg border p-4",
                  achievement.earned
                    ? "border-tanium-accent/30 bg-white/5 text-foreground"
                    : "border-white/10 bg-white/[0.02] text-muted-foreground"
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
                      achievement.earned ? "text-tanium-accent" : "text-muted-foreground"
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
          className="bg-tanium-accent text-foreground hover:bg-blue-600"
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage Settings
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="border-white/20 text-foreground hover:bg-white/10"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

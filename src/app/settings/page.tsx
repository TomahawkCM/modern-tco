'use client';

import {
  Bell,
  BookOpen,
  Mail,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Settings state
  const [settings, setSettings] = useState({
    // Account
    email: user?.email ?? '',
    name: user?.user_metadata?.name ?? '',

    // Notifications
    emailNotifications: true,
    studyReminders: true,
    achievementAlerts: true,
    weeklyProgress: true,

    // Appearance
    theme: 'dark',
    largeText: false,
    highContrast: false,
    reducedMotion: false,

    // Study Preferences
    questionsPerSession: '20',
    studyMode: 'adaptive',
    showExplanations: true,
    autoAdvance: false,

    // Privacy
    shareProgress: false,
    publicProfile: false,
  });

  const handleSave = async () => {
    // TODO: Save settings to Supabase user_settings table
    console.log('Saving settings:', settings);

    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const handleReset = () => {
    toast({
      title: 'Settings reset',
      description: 'All settings have been reset to default values.',
      variant: 'destructive',
    });
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      // TODO: Implement account deletion
      console.log('Delete account requested');
      toast({
        title: 'Account deletion requested',
        description: 'Your account will be deleted within 24 hours.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Settings & Preferences
        </h1>
        <p className="text-muted-foreground mt-2">Customize your TCO exam preparation experience</p>
      </div>

      {/* Account Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Manage your account details and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                className="glass border-white/20 text-foreground"
                disabled
              />
              <p className="text-xs text-muted-foreground">Contact support to change your email</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Display Name
              </Label>
              <Input
                id="name"
                type="text"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="glass border-white/20 text-foreground"
                placeholder="Your name"
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="border-white/20 text-foreground hover:bg-white/10"
            >
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="border-white/20 text-foreground hover:bg-white/10"
            >
              <Mail className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what updates you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Study Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Daily reminders to maintain your streak
              </p>
            </div>
            <Switch
              checked={settings.studyReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, studyReminders: checked })}
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Achievement Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when you earn badges</p>
            </div>
            <Switch
              checked={settings.achievementAlerts}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, achievementAlerts: checked })
              }
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Weekly Progress Report</Label>
              <p className="text-sm text-muted-foreground">
                Summary of your weekly learning progress
              </p>
            </div>
            <Switch
              checked={settings.weeklyProgress}
              onCheckedChange={(checked) => setSettings({ ...settings, weeklyProgress: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance & Accessibility
          </CardTitle>
          <CardDescription>Customize how the platform looks and feels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-foreground">
              Theme
            </Label>
            <Select
              value={settings.theme}
              onValueChange={(value) => setSettings({ ...settings, theme: value })}
            >
              <SelectTrigger className="glass border-white/20 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark Mode</SelectItem>
                <SelectItem value="light">Light Mode</SelectItem>
                <SelectItem value="auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Large Text</Label>
              <p className="text-sm text-muted-foreground">
                Increase font size for better readability
              </p>
            </div>
            <Switch
              checked={settings.largeText}
              onCheckedChange={(checked) => setSettings({ ...settings, largeText: checked })}
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Enhance contrast for better visibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => setSettings({ ...settings, highContrast: checked })}
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => setSettings({ ...settings, reducedMotion: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Study Preferences */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Preferences
          </CardTitle>
          <CardDescription>Customize your learning experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionsPerSession" className="text-foreground">
                Questions Per Session
              </Label>
              <Select
                value={settings.questionsPerSession}
                onValueChange={(value) => setSettings({ ...settings, questionsPerSession: value })}
              >
                <SelectTrigger className="glass border-white/20 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                  <SelectItem value="30">30 questions</SelectItem>
                  <SelectItem value="50">50 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyMode" className="text-foreground">
                Study Mode
              </Label>
              <Select
                value={settings.studyMode}
                onValueChange={(value) => setSettings({ ...settings, studyMode: value })}
              >
                <SelectTrigger className="glass border-white/20 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                  <SelectItem value="linear">Linear Progression</SelectItem>
                  <SelectItem value="random">Random Practice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Show Explanations</Label>
              <p className="text-sm text-muted-foreground">
                Display detailed explanations after each question
              </p>
            </div>
            <Switch
              checked={settings.showExplanations}
              onCheckedChange={(checked) => setSettings({ ...settings, showExplanations: checked })}
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Auto-Advance</Label>
              <p className="text-sm text-muted-foreground">
                Automatically move to next question after answering
              </p>
            </div>
            <Switch
              checked={settings.autoAdvance}
              onCheckedChange={(checked) => setSettings({ ...settings, autoAdvance: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data
          </CardTitle>
          <CardDescription>Control your data and privacy preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Share Progress</Label>
              <p className="text-sm text-muted-foreground">
                Allow instructors to view your progress
              </p>
            </div>
            <Switch
              checked={settings.shareProgress}
              onCheckedChange={(checked) => setSettings({ ...settings, shareProgress: checked })}
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-foreground">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your achievements visible to other learners
              </p>
            </div>
            <Switch
              checked={settings.publicProfile}
              onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
            />
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <Label className="text-foreground">Account Management</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Permanently delete your account and all associated data
            </p>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-white/20 text-foreground hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-white/20 text-foreground hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-tanium-accent text-foreground hover:bg-blue-600"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

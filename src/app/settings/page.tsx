"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  User,
  Bell,
  Palette,
  Clock,
  BookOpen,
  Shield,
  Database,
  Download,
  Upload,
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";
import { useEffect, useState } from "react";
import { analytics } from "@/lib/analytics";
import { ResetProgressDialog } from "@/components/settings/ResetProgressDialog";
import { useModules } from "@/contexts/ModuleContext";
import { useProgress } from "@/contexts/ProgressContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { state, updateSetting, resetSettings, exportSettings } = useSettings();
  const { resetProgress: resetModuleProgress } = useModules();
  const { state: progressState } = useProgress();
  const { clearAllAnswers } = useIncorrectAnswers();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showResetDialog, setShowResetDialog] = useState(false);
  // Accessibility local controls (mirror header toggles)
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      setLargeText(localStorage.getItem("tco-large-text") === "1");
      setHighContrast(localStorage.getItem("tco-high-contrast") === "1");
    } catch {}
  }, []);

  function applyLargeText(on: boolean) {
    const html = document.documentElement;
    if (on) {
      html.style.fontSize = "18px";
      html.setAttribute("data-large-text", "1");
    } else {
      html.style.fontSize = "";
      html.removeAttribute("data-large-text");
    }
    try { localStorage.setItem("tco-large-text", on ? "1" : "0"); } catch {}
    analytics.capture("a11y_large_text_toggle", { enabled: on });
  }

  function applyHighContrast(on: boolean) {
    const html = document.documentElement;
    if (on) html.setAttribute("data-high-contrast", "1");
    else html.removeAttribute("data-high-contrast");
    try { localStorage.setItem("tco-high-contrast", on ? "1" : "0"); } catch {}
    analytics.capture("a11y_high_contrast_toggle", { enabled: on });
  }

  // Show loading state if settings are not yet loaded
  if (state.isLoading || !state.settings) {
    return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
            <p className="text-white/70">Loading settings...</p>
          </div>
        </div>
    );
  }

  const handleSave = async () => {
    setSaveStatus("saving");
    // Settings are auto-saved, so just show the saved status
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaveStatus("saved");

    // Clear saved status after 2 seconds
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  const handleReset = () => {
    resetSettings();
    setSaveStatus("idle");
  };

  return (
        <div className="mx-auto max-w-4xl space-y-8">
        {/* Accessibility */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Large text</div>
                <div className="text-sm text-gray-300">Increase base font size for better readability</div>
              </div>
              <Switch
                checked={largeText}
                onCheckedChange={(v) => { setLargeText(v); applyLargeText(v); }}
                aria-label="Toggle large text"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">High contrast</div>
                <div className="text-sm text-gray-300">Boost contrast for low-vision accessibility</div>
              </div>
              <Switch
                checked={highContrast}
                onCheckedChange={(v) => { setHighContrast(v); applyHighContrast(v); }}
                aria-label="Toggle high contrast"
              />
            </div>
          </CardContent>
        </Card>
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Settings</h1>
          <p className="mb-6 text-xl text-gray-200">
            Customize your study experience and preferences
          </p>
        </div>

        {/* Save status */}
        {saveStatus === "saved" && (
          <Alert className="border-green-200 bg-green-50/10 dark:border-green-800 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              Settings are automatically saved!
            </AlertDescription>
          </Alert>
        )}

        {state.isLoading && (
          <Alert className="border-blue-200 bg-blue-50/10 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-400" />
            <AlertDescription className="text-blue-200">Loading settings...</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="glass grid w-full grid-cols-5 border border-white/10">
            <TabsTrigger
              value="general"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <User className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="study" className="text-white data-[state=active]:bg-tanium-accent">
              <BookOpen className="mr-2 h-4 w-4" />
              Study
            </TabsTrigger>
            <TabsTrigger value="exam" className="text-white data-[state=active]:bg-tanium-accent">
              <Clock className="mr-2 h-4 w-4" />
              Exam
            </TabsTrigger>
            <TabsTrigger
              value="accessibility"
              className="text-white data-[state=active]:bg-tanium-accent"
            >
              <Shield className="mr-2 h-4 w-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="data" className="text-white data-[state=active]:bg-tanium-accent">
              <Database className="mr-2 h-4 w-4" />
              Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <Select
                    value={state.settings.theme}
                    onValueChange={(value) =>
                      updateSetting("theme", value as "dark" | "light" | "system")
                    }
                  >
                    <SelectTrigger className="glass border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Enable Notifications</Label>
                    <div className="text-sm text-gray-400">
                      Get notified about study reminders and achievements
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.notifications}
                    onCheckedChange={(checked) => updateSetting("notifications", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Sound Effects</Label>
                    <div className="text-sm text-gray-400">
                      Play sounds for interactions and feedback
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="study" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  Practice Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Practice Mode</Label>
                  <Select
                    value={state.settings.practiceMode}
                    onValueChange={(value) =>
                      updateSetting("practiceMode", value as "adaptive" | "random" | "sequential")
                    }
                  >
                    <SelectTrigger className="glass border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/20">
                      <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                      <SelectItem value="random">Random Questions</SelectItem>
                      <SelectItem value="sequential">Sequential Order</SelectItem>
                      <SelectItem value="weakness">Focus on Weak Areas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Show Explanations</Label>
                    <div className="text-sm text-gray-400">
                      Display explanations after answering questions
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.showExplanations}
                    onCheckedChange={(checked) => updateSetting("showExplanations", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Auto-Advance</Label>
                    <div className="text-sm text-gray-400">
                      Automatically move to next question after answering
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.autoAdvance}
                    onCheckedChange={(checked) => updateSetting("autoAdvance", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Study Reminders</Label>
                    <div className="text-sm text-gray-400">
                      Get daily reminders to maintain your study streak
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.studyReminders}
                    onCheckedChange={(checked) => updateSetting("studyReminders", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exam" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5" />
                  Exam Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Timer Visible</Label>
                    <div className="text-sm text-gray-400">
                      Show countdown timer during practice
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.timerVisible}
                    onCheckedChange={(checked) => updateSetting("timerVisible", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Strict Timing</Label>
                    <div className="text-sm text-gray-400">Enforce time limits in mock exams</div>
                  </div>
                  <Switch
                    checked={state.settings.strictTiming}
                    onCheckedChange={(checked) => updateSetting("strictTiming", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Randomize Questions</Label>
                    <div className="text-sm text-gray-400">Present questions in random order</div>
                  </div>
                  <Switch
                    checked={state.settings.randomizeQuestions}
                    onCheckedChange={(checked) => updateSetting("randomizeQuestions", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Randomize Answers</Label>
                    <div className="text-sm text-gray-400">Shuffle answer choices</div>
                  </div>
                  <Switch
                    checked={state.settings.randomizeAnswers}
                    onCheckedChange={(checked) => updateSetting("randomizeAnswers", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5" />
                  Accessibility Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">High Contrast</Label>
                    <div className="text-sm text-gray-400">
                      Increase contrast for better visibility
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.highContrast}
                    onCheckedChange={(checked) => updateSetting("highContrast", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Large Text</Label>
                    <div className="text-sm text-gray-400">
                      Increase font size for better readability
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.largeText}
                    onCheckedChange={(checked) => updateSetting("largeText", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Screen Reader Support</Label>
                    <div className="text-sm text-gray-400">Enhanced support for screen readers</div>
                  </div>
                  <Switch
                    checked={state.settings.screenReader}
                    onCheckedChange={(checked) => updateSetting("screenReader", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Keyboard Navigation</Label>
                    <div className="text-sm text-gray-400">Enable full keyboard navigation</div>
                  </div>
                  <Switch
                    checked={state.settings.keyboardNav}
                    onCheckedChange={(checked) => updateSetting("keyboardNav", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Database className="h-5 w-5" />
                  Data & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Track Progress</Label>
                    <div className="text-sm text-gray-400">Store your study progress locally</div>
                  </div>
                  <Switch
                    checked={state.settings.trackProgress}
                    onCheckedChange={(checked) => updateSetting("trackProgress", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Detailed Statistics</Label>
                    <div className="text-sm text-gray-400">
                      Collect detailed performance analytics
                    </div>
                  </div>
                  <Switch
                    checked={state.settings.detailedStats}
                    onCheckedChange={(checked) => updateSetting("detailedStats", checked)}
                  />
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-4">
                  <h3 className="font-medium text-white">Data Management</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button
                      variant="outline"
                      onClick={exportSettings}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                    <Button
                      variant="outline"
                      disabled
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Danger Zone</h3>
                    <Alert className="border-yellow-200 bg-yellow-50/10">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription>
                        Resetting progress will permanently delete all your study data, including module progress, quiz scores, and practice history.
                      </AlertDescription>
                    </Alert>
                    <Button
                      variant="destructive"
                      onClick={() => setShowResetDialog(true)}
                      className="w-full"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Reset All Progress
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>

          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={cn(
              "bg-tanium-accent hover:bg-blue-600",
              saveStatus === "saved" && "bg-green-600 hover:bg-green-700"
            )}
          >
            {saveStatus === "saving" && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
            )}
            {saveStatus === "saved" ? (
              <CheckCircle className="mr-2 h-4 w-4" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {saveStatus === "saving"
              ? "Confirming..."
              : saveStatus === "saved"
                ? "Auto-Save Active!"
                : "Confirm Settings"}
          </Button>
        </div>

        <ResetProgressDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          onConfirm={() => {
            // Reset all progress data
            resetModuleProgress();
            clearAllAnswers();
            // Optionally reset other contexts
            analytics.capture("progress_reset", {
              timestamp: new Date().toISOString()
            });
          }}
        />
      </div>

  );
}

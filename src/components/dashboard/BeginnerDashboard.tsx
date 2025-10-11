"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Phase0Foundation from "@/components/study-modules/Phase0Foundation";
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  Zap,
  Star,
  CheckCircle,
  Brain,
  Lightbulb,
  Heart,
  Rocket,
} from "lucide-react";

interface BeginnerDashboardProps {
  studyProgress?: number;
  onProgressUpdate?: (progress: number) => void;
}

export function BeginnerDashboard({ 
  studyProgress = 0, 
  onProgressUpdate 
}: BeginnerDashboardProps) {
  const router = useRouter();
  const [hasCompletedFoundation, setHasCompletedFoundation] = useState(false);
  const [foundationProgress, setFoundationProgress] = useState(0);
  const [showFoundation, setShowFoundation] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const foundationCompleted = localStorage.getItem('tanium-foundation-completed') === 'true';
    const foundationProgressStored = localStorage.getItem('tanium-foundation-progress');
    
    setHasCompletedFoundation(foundationCompleted);
    if (foundationProgressStored) {
      setFoundationProgress(parseInt(foundationProgressStored, 10));
    }
    
    // Show foundation if not completed
    if (!foundationCompleted) {
      setShowFoundation(true);
    }
  }, []);

  // Handle foundation completion
  const handleFoundationComplete = () => {
    setHasCompletedFoundation(true);
    setFoundationProgress(100);
    localStorage.setItem('tanium-foundation-completed', 'true');
    localStorage.setItem('tanium-foundation-progress', '100');
    onProgressUpdate?.(25); // Foundation is 25% of overall progress
  };

  // Beginner-specific motivational messages
  const motivationalMessages = [
    { icon: Heart, text: "Every expert was once a beginner. You're on the right path!", color: "text-pink-400" },
    { icon: Star, text: "Small daily progress leads to stunning results over time.", color: "text-[#f97316]" },
    { icon: Lightbulb, text: "Understanding comes with practice. Be patient with yourself!", color: "text-primary" },
    { icon: Rocket, text: "Your future self will thank you for starting this journey today.", color: "text-primary" },
  ];

  const [currentMessage] = useState(() => 
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  );

  return (
    <div className="space-y-8">
      {/* Beginner Welcome & Motivation */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Trophy className="h-8 w-8 text-[#f97316]" />
          <h1 className="text-4xl font-bold text-foreground">Your Tanium Learning Journey</h1>
        </div>
        
        <div className="mb-6 mx-auto max-w-2xl">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <currentMessage.icon className={`h-6 w-6 ${currentMessage.color}`} />
            <p className="text-xl text-muted-foreground">{currentMessage.text}</p>
          </div>
          
          {!hasCompletedFoundation ? (
            <p className="text-lg text-muted-foreground">
              Let's start with the fundamentals - no prior Tanium knowledge required!
            </p>
          ) : (
            <p className="text-lg text-green-200">
              Great job completing the foundation! You're ready for more advanced topics.
            </p>
          )}
        </div>
      </div>

      {/* Foundation Module - Priority for Beginners */}
      {!hasCompletedFoundation && showFoundation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <Brain className="mr-3 h-7 w-7 text-primary" />
              Foundation: Start Here (Required)
            </h2>
            <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/30">
              Step 1 of 4
            </Badge>
          </div>
          
          <Phase0Foundation 
            onModuleComplete={(moduleId) => {
              handleFoundationComplete();
              setFoundationProgress(prev => prev + 25); // Increment progress
              localStorage.setItem('tanium-foundation-progress', (foundationProgress + 25).toString());
            }}
            onMilestoneAchieved={(milestoneId) => {
              console.log('Milestone achieved:', milestoneId);
            }}
          />
        </div>
      )}

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Foundation Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground mb-2">{foundationProgress}%</div>
            <Progress value={foundationProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {foundationProgress === 100 ? 'Complete! 🎉' : `${Math.floor(foundationProgress / 20)} of 5 modules`}
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Study Streak</CardTitle>
            <Clock className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1</div>
            <p className="text-xs text-muted-foreground">day so far</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Level</CardTitle>
            <Target className="h-4 w-4 text-[#22c55e]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Building</div>
            <p className="text-xs text-muted-foreground">Growing stronger daily</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Next Milestone</CardTitle>
            <Star className="h-4 w-4 text-[#f97316]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">75%</div>
            <p className="text-xs text-muted-foreground">to first badge</p>
          </CardContent>
        </Card>
      </div>

      {/* Beginner Learning Path */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Rocket className="mr-3 h-7 w-7 text-primary" />
          Your Learning Path
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Foundation Module */}
          <Card className={`glass cursor-pointer border-white/10 transition-all hover:border-white/20 ${
            hasCompletedFoundation ? 'border-[#22c55e]/30' : 'border-primary/30'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`rounded-lg p-2 ${
                    hasCompletedFoundation ? 'bg-[#22c55e]' : 'bg-primary'
                  }`}>
                    {hasCompletedFoundation ? (
                      <CheckCircle className="h-6 w-6 text-foreground" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-foreground" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-foreground text-lg">Foundation</CardTitle>
                    <p className="text-sm text-muted-foreground">85 minutes • 5 modules</p>
                  </div>
                </div>
                <Badge variant={hasCompletedFoundation ? "outline" : "default"} 
                       className={hasCompletedFoundation ? "text-[#22c55e] border-green-400" : "bg-blue-600"}>Step 1</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Learn Tanium basics from scratch. Perfect for complete beginners with zero prior knowledge.
              </p>
              <Button
                className={`w-full ${
                  hasCompletedFoundation 
                    ? 'bg-[#22c55e] hover:bg-green-700' 
                    : 'bg-tanium-accent hover:bg-blue-600'
                }`}
                onClick={() => setShowFoundation(!showFoundation)}
              >
                {hasCompletedFoundation ? (
                  <>Review Foundation</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4" />Start Learning</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Practice Questions */}
          <Card className={`glass cursor-pointer border-white/10 transition-all hover:border-white/20 ${
            hasCompletedFoundation ? 'opacity-100' : 'opacity-50'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-[#22c55e] p-2">
                    <Zap className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground text-lg">Practice Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">Interactive learning</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[#22c55e] border-green-400">Step 2</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Apply your foundation knowledge with guided practice questions and instant feedback.
              </p>
              <Button
                className="w-full bg-[#22c55e] hover:bg-green-700"
                disabled={!hasCompletedFoundation}
                onClick={() => router.push("/practice")}
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
            </CardContent>
          </Card>

          {/* Hands-On Labs */}
          <Card className="glass cursor-pointer border-white/10 transition-all hover:border-white/20 opacity-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-lg bg-cyan-500 p-2">
                    <Target className="h-6 w-6 text-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground text-lg">Hands-On Labs</CardTitle>
                    <p className="text-sm text-muted-foreground">Real Tanium scenarios</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-primary border-cyan-400">Step 3</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Practice with simulated Tanium console environments and real-world scenarios.
              </p>
              <Button
                className="w-full bg-primary hover:bg-cyan-700"
                disabled
              >
                <Target className="mr-2 h-4 w-4" />
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Encouragement & Tips */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-[#f97316]" />
              Beginner Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <span>Take your time - there's no rush. Understanding is more important than speed.</span>
              </li>
              <li className="flex items-start space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <span>Don't skip the foundation module - it makes everything else much easier.</span>
              </li>
              <li className="flex items-start space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                <span>Ask yourself "why" when reading explanations - deep understanding helps retention.</span>
              </li>
              <li className="flex items-start space-x-2 text-muted-foreground">
                <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                <span>Celebrate small wins - completing each module is a real achievement!</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center">
              <Heart className="mr-2 h-5 w-5 text-pink-400" />
              You've Got This!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Remember, every Tanium expert started exactly where you are now. The fact that you're here, 
                ready to learn, shows you have what it takes to succeed.
              </p>
              <div className="bg-gradient-to-r from-pink-500/20 to-primary/20 rounded-lg p-4 border border-pink-500/30">
                <p className="text-pink-100 text-sm font-medium">
                  "The expert in anything was once a beginner who never gave up." 
                  <br />
                  <span className="text-xs text-pink-200">- You're building expertise one day at a time!</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "./app-header";
import { Sidebar } from "./sidebar";
import { BreadcrumbNav } from "./breadcrumb-nav";
import NavigationHelper from "@/components/navigation/NavigationHelper";
import BeginnerModeToggle from "@/components/navigation/BeginnerModeToggle";
import ConfidenceBuilder from "@/components/confidence/ConfidenceBuilder";

interface BeginnerLayoutProps {
  children: React.ReactNode;
}

export function BeginnerLayout({ children }: BeginnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBeginnerMode, setIsBeginnerMode] = useState(true);
  const [currentConfidence, setCurrentConfidence] = useState<'building' | 'growing' | 'strong' | 'expert'>('building');
  const [studyProgress, setStudyProgress] = useState(0);
  const [showConfidenceBuilder, setShowConfidenceBuilder] = useState(false);

  // Initialize beginner mode and progress from localStorage
  useEffect(() => {
    const beginnerModeStored = localStorage.getItem('tanium-beginner-mode');
    const confidenceStored = localStorage.getItem('tanium-confidence-level');
    const progressStored = localStorage.getItem('tanium-study-progress');
    
    if (beginnerModeStored !== null) {
      setIsBeginnerMode(JSON.parse(beginnerModeStored));
    }
    
    if (confidenceStored) {
      setCurrentConfidence(confidenceStored as 'building' | 'growing' | 'strong' | 'expert');
    }
    
    if (progressStored) {
      setStudyProgress(parseInt(progressStored, 10));
    }

    // Show confidence builder for new beginners
    const isFirstVisit = localStorage.getItem('tanium-first-visit') === null;
    if (isFirstVisit) {
      setShowConfidenceBuilder(true);
      localStorage.setItem('tanium-first-visit', 'false');
    }
  }, []);

  // Handle beginner mode toggle
  const handleBeginnerModeChange = (enabled: boolean) => {
    setIsBeginnerMode(enabled);
    localStorage.setItem('tanium-beginner-mode', JSON.stringify(enabled));
  };

  // Handle confidence boost
  const handleBoostConfidence = () => {
    const confidenceLevels: Array<'building' | 'growing' | 'strong' | 'expert'> = 
      ['building', 'growing', 'strong', 'expert'];
    const currentIndex = confidenceLevels.indexOf(currentConfidence);
    if (currentIndex < confidenceLevels.length - 1) {
      const newLevel = confidenceLevels[currentIndex + 1];
      setCurrentConfidence(newLevel);
      localStorage.setItem('tanium-confidence-level', newLevel);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tanium-dark via-tanium-secondary to-tanium-primary relative">
      {/* Beginner Mode Toggle - Fixed Position */}
      <div className="fixed top-20 right-4 z-40">
        <BeginnerModeToggle 
          defaultEnabled={isBeginnerMode}
          onToggle={handleBeginnerModeChange}
        />
      </div>

      {/* Header */}
      <AppHeader onMenuClick={() => setSidebarOpen(true)} currentScore={78} studyStreak={7} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Confidence Builder - Only show in beginner mode */}
      {isBeginnerMode && (
        <div className="fixed top-32 right-4 z-30 max-w-sm">
          <ConfidenceBuilder
            currentConfidence={currentConfidence}
            studyProgress={studyProgress}
            showEncouragement={showConfidenceBuilder}
            onBoostConfidence={handleBoostConfidence}
          />
        </div>
      )}

      {/* Navigation Helper - Only show in beginner mode */}
      {isBeginnerMode && (
        <NavigationHelper />
      )}

      {/* Main content */}
      <main
        id="main-content"
        className={`min-h-[calc(100vh-4rem)] transition-all duration-300 ${
          isBeginnerMode ? 'md:ml-64 mr-4' : 'md:ml-64'
        }`}
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <div className="container mx-auto px-4 py-8">
          {/* Beginner-friendly breadcrumb with extra context */}
          <BreadcrumbNav 
            className={`mb-6 ${isBeginnerMode ? 'bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10' : ''}`}
          />
          
          {/* Beginner Welcome Message */}
          {isBeginnerMode && studyProgress < 10 && (
            <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 p-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">👋</div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Welcome to Your Tanium Journey!
                  </h3>
                  <p className="text-blue-100 mb-4">
                    You're about to master one of the most powerful endpoint management platforms in the world. 
                    Don't worry if you're completely new to Tanium - we'll guide you every step of the way.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">
                      🎯 No prior experience required
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">
                      📚 Step-by-step learning
                    </div>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">
                      🏆 Certification-focused
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {children}
        </div>
      </main>
    </div>
  );
}
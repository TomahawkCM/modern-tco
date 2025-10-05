"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Users, Trophy, BookOpen, Target, Clock, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  // HYDRATION FIX: mounted state prevents React Error #418
  // See HYDRATION_FIX_SUMMARY.md for details
  // Without this, server renders different time-based text than client, causing mismatch
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [typedText, setTypedText] = useState("");
  const fullText = "WELCOME TO YOUR TCO MASTERY JOURNEY";

  useEffect(() => {
    setMounted(true); // Mark as client-side, enables time-based greeting
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let index = 0;
    const typeTimer = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeTimer);
      }
    }, 80);
    return () => clearInterval(typeTimer);
  }, []);

  // HYDRATION FIX: Returns consistent "Welcome" during SSR, then updates to time-based greeting
  // This prevents server/client text mismatch that caused React Error #418
  const getGreeting = () => {
    if (!mounted) return "Welcome"; // Consistent text for SSR/hydration
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Greeting Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <Badge 
            variant="secondary" 
            className="px-4 py-2 text-sm bg-cyan-500/10 border-cyan-500/20 text-cyan-300 backdrop-blur-md"
          >
            <Star className="w-4 h-4 mr-2" />
            {getGreeting()}, Future TCO Expert
          </Badge>
        </motion.div>

        {/* Main Hero Title with Typing Effect */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight"
        >
          {typedText}
          <motion.span
            className="inline-block w-1 h-16 bg-cyan-400 ml-2"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed"
        >
          Master the{" "}
          <span className="text-cyan-400 font-semibold">Tanium Certified Operator</span>{" "}
          certification with our AI-powered learning platform. Join{" "}
          <span className="text-purple-400 font-semibold">thousands of professionals</span>{" "}
          who've accelerated their cybersecurity careers.
        </motion.p>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mb-10"
        >
          {[
            { icon: Users, label: "10,000+", sublabel: "Students" },
            { icon: Trophy, label: "95%", sublabel: "Pass Rate" },
            { icon: Clock, label: "30 Days", sublabel: "Avg Prep Time" },
            { icon: Target, label: "5 Domains", sublabel: "Covered" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30">
                <stat.icon className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.label}</div>
              <div className="text-sm text-slate-400">{stat.sublabel}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-2xl shadow-cyan-500/25 transition-all duration-300"
            >
              <Link href="/study">
                <BookOpen className="w-5 h-5 mr-2" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-4 border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 backdrop-blur-md transition-all duration-300"
              asChild
            >
              <Link href="/demo">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-12 pt-8 border-t border-slate-700/50"
        >
          <p className="text-sm text-slate-400 mb-4">Trusted by professionals at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["Microsoft", "IBM", "Cisco", "Amazon", "Google"].map((company) => (
              <div
                key={company}
                className="text-slate-500 font-semibold text-lg tracking-wider"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-cyan-500/50 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-cyan-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
}
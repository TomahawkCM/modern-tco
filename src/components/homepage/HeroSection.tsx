"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, Play, Star, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [typedText, setTypedText] = useState("");
  const fullText = "WELCOME TO YOUR TCO MASTERY JOURNEY";

  useEffect(() => {
    setMounted(true);
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

  const getGreeting = () => {
    if (!mounted) return "Welcome";
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-background">
      <motion.div
        className="relative z-10 mx-auto max-w-5xl px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Greeting Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Badge
            variant="secondary"
            className="border-primary/20 bg-secondary px-4 py-1.5 text-sm font-medium text-primary"
          >
            <Star className="mr-2 h-3.5 w-3.5 fill-primary" />
            {getGreeting()}, Future TCO Expert
          </Badge>
        </motion.div>

        {/* Main Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl"
        >
          {typedText}
          <motion.span
            className="ml-2 inline-block h-12 w-1 bg-primary align-middle md:h-16"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-muted-foreground"
        >
          Master the{" "}
          <span className="font-semibold text-foreground">Tanium Certified Operator</span>{" "}
          certification with our AI-powered learning platform. Join thousands of professionals
          who've accelerated their cybersecurity careers.
        </motion.p>

        {/* Key Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-12 flex flex-wrap justify-center gap-8 md:gap-12"
        >
          {[
            { icon: Users, label: "10,000+", sublabel: "Students" },
            { icon: Trophy, label: "95%", sublabel: "Pass Rate" },
            { icon: Clock, label: "30 Days", sublabel: "Avg Prep Time" },
            { icon: Target, label: "5 Domains", sublabel: "Covered" },
          ].map((stat, index) => (
            <div key={index} className="group text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-xl font-bold text-foreground">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
            </div>
          ))}
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="btn-press bg-primary px-8 py-6 text-lg text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <Link href="/study">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="btn-press border-2 px-8 py-6 text-lg transition-all hover:bg-secondary"
            asChild
          >
            <Link href="/demo">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

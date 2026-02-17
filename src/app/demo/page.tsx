"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle,
  Gamepad2,
  GraduationCap,
  Play,
  Shield,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const platformFeatures = [
  {
    title: "AI-Powered Study Plans",
    description:
      "Our adaptive learning engine analyzes your strengths and weaknesses, creating personalized study plans that evolve as you progress through the material.",
    icon: Brain,
    highlights: ["Adaptive difficulty", "Personalized pacing", "Weakness targeting"],
  },
  {
    title: "5 Comprehensive Domains",
    description:
      "Full coverage of all TCO exam domains — Questions & Sensors, Computer Group Targeting, Actions & Packages, Console Navigation, and Reporting & Analytics.",
    icon: Target,
    highlights: ["22-23% exam weight each", "Hands-on labs", "Real-world scenarios"],
  },
  {
    title: "Spaced Repetition System",
    description:
      "Scientifically proven memory retention techniques ensure you remember what you learn. Our SRS algorithm schedules reviews at optimal intervals.",
    icon: Sparkles,
    highlights: ["Optimal review timing", "Long-term retention", "Smart flashcards"],
  },
  {
    title: "Mock Exam Simulator",
    description:
      "Practice with realistic exam conditions. Timed tests, randomized questions, and detailed performance analytics prepare you for the real thing.",
    icon: GraduationCap,
    highlights: ["Realistic conditions", "Detailed analytics", "Domain breakdown"],
  },
  {
    title: "Gamified Learning",
    description:
      "Earn XP, unlock achievements, maintain study streaks, and compete on leaderboards. Learning is more effective when it's engaging.",
    icon: Gamepad2,
    highlights: ["Achievements & badges", "Study streaks", "Community leaderboard"],
  },
  {
    title: "Video Lessons",
    description:
      "Expert-led video content for each module breaks down complex topics into digestible segments with hands-on demonstrations.",
    icon: Play,
    highlights: ["Expert instructors", "Hands-on demos", "Progress tracking"],
  },
];

const stats = [
  { value: "10,000+", label: "Students Enrolled", icon: Users },
  { value: "95%", label: "Pass Rate", icon: Trophy },
  { value: "5", label: "Exam Domains Covered", icon: Target },
  { value: "45+", label: "Hands-On Labs", icon: Zap },
];

const steps = [
  {
    step: 1,
    title: "Take the Assessment",
    description: "Start with a quick diagnostic to identify your current knowledge level across all five TCO domains.",
  },
  {
    step: 2,
    title: "Follow Your Custom Path",
    description: "Get a personalized study plan that prioritizes your weakest areas and adapts as you improve.",
  },
  {
    step: 3,
    title: "Practice & Review",
    description: "Complete labs, flashcards, and quizzes. Our spaced repetition system ensures long-term retention.",
  },
  {
    step: 4,
    title: "Simulate the Exam",
    description: "Take full-length mock exams under realistic conditions to build confidence and identify remaining gaps.",
  },
];

export default function DemoPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4 py-16">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <Badge variant="secondary" className="border-primary/20 bg-secondary px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="mr-2 h-3.5 w-3.5" />
              Platform Walkthrough
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl"
          >
            See How the TCO Platform Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground"
          >
            Explore the features that help thousands of professionals pass the Tanium Certified Operator
            exam on their first attempt.
          </motion.p>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="border-y bg-secondary/30 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
              Platform Features
            </Badge>
            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need to Pass
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
              A comprehensive learning platform built specifically for the Tanium Certified Operator
              certification, combining proven study methods with modern technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full transition-all hover:border-primary/50 hover:shadow-md">
                  <CardHeader className="pb-4">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg text-foreground transition-colors group-hover:text-primary">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, hIndex) => (
                        <div key={hIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-primary" />
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-secondary/30 px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <Badge variant="outline" className="mb-4">
              <BarChart3 className="mr-2 h-3.5 w-3.5 text-primary" />
              How It Works
            </Badge>
            <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
              Your Path to Certification
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Four simple steps from sign-up to certification. Our structured approach removes the
              guesswork from exam preparation.
            </p>
          </motion.div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="transition-all hover:border-primary/50">
                  <CardContent className="flex items-start gap-6 p-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                      <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Card className="border-dashed bg-secondary/30 p-8">
            <div className="mb-4 flex items-center justify-center">
              <BookOpen className="mr-3 h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Ready to Get Started?</h3>
            </div>
            <p className="mx-auto mb-8 max-w-xl leading-relaxed text-muted-foreground">
              Join thousands of professionals who have already passed the TCO exam using our platform.
              Start with a free assessment to see where you stand.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                <Link href="/assessment">
                  Take Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-background hover:bg-secondary" asChild>
                <Link href="/study">Browse Study Material</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

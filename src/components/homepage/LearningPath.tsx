"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Target,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Star,
} from "lucide-react";
import Link from "next/link";

const tcoDomains = [
  {
    id: "questions",
    title: "Questions & Sensors",
    description: "Master the art of querying endpoints and gathering intelligence",
    weight: "22%",
    icon: Target,
    color: "from-blue-500 to-primary",
    skills: ["Question syntax", "Sensor deployment", "Data collection", "Performance optimization"],
    estimatedTime: "6-8 hours",
    difficulty: "Beginner",
    labs: 8,
    progress: 0,
  },
  {
    id: "targeting",
    title: "Computer Group Targeting",
    description: "Learn to precisely target endpoints for maximum operational efficiency",
    weight: "23%",
    icon: Users,
    color: "from-primary to-teal-500",
    skills: ["Group creation", "Dynamic targeting", "Filter logic", "Saved question groups"],
    estimatedTime: "7-9 hours",
    difficulty: "Intermediate",
    labs: 12,
    progress: 0,
  },
  {
    id: "actions",
    title: "Actions & Packages",
    description: "Deploy solutions and remediate issues across your infrastructure",
    weight: "15%",
    icon: Zap,
    color: "from-teal-500 to-green-500",
    skills: ["Action deployment", "Package creation", "Content management", "Approval workflows"],
    estimatedTime: "5-7 hours",
    difficulty: "Intermediate",
    labs: 10,
    progress: 0,
  },
  {
    id: "navigation",
    title: "Console Navigation",
    description: "Navigate the Tanium Console like a pro and maximize productivity",
    weight: "23%",
    icon: Shield,
    color: "from-green-500 to-emerald-500",
    skills: ["Interface mastery", "Workflow optimization", "Keyboard shortcuts", "Customization"],
    estimatedTime: "4-6 hours",
    difficulty: "Beginner",
    labs: 6,
    progress: 0,
  },
  {
    id: "reporting",
    title: "Reporting & Analytics",
    description: "Generate insights and reports that drive strategic decisions",
    weight: "17%",
    icon: BarChart3,
    color: "from-emerald-500 to-blue-500",
    skills: ["Report creation", "Dashboard design", "Data visualization", "Scheduled reports"],
    estimatedTime: "5-7 hours",
    difficulty: "Advanced",
    labs: 9,
    progress: 0,
  },
];

export function LearningPath() {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30";
      case "Intermediate":
        return "bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30";
      case "Advanced":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/20 text-muted-foreground border-slate-500/30";
    }
  };

  return (
    <div className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 border-accent/20 bg-accent/10 text-accent-foreground">
            <Star className="mr-2 h-4 w-4" />
            AI-Powered Learning Path
          </Badge>
          <h2 className="mb-6 bg-gradient-to-r from-white via-primary to-purple-200 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Master All 5 TCO Domains
          </h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-muted-foreground">
            Our comprehensive curriculum covers every aspect of the Tanium Certified Operator exam.
            Each domain is carefully structured with hands-on labs, real-world scenarios, and expert
            guidance.
          </p>
        </motion.div>

        {/* Learning Path Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {tcoDomains.map((domain, index) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                variant="cyberpunk"
                className="group h-full cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <CardHeader className="pb-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div
                      className={`h-12 w-12 rounded-lg bg-gradient-to-br ${domain.color} flex items-center justify-center`}
                    >
                      <domain.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <Badge className={getDifficultyColor(domain.difficulty)}>
                      {domain.difficulty}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl text-foreground transition-colors group-hover:text-primary">
                    {domain.title}
                  </CardTitle>

                  <CardDescription className="leading-relaxed text-muted-foreground">
                    {domain.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Exam Weight */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Exam Weight</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {domain.weight}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-muted-foreground">{domain.progress}%</span>
                    </div>
                    <Progress
                      value={domain.progress}
                      className="h-2"
                      aria-label={`${domain.title} domain progress: ${domain.progress}% complete`}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {domain.estimatedTime}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      {domain.labs} Labs
                    </div>
                  </div>

                  {/* Key Skills */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Key Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {domain.skills.slice(0, 2).map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="outline"
                          className="border-border bg-card/50 text-xs text-muted-foreground"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {domain.skills.length > 2 && (
                        <Badge
                          variant="outline"
                          className="border-border bg-card/50 text-xs text-muted-foreground"
                        >
                          +{domain.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    className="mt-4 w-full border border-primary/30 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-primary transition-all duration-300 hover:from-cyan-600/30 hover:to-blue-600/30"
                    variant="outline"
                  >
                    <Link href={`/study/domains/${domain.id}`}>
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Learning Path CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <Card
            variant="cyberpunk"
            className="mx-auto max-w-2xl bg-gradient-to-br from-purple-900/20 to-cyan-900/20 p-8"
          >
            <div className="mb-4 flex items-center justify-center">
              <CheckCircle className="mr-3 h-8 w-8 text-[#22c55e]" />
              <h3 className="text-2xl font-bold text-foreground">Ready to Begin?</h3>
            </div>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              Start with our personalized assessment to identify your strengths and create a custom
              learning path tailored to your experience level.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 text-foreground hover:from-purple-700 hover:to-cyan-700"
              >
                <Link href="/assessment">
                  Take Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 text-primary hover:bg-primary/10"
                asChild
              >
                <Link href="/study">Browse All Modules</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

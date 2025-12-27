"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle,
  Clock,
  Shield,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

const tcoDomains = [
  {
    id: "questions",
    title: "Questions & Sensors",
    description: "Master the art of querying endpoints and gathering intelligence",
    weight: "22%",
    icon: Target,
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
    skills: ["Report creation", "Dashboard design", "Data visualization", "Scheduled reports"],
    estimatedTime: "5-7 hours",
    difficulty: "Advanced",
    labs: 9,
    progress: 0,
  },
];

export function LearningPath() {
  const getDifficultyVariant = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "default";
      case "Intermediate":
        return "secondary";
      case "Advanced":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="bg-background px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge variant="outline" className="mb-4">
            <Star className="mr-2 h-3.5 w-3.5 fill-primary text-primary" />
            AI-Powered Learning Path
          </Badge>
          <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
            Master All 5 TCO Domains
          </h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground">
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
              <Card className="group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <domain.icon className="h-5 w-5" />
                    </div>
                    <Badge variant={getDifficultyVariant(domain.difficulty) as any}>
                      {domain.difficulty}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg text-foreground transition-colors group-hover:text-primary">
                    {domain.title}
                  </CardTitle>

                  <CardDescription className="line-clamp-2 leading-relaxed text-muted-foreground">
                    {domain.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Exam Weight */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Exam Weight</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {domain.weight}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-foreground">{domain.progress}%</span>
                    </div>
                    <Progress
                      value={domain.progress}
                      className="h-1.5"
                      aria-label={`${domain.title} domain progress: ${domain.progress}% complete`}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {domain.estimatedTime}
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5" />
                      {domain.labs} Labs
                    </div>
                  </div>

                  {/* Key Skills */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Key Skills
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {domain.skills.slice(0, 2).map((skill, skillIndex) => (
                        <Badge
                          key={skillIndex}
                          variant="outline"
                          className="bg-secondary/50 text-[10px] font-normal"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {domain.skills.length > 2 && (
                        <Badge
                          variant="outline"
                          className="bg-secondary/50 text-[10px] font-normal"
                        >
                          +{domain.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    asChild
                    className="mt-4 w-full transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                    size="sm"
                  >
                    <Link href={`/study/domains/${domain.id}`}>
                      Start Learning
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          <Card className="mx-auto max-w-3xl border-dashed bg-secondary/30 p-8">
            <div className="mb-4 flex items-center justify-center">
              <CheckCircle className="mr-3 h-6 w-6 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Ready to Begin?</h3>
            </div>
            <p className="mx-auto mb-8 max-w-xl leading-relaxed text-muted-foreground">
              Start with our personalized assessment to identify your strengths and create a custom
              learning path tailored to your experience level.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                <Link href="/assessment">
                  Take Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-background hover:bg-secondary"
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

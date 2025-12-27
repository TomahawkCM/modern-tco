"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Clock,
  Play,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    id: "start-learning",
    title: "Start Learning",
    description: "Jump into your personalized learning path",
    icon: BookOpen,
    href: "/study",
    badge: "Recommended",
    estimatedTime: "5 min setup",
  },
  {
    id: "practice-questions",
    title: "Practice Questions",
    description: "Test your knowledge with sample exam questions",
    icon: Target,
    href: "/practice",
    badge: "Popular",
    estimatedTime: "10-30 min",
  },
  {
    id: "hands-on-labs",
    title: "Hands-on Labs",
    description: "Practice with real Tanium environments",
    icon: Play,
    href: "/labs",
    badge: "Interactive",
    estimatedTime: "30-60 min",
  },
  {
    id: "study-groups",
    title: "Join Study Group",
    description: "Learn with peers and share knowledge",
    icon: Users,
    href: "/community/groups",
    badge: "Social",
    estimatedTime: "Join instantly",
  },
  {
    id: "assessment",
    title: "Skill Assessment",
    description: "Identify your strengths and focus areas",
    icon: Brain,
    href: "/assessment",
    badge: "AI-Powered",
    estimatedTime: "15 min",
  },
  {
    id: "mock-exam",
    title: "Mock Exam",
    description: "Take a full-length practice exam",
    icon: Trophy,
    href: "/exam/mock",
    badge: "Realistic",
    estimatedTime: "90 min",
  },
];

export function QuickActions() {
  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Recommended":
        return "default";
      case "Popular":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="bg-secondary/30 px-4 py-16">
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
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Quick Start
          </Badge>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">Jump Into Action</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Get started immediately with these curated learning activities. Each action is designed
            to move you closer to TCO certification success.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group h-full cursor-pointer transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <Badge variant={getBadgeVariant(action.badge) as any}>{action.badge}</Badge>
                  </div>

                  <CardTitle className="text-lg transition-colors group-hover:text-primary">
                    {action.title}
                  </CardTitle>

                  <CardDescription className="line-clamp-2">{action.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {action.estimatedTime}
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full transition-all group-hover:bg-primary group-hover:text-primary-foreground"
                    variant="outline"
                    size="sm"
                  >
                    <Link href={action.href}>
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Play,
  BookOpen,
  Users,
  Target,
  Clock,
  Brain,
  Trophy,
  ArrowRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    id: "start-learning",
    title: "Start Learning",
    description: "Jump into your personalized learning path",
    icon: BookOpen,
    color: "from-blue-500 to-primary",
    href: "/study",
    badge: "Recommended",
    estimatedTime: "5 min setup"
  },
  {
    id: "practice-questions",
    title: "Practice Questions",
    description: "Test your knowledge with sample exam questions",
    icon: Target,
    color: "from-green-500 to-teal-500",
    href: "/practice",
    badge: "Popular",
    estimatedTime: "10-30 min"
  },
  {
    id: "hands-on-labs",
    title: "Hands-on Labs",
    description: "Practice with real Tanium environments",
    icon: Play,
    color: "from-purple-500 to-pink-500",
    href: "/labs",
    badge: "Interactive",
    estimatedTime: "30-60 min"
  },
  {
    id: "study-groups",
    title: "Join Study Group",
    description: "Learn with peers and share knowledge",
    icon: Users,
    color: "from-orange-500 to-red-500",
    href: "/community/groups",
    badge: "Social",
    estimatedTime: "Join instantly"
  },
  {
    id: "assessment",
    title: "Skill Assessment",
    description: "Identify your strengths and focus areas",
    icon: Brain,
    color: "from-primary to-blue-500",
    href: "/assessment",
    badge: "AI-Powered",
    estimatedTime: "15 min"
  },
  {
    id: "mock-exam",
    title: "Mock Exam",
    description: "Take a full-length practice exam",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500",
    href: "/exam/mock",
    badge: "Realistic",
    estimatedTime: "90 min"
  }
];

export function QuickActions() {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Recommended":
        return "bg-primary/10 text-primary border-primary/20";
      case "Popular":
        return "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20";
      case "Interactive":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case "Social":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "AI-Powered":
        return "bg-primary/10 text-primary border-primary/20";
      case "Realistic":
        return "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20";
      default:
        return "bg-slate-500/10 text-muted-foreground border-slate-500/20";
    }
  };

  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Quick Start
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-200 via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Jump Into Action
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get started immediately with these curated learning activities. 
            Each action is designed to move you closer to TCO certification success.
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <motion.div 
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                variant="cyberpunk"
                className="h-full group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <Badge className={getBadgeColor(action.badge)}>
                      {action.badge}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {action.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {action.estimatedTime}
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 text-primary border border-primary/30 transition-all duration-300"
                    variant="outline"
                  >
                    <Link href={action.href}>
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
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
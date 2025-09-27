import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { StudyModuleWithSections } from '@/types/supabase'

interface StudyModuleCardProps {
  module: StudyModuleWithSections
  progress?: {
    completed: number
    total: number
    percentage: number
  }
  className?: string
}

export function StudyModuleCard({ module, progress, className }: StudyModuleCardProps) {
  const progressPercentage = progress?.percentage || 0
  const isCompleted = progressPercentage === 100
  const hasStarted = progressPercentage > 0

  const getProgressColor = () => {
    if (progressPercentage === 0) return 'bg-gray-200'
    if (progressPercentage < 30) return 'bg-red-500'
    if (progressPercentage < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge variant="default" className="gap-1 bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-500/20"><CheckCircle className="h-3 w-3" />Completed</Badge>
    }
    if (hasStarted) {
      return <Badge variant="default" className="gap-1 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-500/20"><Clock className="h-3 w-3" />In Progress</Badge>
    }
    return <Badge variant="secondary" className="gap-1 bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-500/20"><BookOpen className="h-3 w-3" />Not Started</Badge>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.03, 
        y: -2,
        transition: { duration: 0.2, ease: "easeOut" } 
      }}
      className="group"
    >
      <Card className={`relative bg-black/20 backdrop-blur-xl border border-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.1)] hover:shadow-[0_0_80px_rgba(34,211,238,0.15)] transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:shadow-[0_0_80px_rgba(34,211,238,0.15)] ${className}`}>
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/10 via-sky-400/10 to-cyan-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
        
        <CardHeader className="pb-4 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold text-cyan-100 group-hover:text-cyan-400 transition-colors">
                  {module.title}
                </CardTitle>
                {getStatusBadge()}
              </div>
              <CardDescription className="text-sm text-cyan-100/70 line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cyan-100/60">
                  Progress: {progress.completed}/{progress.total} sections
                </span>
                <span className="font-medium text-cyan-400">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 relative">
          {/* Module Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-cyan-100/60">
              <BookOpen className="h-4 w-4 text-cyan-400" />
              <span>{module.sections?.length || 0} sections</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-100/60">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>{module.estimated_time_minutes ? `${module.estimated_time_minutes} min` : 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-100/60">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>{module.domain}</span>
            </div>
          </div>

          {/* Learning Objectives Preview */}
          {module.learning_objectives && module.learning_objectives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-cyan-100">Key Learning Objectives:</h4>
              <ul className="text-sm text-cyan-100/60 space-y-1">
                {module.learning_objectives.slice(0, 2).map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span className="line-clamp-1">{objective}</span>
                  </li>
                ))}
                {module.learning_objectives.length > 2 && (
                  <li className="text-xs text-cyan-100/40 italic">
                    +{module.learning_objectives.length - 2} more objectives
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500/50">
              <Link href={`/study/modules/${module.id}`}>
                {isCompleted ? 'Review Module' : hasStarted ? 'Continue Learning' : 'Start Learning'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
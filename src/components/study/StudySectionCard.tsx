import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, CheckCircle, BookmarkIcon, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { useStudyProgress } from '@/hooks/useStudyProgress'
import { useBookmarks } from '@/hooks/useBookmarks'
import type { StudySection } from '@/types/supabase'

interface StudySectionCardProps {
  section: StudySection
  moduleId: string
  className?: string
}

export function StudySectionCard({ section, moduleId, className }: StudySectionCardProps) {
  const { getSectionStatus, getSectionCompletion } = useStudyProgress()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  
  const status = getSectionStatus(section.id)
  const completion = getSectionCompletion(section.id)
  const bookmarked = isBookmarked(section.id)

  const getStatusBadge = () => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="gap-1 bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="h-3 w-3" />Completed</Badge>
      case 'in_progress':
        return <Badge variant="default" className="gap-1"><PlayCircle className="h-3 w-3" />In Progress</Badge>
      default:
        return <Badge variant="secondary" className="gap-1"><BookOpen className="h-3 w-3" />Not Started</Badge>
    }
  }

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleBookmark(section.id, moduleId)
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                {section.title}
              </CardTitle>
              {getStatusBadge()}
            </div>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {section.content.substring(0, 100)}...
            </CardDescription>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmarkToggle}
            className="ml-2 shrink-0"
          >
            <BookmarkIcon 
              className={`h-4 w-4 ${bookmarked ? 'fill-current text-primary' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>

        {/* Progress Bar for in-progress sections */}
        {status === 'in_progress' && completion > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completion}%</span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Section Metadata */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{section.estimated_time_minutes ? `${section.estimated_time_minutes} min` : '15 min'}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span className="capitalize">{section.section_type}</span>
          </div>
        </div>

        {/* Content Preview */}
        {section.content && typeof section.content === 'object' && 'overview' in section.content && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Overview:</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {(section.content).overview}
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button asChild className="w-full" variant={status === 'completed' ? 'outline' : 'default'}>
            <Link href={`/study/modules/${moduleId}/sections/${section.id}`}>
              {status === 'completed' 
                ? 'Review Section' 
                : status === 'in_progress' 
                  ? 'Continue Reading' 
                  : 'Start Section'
              }
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
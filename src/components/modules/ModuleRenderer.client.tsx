'use client';

import { useEffect, useMemo, useState } from 'react';
import ClientMDXContent from './ClientMDXContent';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { StudySessionProvider } from '@/contexts/StudySessionContext';
import type { ModuleData } from '@/lib/mdx/module-loader';

interface ModuleRendererProps {
  moduleData: ModuleData;
}

type SectionState = {
  id: string;
  title: string;
  completed: boolean;
  needsReview: boolean;
};

export default function ModuleRenderer({ moduleData }: ModuleRendererProps) {
  const { frontmatter, content } = moduleData;
  const { user } = useAuth();
  const db = useDatabase();
  const [sections, setSections] = useState<SectionState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastViewed, setLastViewed] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'review'>('content');

  useEffect(() => {
    setSections(
      (frontmatter.learningObjectives ?? []).map((title, index) => ({
        id: `objective-${index}`,
        title,
        completed: false,
        needsReview: false,
      }))
    );
  }, [frontmatter.learningObjectives]);

  const domainForPractice = useMemo(() => frontmatter.domainEnum.replace(/_/g, ' '), [frontmatter.domainEnum]);

  return (
    <StudySessionProvider
      moduleId={frontmatter.id}
      sections={sections}
      activeId={activeId}
      lastViewed={lastViewed}
      activeTab={activeTab}
      onMarkSection={async (id, status) => {
        setSections((prev) =>
          prev.map((section) =>
            section.id === id
              ? {
                  ...section,
                  completed: status === 'completed',
                  needsReview: status === 'needs_review',
                }
              : section
          )
        );
      }}
      onSetLastViewed={setLastViewed}
      onSetActiveId={setActiveId}
      onSetActiveTab={setActiveTab}
      onMarkAllComplete={async () => {
        setSections((prev) => prev.map((section) => ({ ...section, completed: true })));
      }}
      onClearAllReview={async () => {
        setSections((prev) => prev.map((section) => ({ ...section, needsReview: false })));
      }}
      onResetProgress={async () => {
        setSections((prev) => prev.map((section) => ({ ...section, completed: false })));
      }}
    >
      <div className="p-8 text-foreground">
        <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tracking {sections.length} sections</p>
        <p className="mt-2 text-xs text-muted-foreground">User: {user?.email ?? 'anonymous'}</p>
        <p className="mt-2 text-xs text-muted-foreground">Domain: {domainForPractice}</p>
        <div className="mt-8">
          <ClientMDXContent content={content} />
        </div>
      </div>
    </StudySessionProvider>
  );
}

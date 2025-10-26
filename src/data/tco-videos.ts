import type { TCOVideo } from '@/components/video/TCOVideoPlayer';

// TCO-specific video library based on research findings
export const tcoVideos: TCOVideo[] = [
  // Navigation and Basic Module Functions (23% exam weight)
  {
    id: 'tco-navigation-basics',
    title: 'TCO Navigation Basics - Platform Interface Fundamentals',
    description: 'Learn to navigate the Tanium console, understand module functions, and master the basic interface components essential for TCO certification.',
    url: 'https://help.tanium.com/videos/tco-navigation-basics.mp4', // Official Tanium video
    duration: 1500, // 25 minutes
    moduleId: 'navigation_basic_functions',
    domain: 'Navigation & Modules',
    difficulty: 'Beginner',
    tags: ['navigation', 'console', 'interface', 'modules', 'tco'],
    thumbnail: '/thumbnails/tco-navigation.jpg',
    transcriptUrl: '/transcripts/tco-navigation-basics.vtt'
  },
  {
    id: 'single-endpoint-view-helpdesk',
    title: 'Single Endpoint View - Tanium for Help Desk - Tanium Tech Talks #129',
    description: 'Master the single endpoint view feature for efficient help desk operations. Learn to access detailed endpoint information, manage offline data, create custom panels, and take actions directly on endpoints. Covers endpoint overview, management, investigation, and customization for your specific needs.',
    url: 'https://www.youtube.com/watch?v=C0DMVxI4sGE',
    duration: 2229, // 37 minutes 9 seconds
    moduleId: 'navigation_basic_functions',
    domain: 'Navigation & Modules',
    difficulty: 'Intermediate',
    tags: ['navigation', 'help-desk', 'endpoint-management', 'single-endpoint-view', 'custom-panels', 'rbac', 'tco'],
    thumbnail: 'https://i.ytimg.com/vi/C0DMVxI4sGE/maxresdefault.jpg',
    transcriptUrl: '/transcripts/single-endpoint-view-helpdesk.vtt'
  },

  // Asking Questions (22% exam weight)
  {
    id: 'mastering-interact-part1',
    title: 'Mastering Interact Part 1 - Natural Language Questions',
    description: 'Master the art of asking effective questions using Tanium\'s natural language interface. Learn question construction, sensor usage, and best practices.',
    url: 'https://help.tanium.com/videos/mastering-interact-part1.mp4', // Official Tanium video
    duration: 1200, // 20 minutes
    moduleId: 'asking_questions',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    tags: ['interact', 'questions', 'sensors', 'natural-language', 'tco'],
    thumbnail: '/thumbnails/mastering-interact-1.jpg',
    transcriptUrl: '/transcripts/mastering-interact-part1.vtt'
  },
  {
    id: 'mastering-interact-part2',
    title: 'Mastering Interact Part 2 - Advanced Query Techniques',
    description: 'Advanced techniques for creating complex questions, using parameters, and managing your question library effectively.',
    url: 'https://help.tanium.com/videos/mastering-interact-part2.mp4', // Official Tanium video
    duration: 1200, // 20 minutes
    moduleId: 'asking_questions',
    domain: 'Asking Questions',
    difficulty: 'Beginner',
    tags: ['interact', 'advanced-queries', 'parameters', 'saved-questions', 'tco'],
    thumbnail: '/thumbnails/mastering-interact-2.jpg',
    transcriptUrl: '/transcripts/mastering-interact-part2.vtt'
  },

  // Taking Action (15% exam weight)
  {
    id: 'tco-package-deployment',
    title: 'TCO Package Deployment Fundamentals',
    description: 'Learn the basics of package deployment and action execution for TCO certification. Covers simple deployment workflows and monitoring.',
    url: 'https://help.tanium.com/videos/tco-package-deployment.mp4', // Official Tanium video
    duration: 1500, // 25 minutes
    moduleId: 'taking_action',
    domain: 'Taking Action',
    difficulty: 'Beginner',
    tags: ['packages', 'deployment', 'actions', 'workflows', 'tco'],
    thumbnail: '/thumbnails/tco-packages.jpg',
    transcriptUrl: '/transcripts/tco-package-deployment.vtt'
  },

  // Refining Questions (23% exam weight)
  {
    id: 'tco-targeting-filtering',
    title: 'TCO Targeting and Filtering Fundamentals',
    description: 'Master computer groups, basic filtering techniques, and targeting strategies essential for TCO certification.',
    url: 'https://help.tanium.com/videos/tco-targeting-filtering.mp4', // Official Tanium video
    duration: 900, // 15 minutes
    moduleId: 'refining_questions',
    domain: 'Refining Questions',
    difficulty: 'Beginner',
    tags: ['targeting', 'filtering', 'computer-groups', 'scoping', 'tco'],
    thumbnail: '/thumbnails/tco-targeting.jpg',
    transcriptUrl: '/transcripts/tco-targeting-filtering.vtt'
  },

  // Reporting and Data Export (17% exam weight)
  {
    id: 'tco-reporting-basics',
    title: 'TCO Reporting and Data Export Basics',
    description: 'Learn fundamental reporting techniques, data export methods, and basic Connect integration for TCO certification.',
    url: 'https://help.tanium.com/videos/tco-reporting-basics.mp4', // Official Tanium video
    duration: 900, // 15 minutes
    moduleId: 'report_generation_export',
    domain: 'Reporting & Export',
    difficulty: 'Beginner',
    tags: ['reporting', 'export', 'data', 'connect', 'tco'],
    thumbnail: '/thumbnails/tco-reporting.jpg',
    transcriptUrl: '/transcripts/tco-reporting-basics.vtt'
  },

  // SecuritySenses TCO Certification Series
  {
    id: 'securitysenses-tco-series',
    title: 'TCO Tanium Certified Operator - Certification Series',
    description: 'Comprehensive TCO exam preparation by experts who helped write the exam questions. Insider guidance and best practices.',
    url: 'https://securitysenses.com/videos/tco-tanium-certified-operator-certification-series.mp4',
    duration: 2700, // 45 minutes
    moduleId: 'exam_strategy',
    domain: 'Exam Strategy',
    difficulty: 'Beginner',
    tags: ['certification', 'exam-prep', 'strategy', 'tco', 'securitysenses'],
    thumbnail: '/thumbnails/securitysenses-tco.jpg',
    transcriptUrl: '/transcripts/securitysenses-tco-series.vtt'
  },

  // Additional TCO Practice Videos
  {
    id: 'tco-practice-scenarios',
    title: 'TCO Practice Scenarios and Knowledge Checks',
    description: 'Hands-on practice scenarios covering all TCO domains with guided solutions and explanations.',
    url: 'https://help.tanium.com/videos/tco-practice-scenarios.mp4',
    duration: 1800, // 30 minutes
    moduleId: 'exam_strategy',
    domain: 'Practice & Assessment',
    difficulty: 'Beginner',
    tags: ['practice', 'scenarios', 'hands-on', 'assessment', 'tco'],
    thumbnail: '/thumbnails/tco-practice.jpg',
    transcriptUrl: '/transcripts/tco-practice-scenarios.vtt'
  }
];

// Helper functions for video management
export const getVideosByModule = (moduleId: string): TCOVideo[] => {
  return tcoVideos.filter(video => video.moduleId === moduleId);
};

export const getVideosByDomain = (domain: string): TCOVideo[] => {
  return tcoVideos.filter(video => video.domain === domain);
};

export const getVideoById = (videoId: string): TCOVideo | undefined => {
  return tcoVideos.find(video => video.id === videoId);
};

export const getPrimaryVideoForModule = (moduleId: string): TCOVideo | undefined => {
  const moduleVideos = getVideosByModule(moduleId);
  return moduleVideos[0]; // Return first video as primary
};

export const getTotalVideoWatchTime = (): number => {
  return tcoVideos.reduce((total, video) => total + video.duration, 0);
};

export const getVideosByTag = (tag: string): TCOVideo[] => {
  return tcoVideos.filter(video => video.tags.includes(tag));
};

// Export default for convenience
export default tcoVideos;
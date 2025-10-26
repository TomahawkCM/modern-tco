# spawn-content-team

Auto-spawn specialized content creation and validation team for Tanium TCO certification materials, videos, and assessments.

## Agent Team Composition

### Content Creation (3 agents)
- **tco-content-specialist** - Tanium certification content with MDX authoring
- **video-system-architect** - Multi-provider video integration and YouTube embeds
- **assessment-engine-specialist** - Weighted scoring algorithms and question design

### Quality Assurance (2 agents)
- **tco-validation-expert** - Certification blueprint alignment and quality control
- **accessibility-tester** - WCAG 2.1 AA compliance for all content

### Analytics (1 agent)
- **tco-analytics-coordinator** - PostHog tracking and engagement metrics

### Coordination (1 agent)
- **mesh-coordinator** - Peer-to-peer collaboration for content workflows

## Automatic Initialization

```javascript
// 1. Initialize swarm with mesh topology for collaborative content creation
mcp__claude-flow__swarm_init({
  topology: "mesh",
  maxAgents: 7,
  strategy: "balanced"
})

// 2. Spawn content creation team
Task("tco-content-specialist: Create high-quality Tanium certification content in MDX format, aligned with TCO blueprint (22%, 23%, 15%, 23%, 17% domain distribution)")
Task("video-system-architect: Integrate YouTube videos, manage video manifest, implement progress tracking (25%, 50%, 75%, 100% milestones)")
Task("assessment-engine-specialist: Design practice questions with weighted scoring, difficulty levels (easy/medium/hard), and domain-specific algorithms")

// 3. Spawn quality assurance team
Task("tco-validation-expert: Validate all content against Tanium certification requirements, ensure accuracy and completeness of learning objectives")
Task("accessibility-tester: Test content for WCAG 2.1 AA compliance, ensure screen reader compatibility, keyboard navigation, and inclusive design")

// 4. Spawn analytics
Task("tco-analytics-coordinator: Set up PostHog event tracking for video views, assessment completion, and learning path progression")

// 5. Spawn coordination
Task("mesh-coordinator: Facilitate peer-to-peer collaboration between content agents, ensure consistent quality and seamless integration")
```

## Use Cases

### New Module Creation
```
User: "Create a new Tanium Comply module with videos and practice questions"
Claude: *Auto-spawns content team with mesh coordination*
```

### Video System Enhancement
```
User: "Add progress tracking and analytics to all training videos"
Claude: *Emphasizes video-system-architect and analytics-coordinator*
```

### Assessment Question Bank
```
User: "Generate 50 new practice questions for Domain 3: Taking Action"
Claude: *Focuses on assessment-engine-specialist and tco-validation-expert*
```

### Content Accessibility Audit
```
User: "Audit all modules for WCAG compliance and fix any issues"
Claude: *Emphasizes accessibility-tester with validation expert support*
```

## Expected Outcomes

- **7 specialized content agents** with mesh coordination
- **Certification-aligned content** matching TCO blueprint
- **Multi-provider video integration** with progress tracking
- **Sophisticated assessment engine** with weighted algorithms
- **100% WCAG 2.1 AA compliance** for all content
- **Comprehensive analytics** for engagement tracking

## Content Creation Workflow

**Mesh Coordination (Peer-to-Peer)**:
1. tco-content-specialist creates MDX content draft
2. video-system-architect integrates training videos
3. assessment-engine-specialist designs practice questions
4. tco-validation-expert reviews for certification alignment
5. accessibility-tester validates WCAG compliance
6. tco-analytics-coordinator adds tracking events
7. mesh-coordinator ensures seamless integration

## Quality Standards

### Content Requirements
- ✅ Aligned with Tanium certification blueprint
- ✅ Domain distribution: 22%, 23%, 15%, 23%, 17%
- ✅ Learning objectives clearly defined
- ✅ Real-world scenarios and examples
- ✅ Progressive difficulty (beginner → advanced)

### Video Requirements
- ✅ YouTube embed with full player controls
- ✅ Progress tracking at 25%, 50%, 75%, 100%
- ✅ Closed captions for accessibility
- ✅ Mobile-responsive video player
- ✅ Analytics integration for engagement

### Assessment Requirements
- ✅ Weighted scoring by domain importance
- ✅ Difficulty levels (easy/medium/hard)
- ✅ Detailed explanations for answers
- ✅ Remediation recommendations
- ✅ Performance analytics tracking

### Accessibility Requirements
- ✅ WCAG 2.1 AA compliance
- ✅ Screen reader compatibility
- ✅ Keyboard navigation support
- ✅ Color contrast ratios (4.5:1 minimum)
- ✅ Alt text for all images
- ✅ Semantic HTML structure

## Token Budget Allocation

- Content Creation: 45% (3 agents)
- Quality Assurance: 30% (2 agents)
- Analytics: 15% (1 agent)
- Coordination: 10% (1 agent)

Total: 7 agents optimized for content workflows

## Performance Metrics

Each agent tracks:
- Content creation velocity (pages/questions per hour)
- Quality score (certification alignment accuracy)
- Accessibility compliance rate
- Video integration success rate
- Analytics event coverage

## Integration with LMS

All content agents integrate with:
- **11+ React Contexts** for state management
- **Supabase PostgreSQL** for content storage
- **PostHog Analytics** for tracking
- **YouTube API** for video integration
- **MDX** for rich content authoring

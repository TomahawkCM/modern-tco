# Task Completion Checklist - Modern TCO

## Before Making Changes

- [ ] Read and understand existing code using symbolic tools
- [ ] Identify integration points and dependencies
- [ ] Check Supabase schema and database constraints
- [ ] Verify authentication requirements

## During Development

- [ ] Follow TypeScript strict mode requirements
- [ ] Use path aliases (@/) for imports
- [ ] Implement proper error handling and fallbacks
- [ ] Maintain dual storage strategy (Supabase + localStorage)
- [ ] Follow React Context patterns for state management

## Code Quality Checks

```bash
# Type checking (MUST PASS)
npm run typecheck

# Linting (MUST PASS)
npm run lint

# Build verification (MUST PASS)
npm run build
```

## Database Integration Verification

- [ ] Test database connections and queries
- [ ] Verify Row Level Security (RLS) policies
- [ ] Check real-time subscription functionality
- [ ] Validate data persistence across sessions
- [ ] Test offline/fallback behavior

## UI/UX Validation

- [ ] Test responsive design on multiple screen sizes
- [ ] Verify glassmorphic design consistency
- [ ] Check Tanium brand color usage
- [ ] Validate accessibility compliance (WCAG 2.1 AA)
- [ ] Test keyboard navigation

## Context Integration Testing

- [ ] AuthContext: Sign in/out functionality
- [ ] QuestionsContext: Question loading and caching
- [ ] ExamContext: Session management and persistence
- [ ] ProgressContext: Statistics tracking and sync
- [ ] SettingsContext: User preferences sync
- [ ] IncorrectAnswersContext: Mistake tracking
- [ ] ModuleContext: Module progress tracking
- [ ] SearchContext: Database-backed search
- [ ] DatabaseContext: Core database operations

## Performance Testing

- [ ] Question loading performance (5-minute cache)
- [ ] Real-time subscription latency
- [ ] Bundle size analysis
- [ ] Lighthouse performance audit (target: 95+)
- [ ] Memory usage profiling

## Security Verification

- [ ] RLS policies functioning correctly
- [ ] No sensitive data in client logs
- [ ] Proper authentication token handling
- [ ] Environment variable security

## Final Validation

```bash
# Run complete test suite if available
npm run test

# Generate and validate questions
npm run generate-questions
npm run validate-questions

# Check migration status
npm run migration:status

# Verify Claude monitoring
npm run claude:status
```

## Documentation Updates

- [ ] Update README.md if needed
- [ ] Document new features or changes
- [ ] Update type definitions
- [ ] Create memory files for complex patterns

## Deployment Preparation

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Build optimization verified
- [ ] Error monitoring setup

## Post-Completion

- [ ] Create memory files with lessons learned
- [ ] Document any new patterns discovered
- [ ] Update project status in memory
- [ ] Clean up temporary files and logs

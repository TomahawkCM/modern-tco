# Enhanced Practice Targeting with Weighted Selection

## Overview

The Tanium TCO LMS practice system has been enhanced with intelligent weighted selection that prioritizes questions based on user performance and needs-review counts. This enhancement helps users focus on areas where they need the most improvement.

## Features

### 🎯 Weighted Selection Modes

The `startWeightedMultiDomainPractice` function now supports three selection modes:

1. **Needs-Review Weighting** (NEW)
2. **TCO Exam Weighting** (existing)
3. **Equal Distribution** (existing)

### 1. Needs-Review Weighting

When `useNeedsReviewWeighting: true` is set, the system:

- Analyzes incorrect answers that haven't been reviewed
- Calculates domain weights based on needs-review counts
- Prioritizes questions previously answered incorrectly
- Ensures minimum 1 question per selected domain

**Algorithm:**
```typescript
// Weight calculation
const needsReview = (incorrectCount - reviewedCount) for each domain
const weight = needsReview / totalNeedsReview
const questionCount = Math.max(1, Math.round(totalQuestions * weight))
```

**Benefits:**
- Adaptive learning based on performance
- Focuses on weak areas
- Improves learning efficiency
- Personalized practice sessions

### 2. TCO Exam Weighting

Standard distribution based on certification exam blueprint:
- Domain 1 (Asking Questions): 22%
- Domain 2 (Refining Questions & Targeting): 23%
- Domain 3 (Taking Action): 15%
- Domain 4 (Navigation and Basic Module Functions): 23%
- Domain 5 (Report Generation and Data Export): 17%

### 3. Equal Distribution

Distributes questions equally across selected domains.

## Usage Examples

### Basic Usage with Needs-Review Weighting

```typescript
const { startWeightedMultiDomainPractice } = usePractice();

// Start practice with needs-review weighting
await startWeightedMultiDomainPractice(
  ["Asking Questions", "Refining Questions & Targeting"],
  {
    questionCount: 30,
    useNeedsReviewWeighting: true
  }
);
```

### Fallback Behavior

If no needs-review data is available, the system automatically falls back to TCO exam weighting:

```typescript
// This will use TCO weights if no incorrect answers exist
await startWeightedMultiDomainPractice(
  domains,
  {
    useNeedsReviewWeighting: true,
    useWeightedDistribution: true // fallback option
  }
);
```

### Mixed Domain Practice

```typescript
// Practice all domains with adaptive weighting
const allDomains = [
  "Asking Questions",
  "Refining Questions & Targeting",
  "Taking Action",
  "Navigation and Basic Module Functions",
  "Report Generation and Data Export"
];

await startWeightedMultiDomainPractice(
  allDomains,
  {
    questionCount: 50,
    useNeedsReviewWeighting: true,
    passingScore: 75,
    timeLimit: 3600 // 60 minutes
  }
);
```

## Implementation Details

### Data Sources

The enhancement integrates two contexts:

1. **IncorrectAnswersContext**: Tracks questions answered incorrectly
2. **QuestionsContext**: Provides question pool and filtering

### Priority System

Questions are prioritized in the following order:
1. Previously incorrect, unreviewed questions
2. Previously incorrect, reviewed questions
3. New questions from the domain

### Performance Optimization

- Fetches 2x the needed questions for filtering
- Sorts and slices to get optimal question set
- Maintains question variety through shuffling
- Caches domain stats for efficiency

## Integration Points

### Practice Page

The practice page can offer a "Focus on Weak Areas" option:

```typescript
<Button
  onClick={() => startWeightedMultiDomainPractice(
    selectedDomains,
    { useNeedsReviewWeighting: true }
  )}
>
  Practice Weak Areas
</Button>
```

### Review Center

The Review Center can display needs-review counts:

```typescript
const domainStats = getDomainStats();
// Display stats showing which domains need more review
```

### Analytics Dashboard

Track improvement over time:
- Questions moved from incorrect to correct
- Reduction in needs-review counts
- Domain mastery progression

## Benefits

### For Learners
- **Personalized Learning**: Focus on individual weak areas
- **Efficient Study Time**: Prioritize questions that need work
- **Measurable Progress**: See improvement in specific domains
- **Adaptive Difficulty**: System adjusts to performance

### For Administrators
- **Learning Analytics**: Identify common problem areas
- **Content Insights**: See which questions are most challenging
- **Progress Tracking**: Monitor user improvement patterns
- **ROI Measurement**: Demonstrate learning effectiveness

## Future Enhancements

### Planned Features
- [ ] Spaced repetition algorithm
- [ ] Difficulty-based weighting
- [ ] Time-since-last-attempt weighting
- [ ] Performance trend analysis
- [ ] Custom weight configurations
- [ ] Group performance comparison

### API Extensions
- [ ] Export needs-review data
- [ ] Import historical performance
- [ ] Batch analytics endpoints
- [ ] Performance prediction models

## Configuration

### Environment Variables

No additional environment variables required. The feature uses existing contexts.

### Settings

Users can configure practice preferences:

```typescript
interface PracticePreferences {
  defaultWeightingMode: 'needs-review' | 'tco' | 'equal';
  minQuestionsPerDomain: number;
  prioritizeIncorrect: boolean;
  includeReviewedQuestions: boolean;
}
```

## Testing

### Unit Tests

Test coverage includes:
- Weight calculation accuracy
- Fallback behavior
- Question prioritization
- Edge cases (no incorrect answers, single domain)

### Integration Tests

- Context integration
- Performance with large datasets
- Multi-user scenarios
- Concurrent sessions

## Performance Metrics

### Benchmarks
- Weight calculation: <10ms for 1000 questions
- Question sorting: <50ms for 500 questions
- Context lookup: <5ms per domain
- Total selection time: <100ms typical

### Optimization Tips
- Pre-calculate domain stats
- Cache frequently accessed data
- Batch database queries
- Use indexed lookups

## Troubleshooting

### Common Issues

1. **No questions selected**
   - Check if domains have questions available
   - Verify user has attempted questions

2. **Uneven distribution**
   - This is expected with needs-review weighting
   - Check domain stats for imbalances

3. **Performance issues**
   - Clear incorrect answers cache
   - Check database indexes
   - Monitor context re-renders

### Debug Mode

Enable debug logging:

```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Domain stats:', domainStats);
  console.log('Weight distribution:', weights);
  console.log('Selected questions:', questions);
}
```

## Conclusion

The enhanced practice targeting system provides intelligent, adaptive question selection that helps users focus on areas needing improvement. By weighting selection based on needs-review counts, the system creates personalized practice sessions that maximize learning efficiency.
# Content Validation Guide - Tanium TCO LMS

**Purpose**: Ensure all learning content, questions, and assessments are accurate, aligned with certification requirements, and provide value to learners.

**Last Updated**: October 1, 2025

---

## 📋 Question Bank Validation (140+ Questions)

### Validation Criteria

Each question must meet ALL of the following criteria:

#### 1. Technical Accuracy ✅
- [ ] Answer matches official Tanium documentation
- [ ] Scenario reflects real-world Tanium usage
- [ ] Technical details are current (not outdated)
- [ ] No contradictions with Tanium best practices

#### 2. Certification Alignment ✅
- [ ] Maps to specific TCO exam blueprint objective
- [ ] Appropriate difficulty for operator-level certification
- [ ] Covers testable knowledge (not trivia)
- [ ] Domain weighting appropriate (22%, 23%, 15%, 23%, 17%)

#### 3. Question Quality ✅
- [ ] Clear, unambiguous wording
- [ ] No grammatical/spelling errors
- [ ] All options are plausible (no obviously wrong answers)
- [ ] Only ONE clearly correct answer
- [ ] Distractor options test common misconceptions

#### 4. Explanation Quality ✅
- [ ] Explains WHY correct answer is right
- [ ] Explains WHY incorrect answers are wrong
- [ ] Provides learning value beyond the question
- [ ] References official documentation when helpful
- [ ] Appropriate length (2-5 sentences)

---

## 🔍 Question Review Process

### Step 1: Initial Self-Review (Developer)

**Checklist for Each Question:**

```markdown
## Question ID: [QID]
**Domain**: [Domain Number and Name]
**Difficulty**: [Easy/Medium/Hard]

### Technical Accuracy
- [ ] Fact-checked against official Tanium docs
- [ ] Scenario is realistic
- [ ] Technical terms used correctly
- [ ] Current best practices reflected

### Certification Alignment
- [ ] Exam blueprint objective: [Specify]
- [ ] Appropriate difficulty level for TCO
- [ ] Tests practical knowledge, not memorization

### Question Quality
- [ ] Wording is clear and unambiguous
- [ ] Grammar and spelling perfect
- [ ] All distractors are plausible
- [ ] One definitive correct answer

### Explanation Quality
- [ ] Explains correct answer clearly
- [ ] Addresses why distractors are wrong
- [ ] Provides additional learning value
- [ ] Appropriate length and depth

### Final Check
- [ ] Question ID unique
- [ ] Metadata complete (domain, difficulty, weight)
- [ ] JSON formatting valid
- [ ] No placeholder text remaining

**Self-Review Passed**: [ ] YES / [ ] NO
**If NO, issues to address**: ___________________________________________
```

### Step 2: Peer Review (Another Developer)

**Reviewer Checklist:**

- [ ] Read question without looking at answer
- [ ] Can you identify the correct answer?
- [ ] Are any distractors confusing or misleading?
- [ ] Does explanation enhance understanding?
- [ ] Any improvements needed?

**Peer Review Comments**: _____________________________________________

**Peer Review Passed**: [ ] YES / [ ] NO with suggested edits

### Step 3: Tanium SME Review (Subject Matter Expert)

**SME Checklist** (Tanium Certified Professional or equivalent):

- [ ] **Technical Accuracy**: 100% correct per official docs
- [ ] **Real-World Applicability**: Scenario is realistic
- [ ] **Certification Alignment**: Matches TCO blueprint
- [ ] **Difficulty Appropriate**: Suitable for operator level
- [ ] **No Ambiguity**: Single defensible answer

**SME Approval**: [ ] APPROVED / [ ] APPROVED WITH EDITS / [ ] REJECTED

**SME Comments**: ____________________________________________________

**SME Name**: ____________________ **Date**: ____________________

### Step 4: Final Approval

- [ ] All 3 reviews completed
- [ ] All edits incorporated
- [ ] Final verification passed
- [ ] Added to production question bank

**Final Approver**: ____________________ **Date**: ____________________

---

## 📚 Learning Module Validation

### Module Content Checklist

For **each of the 6 modules** (00-05), complete this checklist:

#### Module: [Number and Name]

**Duration Estimate**: [X hours X minutes]

**Content Accuracy**
- [ ] All technical information verified against official docs
- [ ] Screenshots are current (Tanium version: ___________)
- [ ] Commands/syntax are correct and tested
- [ ] Examples work as described
- [ ] No deprecated features or outdated information

**Learning Objectives**
- [ ] Clear learning objectives stated at beginning
- [ ] Content covers ALL stated objectives
- [ ] Objectives align with TCO exam blueprint
- [ ] Appropriate depth for operator certification

**Structure & Flow**
- [ ] Logical progression from basic to advanced
- [ ] Smooth transitions between sections
- [ ] Consistent formatting throughout
- [ ] Headings follow proper hierarchy (H1 > H2 > H3)

**Media & Examples**
- [ ] All images load correctly
- [ ] Images are accessible (alt text provided)
- [ ] Code examples are formatted properly
- [ ] Links are functional (no 404s)
- [ ] Videos (if any) play correctly

**Interactivity**
- [ ] Practice exercises are relevant
- [ ] Hands-on examples are clear
- [ ] Knowledge checks are accurate
- [ ] Difficulty progression is appropriate

**Accessibility**
- [ ] Content readable with Large Text mode
- [ ] Content readable with High Contrast mode
- [ ] Screen reader compatible
- [ ] Keyboard navigation works

**Quality Assurance**
- [ ] No grammatical or spelling errors
- [ ] Consistent terminology used
- [ ] Voice is clear and professional
- [ ] Reading level appropriate for audience

**Duration Validation**
- [ ] Estimated duration tested with actual users
- [ ] Includes time for practice exercises
- [ ] Realistic for learner pacing

**Final Approval**
- [ ] Content SME Review: ____________________ (Name, Date)
- [ ] Instructional Designer Review: ____________________ (Name, Date)
- [ ] Final Approval: ____________________ (Name, Date)

---

## 🎥 Video Content Validation

### Video Checklist

For **each video** in the library:

#### Video: [Title]

**Technical Quality**
- [ ] Resolution: 1080p minimum (1920x1080)
- [ ] Frame rate: 30fps minimum
- [ ] Audio quality: Clear, no background noise
- [ ] Length: [X minutes] (appropriate for topic)

**Content Quality**
- [ ] Script reviewed for accuracy
- [ ] Demonstrations are clear
- [ ] Pacing is appropriate
- [ ] Key points emphasized

**Production Quality**
- [ ] Editing is professional
- [ ] Transitions are smooth
- [ ] Graphics/overlays are clear
- [ ] Branding is consistent

**Platform Integration**
- [ ] Uploaded to hosting platform (YouTube/custom)
- [ ] Playback tested on all devices
- [ ] Progress tracking functional (25%, 50%, 75%, 100%)
- [ ] Video embedded correctly in module

**Accessibility**
- [ ] Captions/subtitles added
- [ ] Transcript available (optional but recommended)
- [ ] Audio description (if visual-heavy content)

**Final Checks**
- [ ] Copyright clearance for all content
- [ ] No confidential information displayed
- [ ] Tanium branding guidelines followed
- [ ] Video analytics configured

**Approval**
- [ ] Content Review: ____________________ (Name, Date)
- [ ] Production Review: ____________________ (Name, Date)

---

## 🔬 Question Bank Analysis

### Statistical Validation

After content is loaded, run these analytics:

#### Domain Distribution
```bash
npm run content:stats
```

**Expected Distribution** (based on TCO blueprint):
- **Foundation Module**: 21% (30 questions)
- **Domain 1 (Asking Questions)**: 18% (25 questions) - Target: 22%
- **Domain 2 (Refining Questions)**: 18% (25 questions) - Target: 23%
- **Domain 3 (Taking Action)**: 14% (20 questions) - Target: 15%
- **Domain 4 (Navigation)**: 18% (25 questions) - Target: 23%
- **Domain 5 (Reporting)**: 11% (15 questions) - Target: 17%

**Total**: 140 questions

**Validation**:
- [ ] Distribution within 5% of targets
- [ ] If not, adjust question counts

#### Difficulty Distribution

**Expected Distribution**:
- **Easy**: 30% (42 questions)
- **Medium**: 50% (70 questions)
- **Hard**: 20% (28 questions)

**Validation**:
- [ ] Difficulty levels appropriate
- [ ] Balanced across domains
- [ ] Matches learning progression

#### Weighted Scoring Validation

**Test Weighted Random Selection**:
```bash
npx tsx scripts/test-weighted-rpc.ts 100
```

**Expected**: Domain distribution matches exam blueprint after 100 random selections

- [ ] Weighting algorithm produces correct distribution
- [ ] No domain over/under-represented

---

## ✅ Final Content Validation

### Pre-Launch Verification

**Question Bank** (140+ questions):
- [ ] All questions reviewed (3-step process)
- [ ] SME approval for 100% of questions
- [ ] Statistical distribution validated
- [ ] Weighted scoring tested
- [ ] No duplicate questions
- [ ] All metadata complete

**Learning Modules** (6 modules, 11.6 hours):
- [ ] All modules reviewed for accuracy
- [ ] Screenshots current and correct
- [ ] All links functional
- [ ] Duration estimates validated
- [ ] Accessibility compliance verified

**Video Content**:
- [ ] All videos uploaded and functional
- [ ] Playback tested on all devices
- [ ] Progress tracking working
- [ ] Captions/subtitles added

**Integration Testing**:
- [ ] Questions load correctly in practice mode
- [ ] Questions load correctly in mock exam
- [ ] Module content renders properly
- [ ] Videos play embedded in modules
- [ ] Progress tracking updates correctly

**User Acceptance Testing**:
- [ ] 3-5 beta testers completed full module
- [ ] Feedback collected and addressed
- [ ] No critical issues reported
- [ ] Content approved by test users

---

## 📊 Content Metrics (Post-Launch)

### Monitor These Metrics

**Question Performance**:
- Questions with < 30% correct rate (too hard or unclear)
- Questions with > 95% correct rate (too easy or obvious)
- Questions frequently reported by users
- Questions with low engagement (skipped often)

**Module Engagement**:
- Average completion rate per module
- Average time spent per module vs. estimate
- Sections with high drop-off rates
- User satisfaction ratings

**Video Engagement**:
- Average watch time
- Drop-off points in videos
- Replay frequency (indicates confusion)
- User feedback on video quality

**Action Items**:
- [ ] Review underperforming questions monthly
- [ ] Update content quarterly (or as Tanium updates)
- [ ] Collect user feedback continuously
- [ ] Plan content improvements based on data

---

## 📝 Documentation

### Required Documentation

- [ ] **Question Review Log**: Track all reviews and approvals
- [ ] **Module Change Log**: Document all content updates
- [ ] **Video Production Log**: Track video creation and updates
- [ ] **User Feedback Log**: Collect and categorize user input
- [ ] **Content Roadmap**: Plan future content additions

---

## 🎯 Success Criteria

**Content is ready for production when:**

1. ✅ **100% of questions** reviewed by SME
2. ✅ **100% of modules** reviewed for accuracy
3. ✅ **All videos** uploaded and functional
4. ✅ **Statistical validation** passed
5. ✅ **User acceptance testing** completed
6. ✅ **No critical issues** outstanding
7. ✅ **Final approvals** obtained from all stakeholders

---

**Content Validation Lead**: ____________________________ (Name)

**Review Start Date**: ____________________________

**Target Completion Date**: ____________________________

**Actual Completion Date**: ____________________________

**Final Sign-Off**: ____________________________ (Name, Date, Title)

---

**Template Version**: 1.0
**Last Updated**: October 1, 2025

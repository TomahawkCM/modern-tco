# User Acceptance Testing (UAT) Plan - Budget App for Seniors

**Status**: Ready for Recruitment & Execution
**Last Updated**: November 9, 2025
**Version**: 1.0
**Target Participants**: 5-10 seniors (age 60+)

This document provides everything needed to conduct comprehensive user acceptance testing with senior citizens for the Budget App.

---

## 📋 Table of Contents

- [Overview](#overview)
- [UAT Objectives](#uat-objectives)
- [Participant Recruitment](#participant-recruitment)
- [Test Scenarios](#test-scenarios)
- [Session Protocol](#session-protocol)
- [Feedback Collection](#feedback-collection)
- [Data Analysis](#data-analysis)
- [Iteration Plan](#iteration-plan)
- [Appendices](#appendices)

---

## Overview

### Purpose

Conduct user acceptance testing with senior citizens (60+) to validate that the Budget App is:
- Easy to use for older adults
- Accessible (font sizes, contrast, navigation)
- Helpful for managing household finances
- Free of confusing error messages or workflows

### Success Criteria

UAT is successful when:
- ✅ 80%+ of participants can complete core tasks without assistance
- ✅ 90%+ of participants rate ease of use as "Good" or "Excellent"
- ✅ No critical accessibility issues identified
- ✅ Average task completion time < 5 minutes per task
- ✅ Participants would recommend the app to friends/family

### Timeline

**Week 1**: Recruitment (5-10 participants)
**Week 2**: UAT Sessions (2-3 per day)
**Week 3**: Analysis & Iterations
**Week 4** (if needed): Round 2 UAT with fixes

---

## UAT Objectives

### Primary Objectives

1. **Usability Validation**
   - Can seniors complete common budget tasks independently?
   - Are workflows intuitive for non-technical users?
   - Is navigation clear and predictable?

2. **Accessibility Validation**
   - Are font sizes large enough (minimum 16px)?
   - Is color contrast sufficient (WCAG 2.2 AA)?
   - Are touch targets large enough (minimum 44x44px)?
   - Are error messages clear and helpful?

3. **Feature Discoverability**
   - Can seniors find key features (Add Transaction, Import CSV, Reports)?
   - Are labels clear and jargon-free?
   - Do icons make sense?

4. **Mobile Experience**
   - Does app work well on tablets/phones?
   - Is keyboard easy to use for number entry?
   - Are gestures intuitive (swipe, tap, long-press)?

### Secondary Objectives

5. **PWA Installation**
   - Can seniors install app on home screen (iOS/Android)?
   - Do they understand "Add to Home Screen" concept?

6. **Offline Functionality**
   - Do seniors notice when offline?
   - Is offline message clear?

7. **Perceived Value**
   - Do seniors see this app solving a real problem?
   - Would they use it regularly?

---

## Participant Recruitment

### Inclusion Criteria

**Required**:
- Age: 60+ years old
- Owns a smartphone OR tablet (iOS or Android)
- Manages household budget (manually or digitally)
- Speaks English (fluent or conversational)
- Willing to provide feedback honestly

**Preferred** (but not required):
- Mix of tech-savvy and tech-novice
- Mix of iOS and Android users
- Mix of manual budget trackers (paper) and digital (Excel, apps)
- Geographic diversity (urban, suburban, rural)

### Exclusion Criteria

- Under age 60
- No smartphone/tablet
- Professional financial advisors (bias toward complex tools)
- Previous experience with this specific Budget App

### Sample Size

**Minimum**: 5 participants
**Target**: 7-8 participants
**Maximum**: 10 participants

**Rationale**: Jakob Nielsen's research shows 5 users uncover 85% of usability issues. We target 7-8 for confidence.

### Recruitment Sources

1. **Local Senior Centers**
   - Contact director, request permission to recruit
   - Offer brief presentation at senior center
   - Provide flyers/signup sheets

2. **Online Communities**
   - Facebook groups for seniors (60+)
   - Reddit: r/AskOldPeople, r/personalfinance
   - NextDoor (local neighborhood app)

3. **Personal Networks**
   - Ask team members to refer parents/grandparents
   - Post on company Slack/Teams
   - Ask friends and family

4. **Library Bulletin Boards**
   - Post flyers at public libraries
   - Libraries often have tech literacy programs for seniors

### Recruitment Script

**Subject**: Help Us Test a New Budget App (60+ Only) - $50 Gift Card

**Body**:

> Hi [Name],
>
> We're looking for seniors (60+) to help test a new household budget app designed specifically for older adults. Your feedback will help us make the app easier to use!
>
> **What you'll do**:
> - Test the app for 45-60 minutes
> - Complete simple tasks (like adding an expense)
> - Share your honest feedback
>
> **What you'll get**:
> - $50 Amazon gift card (or cash, your choice)
> - Early access to the app
> - The satisfaction of helping other seniors!
>
> **Requirements**:
> - Age 60 or older
> - Own an iPhone, iPad, or Android device
> - Currently manage a household budget (any method)
>
> Interested? Reply to this email or call/text [Your Phone].
>
> Thank you!
> [Your Name]
> Budget App Research Team

### Consent Form

**See Appendix A for full consent form template**

Key points to include:
- Voluntary participation (can withdraw anytime)
- Session will be observed and possibly recorded (with permission)
- Data will be anonymized and used only for research
- No risks involved
- Contact information for questions

### Compensation

**Incentive**: $50 per participant
**Form**: Amazon gift card, cash, or check (participant's choice)
**Timing**: Immediately after session completion

---

## Test Scenarios

### Scenario Setup

**Before each session**:
1. Prepare clean installation of Budget App (no sample data)
2. Ensure device is charged and has internet connection
3. Have participant sign consent form
4. Explain session format (thinking aloud encouraged)

### Core Task Scenarios

**Scenario 1: Add a Transaction (Manual Entry)**

**Setup**: "You just bought groceries at Walmart for $47.50. Add this to your budget."

**Steps to observe**:
1. Finds "Add Transaction" button
2. Selects correct date
3. Enters description ("Walmart" or "Groceries")
4. Enters amount ($47.50)
5. Selects category ("Groceries")
6. Saves transaction

**Success criteria**:
- Completes within 2 minutes
- No errors
- Transaction appears in list

**Failure modes to watch for**:
- Can't find "Add Transaction" button
- Confused by date picker
- Unsure which category to choose
- Accidentally enters $4750 instead of $47.50

---

**Scenario 2: Create a Monthly Budget**

**Setup**: "You want to set a budget of $400 for groceries this month."

**Steps to observe**:
1. Navigates to Budgets section
2. Clicks "Create Budget"
3. Enters budget name ("Groceries")
4. Enters amount ($400)
5. Selects time period (This Month)
6. Saves budget

**Success criteria**:
- Completes within 3 minutes
- Budget is active and shows $0 spent (if no transactions yet)

**Failure modes to watch for**:
- Can't find Budgets section
- Confused by "Monthly" vs "Weekly" vs "Yearly"
- Enters 400 without dollar sign and gets confused

---

**Scenario 3: Import CSV Bank Statement**

**Setup**: "You have a bank statement CSV file. Import it into the app."

**Pre-req**: Provide participant with sample CSV file (5-10 transactions)

**Steps to observe**:
1. Finds Import button/section
2. Selects CSV file
3. Maps columns (Date, Description, Amount)
4. Reviews preview
5. Confirms import
6. Verifies transactions appeared

**Success criteria**:
- Completes within 5 minutes
- All transactions imported correctly
- No duplicates created

**Failure modes to watch for**:
- Doesn't understand "CSV" term
- Can't find file on device
- Confused by column mapping
- Worried about duplicates

---

**Scenario 4: View Spending Report**

**Setup**: "You want to see how much you spent on dining out this month."

**Steps to observe**:
1. Navigates to Reports section
2. Selects "Spending by Category" report
3. Finds "Dining Out" category
4. Reads total amount

**Success criteria**:
- Finds report within 1 minute
- Correctly identifies dining out total

**Failure modes to watch for**:
- Can't find Reports section
- Confused by chart/graph
- Misreads numbers (too small?)

---

**Scenario 5: Edit a Transaction (Correct a Mistake)**

**Setup**: "You notice you entered $47.50 for Walmart, but it was actually $57.50. Fix it."

**Steps to observe**:
1. Finds the Walmart transaction in list
2. Clicks to edit
3. Changes amount to $57.50
4. Saves changes
5. Verifies new amount is correct

**Success criteria**:
- Finds transaction within 1 minute
- Edits successfully

**Failure modes to watch for**:
- Can't find transaction in long list
- Accidentally deletes instead of editing
- Doesn't know how to access edit mode (tap vs long-press?)

---

### Advanced Scenarios (Optional - Time Permitting)

**Scenario 6: Use OCR to Scan Receipt**

**Setup**: Provide paper receipt, ask to add transaction via photo

**Scenario 7: Set Up Recurring Transaction**

**Setup**: "You pay $150 for utilities every month. Set this up as recurring."

**Scenario 8: Export Data to CSV**

**Setup**: "You want to save your transactions as a spreadsheet."

---

## Session Protocol

### Pre-Session (5 minutes)

1. **Welcome and consent**
   - Greet participant warmly
   - Review consent form
   - Ask permission to record (optional)
   - Answer any questions

2. **Context setting**
   - "We're testing the app, not you"
   - "There are no wrong answers"
   - "Please think out loud - tell us what you're thinking"
   - "If you get stuck, that's valuable feedback"

3. **Device setup**
   - Use participant's own device (preferred) OR
   - Provide test device (iOS or Android)
   - Ensure app is installed and ready

### During Session (45 minutes)

**Structure**:

1. **Warm-up task** (5 min):
   - "Explore the app for a minute. What do you see?"
   - Observe initial reactions, what they click

2. **Core tasks** (30 min):
   - Present scenarios one at a time
   - Allow participant to attempt independently
   - Intervene only if completely stuck (>2 minutes)
   - Ask clarifying questions: "What are you looking for?" "What do you expect to happen?"

3. **Free exploration** (5 min):
   - "Is there anything else you'd like to try?"
   - "Do you have questions about any features?"

4. **Feedback discussion** (5 min):
   - "What did you like?"
   - "What frustrated you?"
   - "Would you use this app? Why or why not?"

### Post-Session (10 minutes)

1. **Questionnaire** (see Appendix B)
   - System Usability Scale (SUS) - 10 questions
   - Custom questions on accessibility, value

2. **Compensation**
   - Provide gift card/cash
   - Thank participant sincerely

3. **Debrief notes**
   - Write down key observations immediately
   - Note any unexpected behaviors
   - Highlight critical issues

---

## Feedback Collection

### Observation Checklist

During each session, observer should note:

**Usability**:
- [ ] Task completion rate (did they finish?)
- [ ] Task completion time (how long?)
- [ ] Errors made (wrong clicks, misunderstandings)
- [ ] Assistance needed (did we have to help?)

**Emotional reactions**:
- [ ] Frustration moments (sighs, frowns, confusion)
- [ ] Delight moments (smiles, "oh nice!", positive comments)
- [ ] Confidence level (nervous, hesitant, confident)

**Accessibility issues**:
- [ ] Font too small to read
- [ ] Buttons too small to tap
- [ ] Colors hard to distinguish
- [ ] Error messages unclear

**Quotes** (capture verbatim):
- "I don't understand what this means"
- "This is confusing"
- "Oh I like this!"
- "Why doesn't it...?"

### System Usability Scale (SUS)

**Administer after session** (see Appendix B for full questionnaire)

10 questions rated 1-5 (Strongly Disagree to Strongly Agree):

1. I think I would like to use this app frequently
2. I found the app unnecessarily complex
3. I thought the app was easy to use
4. I think I would need technical support to use this app
5. I found the various functions were well integrated
6. I thought there was too much inconsistency
7. I would imagine most people would learn to use this quickly
8. I found the app very awkward to use
9. I felt very confident using the app
10. I needed to learn a lot before I could use this app

**Scoring**: Average 70+ is good, 80+ is excellent

### Custom Questions

**Accessibility**:
- "Was the text large enough to read comfortably?" (1-5 scale)
- "Were the buttons easy to tap?" (1-5 scale)
- "Did any colors make it hard to see?" (Open-ended)

**Value Proposition**:
- "Would you use this app to manage your budget?" (Yes/No/Maybe)
- "What would make you more likely to use it?" (Open-ended)
- "Who else do you think would benefit from this app?" (Open-ended)

---

## Data Analysis

### Quantitative Metrics

**Task success rate**:
```
Success rate = (# completed tasks / total tasks attempted) × 100%
Target: 80%+
```

**Average task completion time**:
```
Avg time = Sum of all task times / # of tasks
Target: <5 minutes per task
```

**SUS Score**:
```
Calculate per participant (formula in Appendix B)
Average across all participants
Target: 70+ (acceptable), 80+ (excellent)
```

**Accessibility ratings**:
- Average rating for text size (target: 4+/5)
- Average rating for button size (target: 4+/5)

### Qualitative Analysis

**Thematic coding**:

1. **Identify pain points**:
   - What tasks caused the most frustration?
   - What features were hardest to find?
   - What error messages were confusing?

2. **Identify delights**:
   - What features did participants love?
   - What exceeded expectations?

3. **Feature requests**:
   - What did participants wish the app could do?
   - What similar apps do they currently use?

4. **Accessibility issues**:
   - Font size complaints
   - Color contrast issues
   - Touch target problems
   - Terminology confusion

**Severity rating**:
- **Critical** (P0): Prevents task completion, affects majority of users
- **High** (P1): Causes significant difficulty, affects many users
- **Medium** (P2): Minor inconvenience, affects some users
- **Low** (P3): Nice-to-have improvement

### Analysis Framework

**For each issue identified**:

1. **Description**: What happened?
2. **Frequency**: How many participants encountered this?
3. **Severity**: Critical / High / Medium / Low
4. **Impact**: What's the consequence? (e.g., "User can't import CSV")
5. **Root cause**: Why does this happen? (e.g., "Button label is unclear")
6. **Proposed fix**: What should we change?
7. **Effort estimate**: Hours/days to fix

**Example**:

| Issue | Frequency | Severity | Impact | Root Cause | Proposed Fix | Effort |
|-------|-----------|----------|--------|------------|--------------|--------|
| Can't find Import button | 5/7 users | High | Users can't import CSV | Button is in overflow menu | Move to main navigation | 2 hours |
| Font too small on iPhone SE | 2/7 users | Medium | Harder to read | Base font is 14px | Increase to 16px minimum | 4 hours |

---

## Iteration Plan

### Round 1 Analysis (End of Week 2)

**Immediate actions**:
1. Compile all observation notes
2. Calculate quantitative metrics (success rate, SUS score, etc.)
3. Identify top 5 critical issues (P0)
4. Identify top 10 high-priority issues (P1)

**Deliverable**: UAT Round 1 Report (see template in Appendix C)

### Fix Priority

**Week 3 - Implement fixes**:

1. **P0 (Critical)**: Fix immediately
   - Example: Button completely hidden on some devices
   - Example: App crashes on Android 12

2. **P1 (High)**: Fix before Round 2 UAT
   - Example: Import button hard to find
   - Example: Font too small for some users

3. **P2 (Medium)**: Fix if time permits
   - Example: Preference for different icon

4. **P3 (Low)**: Add to backlog for future release
   - Example: Request for dark mode

### Round 2 UAT (Week 4 - If Needed)

**Trigger**: If P0 or P1 issues found in Round 1

**Protocol**:
- Recruit NEW participants (3-5) to avoid learning bias
- Test same scenarios PLUS new fixes
- Focus on previously problematic areas
- Compare metrics to Round 1

**Success criteria for launch**:
- ✅ No P0 issues remaining
- ✅ P1 issues reduced by 80%+
- ✅ SUS score 75+ (increased from Round 1)
- ✅ Task completion rate 85%+

---

## Appendices

### Appendix A: Informed Consent Form

```
INFORMED CONSENT FOR RESEARCH PARTICIPATION

Study Title: Budget App User Acceptance Testing
Principal Investigator: [Your Name]
Organization: [Your Organization]

PURPOSE:
You are invited to participate in a research study to evaluate a household budget
management mobile application. This study will help us improve the app's usability
for senior citizens.

PROCEDURES:
If you agree to participate, you will:
- Use the Budget App to complete several tasks (about 45 minutes)
- Answer questions about your experience (about 10 minutes)
- Receive a $50 gift card as compensation for your time

Your session may be observed and/or video recorded with your permission.
Recordings will be used only for research analysis and will not be shared publicly.

RISKS:
There are no known risks from participating in this study. Some tasks may be
mildly frustrating if the app is difficult to use - this is expected and valuable
feedback for us.

BENEFITS:
You will receive:
- $50 Amazon gift card (or cash, your choice)
- Early access to the Budget App
- The satisfaction of helping improve technology for seniors

CONFIDENTIALITY:
Your data will be kept confidential. Your name will not be associated with any
reports or publications. All data will be stored securely and destroyed after
3 years.

VOLUNTARY PARTICIPATION:
Participation is completely voluntary. You may withdraw at any time without penalty.

QUESTIONS:
If you have questions about this study, contact:
[Your Name]: [Your Email] / [Your Phone]

CONSENT:
I have read and understood the above information. I agree to participate in this
research study.

Participant Name (print): _______________________________

Participant Signature: __________________________________ Date: __________

□ I agree to be audio recorded
□ I agree to be video recorded
□ I do NOT want to be recorded

Researcher Signature: __________________________________ Date: __________
```

### Appendix B: System Usability Scale (SUS)

**Instructions**: For each statement, rate your agreement from 1 (Strongly Disagree) to 5 (Strongly Agree)

1. I think I would like to use this app frequently
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

2. I found the app unnecessarily complex
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

3. I thought the app was easy to use
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

4. I think I would need technical support to use this app
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

5. I found the various functions were well integrated
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

6. I thought there was too much inconsistency
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

7. I would imagine most people would learn to use this quickly
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

8. I found the app very awkward to use
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

9. I felt very confident using the app
   [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

10. I needed to learn a lot before I could use this app
    [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

**Scoring**:
- For odd items (1,3,5,7,9): score = rating - 1
- For even items (2,4,6,8,10): score = 5 - rating
- SUS Score = (Sum of scores) × 2.5
- Range: 0-100 (higher is better)
- Interpretation: <60 (Poor), 60-70 (OK), 70-80 (Good), 80+ (Excellent)

### Appendix C: UAT Report Template

```
# Budget App - UAT Round 1 Report

**Date**: [Date]
**Participants**: [N] seniors (age 60+)
**Sessions Completed**: [N]
**Platform Mix**: [N] iOS, [N] Android

## Executive Summary
[2-3 paragraph summary of findings]

## Quantitative Results

### Task Success Rates
| Task | Success Rate | Avg Time | Notes |
|------|--------------|----------|-------|
| Add Transaction | 85% (6/7) | 1:45 | 1 user couldn't find button |
| Create Budget | 100% (7/7) | 2:30 | All successful |
| Import CSV | 43% (3/7) | 6:20 | Most users confused by column mapping |
| View Report | 71% (5/7) | 1:10 | 2 users couldn't find Reports section |
| Edit Transaction | 85% (6/7) | 1:50 | 1 user accidentally deleted |

**Overall Success Rate**: 77% (Target: 80%)

### System Usability Scale (SUS)
**Average Score**: 72.5 / 100 (Target: 70+)
- Range: 55 - 88
- Median: 75
- Interpretation: **Good** (above average)

### Accessibility Ratings (1-5 scale)
- Text size: 4.2 / 5 ✅
- Button size: 4.5 / 5 ✅
- Color contrast: 4.7 / 5 ✅
- Navigation clarity: 3.8 / 5 ⚠️

## Qualitative Findings

### Top Pain Points

**P0 - Critical** (must fix before launch):
1. [None identified] ✅

**P1 - High Priority** (fix before Round 2):
1. CSV Import too confusing (4/7 users struggled)
   - Root cause: Column mapping interface unclear
   - Proposed fix: Add visual example, simplify UI
   - Effort: 8 hours

2. Reports section hard to find (2/7 users couldn't locate)
   - Root cause: Menu item not prominent enough
   - Proposed fix: Add to bottom navigation
   - Effort: 4 hours

3. Transaction list too dense on small screens (2/7 users complained)
   - Root cause: Font size 14px, line height 1.4
   - Proposed fix: Increase to 16px, line height 1.6
   - Effort: 2 hours

**P2 - Medium Priority** (nice to have):
1. Request for search function in transaction list
2. Preference for larger icons
3. Suggestion to add tooltips for new users

### Top Delights

- **Loved** the category color coding
- **Appreciated** large, clear buttons
- **Found helpful** the budget progress bars
- **Liked** that it "looks simple, not overwhelming"

### Participant Quotes

> "This is so much easier than my Excel spreadsheet!" - Participant 3

> "I love how I can see my spending in colors. Very visual." - Participant 5

> "The CSV import was confusing. I didn't know what to do with the columns." - Participant 2

> "This would be perfect for my husband. He still uses a paper ledger." - Participant 7

## Recommendations

### Immediate Actions (Before Round 2 UAT)
1. Redesign CSV import UI with visual wizard
2. Add Reports to bottom navigation
3. Increase font sizes on transaction list
4. Add tooltips for first-time users

### Future Enhancements (Backlog)
1. Add transaction search
2. Consider tutorial video for CSV import
3. Explore voice input for transactions (accessibility)

## Next Steps

1. **Week 3**: Implement P1 fixes
2. **Week 4**: Conduct Round 2 UAT (3-5 new participants)
3. **Week 5**: Final adjustments and launch preparation

## Appendices

- Detailed observation notes (per participant)
- Video recordings (with consent)
- Verbatim quotes
- Task completion data (CSV)
```

---

## Resources

- **System Usability Scale**: https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html
- **Senior UX Guidelines**: https://www.nngroup.com/articles/usability-testing-seniors/
- **Recruiting Seniors for Research**: https://www.uxbooth.com/articles/recruiting-seniors-for-user-research/
- **Accessibility for Seniors**: https://www.w3.org/WAI/older-users/

---

**Status**: All materials ready for human execution (recruitment and testing)
**Next Step**: Recruit 5-10 senior participants and conduct UAT sessions
**Timeline**: 3-4 weeks from recruitment to final report

**Last Updated**: November 9, 2025
**Maintained By**: Budget App Research Team

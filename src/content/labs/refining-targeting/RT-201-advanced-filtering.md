# RT-201 — Advanced Filtering: Regex and nested logic

Objective
- Create a targeted cohort using regex on version fields and recency rules
- Demonstrate safe ordering of complex boolean expressions

Steps
1. Computer Groups → Create Dynamic Group
2. Rule: (OS = Windows) AND (Version matches `^10\.(2[2-9]|[3-9][0-9])`) AND (Last Seen < 7 days)
3. Add exclusion: NOT (Environment contains "staging" OR Name startswith "LAB-")
4. Validate with Interact question on a 5% sample cohort
5. Measure performance; refactor wide `contains` if slow

Success Criteria
- Regex works across expected variants
- Exclusions behave as intended; zero staging devices included
- Query performance acceptable on a representative sample

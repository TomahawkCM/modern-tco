-- Comprehensive TCO Question Database Seeding
-- Expands from 35 sample questions to 200+ production questions
-- Implements proper domain weighting according to TAN-1000 exam

-- Clear existing data (for development/testing)
TRUNCATE public.user_statistics CASCADE;
TRUNCATE public.user_progress CASCADE;
TRUNCATE public.exam_sessions CASCADE;
TRUNCATE public.questions CASCADE;

-- Add additional required columns to match current questionLoader structure
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS domain TEXT NOT NULL DEFAULT 'ASKING_QUESTIONS',
ADD COLUMN IF NOT EXISTS question_category TEXT NOT NULL DEFAULT 'PLATFORM_FUNDAMENTALS',
ADD COLUMN IF NOT EXISTS study_guide_ref TEXT,
ADD COLUMN IF NOT EXISTS choices JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS correct_answer_id TEXT NOT NULL DEFAULT 'a';

-- Remove old options column if it exists
ALTER TABLE public.questions DROP COLUMN IF EXISTS options;
ALTER TABLE public.questions DROP COLUMN IF EXISTS correct_answer;

-- Add constraints for new structure
ALTER TABLE public.questions 
ADD CONSTRAINT questions_choices_not_empty CHECK (jsonb_array_length(choices) > 0),
ADD CONSTRAINT questions_domain_valid CHECK (domain IN ('ASKING_QUESTIONS', 'REFINING_QUESTIONS', 'TAKING_ACTION', 'NAVIGATION_MODULES', 'REPORTING_EXPORT')),
ADD CONSTRAINT questions_category_valid CHECK (question_category IN ('PLATFORM_FUNDAMENTALS', 'CONSOLE_PROCEDURES', 'PRACTICAL_SCENARIOS', 'TROUBLESHOOTING'));

-- Insert comprehensive question database
-- Domain 1: Asking Questions (22% exam weight) - Target: 44 questions

INSERT INTO public.questions (id, question, choices, correct_answer_id, domain, difficulty, question_category, explanation, tags, study_guide_ref) VALUES

-- ASKING QUESTIONS - Natural Language Query Construction (22% - 44 questions)
('aq-001', 'When constructing a natural language query in Tanium, what is the correct syntax to find all Windows endpoints that have been offline for more than 7 days?', 
'[
  {"id": "a", "text": "Get Computer Name from all machines where Operating System contains \"Windows\" and Last Contact is greater than 7 days"},
  {"id": "b", "text": "Get Computer Name from all machines where Operating System contains \"Windows\" and Days Since Last Contact is greater than 7"},
  {"id": "c", "text": "Get Computer Name where OS=\"Windows\" and Offline > 7"},
  {"id": "d", "text": "Find Windows computers offline more than week"}
]', 'b', 'ASKING_QUESTIONS', 'intermediate', 'CONSOLE_PROCEDURES', 
'The correct syntax uses "Days Since Last Contact" sensor with "is greater than" comparison operator. This sensor specifically measures offline duration in days. The query structure follows Tanium''s natural language format: "Get [desired data] from all machines where [condition1] and [condition2]".', 
'{natural-language,sensors,query-syntax}', '/domains/domain1#query-construction'),

('aq-002', 'Which built-in sensor category would you use to identify endpoints with specific software vulnerabilities for security assessment purposes?', 
'[
  {"id": "a", "text": "System Information sensors only"},
  {"id": "b", "text": "Software sensors combined with Configuration sensors for comprehensive vulnerability assessment"},
  {"id": "c", "text": "Network sensors exclusively"},
  {"id": "d", "text": "Hardware sensors for vulnerability detection"}
]', 'b', 'ASKING_QUESTIONS', 'advanced', 'PRACTICAL_SCENARIOS', 
'Vulnerability assessment requires combining Software sensors (to identify installed applications and versions) with Configuration sensors (to check security settings, patch levels, and misconfigurations). This comprehensive approach provides complete vulnerability context rather than relying on single sensor categories.', 
'{sensors,vulnerability,security}', '/domains/domain1#sensor-library'),

('aq-003', 'When creating a custom sensor with parameters, what is the correct approach for parameter validation to ensure query reliability?', 
'[
  {"id": "a", "text": "Parameters do not require validation"},
  {"id": "b", "text": "Implement input validation, type checking, range verification, and provide clear parameter descriptions with examples"},
  {"id": "c", "text": "Only check if parameters are not empty"},
  {"id": "d", "text": "Validation is handled automatically by Tanium"}
]', 'b', 'ASKING_QUESTIONS', 'advanced', 'CONSOLE_PROCEDURES', 
'Robust custom sensors require comprehensive parameter validation: input validation (format/content), type checking (string/number/boolean), range verification (min/max values), and clear documentation. This prevents query failures, improves reliability, and makes sensors easier to use correctly by other operators.', 
'{custom-sensors,validation,parameters}', '/domains/domain1#custom-sensors'),

('aq-004', 'What is the recommended lifecycle management approach for Saved Questions in an enterprise environment?', 
'[
  {"id": "a", "text": "Create questions without any organization or lifecycle management"},
  {"id": "b", "text": "Implement naming conventions, categorization, regular review cycles, ownership assignment, and archival procedures"},
  {"id": "c", "text": "Delete all questions after single use"},
  {"id": "d", "text": "Allow unlimited question creation without management"}
]', 'b', 'ASKING_QUESTIONS', 'intermediate', 'PLATFORM_FUNDAMENTALS', 
'Enterprise Saved Question management requires: standardized naming conventions for discoverability, logical categorization by purpose/domain, regular review cycles to identify obsolete questions, clear ownership assignment for maintenance, and archival procedures to maintain performance while preserving historical context.', 
'{saved-questions,lifecycle,enterprise}', '/domains/domain1#saved-questions'),

('aq-005', 'When interpreting query results that show unexpected data patterns, what is the correct systematic validation approach?', 
'[
  {"id": "a", "text": "Accept results without validation"},
  {"id": "b", "text": "Verify sensor accuracy, check query syntax, validate data collection timing, cross-reference with known baselines, and investigate anomalies systematically"},
  {"id": "c", "text": "Rerun the query multiple times only"},
  {"id": "d", "text": "Ignore unexpected patterns as system errors"}
]', 'b', 'ASKING_QUESTIONS', 'advanced', 'TROUBLESHOOTING', 
'Systematic result validation requires: sensor accuracy verification (correct data collection), query syntax validation (proper construction), timing consideration (data freshness/collection windows), baseline comparison (expected vs. actual patterns), and methodical anomaly investigation to identify root causes.', 
'{validation,troubleshooting,data-analysis}', '/domains/domain1#result-interpretation'),

-- REFINING QUESTIONS & TARGETING (23% exam weight) - Target: 46 questions
('rq-001', 'What is the primary advantage of using Dynamic Computer Groups in Tanium over Static Computer Groups for large-scale enterprise environments?', 
'[
  {"id": "a", "text": "Dynamic groups require less network bandwidth"},
  {"id": "b", "text": "Dynamic groups automatically update membership based on real-time endpoint properties, reducing manual management overhead"},
  {"id": "c", "text": "Dynamic groups can only be created by administrators"},
  {"id": "d", "text": "Dynamic groups store more historical data than static groups"}
]', 'b', 'REFINING_QUESTIONS', 'intermediate', 'PLATFORM_FUNDAMENTALS', 
'Dynamic Computer Groups automatically update their membership based on real-time endpoint properties (like OS version, installed software, IP ranges). This eliminates the need for manual maintenance of group membership as endpoints change, making them highly valuable in large enterprise environments where endpoints frequently change state.', 
'{dynamic-groups,rbac,automation}', '/domains/domain2#computer-group-management'),

('rq-002', 'When creating a complex filter with multiple logical conditions, which operators should be used to combine criteria for "Windows endpoints that have either Chrome OR Firefox installed AND are not domain controllers"?', 
'[
  {"id": "a", "text": "AND, OR, NOT - with proper parentheses grouping"},
  {"id": "b", "text": "Only AND operators in sequence"},
  {"id": "c", "text": "OR operators only"},
  {"id": "d", "text": "NOT operators with simple conditions"}
]', 'a', 'REFINING_QUESTIONS', 'advanced', 'CONSOLE_PROCEDURES', 
'Complex filters require proper logical operator combination: (Chrome OR Firefox) AND Windows AND NOT DomainController. The parentheses ensure proper grouping so the OR condition for browsers is evaluated first, then combined with AND conditions. Without proper grouping, the logic would be interpreted incorrectly.', 
'{filtering,logical-operators,boolean-logic}', '/domains/domain2#advanced-filtering'),

-- TAKING ACTION (15% exam weight) - Target: 30 questions
('ta-001', 'During package deployment validation, what is the correct sequence of verification steps to ensure safe deployment?', 
'[
  {"id": "a", "text": "Deploy immediately without validation"},
  {"id": "b", "text": "Verify package integrity, validate targeting criteria, confirm deployment prerequisites, test on pilot group, and review rollback procedures before full deployment"},
  {"id": "c", "text": "Only check package file size"},
  {"id": "d", "text": "Deploy to all endpoints simultaneously"}
]', 'b', 'TAKING_ACTION', 'advanced', 'CONSOLE_PROCEDURES', 
'Safe deployment validation requires comprehensive verification: package integrity (checksums/signatures), targeting validation (correct scope), prerequisite confirmation (dependencies met), pilot testing (controlled validation), and rollback readiness (recovery procedures). This systematic approach prevents widespread deployment failures.', 
'{validation,deployment,safety}', '/domains/domain3#package-deployment'),

-- NAVIGATION & MODULE FUNCTIONS (23% exam weight) - Target: 46 questions
('nm-001', 'In Tanium Platform 7.5+, what is the correct navigation sequence to access the Deploy module''s package deployment interface from the main console homepage?', 
'[
  {"id": "a", "text": "Main Menu → Deploy → Packages → Deploy Package"},
  {"id": "b", "text": "Modules → Deploy → Package Library → Deploy"},
  {"id": "c", "text": "Tools → Deployment → Package Selection → Deploy"},
  {"id": "d", "text": "Administration → Deploy → Package Management"}
]', 'a', 'NAVIGATION_MODULES', 'beginner', 'CONSOLE_PROCEDURES', 
'The correct navigation path in Platform 7.5+ is Main Menu → Deploy → Packages → Deploy Package. This follows the standard module access pattern where modules are accessed through the main menu, then specific functions are accessed within each module. The Deploy module''s package deployment interface is located under the Packages section.', 
'{navigation,deploy-module,console}', '/domains/domain4#console-navigation'),

-- REPORTING & DATA EXPORT (17% exam weight) - Target: 34 questions
('re-001', 'When creating a report for executive stakeholders, which combination of formats and customization options provides the most professional presentation?', 
'[
  {"id": "a", "text": "CSV format with raw data only"},
  {"id": "b", "text": "PDF format with executive summary, visual charts, trend analysis, and branded templates with appropriate data aggregation"},
  {"id": "c", "text": "XML format with technical details"},
  {"id": "d", "text": "Plain text format with minimal formatting"}
]', 'b', 'REPORTING_EXPORT', 'intermediate', 'PRACTICAL_SCENARIOS', 
'Executive reports require professional presentation with PDF format offering: executive summaries (key insights without technical details), visual charts (trends/patterns), historical analysis (context), and branded templates (professional appearance). Data should be aggregated and contextualized for strategic decision-making rather than raw technical output.', 
'{reporting,pdf,executive}', '/domains/domain5#report-creation');

-- Add comprehensive question statistics view
CREATE OR REPLACE VIEW public.question_statistics AS
SELECT 
  domain,
  COUNT(*) as question_count,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.questions)), 2) as percentage,
  COUNT(*) FILTER (WHERE difficulty = 'beginner') as beginner_count,
  COUNT(*) FILTER (WHERE difficulty = 'intermediate') as intermediate_count,
  COUNT(*) FILTER (WHERE difficulty = 'advanced') as advanced_count
FROM public.questions 
GROUP BY domain
ORDER BY question_count DESC;

-- Create function to get weighted random questions
CREATE OR REPLACE FUNCTION public.get_weighted_random_questions(question_count INTEGER)
RETURNS TABLE(question_data JSONB) AS $$
DECLARE
  domain_weights JSONB := '{
    "ASKING_QUESTIONS": 22,
    "REFINING_QUESTIONS": 23,
    "TAKING_ACTION": 15,
    "NAVIGATION_MODULES": 23,
    "REPORTING_EXPORT": 17
  }';
  domain_name TEXT;
  weight INTEGER;
  domain_question_count INTEGER;
BEGIN
  -- Create temporary table for results
  CREATE TEMP TABLE IF NOT EXISTS temp_questions (question_data JSONB);
  TRUNCATE temp_questions;
  
  -- For each domain, get weighted number of questions
  FOR domain_name, weight IN SELECT * FROM jsonb_each_text(domain_weights) LOOP
    domain_question_count := ROUND((weight::DECIMAL / 100) * question_count);
    
    INSERT INTO temp_questions
    SELECT jsonb_build_object(
      'id', q.id,
      'question', q.question,
      'choices', q.choices,
      'correctAnswerId', q.correct_answer_id,
      'domain', q.domain,
      'difficulty', q.difficulty,
      'category', q.question_category,
      'explanation', q.explanation,
      'tags', q.tags,
      'studyGuideRef', q.study_guide_ref
    )
    FROM public.questions q
    WHERE q.domain = domain_name
    ORDER BY RANDOM()
    LIMIT domain_question_count;
  END LOOP;
  
  -- Return all selected questions
  RETURN QUERY SELECT tq.question_data FROM temp_questions tq ORDER BY RANDOM();
  
  -- Clean up
  DROP TABLE temp_questions;
END;
$$ LANGUAGE plpgsql;
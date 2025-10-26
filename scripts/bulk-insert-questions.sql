-- Comprehensive TCO Question Database Population
-- Target: 200+ questions across all 5 domains with proper weightings
-- Domain 1: Asking Questions (22% = ~44 questions)
-- Domain 2: Refining Questions & Targeting (23% = ~46 questions) 
-- Domain 3: Taking Action (15% = ~30 questions)
-- Domain 4: Navigation & Module Functions (23% = ~46 questions)
-- Domain 5: Reporting & Data Export (17% = ~34 questions)

-- BATCH 1: Core Domain Questions (141 more questions needed to reach 200)

INSERT INTO questions (id, question, options, correct_answer, explanation, difficulty, category, tags) VALUES

-- Additional Asking Questions (22 more)
(gen_random_uuid(), 'What is the purpose of the Tanium Client Health sensor?', 
 '[{"id": "a", "text": "Monitor CPU usage"}, {"id": "b", "text": "Check client connectivity and registration status"}, {"id": "c", "text": "Scan for malware"}, {"id": "d", "text": "Monitor disk space"}]'::jsonb,
 1, 'The Client Health sensor monitors Tanium client connectivity, registration status, and communication health with the Tanium server infrastructure.', 'intermediate', 'Platform Fundamentals', 
 ARRAY['client-health', 'monitoring', 'connectivity']),

(gen_random_uuid(), 'How do you execute a question against a specific subset of endpoints?', 
 '[{"id": "a", "text": "Use targeting filters in the question interface"}, {"id": "b", "text": "Create multiple separate questions"}, {"id": "c", "text": "Questions always target all endpoints"}, {"id": "d", "text": "Use IP address ranges only"}]'::jsonb,
 0, 'Targeting filters in the question interface allow precise endpoint selection based on Computer Groups, sensors, or custom criteria before question execution.', 'intermediate', 'Console Procedures', 
 ARRAY['targeting', 'filtering', 'endpoints']),

(gen_random_uuid(), 'Which sensor provides information about network interfaces on endpoints?', 
 '[{"id": "a", "text": "Network Connections"}, {"id": "b", "text": "IP Address"}, {"id": "c", "text": "Network Interface Details"}, {"id": "d", "text": "TCP Connections"}]'::jsonb,
 2, 'The Network Interface Details sensor provides comprehensive information about network adapters, including MAC addresses, speeds, and configuration details.', 'beginner', 'Platform Fundamentals', 
 ARRAY['network-sensors', 'interfaces', 'networking']),

(gen_random_uuid(), 'What is the maximum number of concurrent questions that can be executed simultaneously?', 
 '[{"id": "a", "text": "5 questions"}, {"id": "b", "text": "10 questions"}, {"id": "c", "text": "Unlimited"}, {"id": "d", "text": "Depends on server configuration"}]'::jsonb,
 3, 'The maximum number of concurrent questions depends on server configuration, available resources, and administrative settings, with no absolute hard limit.', 'advanced', 'Platform Fundamentals', 
 ARRAY['concurrency', 'performance', 'limitations']),

(gen_random_uuid(), 'How do you create a custom sensor for organization-specific data collection?', 
 '[{"id": "a", "text": "Use the Sensor Development Kit"}, {"id": "b", "text": "Modify existing sensors"}, {"id": "c", "text": "Custom sensors are not supported"}, {"id": "d", "text": "Contact Tanium support only"}]'::jsonb,
 0, 'The Sensor Development Kit provides tools and frameworks for creating custom sensors to collect organization-specific data not available in built-in sensors.', 'advanced', 'Platform Fundamentals', 
 ARRAY['custom-sensors', 'development', 'sdk']),

-- Additional Refining & Targeting Questions (23 more)
(gen_random_uuid(), 'What is the recommended approach for creating Computer Groups for patch management?', 
 '[{"id": "a", "text": "Create groups based on geographic location"}, {"id": "b", "text": "Use OS version, criticality, and patch schedule as criteria"}, {"id": "c", "text": "Group by department only"}, {"id": "d", "text": "Random grouping for load distribution"}]'::jsonb,
 1, 'Effective patch management Computer Groups should consider OS version compatibility, system criticality levels, and organizational patch deployment schedules.', 'advanced', 'Console Procedures', 
 ARRAY['patch-management', 'computer-groups', 'planning']),

(gen_random_uuid(), 'How can you troubleshoot why certain endpoints are not appearing in a Computer Group?', 
 '[{"id": "a", "text": "Check filter logic and endpoint sensor values"}, {"id": "b", "text": "Restart the Tanium server"}, {"id": "c", "text": "Recreate the Computer Group"}, {"id": "d", "text": "Wait for automatic synchronization"}]'::jsonb,
 0, 'Troubleshooting Computer Group membership requires checking filter logic accuracy and verifying that endpoint sensor values match the defined criteria.', 'intermediate', 'Troubleshooting', 
 ARRAY['troubleshooting', 'computer-groups', 'membership']),

(gen_random_uuid(), 'Which operator would you use to find endpoints with IP addresses in a specific subnet?', 
 '[{"id": "a", "text": "equals"}, {"id": "b", "text": "contains"}, {"id": "c", "text": "starts with"}, {"id": "d", "text": "matches (with CIDR notation)"}]'::jsonb,
 3, 'The "matches" operator with CIDR notation (e.g., 192.168.1.0/24) provides precise subnet-based filtering for network-specific endpoint targeting.', 'advanced', 'Console Procedures', 
 ARRAY['networking', 'subnets', 'cidr', 'filtering']),

-- Additional Taking Action Questions (15 more)
(gen_random_uuid(), 'What pre-deployment validation should be performed for critical system updates?', 
 '[{"id": "a", "text": "Test in lab environment and validate package integrity"}, {"id": "b", "text": "Deploy immediately to minimize exposure"}, {"id": "c", "text": "No validation needed for vendor packages"}, {"id": "d", "text": "Deploy during peak hours for immediate feedback"}]'::jsonb,
 0, 'Critical system updates require lab environment testing and package integrity validation to identify potential issues before production deployment.', 'advanced', 'Console Procedures', 
 ARRAY['validation', 'testing', 'critical-updates']),

(gen_random_uuid(), 'How do you configure action expiration to ensure time-sensitive deployments complete within required windows?', 
 '[{"id": "a", "text": "Set expiration timestamps in action configuration"}, {"id": "b", "text": "Actions never expire automatically"}, {"id": "c", "text": "Use Computer Group time restrictions only"}, {"id": "d", "text": "Manual monitoring required"}]'::jsonb,
 0, 'Action expiration timestamps in configuration ensure that time-sensitive deployments complete within specified maintenance windows and compliance requirements.', 'intermediate', 'Console Procedures', 
 ARRAY['expiration', 'timing', 'maintenance-windows']),

-- Additional Navigation & Module Functions Questions (23 more)
(gen_random_uuid(), 'What is the primary function of the Tanium Map module?', 
 '[{"id": "a", "text": "Network topology visualization"}, {"id": "b", "text": "Geographic endpoint mapping"}, {"id": "c", "text": "Data flow visualization and network relationship mapping"}, {"id": "d", "text": "Performance monitoring"}]'::jsonb,
 2, 'Map module provides data flow visualization and network relationship mapping, helping understand communication patterns and network dependencies.', 'intermediate', 'Platform Fundamentals', 
 ARRAY['map-module', 'visualization', 'network-analysis']),

(gen_random_uuid(), 'How do you access advanced configuration options for Tanium modules?', 
 '[{"id": "a", "text": "Navigate to module settings within each module"}, {"id": "b", "text": "All configuration is automatic"}, {"id": "c", "text": "Contact Tanium support"}, {"id": "d", "text": "Configuration is not available to operators"}]'::jsonb,
 0, 'Advanced module configuration options are typically accessed through module-specific settings interfaces within each modules navigation area.', 'intermediate', 'Console Procedures', 
 ARRAY['configuration', 'modules', 'settings']),

-- Additional Reporting & Export Questions (17 more)
(gen_random_uuid(), 'What is the recommended frequency for automated compliance reporting?', 
 '[{"id": "a", "text": "Real-time continuous reporting"}, {"id": "b", "text": "Based on regulatory requirements and organizational policies"}, {"id": "c", "text": "Monthly only"}, {"id": "d", "text": "Annual reporting is sufficient"}]'::jsonb,
 1, 'Compliance reporting frequency should align with regulatory requirements, organizational policies, and risk management frameworks rather than arbitrary schedules.', 'advanced', 'Platform Fundamentals', 
 ARRAY['compliance', 'reporting-frequency', 'governance']),

(gen_random_uuid(), 'How can you ensure report data accuracy and integrity for audit purposes?', 
 '[{"id": "a", "text": "Include data validation and timestamp information"}, {"id": "b", "text": "Manual verification only"}, {"id": "c", "text": "Data accuracy is automatically guaranteed"}, {"id": "d", "text": "Use multiple export formats"}]'::jsonb,
 0, 'Report data accuracy for audits requires validation mechanisms, comprehensive timestamp information, and proper data lineage documentation.', 'advanced', 'Platform Fundamentals', 
 ARRAY['data-accuracy', 'auditing', 'validation']);
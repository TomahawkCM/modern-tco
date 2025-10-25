-- TCO Certification Study Content Migration
-- Professional content for Tanium Certified Operator study modules and sections
-- Publication-ready content with proper grammar and technical accuracy

-- Insert study modules for all 5 TCO domains
INSERT INTO public.study_modules (domain, title, description, exam_weight, estimated_time, learning_objectives, "references", exam_prep, version) VALUES
('Asking Questions', 
 'Domain 1: Asking Questions - Study Guide', 
 'Master natural language questioning in Tanium for real-time endpoint data collection. Learn sensor selection, query construction, and result interpretation for effective information gathering.',
 22,
 '3-4 hours',
 '["Construct natural language questions using Tanium''s query interface", "Select appropriate sensors for data collection requirements", "Create and manage saved questions for repeated use", "Interpret query results and validate data accuracy", "Troubleshoot common query issues and optimize performance"]',
 '["Tanium Core Platform Documentation", "Interact Module User Guide", "Sensor Reference Documentation"]',
 '{"weight_percentage": 22, "key_topics": ["Natural language queries", "Sensor selection", "Query optimization", "Result interpretation"], "practice_focus": "Question construction and sensor usage"}',
 '1.0'),

('Refining Questions', 
 'Domain 2: Refining Questions and Targeting - Study Guide',
 'Advanced filtering and targeting techniques for precise endpoint management. Covers computer groups, RBAC controls, and intelligent query optimization for effective scope management.',
 23,
 '4-5 hours',
 '["Create and manage computer groups (dynamic and static) for precise targeting", "Construct advanced filters using logical operators and conditions", "Apply least privilege principles in targeting and scope management", "Implement RBAC controls for content access and computer group permissions", "Optimize query performance through intelligent targeting and filtering", "Troubleshoot targeting issues and validate scope accuracy"]',
 '["Computer Groups Administration Guide", "RBAC Implementation Documentation", "Targeting Best Practices Guide"]',
 '{"weight_percentage": 23, "key_topics": ["Computer groups", "Advanced filtering", "RBAC controls", "Query optimization"], "practice_focus": "Targeting and filtering scenarios"}',
 '1.0'),

('Taking Action', 
 'Domain 3: Taking Action - Packages and Actions - Study Guide',
 'Package deployment and action management for effective endpoint operations. Learn approval workflows, action monitoring, and emergency response procedures for secure action execution.',
 15,
 '3-4 hours',
 '["Deploy packages and execute actions on targeted endpoint groups", "Navigate approval workflows and understand multi-tier approval processes", "Monitor action execution status and troubleshoot failed deployments", "Implement proper action scoping using computer groups and filters", "Manage action history and audit trails for compliance and troubleshooting", "Execute emergency response procedures using rapid action deployment"]',
 '["Package Development Guide", "Action Deployment Documentation", "Approval Workflow Configuration"]',
 '{"weight_percentage": 15, "key_topics": ["Package deployment", "Action monitoring", "Approval workflows", "Emergency response"], "practice_focus": "Safe action deployment and monitoring"}',
 '1.0'),

('Navigation & Basic Modules', 
 'Domain 4: Navigation and Basic Module Functions - Study Guide',
 'Master the Tanium Console interface and core module functionality. Learn efficient navigation, dashboard customization, and workflow management for optimal operational productivity.',
 23,
 '4-5 hours',
 '["Navigate the Tanium Console interface efficiently using all major sections", "Utilize core modules (Interact, Deploy, Asset, etc.) for daily operations", "Customize dashboard views and workspace organization for optimal workflow", "Manage user preferences and interface settings for productivity", "Access and use help resources and documentation within the console", "Implement workflow management techniques for efficient task completion"]',
 '["Console Administration Guide", "Module Reference Documentation", "User Interface Customization Guide"]',
 '{"weight_percentage": 23, "key_topics": ["Console navigation", "Module functions", "Dashboard customization", "Workflow management"], "practice_focus": "Interface efficiency and module utilization"}',
 '1.0'),

('Report Generation & Data Export', 
 'Domain 5: Reporting and Data Export - Study Guide',
 'Comprehensive data reporting and export techniques for compliance and analysis. Master automated workflows, format customization, and large dataset management for stakeholder reporting.',
 17,
 '3-4 hours',
 '["Generate comprehensive reports from Tanium data across all modules", "Export data in multiple formats (CSV, JSON, XML, PDF) for different use cases", "Create automated reporting workflows with scheduling and distribution", "Implement data quality validation and integrity checks before reporting", "Customize report formats and layouts for specific stakeholder requirements", "Manage large dataset exports efficiently without system performance impact"]',
 '["Reporting Module Documentation", "Data Export Best Practices", "Automated Workflow Configuration Guide"]',
 '{"weight_percentage": 17, "key_topics": ["Report generation", "Data export formats", "Automated workflows", "Data validation"], "practice_focus": "Reporting scenarios and export procedures"}',
 '1.0');

-- Insert study sections for Domain 1: Asking Questions
INSERT INTO public.study_sections (module_id, title, content, section_type, order_index, estimated_time, key_points, procedures, troubleshooting, "references") 
SELECT 
  id,
  'Learning Objectives & Overview',
  E'# Learning Objectives\n\nBy completing this module, you will be able to:\n\n1. **Construct natural language questions** using Tanium''s query interface\n2. **Select appropriate sensors** for data collection requirements\n3. **Create and manage saved questions** for repeated use\n4. **Interpret query results** and validate data accuracy\n5. **Troubleshoot common query issues** and optimize performance\n\n## Overview & Mental Model\n\n**What is "Asking Questions" in Tanium?**\n\nTanium''s core strength lies in its ability to ask real-time questions across your entire endpoint infrastructure using natural language queries. Think of it as having a conversation with every computer in your network simultaneously.\n\n**Mental Model: Question � Sensor � Data**\n```\nNatural Language Query � Sensor Selection � Real-time Data Collection\n"Get Computer Name"   �  Computer Name   �  [List of all computer names]\n                         Sensor\n```\n\n**Key Concepts:**\n- **Questions**: Natural language queries (e.g., "Get Running Processes")\n- **Sensors**: Data collection mechanisms that answer specific questions\n- **Results**: Real-time data returned from endpoints\n- **Saved Questions**: Reusable queries with predefined parameters',
  'overview',
  1,
  15,
  '["Natural language queries are the foundation of Tanium operations", "Sensors are the data collection mechanisms", "Results provide real-time endpoint information", "Saved questions enable reusable query templates"]',
  '[]',
  '[]',
  '["Tanium Core Platform Documentation", "Interact Module User Guide"]'
FROM public.study_modules WHERE domain = 'Asking Questions';

INSERT INTO public.study_sections (module_id, title, content, section_type, order_index, estimated_time, key_points, procedures, troubleshooting, "references")
SELECT 
  id,
  'Basic Question Construction Procedures',
  E'# Step-by-Step Console Procedures\n\n## Procedure 1: Basic Question Construction\n\n### Step 1: Access the Interact Module\n\n1. **Navigate to Console**: Log into Tanium Console\n2. **Open Interact**: Main Menu > **Interact** > **Ask a Question**\n3. **Verify Access**: Confirm you can see the question input field\n\n**Validation**: Question input field displays with "Get" pre-populated\n\n### Step 2: Construct Your First Question\n\n1. **Start Simple**: Type `Get Computer Name`\n2. **Review Auto-Complete**: Notice sensor suggestions appear\n3. **Select Sensor**: Click on "Computer Name" from dropdown\n4. **Execute Query**: Click "Ask Question" button\n5. **Review Results**: Examine the returned data grid\n\n**Validation**: Results display showing computer names from your environment\n\n### Step 3: Sensor Selection Best Practices\n\n1. **Understand Sensor Types**:\n   - **Basic Sensors**: Computer Name, IP Address, Operating System\n   - **Performance Sensors**: CPU Usage, Memory Usage, Disk Space\n   - **Security Sensors**: Running Processes, Installed Software, Open Ports\n   - **Custom Sensors**: Organization-specific data collection points\n\n2. **Choose Appropriate Sensors**:\n   - Match sensor to your information requirement\n   - Consider performance impact of complex sensors\n   - Validate sensor availability in your environment',
  'procedures',
  2,
  25,
  '["Always start with simple questions before complex ones", "Sensor selection directly impacts query performance", "Auto-complete helps discover available sensors", "Results validation is critical for data accuracy"]',
  '["Access Interact Module", "Type natural language query", "Select appropriate sensor", "Execute and validate results"]',
  '["No results returned: Check sensor availability and permissions", "Slow query performance: Review sensor complexity and targeting", "Invalid sensor error: Verify sensor exists in your environment"]',
  '["Interact Module User Guide", "Sensor Reference Documentation"]'
FROM public.study_modules WHERE domain = 'Asking Questions';

INSERT INTO public.study_sections (module_id, title, content, section_type, order_index, estimated_time, key_points, procedures, troubleshooting, "references")
SELECT 
  id,
  'Advanced Query Techniques & Saved Questions',
  E'# Advanced Query Techniques\n\n## Multi-Sensor Queries\n\nCombine multiple sensors for comprehensive data collection:\n\n```\nGet Computer Name and IP Address and Operating System from all machines\n```\n\n### Benefits:\n- Single query for multiple data points\n- Reduced network overhead\n- Correlated information in one result set\n\n## Saved Questions Management\n\n### Creating Saved Questions\n\n1. **Build Your Query**: Create and test your question\n2. **Save Question**: Click "Save Question" button\n3. **Provide Details**:\n   - **Name**: Descriptive, searchable name\n   - **Description**: Purpose and usage notes\n   - **Category**: Organizational grouping\n   - **Permissions**: Who can access this question\n\n### Best Practices for Saved Questions\n\n- **Naming Convention**: Use consistent, descriptive names\n- **Documentation**: Include clear descriptions and use cases\n- **Regular Review**: Audit and update saved questions periodically\n- **Permission Management**: Apply appropriate access controls\n\n## Query Optimization\n\n### Performance Considerations\n\n1. **Sensor Efficiency**: Choose lightweight sensors when possible\n2. **Targeting**: Use computer groups to limit scope\n3. **Timing**: Avoid running resource-intensive queries during peak hours\n4. **Result Limits**: Apply reasonable limits to large result sets\n\n### Troubleshooting Common Issues\n\n- **Timeout Errors**: Reduce query scope or complexity\n- **Permission Denied**: Verify user has appropriate sensor access\n- **No Results**: Check targeting and sensor availability',
  'procedures',
  3,
  30,
  '["Multi-sensor queries provide comprehensive data in single operation", "Saved questions enable reusability and standardization", "Query optimization reduces network impact", "Regular maintenance improves query library quality"]',
  '["Create multi-sensor queries", "Save and organize questions", "Apply optimization techniques", "Troubleshoot common issues"]',
  '["Query timeouts: Reduce scope and complexity", "Permission errors: Check user sensor access", "Performance issues: Optimize targeting and timing"]',
  '["Query Optimization Guide", "Saved Questions Best Practices"]'
FROM public.study_modules WHERE domain = 'Asking Questions';

-- Insert exam preparation sections for all domains
INSERT INTO public.study_sections (module_id, title, content, section_type, order_index, estimated_time, key_points, procedures, troubleshooting, "references")
SELECT 
  id,
  'Exam Preparation & Key Concepts',
  E'# Exam Preparation for ' || domain || ' Domain\n\n## Exam Weight: ' || exam_weight || '%\n\nThis domain represents ' || exam_weight || '% of the TCO certification exam.\n\n## Key Study Areas\n\n1. **Core Concepts** (High Priority)\n   - Master fundamental principles\n   - Understand terminology and definitions\n   - Practice real-world applications\n\n2. **Procedures and Workflows** (High Priority)\n   - Learn step-by-step processes\n   - Practice common scenarios\n   - Memorize critical sequences\n\n3. **Troubleshooting** (Medium Priority)\n   - Identify common issues\n   - Apply systematic problem-solving\n   - Know resolution procedures\n\n4. **Best Practices** (Medium Priority)\n   - Understand recommended approaches\n   - Apply security and compliance principles\n   - Optimize for performance and efficiency\n\n## Study Tips\n\n- **Practice Regularly**: Use hands-on exercises daily\n- **Understand Context**: Learn why procedures work, not just how\n- **Master Terminology**: Know all technical terms and definitions\n- **Practice Scenarios**: Work through realistic problem situations',
  'exam_prep',
  10,
  15,
  '["Exam weight determines study priority", "Hands-on practice is essential", "Understanding context improves retention", "Scenario practice builds confidence"]',
  '[]',
  '[]',
  '["TCO Exam Blueprint", "Practice Test Questions"]'
FROM public.study_modules;
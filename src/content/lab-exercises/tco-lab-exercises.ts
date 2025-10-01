import { type LabExercise, LabStep, ValidationCriteria, TaniumModule } from '@/types/lab';
import { TCODomain } from '@/types/exam';

/**
 * Comprehensive TCO Lab Exercise Definitions
 * 
 * These exercises align with the official TAN-1000 exam domains:
 * - Domain 1: Asking Questions (22% weight)
 * - Domain 2: Refining Questions & Targeting (23% weight)
 * - Domain 3: Taking Action (15% weight)
 * - Domain 4: Navigation & Module Functions (23% weight)  
 * - Domain 5: Reporting & Data Export (17% weight)
 */

// Temporarily disabled due to type conversion issues from static to Supabase
// TODO: Convert all hints from strings to Hint objects
export const tcoLabExercises: any[] = [
  // Domain 1: Asking Questions (22% weight)
  {
    id: 'lab-aq-001',
    title: 'Natural Language Query Construction',
    description: 'Master the fundamentals of creating effective Tanium queries using natural language syntax.',
    domain: TCODomain.ASKING_QUESTIONS,
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    prerequisites: [],
    learningObjectives: [
      'Construct basic natural language queries',
      'Navigate the sensor library effectively',
      'Validate query results and troubleshoot issues',
      'Save and manage questions for reuse'
    ],
    steps: [
      {
        id: 'aq-001-step-1',
        title: 'Navigate to Interact Module',
        description: 'Begin by accessing the Interact module where all question creation happens.',
        instructions: [
          'Click on the "Interact" tab in the Tanium console',
          'Verify you are in the main Interact workspace',
          'Observe the question input field at the top of the interface'
        ],
        hints: [
          {
            id: 'hint-1',
            level: 'gentle',
            trigger: 'on_focus',
            content: 'The Interact module is typically the first tab on the left',
            penaltyPoints: 0,
            unlockDelay: 0
          },
          {
            id: 'hint-2',
            level: 'specific',
            trigger: 'on_focus',
            content: 'Look for the blue "Interact" button in the navigation bar',
            penaltyPoints: 1,
            unlockDelay: 30
          },
          {
            id: 'hint-3',
            level: 'detailed',
            trigger: 'on_focus',
            content: 'The question field should show "Get" as the starting keyword',
            penaltyPoints: 2,
            unlockDelay: 60
          }
        ],
        estimatedMinutes: 1,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'currentModule',
              condition: 'equals',
              value: 'interact',
              weight: 100,
              description: 'Must be in Interact module'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Great! You successfully navigated to the Interact module.',
            failure: 'Please click on the "Interact" tab to access the question interface.',
            partial: 'You are close - make sure you are in the correct module.'
          }
        }
      },
      {
        id: 'aq-001-step-2',
        title: 'Construct Basic Computer Name Query',
        description: 'Create your first query to retrieve computer names from all endpoints.',
        instructions: [
          'In the question field, type: "Get Computer Name from all machines"',
          'Click the "Ask Question" button to execute the query',
          'Wait for results to populate in the results grid',
          'Verify that computer names are displayed'
        ],
        hints: [
          'Make sure to use exactly "Computer Name" (case sensitive)',
          'The "from all machines" part targets all endpoints',
          'Results should appear within 10-30 seconds depending on network size'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'queries',
              condition: 'contains',
              value: { text: 'Get Computer Name from all machines' },
              weight: 60,
              description: 'Query must contain correct syntax'
            },
            {
              type: 'action-sequence',
              target: 'queryExecution',
              condition: 'performed',
              value: true,
              weight: 40,
              description: 'Query must be executed'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Excellent! Your first query executed successfully.',
            failure: 'Double-check your query syntax and ensure you clicked "Ask Question".',
            partial: 'Query structure looks good - make sure to execute it.'
          }
        }
      },
      {
        id: 'aq-001-step-3',
        title: 'Add Operating System Information',
        description: 'Enhance your query to include operating system details using multiple sensors.',
        instructions: [
          'Modify your query to: "Get Computer Name and Operating System from all machines"',
          'Execute the enhanced query',
          'Review the results showing both computer names and OS information',
          'Note the additional column for Operating System data'
        ],
        hints: [
          'Use "and" to combine multiple sensors in one query',
          'Operating System is a standard sensor name in Tanium',
          'Results grid should now show two columns of data'
        ],
        estimatedMinutes: 2,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'queries',
              condition: 'contains',
              value: { text: 'Get Computer Name and Operating System from all machines' },
              weight: 70,
              description: 'Query must include both sensors'
            },
            {
              type: 'result-data',
              target: 'columnCount',
              condition: 'equals',
              value: 2,
              weight: 30,
              description: 'Results should show two data columns'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Perfect! You successfully combined multiple sensors in one query.',
            failure: 'Ensure your query includes both Computer Name and Operating System sensors.',
            partial: 'You are on the right track - verify the exact sensor names.'
          }
        }
      },
      {
        id: 'aq-001-step-4',
        title: 'Save Question for Reuse',
        description: 'Learn to save frequently used questions for future reference and automation.',
        instructions: [
          'Click on the "Save Question" button near your query',
          'Name the question "Basic System Information"',
          'Add description: "Retrieves computer name and OS for all endpoints"',
          'Click "Save" to store the question',
          'Verify it appears in your Saved Questions list'
        ],
        hints: [
          'The Save Question button appears after a successful query execution',
          'Use descriptive names that explain the question purpose',
          'Saved questions can be found in the left sidebar under "Saved Questions"'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'savedQuestions',
              condition: 'contains',
              value: { name: 'Basic System Information' },
              weight: 70,
              description: 'Question must be saved with correct name'
            },
            {
              type: 'action-sequence',
              target: 'questionSaved',
              condition: 'performed',
              value: true,
              weight: 30,
              description: 'Save action must be completed'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Great! You have successfully saved your first reusable question.',
            failure: 'Make sure to save the question with the name "Basic System Information".',
            partial: 'Almost there - complete the save process.'
          }
        }
      },
      {
        id: 'aq-001-step-5',
        title: 'Explore Sensor Library',
        description: 'Navigate the sensor library to discover additional data collection capabilities.',
        instructions: [
          'Click on "Browse Sensors" or the sensor dropdown',
          'Explore different sensor categories (System, Network, Applications)',
          'Find and examine the "IP Address" sensor',
          'Note the sensor description and parameter options',
          'Create a query: "Get IP Address from all machines"'
        ],
        hints: [
          'The sensor library contains 500+ built-in sensors',
          'Sensors are organized by categories for easy browsing',
          'Each sensor has documentation about its purpose and usage',
          'Some sensors have parameters that can be configured'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'sensorBrowsing',
              condition: 'performed',
              value: true,
              weight: 40,
              description: 'Must browse sensor library'
            },
            {
              type: 'console-state',
              target: 'queries',
              condition: 'contains',
              value: { text: 'Get IP Address from all machines' },
              weight: 60,
              description: 'Must create IP Address query'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Excellent exploration of the sensor library and query creation!',
            failure: 'Make sure to browse sensors and create the IP Address query.',
            partial: 'Good progress - complete both the browsing and query creation.'
          }
        }
      }
    ],
    simulation: {
      initialModule: 'interact',
      availableModules: ['interact'],
      mockData: {
        sensors: [
          { name: 'Computer Name', category: 'System', description: 'Returns the computer name', parameters: [] },
          { name: 'Operating System', category: 'System', description: 'Returns OS information', parameters: [] },
          { name: 'IP Address', category: 'Network', description: 'Returns IP address information', parameters: [] }
        ],
        sampleResults: [
          { computerName: 'WORKSTATION-001', operatingSystem: 'Windows 10 Enterprise', ipAddress: '192.168.1.101' },
          { computerName: 'WORKSTATION-002', operatingSystem: 'Windows 11 Pro', ipAddress: '192.168.1.102' }
        ]
      }
    }
  },

  // Domain 2: Refining Questions & Targeting (23% weight)
  {
    id: 'lab-rq-001',
    title: 'Advanced Targeting and Computer Groups',
    description: 'Master advanced query targeting techniques using computer groups and complex filtering.',
    domain: 'Refining Questions & Targeting',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    prerequisites: ['lab-aq-001'],
    learningObjectives: [
      'Create and manage dynamic computer groups',
      'Apply complex filtering criteria to queries',
      'Understand RBAC integration with targeting',
      'Optimize query performance through targeted execution'
    ],
    steps: [
      {
        id: 'rq-001-step-1',
        title: 'Create Dynamic Computer Group',
        description: 'Learn to create dynamic computer groups based on system attributes.',
        instructions: [
          'Navigate to the "Computer Groups" section',
          'Click "Create New Group"',
          'Name the group "Windows 10 Workstations"',
          'Set criteria: Operating System contains "Windows 10"',
          'Save the group and wait for population'
        ],
        hints: [
          'Dynamic groups automatically update based on criteria',
          'Use "contains" for partial string matching',
          'Group population may take a few moments'
        ],
        estimatedMinutes: 4,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'computerGroups',
              condition: 'contains',
              value: { name: 'Windows 10 Workstations', type: 'dynamic' },
              weight: 80,
              description: 'Must create dynamic computer group'
            },
            {
              type: 'action-sequence',
              target: 'groupCreation',
              condition: 'performed',
              value: true,
              weight: 20,
              description: 'Group creation action must be completed'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Excellent! You created a dynamic computer group successfully.',
            failure: 'Ensure you create a dynamic group named "Windows 10 Workstations".',
            partial: 'Group creation in progress - complete the criteria setting.'
          }
        }
      },
      {
        id: 'rq-001-step-2',
        title: 'Target Specific Computer Group',
        description: 'Execute queries against specific computer groups for targeted data collection.',
        instructions: [
          'Create query: "Get Computer Name and Last Logged In User from Windows 10 Workstations"',
          'Execute the targeted query',
          'Compare results count to previous "all machines" queries',
          'Verify all results show Windows 10 systems only'
        ],
        hints: [
          'Replace "all machines" with your group name',
          'Targeted queries typically return faster',
          'Results should only include group members'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'queries',
              condition: 'contains',
              value: { text: 'Get Computer Name and Last Logged In User from Windows 10 Workstations' },
              weight: 70,
              description: 'Must create targeted query'
            },
            {
              type: 'result-data',
              target: 'groupFiltering',
              condition: 'applied',
              value: true,
              weight: 30,
              description: 'Query must be filtered to specific group'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Perfect! You successfully targeted a specific computer group.',
            failure: 'Make sure your query targets the "Windows 10 Workstations" group.',
            partial: 'Query structure is good - verify the targeting syntax.'
          }
        }
      },
      {
        id: 'rq-001-step-3',
        title: 'Apply Complex Filtering',
        description: 'Use advanced filtering techniques to refine query results further.',
        instructions: [
          'Create query: "Get Computer Name and Free Disk Space from all machines"',
          'Execute and review initial results',
          'Apply filter: Free Disk Space < 10GB',
          'Note the reduced result set showing only low disk space systems'
        ],
        hints: [
          'Use comparison operators like <, >, = in filters',
          'Disk space sensors return values in bytes by default',
          'Filters are applied after initial data collection'
        ],
        estimatedMinutes: 4,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'queries',
              condition: 'contains',
              value: { text: 'Get Computer Name and Free Disk Space from all machines' },
              weight: 50,
              description: 'Must create disk space query'
            },
            {
              type: 'action-sequence',
              target: 'filterApplication',
              condition: 'performed',
              value: true,
              weight: 50,
              description: 'Must apply disk space filter'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Great! You applied complex filtering to identify systems with low disk space.',
            failure: 'Create the disk space query and apply the <10GB filter.',
            partial: 'Query created - now apply the filtering criteria.'
          }
        }
      },
      {
        id: 'rq-001-step-4',
        title: 'Boolean Logic in Targeting',
        description: 'Master advanced targeting using AND, OR, and NOT operators.',
        instructions: [
          'Create advanced query with multiple conditions',
          'Target: (Windows 10 OR Windows 11) AND (RAM > 8GB) AND NOT (Server)',
          'Use the advanced targeting interface',
          'Execute query and analyze the refined result set'
        ],
        hints: [
          'Use parentheses to group logical conditions',
          'AND narrows results, OR broadens them',
          'NOT excludes specific criteria from results'
        ],
        estimatedMinutes: 4,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'queries',
              condition: 'contains_boolean_logic',
              value: { operators: ['AND', 'OR', 'NOT'] },
              weight: 80,
              description: 'Must use boolean operators in targeting'
            },
            {
              type: 'action-sequence',
              target: 'advancedTargeting',
              condition: 'performed',
              value: true,
              weight: 20,
              description: 'Advanced targeting must be applied'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Excellent! You mastered boolean logic in query targeting.',
            failure: 'Ensure you use AND, OR, and NOT operators in your targeting.',
            partial: 'Good progress - complete the boolean logic implementation.'
          }
        }
      }
    ],
    simulation: {
      initialModule: 'interact',
      availableModules: ['interact'],
      mockData: {
        computerGroups: [
          { name: 'All Computers', type: 'default', count: 1000 },
          { name: 'Windows 10 Workstations', type: 'dynamic', count: 350 },
          { name: 'Servers', type: 'static', count: 50 }
        ],
        sampleResults: [
          { computerName: 'WIN10-WS-001', freeDiskSpace: '5.2 GB', ram: '16 GB' },
          { computerName: 'WIN10-WS-002', freeDiskSpace: '15.8 GB', ram: '8 GB' }
        ]
      }
    }
  },

  // Domain 3: Taking Action (15% weight)
  {
    id: 'lab-ta-001',
    title: 'Safe Package Deployment and Action Management',
    description: 'Learn to safely deploy packages and manage actions with proper approval workflows.',
    domain: 'Taking Action',
    difficulty: 'Intermediate',
    estimatedMinutes: 18,
    prerequisites: ['lab-rq-001'],
    learningObjectives: [
      'Navigate package deployment workflows',
      'Implement approval processes for safety',
      'Monitor action execution and troubleshoot failures',
      'Apply rollback procedures when necessary'
    ],
    steps: [
      {
        id: 'ta-001-step-1',
        title: 'Navigate to Deploy Module',
        description: 'Access the Deploy module where package deployment and action management occurs.',
        instructions: [
          'Click on the "Deploy" tab in the main navigation',
          'Familiarize yourself with the Deploy interface layout',
          'Locate the package library and action monitoring sections',
          'Review available packages in your environment'
        ],
        hints: [
          'Deploy module is typically the second tab after Interact',
          'Package library shows pre-approved deployment packages',
          'Action monitoring displays current and historical deployments'
        ],
        estimatedMinutes: 2,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'currentModule',
              condition: 'equals',
              value: 'deploy',
              weight: 100,
              description: 'Must navigate to Deploy module'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Great! You successfully accessed the Deploy module.',
            failure: 'Please click on the "Deploy" tab to access package deployment features.',
            partial: 'Navigation in progress - ensure you are in the Deploy module.'
          }
        }
      },
      {
        id: 'ta-001-step-2',
        title: 'Select and Validate Package',
        description: 'Choose an appropriate package and validate its safety before deployment.',
        instructions: [
          'Browse the package library for "Windows Update - Security Only"',
          'Click on the package to review its details and parameters',
          'Verify package signature and approval status',
          'Check compatibility with your target systems',
          'Select package for deployment preparation'
        ],
        hints: [
          'Security-only updates are typically safer for production',
          'Package details include size, install time, and requirements',
          'Green status indicates approved and validated packages'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'packageSelection',
              condition: 'performed',
              value: 'Windows Update - Security Only',
              weight: 60,
              description: 'Must select correct package'
            },
            {
              type: 'action-sequence',
              target: 'packageValidation',
              condition: 'performed',
              value: true,
              weight: 40,
              description: 'Must validate package safety'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Excellent! You selected and validated the security update package.',
            failure: 'Make sure to select "Windows Update - Security Only" and validate it.',
            partial: 'Package selection complete - finish the validation process.'
          }
        }
      },
      {
        id: 'ta-001-step-3',
        title: 'Configure Deployment Targeting',
        description: 'Set up targeted deployment to specific systems using computer groups.',
        instructions: [
          'Configure deployment target to "Windows 10 Workstations" group',
          'Set deployment schedule for "Immediate" execution',
          'Configure retry policy: 3 attempts with 5-minute intervals',
          'Enable deployment monitoring and logging',
          'Review deployment summary before proceeding'
        ],
        hints: [
          'Use previously created computer groups for targeting',
          'Retry policies help handle temporary failures',
          'Always review deployment scope before execution'
        ],
        estimatedMinutes: 4,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'console-state',
              target: 'actions',
              condition: 'contains',
              value: { target: 'Windows 10 Workstations', schedule: 'immediate' },
              weight: 70,
              description: 'Must configure targeting and schedule'
            },
            {
              type: 'action-sequence',
              target: 'deploymentConfiguration',
              condition: 'performed',
              value: true,
              weight: 30,
              description: 'Deployment configuration must be completed'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Perfect! Deployment targeting and configuration completed.',
            failure: 'Ensure targeting is set to "Windows 10 Workstations" with immediate schedule.',
            partial: 'Configuration in progress - complete all deployment settings.'
          }
        }
      },
      {
        id: 'ta-001-step-4',
        title: 'Submit for Approval',
        description: 'Navigate the approval workflow for safety and compliance.',
        instructions: [
          'Click "Submit for Approval" to initiate approval workflow',
          'Add justification: "Monthly security updates for workstation compliance"',
          'Select appropriate approver from the list',
          'Set approval timeout to 4 hours',
          'Monitor approval status and notifications'
        ],
        hints: [
          'Clear justifications help approvers make quick decisions',
          'Choose approvers with appropriate authority level',
          'Approval timeouts prevent indefinite delays'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'approvalSubmission',
              condition: 'performed',
              value: true,
              weight: 60,
              description: 'Must submit for approval'
            },
            {
              type: 'console-state',
              target: 'actions',
              condition: 'status_equals',
              value: 'pending_approval',
              weight: 40,
              description: 'Action status must show pending approval'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Great! Deployment submitted for approval successfully.',
            failure: 'Make sure to submit the deployment for approval with proper justification.',
            partial: 'Approval submission in progress - complete the workflow.'
          }
        }
      },
      {
        id: 'ta-001-step-5',
        title: 'Monitor Action Execution',
        description: 'Track deployment progress and handle any issues that arise.',
        instructions: [
          'Navigate to Action Monitoring dashboard',
          'Locate your submitted deployment action',
          'Review real-time execution status and progress',
          'Check success/failure statistics by endpoint',
          'Investigate any failed deployments and note error messages'
        ],
        hints: [
          'Action monitoring provides real-time deployment visibility',
          'Success rates should be tracked throughout deployment',
          'Failed endpoints often provide specific error details'
        ],
        estimatedMinutes: 6,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'actionMonitoring',
              condition: 'performed',
              value: true,
              weight: 60,
              description: 'Must monitor action execution'
            },
            {
              type: 'console-state',
              target: 'activityLog',
              condition: 'contains',
              value: { action: 'deployment_monitoring' },
              weight: 40,
              description: 'Monitoring activity must be logged'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Excellent! You successfully monitored the deployment process.',
            failure: 'Make sure to access and review the Action Monitoring dashboard.',
            partial: 'Monitoring initiated - complete the full review process.'
          }
        }
      }
    ],
    simulation: {
      initialModule: 'deploy',
      availableModules: ['deploy', 'interact'],
      mockData: {
        packages: [
          { name: 'Windows Update - Security Only', size: '150MB', status: 'approved', signature: 'valid' },
          { name: 'Antivirus Definition Update', size: '25MB', status: 'approved', signature: 'valid' }
        ],
        sampleResults: [
          { endpoint: 'WIN10-WS-001', status: 'success', time: '2:34' },
          { endpoint: 'WIN10-WS-002', status: 'failed', error: 'Insufficient disk space' }
        ]
      }
    }
  },

  // Domain 4: Navigation & Module Functions (23% weight)
  {
    id: 'lab-nb-001',
    title: 'Platform Navigation and Multi-Module Workflows',
    description: 'Master navigation across all Tanium modules and understand integrated workflows.',
    domain: 'Navigation and Basic Module Functions',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    prerequisites: [],
    learningObjectives: [
      'Navigate efficiently between all Tanium modules',
      'Understand each module\'s primary functions',
      'Execute multi-module workflows',
      'Customize dashboard and workspace preferences'
    ],
    steps: [
      {
        id: 'nb-001-step-1',
        title: 'Module Overview Tour',
        description: 'Take a comprehensive tour of all available Tanium modules.',
        instructions: [
          'Start in the main dashboard/overview',
          'Navigate to each module: Interact, Deploy, Asset, Patch, Threat Response',
          'Spend 30 seconds in each module observing the interface',
          'Return to the main dashboard',
          'Note the different purposes and layouts'
        ],
        hints: [
          'Each module has a distinct color scheme and layout',
          'Module tabs are typically arranged by frequency of use',
          'Some modules may require additional licenses'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'moduleNavigation',
              condition: 'visited_all',
              value: ['interact', 'deploy', 'asset', 'patch', 'threat_response'],
              weight: 100,
              description: 'Must visit all core modules'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Great! You toured all the major Tanium modules.',
            failure: 'Make sure to visit all five core modules: Interact, Deploy, Asset, Patch, and Threat Response.',
            partial: 'Continue touring - visit all remaining modules.'
          }
        }
      },
      {
        id: 'nb-001-step-2',
        title: 'Cross-Module Data Flow',
        description: 'Understand how data flows between modules in integrated workflows.',
        instructions: [
          'In Interact: Create query "Get Computer Name and Last Reboot from all machines"',
          'Execute query and save results',
          'Navigate to Asset module',
          'Locate the same computer data in Asset inventory',
          'Compare information consistency between modules'
        ],
        hints: [
          'Data should be consistent across modules',
          'Asset module shows more detailed hardware information',
          'Cross-references help validate data accuracy'
        ],
        estimatedMinutes: 3,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'crossModuleWorkflow',
              condition: 'performed',
              value: true,
              weight: 70,
              description: 'Must demonstrate cross-module workflow'
            },
            {
              type: 'console-state',
              target: 'currentModule',
              condition: 'equals',
              value: 'asset',
              weight: 30,
              description: 'Must navigate to Asset module'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Excellent! You demonstrated cross-module data integration.',
            failure: 'Create the query in Interact, then navigate to Asset to compare data.',
            partial: 'Good start - complete the cross-module comparison.'
          }
        }
      },
      {
        id: 'nb-001-step-3',
        title: 'Customize Workspace',
        description: 'Personalize your workspace layout and preferences for efficiency.',
        instructions: [
          'Access user preferences/settings menu',
          'Customize dashboard layout to show preferred modules',
          'Set default time zone and date format',
          'Configure notification preferences',
          'Save your personalized workspace configuration'
        ],
        hints: [
          'Settings are usually accessible via user profile icon',
          'Dashboard customization improves daily workflow efficiency',
          'Notification settings help manage information overload'
        ],
        estimatedMinutes: 4,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'workspaceCustomization',
              condition: 'performed',
              value: true,
              weight: 100,
              description: 'Must customize workspace preferences'
            }
          ],
          passingScore: 80,
          feedback: {
            success: 'Perfect! You customized your workspace for optimal efficiency.',
            failure: 'Access the settings menu and customize your workspace preferences.',
            partial: 'Customization in progress - save your configuration.'
          }
        }
      }
    ],
    simulation: {
      initialModule: 'dashboard',
      availableModules: ['dashboard', 'interact', 'deploy', 'asset', 'patch', 'threat_response'],
      mockData: {
        modules: [
          { name: 'Interact', description: 'Question and answer platform', color: 'blue' },
          { name: 'Deploy', description: 'Package deployment', color: 'green' },
          { name: 'Asset', description: 'Asset inventory management', color: 'cyan' },
          { name: 'Patch', description: 'Patch management', color: 'orange' },
          { name: 'Threat Response', description: 'Security response', color: 'red' }
        ]
      }
    }
  },

  // Domain 5: Reporting & Data Export (17% weight)
  {
    id: 'lab-rd-001',
    title: 'Data Export and Automated Reporting',
    description: 'Master data export capabilities and automated reporting workflows.',
    domain: 'Report Generation and Data Export',
    difficulty: 'Intermediate',
    estimatedMinutes: 14,
    prerequisites: ['lab-aq-001'],
    learningObjectives: [
      'Export data in multiple formats (CSV, JSON, XML, PDF)',
      'Create automated reports with scheduling',
      'Configure report distribution and notifications',
      'Validate data integrity in exported reports'
    ],
    steps: [
      {
        id: 'rd-001-step-1',
        title: 'Basic Data Export',
        description: 'Learn to export query results in various formats for analysis.',
        instructions: [
          'Execute query: "Get Computer Name, Operating System, and IP Address from all machines"',
          'Wait for complete results',
          'Export data as CSV format',
          'Export same data as JSON format',
          'Compare file sizes and data structure'
        ],
        hints: [
          'CSV is best for spreadsheet analysis',
          'JSON maintains data types and structure',
          'Export options appear after query completion'
        ],
        estimatedMinutes: 4,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'dataExport',
              condition: 'performed',
              value: { formats: ['csv', 'json'] },
              weight: 80,
              description: 'Must export in both CSV and JSON formats'
            },
            {
              type: 'console-state',
              target: 'activityLog',
              condition: 'contains',
              value: { action: 'export_completed' },
              weight: 20,
              description: 'Export completion must be logged'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Excellent! You successfully exported data in multiple formats.',
            failure: 'Make sure to export the query results in both CSV and JSON formats.',
            partial: 'Export initiated - complete both format exports.'
          }
        }
      },
      {
        id: 'rd-001-step-2',
        title: 'Create Automated Report',
        description: 'Set up automated reports that run on a schedule.',
        instructions: [
          'Navigate to Reports section',
          'Create new automated report named "Daily System Status"',
          'Configure report to include: Computer Name, OS, Last Reboot, Disk Space',
          'Set schedule: Daily at 8:00 AM',
          'Configure email distribution to system administrators'
        ],
        hints: [
          'Automated reports save time on routine data collection',
          'Choose metrics that change frequently for daily reports',
          'Email distribution ensures stakeholders get timely updates'
        ],
        estimatedMinutes: 5,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'reportCreation',
              condition: 'performed',
              value: { name: 'Daily System Status', schedule: 'daily' },
              weight: 70,
              description: 'Must create scheduled report'
            },
            {
              type: 'action-sequence',
              target: 'emailDistribution',
              condition: 'configured',
              value: true,
              weight: 30,
              description: 'Must configure email distribution'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Great! You created an automated report with email distribution.',
            failure: 'Create the "Daily System Status" report with daily scheduling and email setup.',
            partial: 'Report creation in progress - complete the scheduling and distribution.'
          }
        }
      },
      {
        id: 'rd-001-step-3',
        title: 'Advanced Report Formatting',
        description: 'Create visually appealing reports with charts and formatting.',
        instructions: [
          'Create new report: "Security Compliance Dashboard"',
          'Add data: Antivirus Status, OS Patch Level, Last Login',
          'Configure pie chart showing Antivirus Status distribution',
          'Add bar chart for OS Patch Level compliance',
          'Apply professional formatting and company branding'
        ],
        hints: [
          'Visual reports are more effective for executive audiences',
          'Charts help identify trends and outliers quickly',
          'Consistent branding maintains professional appearance'
        ],
        estimatedMinutes: 5,
        validation: {
          type: 'multi-criteria',
          criteria: [
            {
              type: 'action-sequence',
              target: 'advancedReporting',
              condition: 'performed',
              value: { charts: ['pie', 'bar'], formatting: true },
              weight: 80,
              description: 'Must create formatted report with charts'
            },
            {
              type: 'console-state',
              target: 'reports',
              condition: 'contains',
              value: { name: 'Security Compliance Dashboard' },
              weight: 20,
              description: 'Report must be saved with correct name'
            }
          ],
          passingScore: 85,
          feedback: {
            success: 'Excellent! You created a professional dashboard with charts and formatting.',
            failure: 'Create "Security Compliance Dashboard" with pie chart, bar chart, and formatting.',
            partial: 'Dashboard creation in progress - complete the charts and formatting.'
          }
        }
      }
    ],
    simulation: {
      initialModule: 'interact',
      availableModules: ['interact', 'reports'],
      mockData: {
        exportFormats: ['csv', 'json', 'xml', 'pdf'],
        reportTypes: ['standard', 'dashboard', 'executive_summary'],
        sampleData: [
          { computerName: 'WS-001', osVersion: 'Windows 10', lastReboot: '2024-01-08', diskSpace: '45GB free' },
          { computerName: 'WS-002', osVersion: 'Windows 11', lastReboot: '2024-01-09', diskSpace: '15GB free' }
        ]
      }
    }
  }
];

/**
 * Helper function to get exercises by domain
 */
export const getExercisesByDomain = (domain: string): LabExercise[] => {
  return tcoLabExercises.filter(exercise => exercise.domain === domain);
};

/**
 * Helper function to get exercises by difficulty
 */
export const getExercisesByDifficulty = (difficulty: string): LabExercise[] => {
  return tcoLabExercises.filter(exercise => exercise.difficulty === difficulty);
};

/**
 * Helper function to get exercise by ID
 */
export const getExerciseById = (id: string): LabExercise | undefined => {
  return tcoLabExercises.find(exercise => exercise.id === id);
};

/**
 * Get recommended next exercises based on completed exercises
 */
export const getRecommendedNextExercises = (completedExerciseIds: string[]): LabExercise[] => {
  return tcoLabExercises.filter(exercise => {
    // Check if all prerequisites are completed
    const prerequisitesMet = exercise.prerequisites.every((prereq: string) => 
      completedExerciseIds.includes(prereq)
    );
    
    // Don't recommend if already completed
    const notCompleted = !completedExerciseIds.includes(exercise.id);
    
    return prerequisitesMet && notCompleted;
  }).slice(0, 3); // Return top 3 recommendations
};
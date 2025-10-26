/**
 * TCO Terminology Database
 * Comprehensive definitions for Tanium Certified Operator certification
 * Organized by category with beginner-friendly explanations
 */

export interface TermDefinition {
  id: string;
  term: string;
  category: TermCategory;
  definition: string;
  beginnerExplanation: string;
  examples?: string[];
  relatedTerms?: string[];
  importance: 'critical' | 'important' | 'useful';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  examRelevance: boolean;
  taniumSpecific: boolean;
}

export type TermCategory = 
  | 'basic-it'
  | 'networking'
  | 'security'
  | 'endpoints'
  | 'tanium-core'
  | 'tanium-modules'
  | 'operations'
  | 'compliance'
  | 'troubleshooting';

export interface CategoryInfo {
  id: TermCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  examWeight: number; // Approximate percentage of exam coverage
}

export const TERM_CATEGORIES: CategoryInfo[] = [
  {
    id: 'basic-it',
    name: 'Basic IT Concepts',
    description: 'Fundamental computer and technology terms',
    icon: '💻',
    color: 'blue',
    examWeight: 15
  },
  {
    id: 'networking',
    name: 'Networking',
    description: 'Network protocols, connectivity, and infrastructure',
    icon: '🌐',
    color: 'green',
    examWeight: 20
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Cybersecurity principles, threats, and controls',
    icon: '🛡️',
    color: 'red',
    examWeight: 25
  },
  {
    id: 'endpoints',
    name: 'Endpoint Management',
    description: 'Device management concepts and practices',
    icon: '🖥️',
    color: 'cyan',
    examWeight: 30
  },
  {
    id: 'tanium-core',
    name: 'Tanium Platform',
    description: 'Core Tanium concepts and architecture',
    icon: '⚡',
    color: 'yellow',
    examWeight: 40
  },
  {
    id: 'tanium-modules',
    name: 'Tanium Modules',
    description: 'Specific Tanium modules and their functions',
    icon: '🧩',
    color: 'sky',
    examWeight: 35
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Day-to-day operational procedures and best practices',
    icon: '⚙️',
    color: 'gray',
    examWeight: 25
  },
  {
    id: 'compliance',
    name: 'Compliance & Risk',
    description: 'Regulatory requirements and risk management',
    icon: '📋',
    color: 'orange',
    examWeight: 15
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Problem-solving and diagnostic techniques',
    icon: '🔧',
    color: 'teal',
    examWeight: 20
  }
];

export const TCO_TERMINOLOGY: TermDefinition[] = [
  // Basic IT Concepts
  {
    id: 'operating-system',
    term: 'Operating System (OS)',
    category: 'basic-it',
    definition: 'The fundamental software that manages computer hardware and software resources, providing common services for computer programs.',
    beginnerExplanation: 'Think of the operating system as the manager of your computer - it controls how programs run, manages files, and handles communication between software and hardware. Common examples are Windows, macOS, and Linux.',
    examples: ['Windows 10/11', 'macOS Monterey', 'Ubuntu Linux', 'Red Hat Enterprise Linux'],
    relatedTerms: ['kernel', 'device-driver', 'file-system'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'ip-address',
    term: 'IP Address',
    category: 'networking',
    definition: 'A unique numerical identifier assigned to each device connected to a network that uses the Internet Protocol for communication.',
    beginnerExplanation: 'An IP address is like a postal address for your computer on a network. Just as mail needs your home address to reach you, data on a network needs an IP address to reach the right computer.',
    examples: ['192.168.1.100 (private)', '8.8.8.8 (Google DNS)', '2001:db8::1 (IPv6)'],
    relatedTerms: ['subnet', 'dhcp', 'dns', 'mac-address'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'endpoint',
    term: 'Endpoint',
    category: 'endpoints',
    definition: 'Any device that connects to and communicates across a network, representing a point of entry to an enterprise network.',
    beginnerExplanation: 'An endpoint is any device that connects to your company\'s network - laptops, desktops, phones, tablets, printers, servers. They\'re called "endpoints" because they sit at the "end" of network connections.',
    examples: ['Desktop computers', 'Laptops', 'Mobile phones', 'Tablets', 'Printers', 'IoT devices'],
    relatedTerms: ['device', 'client', 'workstation', 'node'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },

  // Security Terms
  {
    id: 'malware',
    term: 'Malware',
    category: 'security',
    definition: 'Malicious software designed to damage, disrupt, or gain unauthorized access to computer systems.',
    beginnerExplanation: 'Malware is the general term for "bad" software that can harm your computer or steal information. It includes viruses, ransomware, spyware, and other harmful programs.',
    examples: ['Viruses', 'Ransomware', 'Trojan horses', 'Spyware', 'Adware'],
    relatedTerms: ['virus', 'ransomware', 'trojan', 'spyware', 'antivirus'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'vulnerability',
    term: 'Vulnerability',
    category: 'security',
    definition: 'A weakness or flaw in a system, application, or network that could potentially be exploited by attackers to cause harm.',
    beginnerExplanation: 'A vulnerability is like a weak spot in your security - maybe an unlocked window in your house. Attackers look for these weak spots to break in and cause damage or steal information.',
    examples: ['Unpatched software', 'Weak passwords', 'Misconfigured systems', 'Buffer overflow bugs'],
    relatedTerms: ['exploit', 'patch', 'zero-day', 'cve', 'security-update'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'patch',
    term: 'Patch',
    category: 'security',
    definition: 'A software update designed to fix security vulnerabilities, bugs, or improve functionality in existing software.',
    beginnerExplanation: 'A patch is like a repair for software - when developers find problems or security holes, they create patches (updates) to fix them. Installing patches keeps your software secure and working properly.',
    examples: ['Windows security updates', 'Adobe Flash patches', 'Java updates', 'Browser security fixes'],
    relatedTerms: ['update', 'hotfix', 'security-update', 'vulnerability', 'patch-management'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },

  // Core Tanium Terms
  {
    id: 'tanium-server',
    term: 'Tanium Server',
    category: 'tanium-core',
    definition: 'The central management component of the Tanium platform that coordinates communication with Tanium Clients and processes queries and actions.',
    beginnerExplanation: 'The Tanium Server is like the brain of the Tanium system. It\'s the central computer that sends questions to all the other computers (clients) in your network and collects their answers.',
    examples: ['Primary Tanium Server', 'Zone Server (for remote locations)', 'Module Server (for specific functions)'],
    relatedTerms: ['tanium-client', 'tanium-console', 'zone-server', 'linear-chain'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'tanium-client',
    term: 'Tanium Client',
    category: 'tanium-core',
    definition: 'Software agent installed on endpoints that communicates with the Tanium Server to answer queries and execute actions.',
    beginnerExplanation: 'The Tanium Client is a small program installed on every computer you want to manage. It\'s like having a helpful assistant on each computer that can answer questions and carry out tasks when asked.',
    examples: ['Windows Tanium Client', 'macOS Tanium Client', 'Linux Tanium Client'],
    relatedTerms: ['tanium-server', 'agent', 'endpoint', 'sensor', 'package'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'tanium-console',
    term: 'Tanium Console',
    category: 'tanium-core',
    definition: 'The web-based user interface that allows administrators to interact with the Tanium platform, create questions, deploy actions, and view results.',
    beginnerExplanation: 'The Tanium Console is the website-like interface where you control Tanium. It\'s like a dashboard for your car - you can see what\'s happening and control different functions.',
    examples: ['Question results grid', 'Saved Questions workspace', 'Package deployment interface', 'Computer Groups management'],
    relatedTerms: ['web-interface', 'dashboard', 'workspace', 'question', 'action'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'sensor',
    term: 'Sensor',
    category: 'tanium-core',
    definition: 'A component that collects specific information from endpoints, such as operating system details, installed software, or system performance metrics.',
    beginnerExplanation: 'A sensor is like a question you can ask computers. Each sensor knows how to find specific information - one sensor might find what programs are installed, another might check if the computer is online.',
    examples: ['Computer Name sensor', 'Operating System sensor', 'Running Processes sensor', 'IP Address sensor'],
    relatedTerms: ['question', 'data-collection', 'endpoint-data', 'query'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'question',
    term: 'Question',
    category: 'tanium-core',
    definition: 'A query sent to endpoints to gather specific information using one or more sensors, with optional filters and parameters.',
    beginnerExplanation: 'A question in Tanium is exactly what it sounds like - you ask all your computers a question like "What operating system are you running?" and they all answer back at the same time.',
    examples: ['Get Computer Name from all machines', 'Get Running Processes from machines with high CPU usage', 'Get Installed Applications from Windows machines'],
    relatedTerms: ['sensor', 'query', 'filter', 'saved-question', 'question-results'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'package',
    term: 'Package',
    category: 'tanium-core',
    definition: 'A collection of files and instructions that can be deployed to endpoints to perform specific actions, such as installing software or running scripts.',
    beginnerExplanation: 'A package is like a toolkit that gets sent to computers to do something specific - install software, run a cleanup script, or collect special information. It\'s bundled up so everything needed is included.',
    examples: ['Software installation package', 'Registry cleanup package', 'Antivirus update package', 'Custom script package'],
    relatedTerms: ['action', 'deployment', 'script', 'payload', 'package-deployment'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'action',
    term: 'Action',
    category: 'tanium-core',
    definition: 'The deployment of a package to specific endpoints to perform tasks such as software installation, configuration changes, or data collection.',
    beginnerExplanation: 'An action is when you tell computers to do something using a package. It\'s like giving instructions to a group of people - "everyone install this software" or "everyone run this cleanup tool."',
    examples: ['Deploy Windows update package', 'Install security software', 'Run disk cleanup script', 'Collect forensic data'],
    relatedTerms: ['package', 'deployment', 'execution', 'target-group', 'action-status'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'computer-group',
    term: 'Computer Group',
    category: 'tanium-core',
    definition: 'A logical collection of endpoints based on specific criteria, used for targeting questions and actions to specific sets of machines.',
    beginnerExplanation: 'A computer group is like organizing your computers into teams based on what they have in common - all Windows computers, all laptops in the sales department, or all computers that need updates.',
    examples: ['Windows 10 machines', 'Sales department laptops', 'Servers in datacenter', 'Machines with low disk space'],
    relatedTerms: ['targeting', 'filter', 'dynamic-group', 'static-group', 'membership-criteria'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'linear-chain',
    term: 'Linear Chain',
    category: 'tanium-core',
    definition: 'Tanium\'s unique communication protocol where endpoints forward queries and aggregate results in a peer-to-peer chain, enabling rapid real-time communication at scale.',
    beginnerExplanation: 'Linear chain is Tanium\'s special way of talking to lots of computers quickly. Instead of the server talking to each computer one by one, computers pass messages to each other in a chain, like a game of telephone but much faster and more reliable.',
    examples: ['Query propagation through endpoint chain', 'Result aggregation back to server', 'Peer-to-peer communication', 'Scalable architecture'],
    relatedTerms: ['peer-to-peer', 'scalability', 'real-time', 'architecture', 'communication-protocol'],
    importance: 'important',
    difficulty: 'advanced',
    examRelevance: true,
    taniumSpecific: true
  },

  // Tanium Modules
  {
    id: 'tanium-interact',
    term: 'Tanium Interact',
    category: 'tanium-modules',
    definition: 'The core Tanium module that provides real-time visibility and control over endpoints through questions and actions.',
    beginnerExplanation: 'Interact is the main part of Tanium where you ask questions and get answers from your computers. It\'s like the basic toolkit that lets you see what\'s happening on all your computers in real-time.',
    examples: ['Ask questions about system status', 'Deploy software packages', 'Investigate security incidents', 'Monitor endpoint health'],
    relatedTerms: ['question', 'action', 'real-time', 'visibility', 'endpoint-control'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'tanium-deploy',
    term: 'Tanium Deploy',
    category: 'tanium-modules',
    definition: 'Tanium module that provides software deployment and patch management capabilities across endpoints.',
    beginnerExplanation: 'Deploy is Tanium\'s tool for installing software and updates on computers. Instead of visiting each computer individually, you can install programs on hundreds or thousands of computers at once.',
    examples: ['Deploy Microsoft Office', 'Install security patches', 'Update antivirus software', 'Remove unwanted applications'],
    relatedTerms: ['software-deployment', 'patch-management', 'package', 'installation', 'update'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'tanium-asset',
    term: 'Tanium Asset',
    category: 'tanium-modules',
    definition: 'Tanium module that provides comprehensive asset inventory and management capabilities for hardware and software assets.',
    beginnerExplanation: 'Asset keeps track of all your computers and what\'s on them - like a detailed inventory list. It knows what hardware you have, what software is installed, and helps you manage your IT assets.',
    examples: ['Hardware inventory tracking', 'Software license management', 'Asset lifecycle management', 'Compliance reporting'],
    relatedTerms: ['inventory', 'asset-management', 'hardware', 'software', 'compliance'],
    importance: 'important',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'tanium-patch',
    term: 'Tanium Patch',
    category: 'tanium-modules',
    definition: 'Tanium module that provides comprehensive patch management for operating systems and third-party applications.',
    beginnerExplanation: 'Patch helps you keep all your computers up to date with the latest security fixes and updates. It finds computers that need updates and can install them automatically.',
    examples: ['Windows Update management', 'Third-party application patching', 'Patch testing and deployment', 'Vulnerability remediation'],
    relatedTerms: ['patch-management', 'updates', 'vulnerability', 'security', 'remediation'],
    importance: 'critical',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'tanium-threat-response',
    term: 'Tanium Threat Response',
    category: 'tanium-modules',
    definition: 'Tanium module that provides incident response, threat hunting, and forensic investigation capabilities.',
    beginnerExplanation: 'Threat Response is like being a detective for your computer network. When something suspicious happens, it helps you investigate, find the problem, and fix it quickly.',
    examples: ['Incident response workflows', 'Threat hunting queries', 'Forensic data collection', 'IOC (Indicator of Compromise) detection'],
    relatedTerms: ['incident-response', 'threat-hunting', 'forensics', 'investigation', 'ioc'],
    importance: 'important',
    difficulty: 'advanced',
    examRelevance: true,
    taniumSpecific: true
  },

  // Operations and Best Practices
  {
    id: 'saved-question',
    term: 'Saved Question',
    category: 'operations',
    definition: 'A pre-configured question that can be reused and scheduled to run automatically, providing consistent monitoring and reporting.',
    beginnerExplanation: 'A saved question is like having a favorite question that you ask regularly. Instead of typing it out each time, you save it and can run it whenever you need the same information.',
    examples: ['Daily system health check', 'Weekly software inventory', 'Security compliance scan', 'Performance monitoring query'],
    relatedTerms: ['question', 'automation', 'monitoring', 'scheduled-query', 'reporting'],
    importance: 'important',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'targeting',
    term: 'Targeting',
    category: 'operations',
    definition: 'The process of selecting specific endpoints or groups of endpoints to receive questions or actions based on defined criteria.',
    beginnerExplanation: 'Targeting is choosing which computers should receive your question or action. It\'s like addressing an email - you pick who should get the message instead of sending it to everyone.',
    examples: ['Target all Windows 10 machines', 'Target computers in specific location', 'Target machines with low disk space', 'Target servers only'],
    relatedTerms: ['computer-group', 'filter', 'selection-criteria', 'scope'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: true
  },
  {
    id: 'real-time',
    term: 'Real-time',
    category: 'operations',
    definition: 'The ability to get current, up-to-the-minute information from endpoints as conditions exist right now, rather than from stored or cached data.',
    beginnerExplanation: 'Real-time means getting information as it happens right now, not old information from yesterday or last week. It\'s like looking out your window to see the current weather instead of checking yesterday\'s weather report.',
    examples: ['Current running processes', 'Live memory usage', 'Active network connections', 'Present system status'],
    relatedTerms: ['live-data', 'current-state', 'immediate', 'up-to-date'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: true
  },

  // Compliance and Risk
  {
    id: 'compliance',
    term: 'Compliance',
    category: 'compliance',
    definition: 'Adherence to regulatory requirements, industry standards, and organizational policies that govern how data and systems must be protected and managed.',
    beginnerExplanation: 'Compliance means following the rules that apply to your organization - like laws about protecting customer data, industry standards for security, or company policies about software use.',
    examples: ['HIPAA compliance for healthcare', 'PCI DSS for payment processing', 'SOX for financial reporting', 'GDPR for data protection'],
    relatedTerms: ['regulation', 'audit', 'policy', 'standard', 'requirement'],
    importance: 'important',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'audit',
    term: 'Audit',
    category: 'compliance',
    definition: 'A systematic review and evaluation of an organization\'s systems, processes, and controls to ensure compliance with regulations and standards.',
    beginnerExplanation: 'An audit is like an inspection where external experts check if your organization is following all the required rules and has proper security measures in place.',
    examples: ['Annual security audit', 'Compliance assessment', 'Financial audit', 'IT controls review'],
    relatedTerms: ['compliance', 'assessment', 'review', 'validation', 'auditor'],
    importance: 'important',
    difficulty: 'intermediate',
    examRelevance: true,
    taniumSpecific: false
  },

  // Troubleshooting
  {
    id: 'log',
    term: 'Log',
    category: 'troubleshooting',
    definition: 'A record of events, actions, or messages generated by computer systems, applications, or security tools that can be used for monitoring, troubleshooting, and forensic analysis.',
    beginnerExplanation: 'A log is like a diary that computers keep - it writes down what happened when, including errors, successful actions, and important events. IT people read logs to understand problems and fix them.',
    examples: ['System event logs', 'Application error logs', 'Security audit logs', 'Web server access logs'],
    relatedTerms: ['event', 'logging', 'audit-trail', 'monitoring', 'forensics'],
    importance: 'important',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'troubleshooting',
    term: 'Troubleshooting',
    category: 'troubleshooting',
    definition: 'The systematic process of diagnosing and resolving problems with computer systems, networks, or applications.',
    beginnerExplanation: 'Troubleshooting is like being a detective for computer problems - you look for clues, test different solutions, and work step-by-step to find and fix what\'s wrong.',
    examples: ['Network connectivity issues', 'Software crash investigation', 'Performance problem diagnosis', 'Security incident analysis'],
    relatedTerms: ['diagnosis', 'problem-solving', 'root-cause', 'investigation', 'resolution'],
    importance: 'important',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },

  // Additional Critical Terms
  {
    id: 'agent',
    term: 'Agent',
    category: 'endpoints',
    definition: 'Software installed on an endpoint that communicates with a central management server to provide monitoring, management, and security capabilities.',
    beginnerExplanation: 'An agent is a small program installed on computers that acts like a representative for the management system. It reports information back and can carry out instructions, like having a helpful assistant on each computer.',
    examples: ['Tanium Client', 'Antivirus agent', 'Monitoring agent', 'Backup agent'],
    relatedTerms: ['client', 'tanium-client', 'endpoint-software', 'management-agent'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'deployment',
    term: 'Deployment',
    category: 'operations',
    definition: 'The process of installing, configuring, and making software or systems available for use across multiple endpoints or environments.',
    beginnerExplanation: 'Deployment is the process of rolling out software or updates to multiple computers at once. Instead of installing software on each computer individually, deployment lets you do it for many computers simultaneously.',
    examples: ['Software deployment', 'Security patch deployment', 'Agent deployment', 'Configuration deployment'],
    relatedTerms: ['installation', 'rollout', 'distribution', 'package-deployment'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  },
  {
    id: 'visibility',
    term: 'Visibility',
    category: 'operations',
    definition: 'The ability to see and understand what is happening across IT infrastructure, including device status, software inventory, security posture, and performance metrics.',
    beginnerExplanation: 'Visibility means being able to see what\'s happening with all your computers and systems. It\'s like having security cameras throughout a building - you can see what\'s going on everywhere from one central location.',
    examples: ['Network visibility', 'Endpoint visibility', 'Security visibility', 'Application performance visibility'],
    relatedTerms: ['monitoring', 'observability', 'transparency', 'insight', 'awareness'],
    importance: 'critical',
    difficulty: 'beginner',
    examRelevance: true,
    taniumSpecific: false
  }
];

/**
 * Search functionality for terminology database
 */
export class TerminologySearch {
  private terms: TermDefinition[];
  private searchIndex: Map<string, TermDefinition[]>;

  constructor(customTerms?: TermDefinition[]) {
    this.terms = customTerms || TCO_TERMINOLOGY;
    this.searchIndex = this.buildSearchIndex();
  }

  /**
   * Build search index for faster lookups
   */
  private buildSearchIndex(): Map<string, TermDefinition[]> {
    const index = new Map<string, TermDefinition[]>();

    this.terms.forEach(term => {
      // Index by term name
      const termWords = term.term.toLowerCase().split(/\s+/);
      termWords.forEach(word => {
        if (!index.has(word)) {
          index.set(word, []);
        }
        index.get(word)!.push(term);
      });

      // Index by definition keywords
      const definitionWords = term.definition.toLowerCase().split(/\s+/);
      definitionWords.forEach(word => {
        if (word.length > 3) { // Only index significant words
          if (!index.has(word)) {
            index.set(word, []);
          }
          if (!index.get(word)!.includes(term)) {
            index.get(word)!.push(term);
          }
        }
      });

      // Index by related terms
      if (term.relatedTerms) {
        term.relatedTerms.forEach(relatedTerm => {
          const relatedWords = relatedTerm.toLowerCase().split(/\s+/);
          relatedWords.forEach(word => {
            if (!index.has(word)) {
              index.set(word, []);
            }
            if (!index.get(word)!.includes(term)) {
              index.get(word)!.push(term);
            }
          });
        });
      }
    });

    return index;
  }

  /**
   * Search for terms matching query
   */
  search(query: string, options?: {
    category?: TermCategory;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    examOnly?: boolean;
    taniumOnly?: boolean;
    limit?: number;
  }): TermDefinition[] {
    if (!query.trim()) {
      return this.getFilteredTerms(options);
    }

    const queryWords = query.toLowerCase().split(/\s+/);
    const matchCounts = new Map<string, number>();

    // Find matches for each query word
    queryWords.forEach(word => {
      const matches = this.searchIndex.get(word) || [];
      matches.forEach(term => {
        const currentCount = matchCounts.get(term.id) || 0;
        matchCounts.set(term.id, currentCount + 1);
      });
    });

    // Sort by relevance (number of matching words, then importance)
    const results = Array.from(matchCounts.entries())
      .sort((a, b) => {
        if (a[1] !== b[1]) return b[1] - a[1]; // More matches first
        
        const termA = this.terms.find(t => t.id === a[0])!;
        const termB = this.terms.find(t => t.id === b[0])!;
        
        // Priority: critical > important > useful
        const importanceOrder = { critical: 3, important: 2, useful: 1 };
        return importanceOrder[termB.importance] - importanceOrder[termA.importance];
      })
      .map(([termId]) => this.terms.find(t => t.id === termId)!)
      .filter(term => this.matchesFilters(term, options));

    return options?.limit ? results.slice(0, options.limit) : results;
  }

  /**
   * Get terms by category
   */
  getByCategory(category: TermCategory): TermDefinition[] {
    return this.terms.filter(term => term.category === category);
  }

  /**
   * Get term by ID
   */
  getById(id: string): TermDefinition | undefined {
    return this.terms.find(term => term.id === id);
  }

  /**
   * Get related terms
   */
  getRelatedTerms(termId: string): TermDefinition[] {
    const term = this.getById(termId);
    if (!term?.relatedTerms) return [];

    return term.relatedTerms
      .map(relatedId => this.getById(relatedId))
      .filter((t): t is TermDefinition => t !== undefined);
  }

  /**
   * Get filtered terms
   */
  private getFilteredTerms(options?: {
    category?: TermCategory;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    examOnly?: boolean;
    taniumOnly?: boolean;
    limit?: number;
  }): TermDefinition[] {
    const filtered = this.terms.filter(term => this.matchesFilters(term, options));
    
    // Sort by importance and difficulty
    filtered.sort((a, b) => {
      const importanceOrder = { critical: 3, important: 2, useful: 1 };
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
      
      if (a.importance !== b.importance) {
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      }
      
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    return options?.limit ? filtered.slice(0, options.limit) : filtered;
  }

  /**
   * Check if term matches filters
   */
  private matchesFilters(term: TermDefinition, options?: {
    category?: TermCategory;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    examOnly?: boolean;
    taniumOnly?: boolean;
  }): boolean {
    if (options?.category && term.category !== options.category) {
      return false;
    }

    if (options?.difficulty && term.difficulty !== options.difficulty) {
      return false;
    }

    if (options?.examOnly && !term.examRelevance) {
      return false;
    }

    if (options?.taniumOnly && !term.taniumSpecific) {
      return false;
    }

    return true;
  }

  /**
   * Get statistics about the terminology database
   */
  getStatistics(): {
    totalTerms: number;
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byImportance: Record<string, number>;
    examRelevant: number;
    taniumSpecific: number;
  } {
    const stats = {
      totalTerms: this.terms.length,
      byCategory: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>,
      byImportance: {} as Record<string, number>,
      examRelevant: 0,
      taniumSpecific: 0
    };

    this.terms.forEach(term => {
      // By category
      stats.byCategory[term.category] = (stats.byCategory[term.category] || 0) + 1;
      
      // By difficulty
      stats.byDifficulty[term.difficulty] = (stats.byDifficulty[term.difficulty] || 0) + 1;
      
      // By importance
      stats.byImportance[term.importance] = (stats.byImportance[term.importance] || 0) + 1;
      
      // Exam relevance
      if (term.examRelevance) stats.examRelevant++;
      
      // Tanium specific
      if (term.taniumSpecific) stats.taniumSpecific++;
    });

    return stats;
  }
}

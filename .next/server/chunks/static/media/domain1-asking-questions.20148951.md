import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMDXComponents as _provideComponents } from "next-mdx-import-source-file";
function _createMdxContent(props) {
    const _components = {
        br: "br",
        code: "code",
        h1: "h1",
        h2: "h2",
        h3: "h3",
        hr: "hr",
        li: "li",
        ol: "ol",
        p: "p",
        pre: "pre",
        strong: "strong",
        ul: "ul",
        ..._provideComponents(),
        ...props.components
    };
    return _jsxs(_Fragment, {
        children: [
            _jsx(_components.h1, {
                children: "Domain 1: Asking Questions (22% Exam Weight)"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "TCO Certification Domain 1"
                    }),
                    ": Natural Language Query Construction and Sensor Management"
                ]
            }),
            "\n",
            _jsx(_components.h2, {
                children: "📋 Learning Objectives"
            }),
            "\n",
            _jsx(_components.p, {
                children: "By the end of this module, you will be able to:"
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Master Natural Language Query Construction"
                            }),
                            " - Create effective Tanium console queries using proper syntax and procedures"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Navigate the Sensor Library"
                            }),
                            " - Utilize 500+ built-in sensors and create custom sensors with proper parameters"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Manage Saved Questions"
                            }),
                            " - Implement lifecycle management workflows for question creation, deployment, and sharing"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Interpret Query Results"
                            }),
                            " - Validate data accuracy, troubleshoot issues, and optimize performance"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Optimize Question Performance"
                            }),
                            " - Apply advanced techniques for large-scale enterprise deployments"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "🎯 Module 1: Natural Language Query Construction Fundamentals"
            }),
            "\n",
            _jsx(_components.h3, {
                children: "1.1 Tanium Query Language Basics"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Core Query Components"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Subject"
                            }),
                            ": What data you want to collect (sensors)"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Targeting"
                            }),
                            ": Which endpoints to query (computer groups, filters)"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Modifiers"
                            }),
                            ": How to refine and process results"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Output"
                            }),
                            ": How results are displayed and formatted"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Basic Query Syntax"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsx(_components.pre, {
                children: _jsx(_components.code, {
                    children: "Get [Sensor] from [Target] [Modifiers]\n"
                })
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Examples"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsx(_components.pre, {
                children: _jsx(_components.code, {
                    children: "Get Computer Name from all machines\nGet IP Address from all machines with Is Windows containing \"Yes\"\nGet Installed Applications from Computer Group \"Production Servers\"\nGet Running Processes from all machines where Operating System contains \"Windows 10\"\n"
                })
            }),
            "\n",
            _jsx(_components.h3, {
                children: "1.2 Query Construction Best Practices"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Effective Query Design Principles"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Start Simple, Build Complexity"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Begin with basic sensor queries"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Add targeting and filtering incrementally"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Test at each step to validate results"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Use Precise Targeting"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Leverage computer groups for recurring queries"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Apply filters to minimize network impact"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Consider endpoint capacity and network bandwidth"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Validate Query Logic"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Test queries on small sample sets first"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Verify sensor compatibility with target platforms"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Check for expected data formats and ranges"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "1.3 Advanced Query Techniques"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Complex Query Patterns"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Multi-Sensor Queries"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Get Computer Name and IP Address and Operating System\nfrom all machines\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Conditional Logic"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Get Running Processes from all machines\nwhere CPU Usage is greater than 50\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Data Transformation"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Get Installed Applications[contains \"Adobe\"]\nfrom Computer Group \"Workstations\"\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Time-Based Queries"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Get Last Reboot from all machines\nwhere Last Reboot is older than \"7 days\"\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "🎯 Module 2: Sensor Library Mastery"
            }),
            "\n",
            _jsx(_components.h3, {
                children: "2.1 Built-In Sensor Categories"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "System Information Sensors"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsx(_components.li, {
                        children: "Computer Name, IP Address, MAC Address"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Operating System, System Manufacturer"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "CPU, Memory, Disk Space information"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Network Configuration details"
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Security Sensors"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsx(_components.li, {
                        children: "Running Processes, Services, Scheduled Tasks"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Registry Keys and Values"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Installed Applications and Updates"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "User Account information"
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Performance Sensors"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsx(_components.li, {
                        children: "CPU Usage, Memory Usage, Disk Usage"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Network Interface statistics"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Process resource consumption"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "System uptime and availability"
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Configuration Sensors"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsx(_components.li, {
                        children: "Environmental Variables"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "System Settings and Policies"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Hardware Configuration"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Software Configuration details"
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "2.2 Sensor Parameter Configuration"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Common Sensor Parameters"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "String Parameters"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Case sensitivity options"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Regular expression support"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Wildcard matching patterns"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Exact match requirements"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Numeric Parameters"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Comparison operators (>, <, =, >=, <=)"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Range specifications"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Unit conversions (bytes, MB, GB)"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Threshold definitions"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Time Parameters"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Absolute timestamps"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Relative time ranges"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Duration specifications"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Timezone considerations"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "2.3 Custom Sensor Creation"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Custom Sensor Development Process"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Requirements Analysis"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Define data collection objectives"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Identify target platforms and compatibility"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Specify output format requirements"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Consider performance implications"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Sensor Implementation"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Choose appropriate scripting language (PowerShell, VBScript, etc.)"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement data collection logic"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Handle error conditions and edge cases"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Optimize for performance and reliability"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Testing and Validation"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Test across different operating systems"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Validate output formats and data types"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Performance testing under load"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Security and permission validation"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Deployment and Management"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Package sensor for distribution"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Configure appropriate permissions"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Document usage and parameters"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement version control procedures"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "🎯 Module 3: Saved Question Management"
            }),
            "\n",
            _jsx(_components.h3, {
                children: "3.1 Question Creation Workflow"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Step-by-Step Question Creation"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Initial Design"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Navigate: Interact → Questions → New Question\n1. Define question objective and scope\n2. Select appropriate sensors and parameters\n3. Configure targeting criteria\n4. Set execution parameters (timeout, retries)\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Testing and Validation"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "1. Test on small subset of endpoints\n2. Validate results format and accuracy\n3. Check performance and resource impact\n4. Refine query based on test results\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Production Deployment"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "1. Configure appropriate scheduling\n2. Set up result handling and storage\n3. Configure notifications and alerts\n4. Document question purpose and usage\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "3.2 Question Library Organization"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Organizational Best Practices"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Naming Conventions"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Use descriptive, standardized names"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Include purpose and target information"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Version numbering for iterations"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Category prefixes for grouping"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Categorization Strategy"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "By functional area (Security, Performance, Inventory)"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "By target platform (Windows, Linux, macOS)"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "By urgency level (Critical, Standard, Informational)"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "By update frequency (Real-time, Daily, Weekly)"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Access Control Management"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Define user groups and permissions"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement approval workflows for sensitive questions"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Audit access patterns and usage"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Regular review and cleanup procedures"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "3.3 Question Sharing and Collaboration"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Sharing Mechanisms"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Internal Sharing"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Team-based question libraries"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Role-based access controls"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Version control and change management"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Usage analytics and reporting"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "External Collaboration"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Community question libraries"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Vendor-provided question packages"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Industry best practice questions"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Compliance and audit questions"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "🎯 Module 4: Query Result Interpretation and Optimization"
            }),
            "\n",
            _jsx(_components.h3, {
                children: "4.1 Result Analysis Techniques"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Data Validation Methods"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Accuracy Verification"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Cross-reference with known good data"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Validate against multiple data sources"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Check for logical consistency"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Identify and investigate anomalies"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Completeness Assessment"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Verify expected endpoint response rates"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Identify non-responsive endpoints"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Analyze partial result patterns"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Determine data coverage gaps"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Performance Analysis"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Monitor query execution times"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Analyze network bandwidth usage"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Track endpoint resource consumption"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Identify optimization opportunities"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "4.2 Troubleshooting Common Issues"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Query Performance Problems"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Slow Query Execution"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Cause"
                                            }),
                                            ": Complex sensors, large result sets, network congestion"
                                        ]
                                    }),
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Solution"
                                            }),
                                            ": Optimize sensor selection, implement result filtering, schedule during off-peak hours"
                                        ]
                                    }),
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Prevention"
                                            }),
                                            ": Performance testing, incremental complexity building"
                                        ]
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Incomplete Results"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Cause"
                                            }),
                                            ": Endpoint connectivity issues, permission problems, timeout settings"
                                        ]
                                    }),
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Solution"
                                            }),
                                            ": Adjust timeout values, verify permissions, check network connectivity"
                                        ]
                                    }),
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Prevention"
                                            }),
                                            ": Regular connectivity testing, permission audits"
                                        ]
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Inaccurate Data"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Cause"
                                            }),
                                            ": Sensor compatibility issues, outdated sensors, platform variations"
                                        ]
                                    }),
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Solution"
                                            }),
                                            ": Update sensors, verify platform compatibility, cross-validate results"
                                        ]
                                    }),
                                    "\n",
                                    _jsxs(_components.li, {
                                        children: [
                                            _jsx(_components.strong, {
                                                children: "Prevention"
                                            }),
                                            ": Regular sensor updates, compatibility testing"
                                        ]
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "4.3 Performance Optimization Strategies"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Large-Scale Deployment Optimization"
                    }),
                    ":"
                ]
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Query Scheduling"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Distribute query load across time windows"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Prioritize critical queries during peak hours"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement intelligent retry mechanisms"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Balance real-time needs with resource constraints"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Result Caching and Storage"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement result caching for frequently accessed data"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Configure appropriate data retention policies"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Optimize database storage and indexing"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement data archiving procedures"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Network Optimization"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Implement result compression"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Use differential updates where possible"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Optimize query distribution patterns"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Monitor and manage bandwidth usage"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "🧪 Hands-On Lab: LAB-AQ-001 - Natural Language Query Construction"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Duration"
                    }),
                    ": 12 minutes",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "Objective"
                    }),
                    ": Master essential query construction and sensor utilization techniques"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Lab Setup"
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsx(_components.li, {
                        children: "Access to Tanium Console with question creation permissions"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Sample endpoints with diverse operating systems"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "Access to sensor library and custom sensor creation tools"
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Exercise 1: Basic Query Construction (4 minutes)"
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Simple Data Collection"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Create Query: Get Computer Name from all machines\n1. Navigate to Interact → Questions → New Question\n2. Enter the natural language query\n3. Review auto-generated sensor selections\n4. Execute on small test group (5-10 machines)\n5. Analyze results for completeness and accuracy\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Multi-Sensor Queries"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Create Query: Get Computer Name and IP Address and Operating System from all machines\n1. Build query with multiple sensors\n2. Verify sensor compatibility across platforms\n3. Execute and compare results format\n4. Document any platform-specific variations\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Exercise 2: Advanced Targeting and Filtering (4 minutes)"
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Conditional Queries"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Create Query: Get Running Processes from all machines where CPU Usage is greater than 25\n1. Implement conditional logic in query\n2. Configure appropriate thresholds\n3. Test on endpoints with known high-CPU processes\n4. Validate filter effectiveness\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Computer Group Targeting"
                                })
                            }),
                            "\n",
                            _jsx(_components.pre, {
                                children: _jsx(_components.code, {
                                    children: "Create Query: Get Installed Applications from Computer Group \"Test Workstations\"\n1. Select or create appropriate computer group\n2. Configure query targeting\n3. Execute and validate group membership accuracy\n4. Compare results across group members\n"
                                })
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Exercise 3: Result Analysis and Optimization (4 minutes)"
            }),
            "\n",
            _jsxs(_components.ol, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Performance Analysis"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Execute queries with different complexity levels"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Monitor execution times and resource usage"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Identify performance bottlenecks"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Document optimization opportunities"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            "\n",
                            _jsx(_components.p, {
                                children: _jsx(_components.strong, {
                                    children: "Result Validation"
                                })
                            }),
                            "\n",
                            _jsxs(_components.ul, {
                                children: [
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Cross-reference results with known data sources"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Identify and investigate anomalies"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Validate data completeness and accuracy"
                                    }),
                                    "\n",
                                    _jsx(_components.li, {
                                        children: "Document findings and recommendations"
                                    }),
                                    "\n"
                                ]
                            }),
                            "\n"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Lab Validation"
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsx(_components.li, {
                        children: "[ ] Successfully created and executed basic natural language queries"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "[ ] Demonstrated multi-sensor query construction"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "[ ] Implemented conditional logic and filtering"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "[ ] Utilized computer group targeting effectively"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "[ ] Analyzed query performance and optimized execution"
                    }),
                    "\n",
                    _jsx(_components.li, {
                        children: "[ ] Validated result accuracy and completeness"
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "📝 Domain 1 Practice Questions"
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 1: Natural Language Query Syntax"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": You need to identify all Windows 10 workstations that have been running for more than 30 days without a reboot to plan maintenance windows."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": Which natural language query correctly identifies these endpoints?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " ",
                    _jsx(_components.code, {
                        children: "Get Computer Name from all machines where Operating System = \"Windows 10\" and Uptime > 30"
                    }),
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " ",
                    _jsx(_components.code, {
                        children: "Get Computer Name from all machines where Operating System contains \"Windows 10\" and Last Reboot is older than \"30 days\""
                    }),
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " ",
                    _jsx(_components.code, {
                        children: "Get Computer Name and Uptime from Windows 10 machines with Last Reboot > 30 days"
                    }),
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " ",
                    _jsx(_components.code, {
                        children: "Get Computer Name where OS is \"Windows 10\" and Days Since Reboot is greater than 30"
                    })
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": B"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Option B uses the correct Tanium natural language syntax with proper sensor names and conditional operators. \"Operating System contains\" handles version variations, and \"Last Reboot is older than\" with time specification is the correct syntax for time-based comparisons. The other options use incorrect sensor names or syntax that wouldn't be recognized by the Tanium query parser."
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 2: Sensor Parameter Configuration"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": A security team needs to identify all processes consuming more than 100MB of memory across the enterprise to investigate potential memory leaks or malicious activity."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": What is the most effective approach to configure this query for optimal performance and accuracy?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " Query all processes first, then filter results manually in the console",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " Use \"Get Running Processes from all machines where Memory Usage is greater than 100\"",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " Create separate queries for each operating system due to memory reporting differences",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " Use \"Get Running Processes[Memory Usage > 104857600] from all machines\""
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": D"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Option D uses the most precise approach by specifying the memory threshold in bytes (104857600 bytes = 100MB) within the sensor parameter, which filters at the sensor level for optimal performance. This approach minimizes network traffic and provides consistent results across platforms. Option B might work but could be ambiguous about units, while Options A and C are inefficient approaches."
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 3: Custom Sensor Implementation"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": Your organization needs to track a specific third-party application's configuration file contents that aren't covered by built-in sensors."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": Which approach represents the best practice for implementing this custom sensor requirement?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " Modify an existing built-in sensor to include the additional functionality",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " Create a custom sensor with proper error handling, multi-platform support, and performance optimization",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " Use multiple existing sensors in combination to approximate the needed data",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " Request the data through manual collection and import into Tanium"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": B"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Creating a custom sensor with proper engineering practices is the correct approach for requirements not met by built-in sensors. This includes implementing error handling for missing files, supporting different platforms where the application runs, optimizing for performance to minimize endpoint impact, and following Tanium's sensor development guidelines. This provides reliable, scalable, and maintainable functionality."
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 4: Question Library Management"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": Your team manages over 200 saved questions across multiple departments with different access requirements and update schedules."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": Which organizational strategy provides the most effective management and governance?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " Group questions by creation date with annual review cycles",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " Implement role-based categories with standardized naming conventions and access controls",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " Organize alphabetically with shared access for all team members",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " Create department-specific folders with no cross-team access"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": B"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Role-based categorization with standardized naming and access controls provides the most scalable and secure approach to question library management. This strategy ensures appropriate access based on job function, enables efficient discovery through consistent naming, and maintains security through proper access controls. It also supports collaboration while maintaining governance over sensitive queries."
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 5: Performance Optimization for Enterprise Scale"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": A query targeting 50,000 endpoints is causing network congestion during business hours and affecting other critical operations."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": Which optimization strategy addresses this issue most effectively while maintaining data collection requirements?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " Reduce the query timeout to force faster completion",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " Implement query scheduling during off-peak hours with result caching",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " Split the query into smaller geographic regions manually",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " Reduce the number of sensors in the query to minimize data transfer"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": B"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Scheduling queries during off-peak hours with result caching addresses the root cause of network congestion while maintaining data availability. This approach moves resource-intensive operations to times when network capacity is available and provides cached results for immediate access during business hours. The other options either compromise data quality (A, D) or create management overhead without addressing the fundamental timing issue (C)."
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 6: Troubleshooting Query Results"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": A query returns results from only 85% of expected endpoints, with the remaining 15% showing no response."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": What is the most systematic approach to diagnose and resolve this issue?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " Immediately increase the query timeout and retry",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " Check endpoint connectivity, permissions, and sensor compatibility in that order",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " Exclude non-responsive endpoints from the target group",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " Run a simpler query first to test basic connectivity"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": B"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Following a systematic diagnostic approach starting with connectivity (network reachability), then permissions (authentication and authorization), and finally sensor compatibility (platform support) provides the most efficient troubleshooting methodology. This sequence addresses the most common causes in order of likelihood and severity, ensuring comprehensive diagnosis while minimizing time spent on less probable causes."
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question 7: Advanced Query Logic Implementation"
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Scenario"
                    }),
                    ": Security requires identification of endpoints with specific vulnerabilities based on multiple criteria: Windows OS, specific patch levels, and certain applications installed."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Question"
                    }),
                    ": Which query structure most effectively implements this complex logic?"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "A)"
                    }),
                    " Use multiple separate queries and correlate results manually",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "B)"
                    }),
                    " Implement nested conditional logic within a single query using AND operators",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "C)"
                    }),
                    " Create a custom sensor that evaluates all criteria programmatically",
                    _jsx(_components.br, {}),
                    "\n",
                    _jsx(_components.strong, {
                        children: "D)"
                    }),
                    " Use computer groups pre-filtered for each criterion, then intersect the groups"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Correct Answer"
                    }),
                    ": B"
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Explanation"
                    }),
                    ": Implementing nested conditional logic with AND operators in a single query provides the most efficient and accurate approach. This method ensures all criteria are evaluated simultaneously against each endpoint, reducing network traffic and providing precise results. While option C (custom sensor) could work, it's more complex to maintain, and option D (computer groups) adds unnecessary management overhead for dynamic criteria."
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsx(_components.h2, {
                children: "🎯 Key Takeaways"
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Essential Query Construction Skills"
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Natural Language Mastery"
                            }),
                            ": Understand Tanium's query syntax and construction patterns"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Sensor Selection"
                            }),
                            ": Choose appropriate sensors based on data requirements and platform compatibility"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Targeting Precision"
                            }),
                            ": Use computer groups and filters effectively to minimize resource impact"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Performance Optimization"
                            }),
                            ": Design queries that balance data needs with system resources"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Sensor Library Expertise"
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Built-in Sensor Categories"
                            }),
                            ": Master the 500+ available sensors across system, security, and performance domains"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Custom Sensor Development"
                            }),
                            ": Implement reliable custom sensors when built-in options are insufficient"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Parameter Configuration"
                            }),
                            ": Utilize sensor parameters effectively for precise data collection"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Platform Considerations"
                            }),
                            ": Account for operating system differences in sensor behavior"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Question Management Excellence"
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Lifecycle Management"
                            }),
                            ": Implement proper creation, testing, deployment, and maintenance procedures"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Library Organization"
                            }),
                            ": Use consistent naming, categorization, and access control strategies"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Sharing and Collaboration"
                            }),
                            ": Balance security with collaboration needs in question sharing"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Version Control"
                            }),
                            ": Maintain proper versioning and change management for critical questions"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.h3, {
                children: "Result Analysis Mastery"
            }),
            "\n",
            _jsxs(_components.ul, {
                children: [
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Data Validation"
                            }),
                            ": Implement systematic approaches to verify result accuracy and completeness"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Troubleshooting"
                            }),
                            ": Apply structured diagnostic procedures for common query issues"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Performance Monitoring"
                            }),
                            ": Continuously monitor and optimize query performance at enterprise scale"
                        ]
                    }),
                    "\n",
                    _jsxs(_components.li, {
                        children: [
                            _jsx(_components.strong, {
                                children: "Optimization Strategies"
                            }),
                            ": Apply caching, scheduling, and resource management techniques"
                        ]
                    }),
                    "\n"
                ]
            }),
            "\n",
            _jsx(_components.hr, {}),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Next Steps"
                    }),
                    ": After mastering Domain 1 question construction and sensor management, proceed to Domain 2 (Refining Questions & Targeting) to learn advanced filtering and targeting techniques, or Domain 4 (Navigation & Module Functions) for platform operation skills."
                ]
            }),
            "\n",
            _jsxs(_components.p, {
                children: [
                    _jsx(_components.strong, {
                        children: "Exam Weight"
                    }),
                    ": This domain represents 22% of the TCO certification exam - the third-highest weight. These foundational skills in question construction and sensor management are essential for all other Tanium operations and form the basis for advanced techniques covered in other domains."
                ]
            })
        ]
    });
}
export default function MDXContent(props = {}) {
    const { wrapper: MDXLayout } = {
        ..._provideComponents(),
        ...props.components
    };
    return MDXLayout ? _jsx(MDXLayout, {
        ...props,
        children: _jsx(_createMdxContent, {
            ...props
        })
    }) : _createMdxContent(props);
}

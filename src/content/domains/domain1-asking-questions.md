# Domain 1: Asking Questions (22% Exam Weight)

**TCO Certification Domain 1**: Natural Language Query Construction and Sensor Management

## 📋 Learning Objectives

By the end of this module, you will be able to:

1. **Master Natural Language Query Construction** - Create effective Tanium console queries using proper syntax and procedures
2. **Navigate the Sensor Library** - Utilize 500+ built-in sensors and create custom sensors with proper parameters
3. **Manage Saved Questions** - Implement lifecycle management workflows for question creation, deployment, and sharing
4. **Interpret Query Results** - Validate data accuracy, troubleshoot issues, and optimize performance
5. **Optimize Question Performance** - Apply advanced techniques for large-scale enterprise deployments

---

## 🎯 Module 1: Natural Language Query Construction Fundamentals

### 1.1 Tanium Query Language Basics

**Core Query Components**:

- **Subject**: What data you want to collect (sensors)
- **Targeting**: Which endpoints to query (computer groups, filters)
- **Modifiers**: How to refine and process results
- **Output**: How results are displayed and formatted

**Basic Query Syntax**:

```
Get [Sensor] from [Target] [Modifiers]
```

**Examples**:

```
Get Computer Name from all machines
Get IP Address from all machines with Is Windows containing "Yes"
Get Installed Applications from Computer Group "Production Servers"
Get Running Processes from all machines where Operating System contains "Windows 10"
```

### 1.2 Query Construction Best Practices

**Effective Query Design Principles**:

1. **Start Simple, Build Complexity**
   - Begin with basic sensor queries
   - Add targeting and filtering incrementally
   - Test at each step to validate results

2. **Use Precise Targeting**
   - Leverage computer groups for recurring queries
   - Apply filters to minimize network impact
   - Consider endpoint capacity and network bandwidth

3. **Validate Query Logic**
   - Test queries on small sample sets first
   - Verify sensor compatibility with target platforms
   - Check for expected data formats and ranges

### 1.3 Advanced Query Techniques

**Complex Query Patterns**:

1. **Multi-Sensor Queries**

   ```
   Get Computer Name and IP Address and Operating System
   from all machines
   ```

2. **Conditional Logic**

   ```
   Get Running Processes from all machines
   where CPU Usage is greater than 50
   ```

3. **Data Transformation**

   ```
   Get Installed Applications[contains "Adobe"]
   from Computer Group "Workstations"
   ```

4. **Time-Based Queries**

   ```
   Get Last Reboot from all machines
   where Last Reboot is older than "7 days"
   ```

---

## 🎯 Module 2: Sensor Library Mastery

### 2.1 Built-In Sensor Categories

**System Information Sensors**:

- Computer Name, IP Address, MAC Address
- Operating System, System Manufacturer
- CPU, Memory, Disk Space information
- Network Configuration details

**Security Sensors**:

- Running Processes, Services, Scheduled Tasks
- Registry Keys and Values
- Installed Applications and Updates
- User Account information

**Performance Sensors**:

- CPU Usage, Memory Usage, Disk Usage
- Network Interface statistics
- Process resource consumption
- System uptime and availability

**Configuration Sensors**:

- Environmental Variables
- System Settings and Policies
- Hardware Configuration
- Software Configuration details

### 2.2 Sensor Parameter Configuration

**Common Sensor Parameters**:

1. **String Parameters**
   - Case sensitivity options
   - Regular expression support
   - Wildcard matching patterns
   - Exact match requirements

2. **Numeric Parameters**
   - Comparison operators (>, <, =, >=, <=)
   - Range specifications
   - Unit conversions (bytes, MB, GB)
   - Threshold definitions

3. **Time Parameters**
   - Absolute timestamps
   - Relative time ranges
   - Duration specifications
   - Timezone considerations

### 2.3 Custom Sensor Creation

**Custom Sensor Development Process**:

1. **Requirements Analysis**
   - Define data collection objectives
   - Identify target platforms and compatibility
   - Specify output format requirements
   - Consider performance implications

2. **Sensor Implementation**
   - Choose appropriate scripting language (PowerShell, VBScript, etc.)
   - Implement data collection logic
   - Handle error conditions and edge cases
   - Optimize for performance and reliability

3. **Testing and Validation**
   - Test across different operating systems
   - Validate output formats and data types
   - Performance testing under load
   - Security and permission validation

4. **Deployment and Management**
   - Package sensor for distribution
   - Configure appropriate permissions
   - Document usage and parameters
   - Implement version control procedures

---

## 🎯 Module 3: Saved Question Management

### 3.1 Question Creation Workflow

**Step-by-Step Question Creation**:

1. **Initial Design**

   ```
   Navigate: Interact → Questions → New Question
   1. Define question objective and scope
   2. Select appropriate sensors and parameters
   3. Configure targeting criteria
   4. Set execution parameters (timeout, retries)
   ```

2. **Testing and Validation**

   ```
   1. Test on small subset of endpoints
   2. Validate results format and accuracy
   3. Check performance and resource impact
   4. Refine query based on test results
   ```

3. **Production Deployment**

   ```
   1. Configure appropriate scheduling
   2. Set up result handling and storage
   3. Configure notifications and alerts
   4. Document question purpose and usage
   ```

### 3.2 Question Library Organization

**Organizational Best Practices**:

1. **Naming Conventions**
   - Use descriptive, standardized names
   - Include purpose and target information
   - Version numbering for iterations
   - Category prefixes for grouping

2. **Categorization Strategy**
   - By functional area (Security, Performance, Inventory)
   - By target platform (Windows, Linux, macOS)
   - By urgency level (Critical, Standard, Informational)
   - By update frequency (Real-time, Daily, Weekly)

3. **Access Control Management**
   - Define user groups and permissions
   - Implement approval workflows for sensitive questions
   - Audit access patterns and usage
   - Regular review and cleanup procedures

### 3.3 Question Sharing and Collaboration

**Sharing Mechanisms**:

1. **Internal Sharing**
   - Team-based question libraries
   - Role-based access controls
   - Version control and change management
   - Usage analytics and reporting

2. **External Collaboration**
   - Community question libraries
   - Vendor-provided question packages
   - Industry best practice questions
   - Compliance and audit questions

---

## 🎯 Module 4: Query Result Interpretation and Optimization

### 4.1 Result Analysis Techniques

**Data Validation Methods**:

1. **Accuracy Verification**
   - Cross-reference with known good data
   - Validate against multiple data sources
   - Check for logical consistency
   - Identify and investigate anomalies

2. **Completeness Assessment**
   - Verify expected endpoint response rates
   - Identify non-responsive endpoints
   - Analyze partial result patterns
   - Determine data coverage gaps

3. **Performance Analysis**
   - Monitor query execution times
   - Analyze network bandwidth usage
   - Track endpoint resource consumption
   - Identify optimization opportunities

### 4.2 Troubleshooting Common Issues

**Query Performance Problems**:

1. **Slow Query Execution**
   - **Cause**: Complex sensors, large result sets, network congestion
   - **Solution**: Optimize sensor selection, implement result filtering, schedule during off-peak hours
   - **Prevention**: Performance testing, incremental complexity building

2. **Incomplete Results**
   - **Cause**: Endpoint connectivity issues, permission problems, timeout settings
   - **Solution**: Adjust timeout values, verify permissions, check network connectivity
   - **Prevention**: Regular connectivity testing, permission audits

3. **Inaccurate Data**
   - **Cause**: Sensor compatibility issues, outdated sensors, platform variations
   - **Solution**: Update sensors, verify platform compatibility, cross-validate results
   - **Prevention**: Regular sensor updates, compatibility testing

### 4.3 Performance Optimization Strategies

**Large-Scale Deployment Optimization**:

1. **Query Scheduling**
   - Distribute query load across time windows
   - Prioritize critical queries during peak hours
   - Implement intelligent retry mechanisms
   - Balance real-time needs with resource constraints

2. **Result Caching and Storage**
   - Implement result caching for frequently accessed data
   - Configure appropriate data retention policies
   - Optimize database storage and indexing
   - Implement data archiving procedures

3. **Network Optimization**
   - Implement result compression
   - Use differential updates where possible
   - Optimize query distribution patterns
   - Monitor and manage bandwidth usage

---

## 🧪 Hands-On Lab: LAB-AQ-001 - Natural Language Query Construction

**Duration**: 12 minutes  
**Objective**: Master essential query construction and sensor utilization techniques

### Lab Setup

- Access to Tanium Console with question creation permissions
- Sample endpoints with diverse operating systems
- Access to sensor library and custom sensor creation tools

### Exercise 1: Basic Query Construction (4 minutes)

1. **Simple Data Collection**

   ```
   Create Query: Get Computer Name from all machines
   1. Navigate to Interact → Questions → New Question
   2. Enter the natural language query
   3. Review auto-generated sensor selections
   4. Execute on small test group (5-10 machines)
   5. Analyze results for completeness and accuracy
   ```

2. **Multi-Sensor Queries**

   ```
   Create Query: Get Computer Name and IP Address and Operating System from all machines
   1. Build query with multiple sensors
   2. Verify sensor compatibility across platforms
   3. Execute and compare results format
   4. Document any platform-specific variations
   ```

### Exercise 2: Advanced Targeting and Filtering (4 minutes)

1. **Conditional Queries**

   ```
   Create Query: Get Running Processes from all machines where CPU Usage is greater than 25
   1. Implement conditional logic in query
   2. Configure appropriate thresholds
   3. Test on endpoints with known high-CPU processes
   4. Validate filter effectiveness
   ```

2. **Computer Group Targeting**

   ```
   Create Query: Get Installed Applications from Computer Group "Test Workstations"
   1. Select or create appropriate computer group
   2. Configure query targeting
   3. Execute and validate group membership accuracy
   4. Compare results across group members
   ```

### Exercise 3: Result Analysis and Optimization (4 minutes)

1. **Performance Analysis**
   - Execute queries with different complexity levels
   - Monitor execution times and resource usage
   - Identify performance bottlenecks
   - Document optimization opportunities

2. **Result Validation**
   - Cross-reference results with known data sources
   - Identify and investigate anomalies
   - Validate data completeness and accuracy
   - Document findings and recommendations

### Lab Validation

- [ ] Successfully created and executed basic natural language queries
- [ ] Demonstrated multi-sensor query construction
- [ ] Implemented conditional logic and filtering
- [ ] Utilized computer group targeting effectively
- [ ] Analyzed query performance and optimized execution
- [ ] Validated result accuracy and completeness

---

## 📝 Domain 1 Practice Questions

### Question 1: Natural Language Query Syntax

**Scenario**: You need to identify all Windows 10 workstations that have been running for more than 30 days without a reboot to plan maintenance windows.

**Question**: Which natural language query correctly identifies these endpoints?

**A)** `Get Computer Name from all machines where Operating System = "Windows 10" and Uptime > 30`  
**B)** `Get Computer Name from all machines where Operating System contains "Windows 10" and Last Reboot is older than "30 days"`  
**C)** `Get Computer Name and Uptime from Windows 10 machines with Last Reboot > 30 days`  
**D)** `Get Computer Name where OS is "Windows 10" and Days Since Reboot is greater than 30`

**Correct Answer**: B

**Explanation**: Option B uses the correct Tanium natural language syntax with proper sensor names and conditional operators. "Operating System contains" handles version variations, and "Last Reboot is older than" with time specification is the correct syntax for time-based comparisons. The other options use incorrect sensor names or syntax that wouldn't be recognized by the Tanium query parser.

### Question 2: Sensor Parameter Configuration

**Scenario**: A security team needs to identify all processes consuming more than 100MB of memory across the enterprise to investigate potential memory leaks or malicious activity.

**Question**: What is the most effective approach to configure this query for optimal performance and accuracy?

**A)** Query all processes first, then filter results manually in the console  
**B)** Use "Get Running Processes from all machines where Memory Usage is greater than 100"  
**C)** Create separate queries for each operating system due to memory reporting differences  
**D)** Use "Get Running Processes[Memory Usage > 104857600] from all machines"

**Correct Answer**: D

**Explanation**: Option D uses the most precise approach by specifying the memory threshold in bytes (104857600 bytes = 100MB) within the sensor parameter, which filters at the sensor level for optimal performance. This approach minimizes network traffic and provides consistent results across platforms. Option B might work but could be ambiguous about units, while Options A and C are inefficient approaches.

### Question 3: Custom Sensor Implementation

**Scenario**: Your organization needs to track a specific third-party application's configuration file contents that aren't covered by built-in sensors.

**Question**: Which approach represents the best practice for implementing this custom sensor requirement?

**A)** Modify an existing built-in sensor to include the additional functionality  
**B)** Create a custom sensor with proper error handling, multi-platform support, and performance optimization  
**C)** Use multiple existing sensors in combination to approximate the needed data  
**D)** Request the data through manual collection and import into Tanium

**Correct Answer**: B

**Explanation**: Creating a custom sensor with proper engineering practices is the correct approach for requirements not met by built-in sensors. This includes implementing error handling for missing files, supporting different platforms where the application runs, optimizing for performance to minimize endpoint impact, and following Tanium's sensor development guidelines. This provides reliable, scalable, and maintainable functionality.

### Question 4: Question Library Management

**Scenario**: Your team manages over 200 saved questions across multiple departments with different access requirements and update schedules.

**Question**: Which organizational strategy provides the most effective management and governance?

**A)** Group questions by creation date with annual review cycles  
**B)** Implement role-based categories with standardized naming conventions and access controls  
**C)** Organize alphabetically with shared access for all team members  
**D)** Create department-specific folders with no cross-team access

**Correct Answer**: B

**Explanation**: Role-based categorization with standardized naming and access controls provides the most scalable and secure approach to question library management. This strategy ensures appropriate access based on job function, enables efficient discovery through consistent naming, and maintains security through proper access controls. It also supports collaboration while maintaining governance over sensitive queries.

### Question 5: Performance Optimization for Enterprise Scale

**Scenario**: A query targeting 50,000 endpoints is causing network congestion during business hours and affecting other critical operations.

**Question**: Which optimization strategy addresses this issue most effectively while maintaining data collection requirements?

**A)** Reduce the query timeout to force faster completion  
**B)** Implement query scheduling during off-peak hours with result caching  
**C)** Split the query into smaller geographic regions manually  
**D)** Reduce the number of sensors in the query to minimize data transfer

**Correct Answer**: B

**Explanation**: Scheduling queries during off-peak hours with result caching addresses the root cause of network congestion while maintaining data availability. This approach moves resource-intensive operations to times when network capacity is available and provides cached results for immediate access during business hours. The other options either compromise data quality (A, D) or create management overhead without addressing the fundamental timing issue (C).

### Question 6: Troubleshooting Query Results

**Scenario**: A query returns results from only 85% of expected endpoints, with the remaining 15% showing no response.

**Question**: What is the most systematic approach to diagnose and resolve this issue?

**A)** Immediately increase the query timeout and retry  
**B)** Check endpoint connectivity, permissions, and sensor compatibility in that order  
**C)** Exclude non-responsive endpoints from the target group  
**D)** Run a simpler query first to test basic connectivity

**Correct Answer**: B

**Explanation**: Following a systematic diagnostic approach starting with connectivity (network reachability), then permissions (authentication and authorization), and finally sensor compatibility (platform support) provides the most efficient troubleshooting methodology. This sequence addresses the most common causes in order of likelihood and severity, ensuring comprehensive diagnosis while minimizing time spent on less probable causes.

### Question 7: Advanced Query Logic Implementation

**Scenario**: Security requires identification of endpoints with specific vulnerabilities based on multiple criteria: Windows OS, specific patch levels, and certain applications installed.

**Question**: Which query structure most effectively implements this complex logic?

**A)** Use multiple separate queries and correlate results manually  
**B)** Implement nested conditional logic within a single query using AND operators  
**C)** Create a custom sensor that evaluates all criteria programmatically  
**D)** Use computer groups pre-filtered for each criterion, then intersect the groups

**Correct Answer**: B

**Explanation**: Implementing nested conditional logic with AND operators in a single query provides the most efficient and accurate approach. This method ensures all criteria are evaluated simultaneously against each endpoint, reducing network traffic and providing precise results. While option C (custom sensor) could work, it's more complex to maintain, and option D (computer groups) adds unnecessary management overhead for dynamic criteria.

---

## 🎯 Key Takeaways

### Essential Query Construction Skills

- **Natural Language Mastery**: Understand Tanium's query syntax and construction patterns
- **Sensor Selection**: Choose appropriate sensors based on data requirements and platform compatibility
- **Targeting Precision**: Use computer groups and filters effectively to minimize resource impact
- **Performance Optimization**: Design queries that balance data needs with system resources

### Sensor Library Expertise

- **Built-in Sensor Categories**: Master the 500+ available sensors across system, security, and performance domains
- **Custom Sensor Development**: Implement reliable custom sensors when built-in options are insufficient
- **Parameter Configuration**: Utilize sensor parameters effectively for precise data collection
- **Platform Considerations**: Account for operating system differences in sensor behavior

### Question Management Excellence

- **Lifecycle Management**: Implement proper creation, testing, deployment, and maintenance procedures
- **Library Organization**: Use consistent naming, categorization, and access control strategies
- **Sharing and Collaboration**: Balance security with collaboration needs in question sharing
- **Version Control**: Maintain proper versioning and change management for critical questions

### Result Analysis Mastery

- **Data Validation**: Implement systematic approaches to verify result accuracy and completeness
- **Troubleshooting**: Apply structured diagnostic procedures for common query issues
- **Performance Monitoring**: Continuously monitor and optimize query performance at enterprise scale
- **Optimization Strategies**: Apply caching, scheduling, and resource management techniques

---

**Next Steps**: After mastering Domain 1 question construction and sensor management, proceed to Domain 2 (Refining Questions & Targeting) to learn advanced filtering and targeting techniques, or Domain 4 (Navigation & Module Functions) for platform operation skills.

**Exam Weight**: This domain represents 22% of the TCO certification exam - the third-highest weight. These foundational skills in question construction and sensor management are essential for all other Tanium operations and form the basis for advanced techniques covered in other domains.

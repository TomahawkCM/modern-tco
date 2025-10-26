# Domain 2: Refining Questions & Targeting

## 23% of TAN-1000 Exam | HIGHEST PRIORITY DOMAIN

> **🎯 LEARNING OBJECTIVE**: Master advanced targeting techniques, computer group management, and query refinement to efficiently scope Tanium operations in enterprise environments while maintaining security and performance standards.

---

## 📚 DOMAIN OVERVIEW

**Domain Weight**: 23% (Highest on exam)  
**Estimated Study Time**: 15-20 hours  
**Prerequisites**: Domain 1 (Asking Questions) completion  
**Exam Format**: Multiple-choice, practical scenarios, console navigation tasks

### **Why This Domain Matters**

Refining questions and targeting is the **foundation of secure Tanium operations**. Poor targeting can:

- **Impact thousands of endpoints** unintentionally
- **Violate least privilege security** principles
- **Cause performance degradation** across enterprise networks
- **Trigger compliance violations** in regulated environments

Master this domain to ensure **precise, secure, and efficient** Tanium operations.

---

## 🎯 LEARNING MODULES

### **Module 2.1: Computer Groups - Dynamic Management** ⭐ CRITICAL

**Exam Coverage**: ~35% of Domain 2 questions  
**Enterprise Use**: Daily operations, automated targeting

#### **Core Concepts**

**Dynamic Computer Groups** automatically update membership based on live endpoint data and configurable rules. They provide **real-time targeting** that adapts to changing enterprise environments.

#### **Dynamic Group Fundamentals**

**Definition**: Self-updating collections of endpoints based on logical conditions

- **Live Evaluation**: Membership recalculated with each query execution
- **Rule-Based**: Conditions using sensor data, LDAP attributes, custom properties
- **RBAC Integration**: Security controls determine visibility and management access
- **Performance Optimized**: Efficient evaluation to minimize network overhead

#### **Dynamic Group Creation Workflow**

##### Step 1: Access Group Management

```text
Tanium Console → Administration → Computer Groups → New Group
Select: "Dynamic Group" → Configure Properties
```

##### Step 2: Define Base Conditions

- **Primary Criteria**: Operating system, domain membership, organizational unit
- **Secondary Filters**: Last seen status, IP ranges, installed software
- **Custom Properties**: Business-specific attributes (cost center, asset tags, etc.)

##### Step 3: Logical Operators

- **AND**: All conditions must be true (restrictive, precise targeting)
- **OR**: Any condition can be true (inclusive, broader targeting)
- **NOT**: Exclude matching endpoints (exception handling)
- **Parenthetical Grouping**: Complex logic with proper precedence

##### Step 4: Rule Validation

- **Test Evaluation**: Preview membership before saving
- **Performance Check**: Verify execution time within limits
- **Security Review**: Confirm least privilege compliance
- **Documentation**: Add business justification and use case

#### **Enterprise Dynamic Group Patterns**

**Pattern 1: Critical Server Targeting**

```
Condition: (Operating System contains "Windows Server")
AND (Computer Domain equals "PROD.COMPANY.COM")
AND (Asset Tag contains "CRITICAL")
AND (Last Seen within "24 hours")

Use Case: High-priority patch deployment, security updates
Security: Restricted to senior administrators only
```

**Pattern 2: Development Environment Isolation**

```
Condition: (Computer Domain equals "DEV.COMPANY.COM")
OR (IP Address starts with "172.16.100")
OR (Custom Property "Environment" equals "Development")

Use Case: Testing new packages, development-specific queries
Security: Development team access, isolated from production
```

**Pattern 3: Compliance Scope Management**

```
Condition: (Custom Property "Compliance Zone" equals "PCI")
AND (Operating System contains "Windows")
AND NOT (Computer Name contains "TEMPLATE")

Use Case: PCI DSS compliance scanning, audit requirements
Security: Compliance team access, audit trail required
```

#### **RBAC Integration Best Practices**

**Role-Based Access Control** ensures dynamic groups respect enterprise security:

**Security Principles**:

- **Least Privilege**: Users see only groups within their scope
- **Separation of Duties**: Creation vs. execution permissions separated
- **Audit Trail**: All group modifications logged with user attribution
- **Approval Workflows**: High-impact groups require management approval

**RBAC Configuration Steps**:

1. **Define Security Zones**: Production, Development, DMZ, Management
2. **Create Role Templates**: Read-Only, Operator, Administrator levels
3. **Map Group Visibility**: Security zone to role assignments
4. **Configure Approval Chains**: Multi-tier approval for sensitive groups
5. **Test Access Controls**: Verify least privilege enforcement

#### **Performance Optimization Techniques**

**Optimization Strategy 1: Condition Ordering**

- Place **most selective conditions first** (fewer endpoints to evaluate)
- Use **indexed sensors** when possible (Computer Name, IP Address)
- Avoid **expensive operations** early in evaluation chain

**Optimization Strategy 2: Caching Strategy**

- **Static Conditions**: Cache results for stable attributes (OS, Domain)
- **Dynamic Refresh**: Real-time evaluation for critical conditions only
- **Scheduled Updates**: Balance accuracy with performance impact

**Optimization Strategy 3: Network Efficiency**

- **Local Evaluation**: Use endpoint-local data when available
- **Batch Operations**: Combine multiple group evaluations
- **Off-Peak Scheduling**: Resource-intensive groups during maintenance windows

#### **Troubleshooting Dynamic Groups**

**Common Issue 1: Empty Group Results**

- **Diagnosis**: Check condition syntax, verify sensor data availability
- **Resolution**: Test individual conditions, validate RBAC permissions
- **Prevention**: Use group preview, implement staged rollouts

**Common Issue 2: Performance Degradation**

- **Diagnosis**: Monitor evaluation time, check network utilization
- **Resolution**: Optimize condition order, implement caching
- **Prevention**: Regular performance reviews, condition complexity limits

**Common Issue 3: Unexpected Membership**

- **Diagnosis**: Review logical operators, check condition precedence
- **Resolution**: Use parenthetical grouping, test with subset conditions
- **Prevention**: Mandatory peer review, documentation requirements

---

### **Module 2.2: Computer Groups - Static Management** ⭐ CRITICAL

**Exam Coverage**: ~25% of Domain 2 questions  
**Enterprise Use**: Permanent assignments, manual curation

#### **Static Group Fundamentals**

**Static Computer Groups** contain manually assigned endpoints that remain constant until explicitly modified. They provide **predictable targeting** for systems requiring stable group membership.

#### **When to Use Static Groups**

**Scenario 1: Critical Infrastructure**

- Database servers, domain controllers, critical business applications
- **Rationale**: Prevent accidental inclusion/exclusion from dynamic conditions
- **Management**: Senior administrators only, change control required

**Scenario 2: Special Projects**

- Pilot deployments, testing initiatives, temporary exclusions
- **Rationale**: Precise control over project scope and timeline
- **Management**: Project teams with time-limited access

**Scenario 3: Exception Handling**

- Systems with unique configurations, legacy endpoints, compliance exceptions
- **Rationale**: Handle edge cases that don't fit dynamic patterns
- **Management**: Exception approval workflow, regular review cycles

#### **Static Group Creation Process**

**Step 1: Group Planning**

- **Business Justification**: Document purpose and expected lifetime
- **Membership Criteria**: Define inclusion/exclusion requirements
- **Access Controls**: Identify authorized managers and viewers
- **Review Schedule**: Plan regular membership audits

**Step 2: Initial Population**

- **Manual Addition**: Individual endpoint selection via console
- **CSV Import**: Bulk loading from prepared endpoint lists
- **Query-Based**: Populate from saved question results (one-time)
- **Hybrid Approach**: Combine methods for efficient population

**Step 3: Ongoing Management**

- **Add Members**: Manual endpoint additions with approval
- **Remove Members**: Decommissioning, role changes, project completion
- **Membership Audit**: Regular review of current vs. intended membership
- **Documentation Updates**: Maintain current purpose and scope

#### **Static Group Management Workflow**

**Monthly Review Process**:

1. **Membership Audit**: Compare current vs. intended endpoints
2. **Access Review**: Verify authorized users still require access
3. **Purpose Validation**: Confirm group still serves business need
4. **Performance Check**: Ensure group size remains manageable
5. **Documentation Update**: Maintain current metadata and justification

**Change Management Process**:

1. **Change Request**: Formal submission with business justification
2. **Impact Analysis**: Review security, performance, compliance implications
3. **Approval Workflow**: Multi-tier approval based on group sensitivity
4. **Implementation**: Controlled deployment with rollback planning
5. **Validation**: Confirm changes achieved intended outcomes

#### **Enterprise Static Group Patterns**

**Pattern 1: Critical Database Servers**

```
Group: CRITICAL_DB_SERVERS
Members: 12 endpoints (Oracle, SQL Server, MongoDB clusters)
Access: DBA team + Senior Operations (Read/Write)
Review: Weekly membership validation
Purpose: Database maintenance, security patching, performance monitoring
```

**Pattern 2: Executive Endpoints**

```
Group: EXECUTIVE_WORKSTATIONS
Members: 25 endpoints (C-suite, VP-level executives)
Access: IT Security team only (Read/Write)
Review: Monthly access review, quarterly membership audit
Purpose: Enhanced security monitoring, priority support, compliance reporting
```

**Pattern 3: Pilot Test Environment**

```
Group: Q4_PILOT_WINDOWS11
Members: 50 endpoints (selected volunteers from each department)
Access: Desktop Engineering team (Read/Write), Help Desk (Read)
Review: Weekly during pilot, dissolved after completion
Purpose: Windows 11 upgrade testing, user feedback collection
```

---

### **Module 2.3: Advanced Filtering Techniques** ⭐ CRITICAL

**Exam Coverage**: ~25% of Domain 2 questions  
**Enterprise Use**: Complex targeting, performance optimization

#### **Filtering Fundamentals**

**Advanced filtering** transforms basic queries into precise, efficient operations that target exactly the intended endpoints while minimizing network overhead and security exposure.

#### **Logical Operators Mastery**

**AND Operator - Restrictive Filtering**

- **Purpose**: All conditions must be satisfied
- **Use Case**: Precise targeting, security-sensitive operations
- **Performance**: Most restrictive condition first for efficiency

**Example: Critical Security Patch**

```
Filter: (Operating System contains "Windows")
AND (Computer Domain equals "PROD.COMPANY.COM")
AND (Last Seen within "2 hours")
AND (Installed Application contains "Adobe Reader")

Result: Only production Windows systems with Adobe Reader, recently online
Business Impact: Precise targeting reduces deployment risk
```

**OR Operator - Inclusive Filtering**

- **Purpose**: Any condition can trigger inclusion
- **Use Case**: Broad scoping, multiple environment targeting
- **Performance**: Least expensive conditions first

**Example: Multi-Environment Deployment**

```
Filter: (Computer Domain equals "PROD.COMPANY.COM")
OR (Computer Domain equals "STAGE.COMPANY.COM")
OR (IP Address starts with "10.1.100")

Result: Endpoints from production, staging, or specific network range
Business Impact: Coordinated deployment across environments
```

**NOT Operator - Exclusion Filtering**

- **Purpose**: Exclude matching endpoints from results
- **Use Case**: Exception handling, risk mitigation
- **Performance**: Apply exclusions after positive conditions

**Example: Exclude Critical Systems**

```
Base Query: Operating System contains "Windows Server"
Filter: NOT (Computer Name contains "DC")
AND NOT (Custom Property "Environment" equals "CRITICAL")

Result: Windows servers excluding domain controllers and critical systems
Business Impact: Safe testing scope, production protection
```

#### **Regular Expressions (Regex) in Filtering**

**Regex Fundamentals for Tanium**
Regular expressions provide **powerful pattern matching** for complex filtering scenarios.

**Basic Regex Patterns**:

- **`.`** - Any single character
- **`*`** - Zero or more of preceding character
- **`+`** - One or more of preceding character
- **`^`** - Start of string
- **`$`** - End of string
- **`[]`** - Character class
- **`|`** - OR operator within regex

**Tanium Regex Examples**:

**Pattern 1: Computer Name Conventions**

```
Regex: ^(WS|LT|SV)-[A-Z]{2}-[0-9]{4}$

Matches: WS-NY-1234, LT-CA-5678, SV-TX-9012
Purpose: Enforce naming conventions, validate compliance
Use Case: Asset management, location tracking
```

**Pattern 2: IP Address Ranges**

```
Regex: ^10\.(1[0-5]|[1-9])\.[0-9]{1,3}\.[0-9]{1,3}$

Matches: 10.1.x.x through 10.15.x.x ranges
Purpose: Network segment targeting
Use Case: Security zone operations, bandwidth management
```

**Pattern 3: Software Version Filtering**

```
Regex: Adobe.*Reader.*(11\.|DC )

Matches: Adobe Reader 11.x, Adobe Acrobat Reader DC
Purpose: Version-specific targeting for patches
Use Case: Vulnerability remediation, software lifecycle
```

#### **Boolean Logic Complexity**

**Parenthetical Grouping**
Use parentheses to control **operator precedence** and create **complex logical conditions**.

**Complex Example: Multi-Tier Application Targeting**

```
Filter: ((Computer Name starts with "APP") AND (IP Address starts with "10.1."))
OR ((Computer Name starts with "DB") AND (IP Address starts with "10.2."))
OR ((Computer Name starts with "WEB") AND (IP Address starts with "10.3."))

Logic: Target application servers in 10.1.x network,
       OR database servers in 10.2.x network,
       OR web servers in 10.3.x network

Business Case: Three-tier application maintenance window
```

**Performance Optimization with Boolean Logic**:

1. **Most Selective First**: Place conditions that eliminate most endpoints early
2. **Expensive Operations Last**: Complex regex or custom sensors at end
3. **Short-Circuit Evaluation**: Use OR when first condition likely to match
4. **Condition Caching**: Reuse common filter components across queries

---

### **Module 2.4: Query Optimization & Performance** ⭐ CRITICAL

**Exam Coverage**: ~15% of Domain 2 questions  
**Enterprise Use**: Scalability, network efficiency

#### **Performance Fundamentals**

**Query optimization** ensures Tanium operations scale efficiently across enterprise environments without impacting network performance or endpoint resources.

#### **Performance Metrics Understanding**

**Key Performance Indicators**:

- **Query Execution Time**: Target <30 seconds for standard queries
- **Network Bandwidth**: Monitor utilization spikes during execution
- **Endpoint CPU Impact**: Limit sensor processing overhead
- **Result Set Size**: Balance completeness with transmission efficiency
- **Concurrent Query Limit**: Manage simultaneous operations

#### **Optimization Strategies**

**Strategy 1: Sensor Selection Optimization**

- **Built-in Sensors**: Prefer optimized, indexed sensors when available
- **Custom Sensors**: Cache results, minimize execution frequency
- **Sensor Chaining**: Combine related sensors efficiently
- **Parameter Optimization**: Use most efficient parameter combinations

**Strategy 2: Targeting Optimization**

- **Scope Minimization**: Target smallest necessary endpoint set
- **Time-Based Filtering**: Use "Last Seen" to avoid offline systems
- **Geographic Filtering**: Leverage location-based targeting
- **Load Distribution**: Spread resource-intensive queries across time

**Strategy 3: Result Processing Optimization**

- **Column Selection**: Request only necessary data columns
- **Result Limits**: Use appropriate row limits for use case
- **Aggregation**: Perform data summarization when possible
- **Caching Strategy**: Cache frequently-used results

#### **Enterprise Optimization Patterns**

**Pattern 1: Large-Scale Inventory Query**

```
Original Query: Get Computer Name and IP Address and Operating System from all machines

Optimized Approach:
- Target: Last Seen within "4 hours" (exclude offline systems)
- Scope: Use geographic computer groups (reduce network traversal)
- Timing: Execute during off-peak hours (reduce contention)
- Caching: Cache OS data (changes infrequently)

Performance Improvement: 60% reduction in execution time
```

**Pattern 2: Security Compliance Scanning**

```
Challenge: Scan 10,000+ endpoints for security configuration

Optimization Strategy:
- Staged Execution: Process in batches of 1,000 endpoints
- Parallel Processing: Run multiple geographic scopes simultaneously
- Result Filtering: Apply security filters at endpoint (reduce data transfer)
- Progress Monitoring: Track completion percentage, estimate remaining time

Business Impact: Complete compliance scan in 2 hours vs. 8 hours
```

---

## 🧪 HANDS-ON LAB: LAB-RQ-001

## Advanced Targeting and Refinement (15 minutes)

### **Lab Objective**

Master dynamic computer group creation, complex filter logic, and query optimization in realistic enterprise scenarios.

### **Lab Environment Setup**

- **Simulated Environment**: 500+ endpoints across multiple domains
- **Required Permissions**: Computer Group management, query execution
- **Time Limit**: 15 minutes for completion
- **Success Criteria**: All tasks completed with >95% targeting accuracy

### **Task 1: Dynamic Computer Group Creation (5 minutes)**

**Scenario**: Create a dynamic group for Windows 10 workstations in the marketing department that have been seen within the last 24 hours.

**Instructions**:

1. Navigate to **Administration → Computer Groups → New Group**
2. Select **"Dynamic Group"** and name it `MARKETING_WIN10_ACTIVE`
3. Configure conditions:

   ```
   Condition 1: Operating System contains "Windows 10"
   AND
   Condition 2: Computer Domain equals "MARKETING.COMPANY.COM"
   AND
   Condition 3: Last Seen within "24 hours"
   ```

4. **Test the group** using the preview functionality
5. **Save the group** with appropriate documentation

**Expected Results**: 45-55 endpoints in group membership
**Validation**: Group updates automatically as endpoints come online/offline

### **Task 2: Complex Filter Logic (5 minutes)**

**Scenario**: Target all Windows servers EXCEPT domain controllers and critical database servers for a routine maintenance query.

**Instructions**:

1. Open **Interact → Ask a Question**
2. Create base query: `Get Computer Name from all machines`
3. Add complex filter:

   ```
   Filter: (Operating System contains "Windows Server")
   AND NOT (Computer Name contains "DC")
   AND NOT (Computer Name contains "DB")
   AND NOT (Custom Property "Environment" equals "CRITICAL")
   ```

4. **Validate targeting** using question preview
5. **Execute query** and verify results exclude protected systems

**Expected Results**: 80-120 endpoints, no DCs or critical DBs
**Validation**: Manual verification of exclusion effectiveness

### **Task 3: Performance Optimization (5 minutes)**

**Scenario**: Optimize a slow-running query that checks software installation across all endpoints.

**Original Query** (slow):

```
Get Computer Name and IP Address and Installed Applications from all machines
```

**Instructions**:

1. **Analyze the problem**: Identify performance bottlenecks
2. **Apply optimizations**:
   - Add time filter: `Last Seen within "4 hours"`
   - Scope to active network: `IP Address starts with "10.1"`
   - Limit results: `Maximum 500 results`
3. **Compare performance**: Execute both versions, measure execution time
4. **Document improvements**: Calculate performance gain percentage

**Expected Results**: >50% improvement in execution time
**Validation**: Side-by-side timing comparison

### **Lab Validation Checkpoints**

**Checkpoint 1**: Dynamic group shows correct membership count ✓  
**Checkpoint 2**: Complex filter excludes all protected systems ✓  
**Checkpoint 3**: Optimized query executes in <30 seconds ✓  
**Checkpoint 4**: All targeting logic documented and explained ✓

---

## 🎯 PRACTICE QUESTIONS

### **Question 1: Dynamic Group Logic (Difficulty: Medium)**

You need to create a dynamic computer group that includes all Windows 10 workstations in the Sales department, but excludes any machine that hasn't been seen in over 48 hours.

Which condition configuration is correct?

**A)**

```
(Operating System = "Windows 10")
AND (Department = "Sales")
AND (Last Seen > "48 hours")
```

**B)**

```
(Operating System contains "Windows 10")
AND (Computer Domain = "SALES.COMPANY.COM")
AND (Last Seen within "48 hours")
```

**C)**

```
(Operating System = "Windows 10")
OR (Department = "Sales")
AND NOT (Last Seen > "48 hours")
```

**D)**

```
(Operating System contains "Windows 10")
AND (Computer Domain contains "SALES")
AND NOT (Last Seen within "48 hours")
```

**Correct Answer**: B

**Explanation**: Option B correctly uses "contains" for flexible OS matching, properly identifies the domain, and uses "within" to include machines seen within (not over) 48 hours. Option A uses incorrect ">" logic for time. Option C uses OR instead of AND, creating overly broad targeting. Option D uses NOT incorrectly, excluding recently seen machines instead of including them.

### **Question 2: Boolean Logic Complexity (Difficulty: Hard)**

Your organization has three environments: Production (PROD), Staging (STAGE), and Development (DEV). You need to target Windows servers in Production and Staging, but exclude any server with "CRITICAL" in its computer name from any environment.

What is the most efficient filter structure?

**A)**

```
((Domain = "PROD") AND (OS contains "Windows Server"))
OR ((Domain = "STAGE") AND (OS contains "Windows Server"))
AND NOT (Computer Name contains "CRITICAL")
```

**B)**

```
(OS contains "Windows Server")
AND ((Domain = "PROD") OR (Domain = "STAGE"))
AND NOT (Computer Name contains "CRITICAL")
```

**C)**

```
(Domain = "PROD" OR Domain = "STAGE")
AND (OS contains "Windows Server")
AND NOT (Computer Name contains "CRITICAL")
```

**D)**

```
NOT (Computer Name contains "CRITICAL")
AND (OS contains "Windows Server")
AND (Domain = "PROD" OR Domain = "STAGE")
```

**Correct Answer**: B

**Explanation**: Option B is most efficient because it evaluates the OS condition first (most selective), then applies domain filtering with proper parenthetical grouping, and finally applies the exclusion. This order minimizes the number of endpoints that need to be evaluated for subsequent conditions. Option A has incorrect operator precedence without parentheses. Options C and D would work but are less efficient in execution order.

### **Question 3: Performance Optimization (Difficulty: Medium)**

A query targeting all endpoints for software inventory is running slowly (>5 minutes execution time). The current query is:

```
Get Computer Name and IP Address and Installed Applications from all machines
```

Which optimization would provide the MOST performance improvement?

**A)** Add filter: `Last Seen within "24 hours"`
**B)** Change to: `Get Computer Name from all machines where Installed Applications contains "Office"`  
**C)** Add filter: `Operating System contains "Windows"`
**D)** Change to: `Get Computer Name and Installed Applications from all machines`

**Correct Answer**: A

**Explanation**: Adding "Last Seen within 24 hours" provides the most performance improvement because it eliminates offline machines from the query scope, often reducing the target set by 20-30%. This significantly reduces network overhead and processing time. Option B changes the query purpose entirely. Option C provides minimal improvement since most environments are predominantly Windows. Option D removes IP Address but doesn't address the core performance issue of querying offline machines.

### **Question 4: RBAC Integration (Difficulty: Medium)**

You're configuring RBAC for computer groups in a multi-tenant environment. The Sales team should only see their own computer groups, while IT Security should see all groups but only modify security-related groups.

What is the correct RBAC configuration approach?

**A)** Create separate Tanium instances for each team
**B)** Use content sets to restrict group visibility by department, with modify permissions based on group naming conventions
**C)** Grant all users view access to all groups, restrict modify access through approval workflows
**D)** Create role-based content sets with department-specific group access and function-based modify permissions

**Correct Answer**: D

**Explanation**: Option D correctly implements comprehensive RBAC using content sets to control both visibility (department-specific) and modification rights (function-based). This follows enterprise security principles of least privilege and separation of duties. Option A is inefficient and expensive. Option B relies on naming conventions which can be circumvented. Option C violates least privilege by giving everyone view access to all groups.

### **Question 5: Regex Filtering (Difficulty: Hard)**

Your organization uses a computer naming convention where workstations are named `WS-[LOCATION]-[NUMBER]` (e.g., WS-NYC-001, WS-LAX-542). You need to target only workstations in New York (NYC) locations with numbers between 100-199.

Which regex pattern correctly identifies these systems?

**A)** `^WS-NYC-1[0-9]{2}$`
**B)** `WS-NYC-1[0-9][0-9]`  
**C)** `^WS-NYC-[1][0-9]{2}$`
**D)** `WS-NYC-1*`

**Correct Answer**: A

**Explanation**: Option A correctly uses `^` and `$` anchors to match the complete string, "NYC" for the specific location, and `1[0-9]{2}` to match exactly 100-199 (1 followed by exactly two digits). Option B lacks anchors and would match partial strings. Option C uses `[1]` unnecessarily (just `1` is sufficient). Option D uses `*` which means zero or more, not the intended range.

---

## 📖 DOMAIN 2 SUMMARY

### **Key Learning Outcomes**

Upon completing Domain 2, students will be able to:

✅ **Create and manage dynamic computer groups** with complex conditions and RBAC integration  
✅ **Implement static computer groups** for critical infrastructure and special projects  
✅ **Apply advanced filtering techniques** using logical operators, regex, and boolean logic  
✅ **Optimize query performance** through strategic targeting and resource management  
✅ **Integrate RBAC controls** to maintain enterprise security and compliance  
✅ **Troubleshoot targeting issues** using systematic diagnostic approaches

### **Exam Readiness Checklist**

- [ ] **Dynamic Groups**: Can create complex multi-condition groups with >95% accuracy
- [ ] **Static Groups**: Understand management lifecycle and business use cases
- [ ] **Boolean Logic**: Master AND/OR/NOT operators with proper precedence
- [ ] **Regex Patterns**: Apply regular expressions for complex pattern matching
- [ ] **Performance**: Optimize queries for enterprise-scale deployments
- [ ] **RBAC**: Configure role-based access controls following security principles
- [ ] **Lab Exercise**: Complete LAB-RQ-001 within time limit with all validations

### **Real-World Application**

Domain 2 skills are essential for:

- **Production Operations**: Safe, targeted deployments across enterprise infrastructure
- **Security Operations**: Precise threat response and compliance enforcement
- **Change Management**: Controlled rollouts with appropriate risk mitigation
- **Performance Management**: Scalable operations that don't impact business systems

---

**Next**: [Domain 4: Navigation & Module Functions →](domain4-navigation-modules.md)  
**Previous**: [← Domain 1: Asking Questions](domain1-asking-questions.md)  
**Lab Exercise**: [LAB-RQ-001: Advanced Targeting and Refinement →](../labs/lab-rq-001.md)

# Domain 3: Taking Action (15% Exam Weight)

## Learning Objectives

By completing this domain, TCO candidates will master:

- **Package Deployment**: Selection, validation, step-by-step deployment procedures, safety protocols
- **Action Execution**: Real-time status tracking, validation methods, rollback procedures
- **Approval Workflows**: Multi-tier navigation, escalation procedures, workflow management
- **Troubleshooting**: Failed action analysis, common scenarios, root cause resolution techniques

## Module 3.1: Package Deployment Mastery

### Package Selection & Validation

**Tanium Package Library Navigation:**

- **Built-in Packages**: Microsoft patches, software installations, configuration updates
- **Custom Packages**: Organization-specific deployments, proprietary software
- **Community Packages**: Third-party validated solutions, open-source tools
- **Package Categories**: Security updates, software deployment, configuration management, compliance

**Package Validation Process:**

1. **Compatibility Check**: Target OS versions, architecture requirements (x86/x64)
2. **Dependency Analysis**: Prerequisites, required services, conflicting software
3. **Impact Assessment**: System resources, reboot requirements, service disruptions
4. **Testing Protocol**: Pilot deployment, validation criteria, rollback planning
5. **Security Review**: Digital signatures, source validation, malware scanning

### Step-by-Step Deployment Procedures

**Pre-Deployment Preparation:**

1. **Target Selection**: Computer groups, individual endpoints, exclusion criteria
2. **Scheduling Configuration**: Maintenance windows, business hours, timezone considerations
3. **Resource Planning**: Bandwidth allocation, server capacity, concurrent deployment limits
4. **Backup Procedures**: System state backup, configuration snapshots, recovery points
5. **Communication Plan**: Stakeholder notification, user impact messaging, support preparation

**Deployment Execution Workflow:**

```
1. Navigate to Deploy → Packages
2. Select target package from library
3. Configure deployment parameters:
   - Target computer groups
   - Execution schedule
   - Retry logic and timeout settings
   - Success/failure criteria
4. Review deployment summary
5. Submit for approval (if required)
6. Monitor deployment progress
7. Validate successful completion
8. Handle exceptions and failures
```

### Safety Protocols & Risk Mitigation

**Critical System Protection:**

- **Staging Environment**: Test deployments before production
- **Phased Rollout**: Gradual deployment across user segments
- **Circuit Breakers**: Automatic halt on failure threshold breach
- **Emergency Stop**: Immediate deployment termination capability

**Validation Checkpoints:**

1. **Pre-deployment**: Target validation, resource availability, conflict detection
2. **Mid-deployment**: Progress monitoring, error rate tracking, performance impact
3. **Post-deployment**: Success verification, system stability, functionality testing
4. **Final Validation**: Comprehensive testing, user acceptance, documentation update

## Module 3.2: Action Execution Excellence

### Real-Time Status Tracking

**Deployment Dashboard Components:**

- **Progress Indicators**: Completion percentage, remaining time estimates, throughput metrics
- **Status Categories**: Pending, Running, Completed, Failed, Queued, Cancelled
- **Resource Monitoring**: CPU utilization, network bandwidth, disk I/O, memory usage
- **Error Tracking**: Failure reasons, error codes, affected endpoints, remediation suggestions

**Advanced Monitoring Features:**

1. **Live Updates**: Real-time refresh, automatic status polling, push notifications
2. **Filtering & Search**: Status filters, endpoint search, time range selection
3. **Drill-Down Analysis**: Individual endpoint status, detailed error messages, log access
4. **Performance Metrics**: Deployment speed, success rates, resource efficiency
5. **Historical Comparison**: Baseline performance, trend analysis, improvement tracking

### Validation Methods & Success Criteria

**Automated Validation Techniques:**

- **Registry Verification**: Configuration changes, software installation confirmation
- **File System Checks**: File presence, version validation, permission verification
- **Service Status**: Service state, startup configuration, dependency verification
- **Process Monitoring**: Application startup, resource consumption, stability checks

**Manual Validation Procedures:**

1. **Functional Testing**: Application launch, feature verification, user workflow testing
2. **Integration Testing**: System interactions, data flow validation, API connectivity
3. **Performance Assessment**: Response times, resource usage, stability metrics
4. **User Acceptance**: End-user testing, feedback collection, issue resolution

### Rollback Procedures & Emergency Response

**Rollback Triggers:**

- **Failure Threshold**: >20% deployment failures across target endpoints
- **Critical System Impact**: Essential service disruption, security vulnerabilities
- **Performance Degradation**: System slowdown, resource exhaustion, instability
- **Business Impact**: Operational disruption, revenue loss, compliance violations

**Emergency Rollback Process:**

1. **Immediate Assessment**: Failure scope, impact analysis, root cause identification
2. **Stop Deployment**: Cancel pending actions, prevent further installations
3. **Rollback Execution**: Restore previous state, remove failed installations
4. **System Validation**: Verify rollback success, system stability, service restoration
5. **Incident Documentation**: Failure analysis, lessons learned, preventive measures

## Module 3.3: Approval Workflows & Governance

### Multi-Tier Approval Navigation

**Approval Hierarchy Levels:**

- **Level 1 - Technical Review**: Technical validation, compatibility verification, resource assessment
- **Level 2 - Security Approval**: Security impact analysis, vulnerability assessment, compliance check
- **Level 3 - Management Authorization**: Business impact review, resource allocation, schedule approval
- **Level 4 - Executive Sign-off**: High-risk deployments, major system changes, compliance requirements

**Workflow Configuration:**

1. **Approval Chain Definition**: Role assignments, authority levels, delegation rules
2. **Escalation Procedures**: Timeout handling, automatic escalation, emergency overrides
3. **Notification System**: Email alerts, dashboard notifications, mobile push messages
4. **Documentation Requirements**: Justification, impact assessment, risk mitigation plans
5. **Audit Trail**: Decision history, approval timestamps, reviewer comments

### Escalation Procedures & Emergency Overrides

**Standard Escalation Path:**

```
Requester → Technical Reviewer → Security Approver → Manager → Executive
         ↓ (if timeout)     ↓ (if timeout)      ↓ (if timeout)
    Auto-escalate    Auto-escalate    Executive Alert
```

**Emergency Override Protocols:**

- **Security Incidents**: Critical vulnerability patches, malware response, breach containment
- **System Outages**: Service restoration, infrastructure repair, business continuity
- **Compliance Deadlines**: Regulatory requirements, audit findings, legal obligations
- **Executive Authorization**: C-level approval, board mandates, strategic initiatives

### Workflow Management & Optimization

**Process Efficiency Measures:**

1. **Parallel Approvals**: Simultaneous review by multiple stakeholders
2. **Pre-approved Categories**: Standard deployments, routine maintenance, known-good packages
3. **Automated Routing**: Rule-based assignment, load balancing, skill matching
4. **SLA Management**: Time limits, escalation triggers, performance metrics
5. **Template Workflows**: Standardized processes, reduced manual configuration

**Performance Metrics & KPIs:**

- **Approval Time**: Average time from request to final approval
- **Escalation Rate**: Percentage of requests requiring escalation
- **Override Frequency**: Emergency override usage and justification
- **Success Rate**: Deployment success after approval completion
- **User Satisfaction**: Stakeholder feedback, process improvement suggestions

## Module 3.4: Troubleshooting & Root Cause Analysis

### Failed Action Analysis Framework

**Common Failure Categories:**

1. **Permission Issues**: Insufficient privileges, UAC restrictions, service account problems
2. **Resource Constraints**: Insufficient disk space, memory limitations, CPU overload
3. **Network Problems**: Connectivity issues, bandwidth limitations, proxy restrictions
4. **Dependency Failures**: Missing prerequisites, service unavailability, version conflicts
5. **Configuration Errors**: Parameter mistakes, path problems, registry issues

**Systematic Diagnosis Process:**

```
1. Error Collection → Gather all error messages and codes
2. Timeline Analysis → Establish sequence of events
3. Environment Review → Check system state and conditions
4. Dependency Mapping → Identify all required components
5. Resource Verification → Confirm availability and access
6. Root Cause Identification → Determine underlying issue
7. Solution Development → Create remediation plan
8. Implementation → Execute fix and validate
```

### Common Scenarios & Resolution Techniques

**Scenario 1: Package Installation Failure**

- **Symptoms**: Installation aborts, error code 1603, rollback initiated
- **Investigation**: Check installer logs, verify dependencies, confirm disk space
- **Resolution**: Install prerequisites, free disk space, run as administrator
- **Prevention**: Enhanced pre-deployment validation, dependency checking

**Scenario 2: Network Connectivity Issues**

- **Symptoms**: Download failures, timeout errors, partial completion
- **Investigation**: Network path analysis, bandwidth utilization, proxy configuration
- **Resolution**: Retry logic, alternative download sources, bandwidth optimization
- **Prevention**: Network health monitoring, redundant delivery paths

**Scenario 3: Permission Denied Errors**

- **Symptoms**: Access denied, privilege escalation failures, service start errors
- **Investigation**: User context analysis, UAC settings, service account validation
- **Resolution**: Credential adjustment, privilege elevation, service configuration
- **Prevention**: Proper service account setup, permission validation

**Scenario 4: Resource Exhaustion**

- **Symptoms**: Out of memory errors, disk full messages, CPU timeout
- **Investigation**: Resource monitoring, utilization trends, concurrent process analysis
- **Resolution**: Resource allocation, process optimization, scheduling adjustment
- **Prevention**: Capacity planning, resource monitoring, load management

### Root Cause Resolution Techniques

**Advanced Diagnostic Tools:**

1. **Log Analysis**: Centralized logging, pattern recognition, correlation analysis
2. **Performance Monitoring**: Real-time metrics, historical trends, anomaly detection
3. **Network Analysis**: Packet capture, latency measurement, path optimization
4. **System Profiling**: Resource usage, process behavior, dependency mapping
5. **User Experience Monitoring**: End-user impact, workflow disruption, satisfaction metrics

**Solution Implementation Best Practices:**

- **Test in Isolation**: Reproduce issues in controlled environment
- **Incremental Changes**: Small, measurable modifications with validation
- **Documentation**: Detailed solution records, decision rationale, success metrics
- **Knowledge Sharing**: Team communication, solution repository, training updates
- **Continuous Improvement**: Process refinement, tool enhancement, skill development

## Module 3.5: Scheduling & Dependencies Management

### Advanced Scheduling Strategies

**Time-Based Scheduling:**

- **Maintenance Windows**: Pre-defined periods, business hour avoidance, timezone coordination
- **Staggered Deployment**: Phased rollout, load distribution, risk mitigation
- **Conditional Timing**: Event triggers, dependency completion, system readiness
- **Recurring Schedules**: Regular maintenance, patch cycles, compliance updates

**Dependency Management:**

1. **Sequential Dependencies**: Install A before B, configuration ordering, service startup
2. **Parallel Execution**: Independent packages, resource optimization, time efficiency
3. **Conditional Logic**: If-then scenarios, environment-specific actions, failure handling
4. **Resource Dependencies**: Shared resources, capacity constraints, conflict resolution
5. **External Dependencies**: Third-party services, network resources, approval gates

### Batch Deployment Optimization

**Batch Configuration Parameters:**

- **Batch Size**: Concurrent endpoint limits, resource capacity, risk tolerance
- **Timing Intervals**: Stagger timing, recovery periods, monitoring windows
- **Success Thresholds**: Minimum success rate, failure tolerance, proceed conditions
- **Resource Allocation**: Bandwidth limits, server capacity, network optimization

**Performance Optimization Techniques:**

1. **Load Balancing**: Server distribution, geographic optimization, capacity management
2. **Bandwidth Management**: Traffic shaping, priority queues, compression utilization
3. **Retry Logic**: Intelligent retry, exponential backoff, circuit breakers
4. **Monitoring Integration**: Real-time feedback, performance adjustment, predictive scaling
5. **Adaptive Scheduling**: Dynamic adjustment, learning algorithms, optimization feedback

## Hands-On Lab Exercise: LAB-TA-001

### Lab Objective: Safe Action Deployment (18 minutes)

**Scenario:** Deploy a critical security patch to 500 Windows endpoints using proper safety protocols, approval workflows, and monitoring procedures.

### Lab Steps

**Step 1: Package Selection & Validation (4 minutes)**

1. Navigate to **Deploy** → **Packages** → **Microsoft Updates**
2. Select security patch KB5012345 (simulated critical vulnerability fix)
3. Review package details:
   - Target OS compatibility: Windows 10/11, Windows Server 2016-2022
   - Prerequisites: .NET Framework 4.8, specific service packs
   - System impact: Requires reboot, 15-minute installation time
   - File size: 245 MB download per endpoint
4. Validate package integrity:
   - Check digital signature verification
   - Review security scan results
   - Confirm hash validation

**Step 2: Target Configuration & Risk Assessment (5 minutes)**

1. Create deployment target groups:
   - **Pilot Group**: 25 test endpoints (5% of total)
   - **Production Phase 1**: 125 business-critical endpoints (25%)
   - **Production Phase 2**: 350 remaining endpoints (70%)
2. Configure deployment parameters:
   - Execution window: Tuesday-Thursday, 10 PM - 6 AM local time
   - Maximum concurrent installations: 50 endpoints
   - Failure threshold: Stop if >10% pilot group fails
   - Retry logic: 3 attempts with 30-minute intervals
3. Risk assessment checklist:
   - Verify maintenance window alignment
   - Confirm backup procedures in place
   - Identify critical system exclusions
   - Review rollback procedures

**Step 3: Approval Workflow Implementation (4 minutes)**

1. Submit deployment request with required documentation:
   - Business justification: Critical security vulnerability CVE-2024-12345
   - Impact assessment: Minimal disruption during maintenance window
   - Risk mitigation: Phased deployment with pilot group validation
   - Rollback plan: Automated uninstall available within 24 hours
2. Navigate approval workflow:
   - Technical Review: Verify compatibility and scheduling
   - Security Approval: Confirm vulnerability severity and patch validation
   - Management Authorization: Approve resource allocation and timing
3. Monitor approval status:
   - Track progress through approval chain
   - Respond to approver questions/requests
   - Adjust timeline if required by approvers

**Step 4: Deployment Execution & Monitoring (5 minutes)**

1. Initiate pilot deployment:
   - Start with 25-endpoint pilot group
   - Monitor real-time progress in deployment dashboard
   - Track success/failure rates and performance metrics
2. Validate pilot success:
   - Verify 95%+ success rate (acceptable: 23+ of 25 endpoints)
   - Confirm system stability post-deployment
   - Test critical application functionality
3. Production deployment execution:
   - Launch Phase 1 after pilot validation
   - Monitor concurrent installation limits
   - Track resource utilization and network impact
   - Respond to any failures with immediate investigation
4. Final validation and documentation:
   - Confirm 98%+ overall success rate
   - Document any exceptions and resolutions
   - Update compliance tracking systems

### Lab Validation Criteria

- ✅ Package properly validated with security verification
- ✅ Target groups configured with appropriate phasing strategy
- ✅ Approval workflow completed with all required documentation
- ✅ Pilot deployment executed successfully with >95% success rate
- ✅ Production deployment completed with >98% overall success rate
- ✅ Real-time monitoring maintained throughout deployment
- ✅ All failures properly investigated and resolved

## Practice Questions

### Question 1: Package Deployment Safety Protocols

**Scenario:** You're deploying a major software update to 1,000 endpoints across multiple geographic locations. During the pilot phase (100 endpoints), 15 installations fail with various error codes.

**Question:** What is the most appropriate next action according to TCO best practices?

A) Continue with the full deployment since 85% success rate is acceptable for major updates
B) Halt the deployment, investigate the 15 failures, and resolve issues before proceeding
C) Reduce the deployment scope to exclude the problematic endpoint types and continue
D) Increase the retry attempts to 5 and continue with the full deployment

**Answer:** B) Halt the deployment, investigate the 15 failures, and resolve issues before proceeding

**Explanation:** A 15% failure rate in the pilot phase indicates systemic issues that will likely affect the full deployment. TCO best practices require investigating and resolving failures during pilot phases to prevent large-scale problems. The standard threshold for proceeding is typically 95%+ success rate in pilot deployments.

### Question 2: Approval Workflow Escalation

**Scenario:** A critical security patch needs deployment within 24 hours due to an active exploit, but your normal approval workflow takes 48-72 hours. The security team has confirmed this is a legitimate emergency.

**Question:** Which approach best follows Tanium approval workflow best practices?

A) Deploy immediately without approvals since security emergencies bypass all workflows
B) Use the emergency override process with executive authorization and post-deployment documentation
C) Request expedited review from all normal approvers within the 24-hour timeframe
D) Deploy to a limited subset and wait for full approvals before broader deployment

**Answer:** B) Use the emergency override process with executive authorization and post-deployment documentation

**Explanation:** Emergency override processes exist specifically for critical security situations. This approach maintains governance while enabling rapid response. Executive authorization ensures accountability, and post-deployment documentation maintains audit trails and enables process improvement.

### Question 3: Failed Action Root Cause Analysis

**Scenario:** A software installation is failing on approximately 30% of target endpoints with error code 1603 (generic installation failure). The failures are distributed across different operating systems and geographic locations.

**Question:** What is the most systematic approach to identify the root cause?

A) Immediately retry the failed installations with elevated privileges
B) Analyze installer logs, check dependencies, and compare successful vs. failed endpoint configurations
C) Exclude the failing endpoints and complete the deployment on successful systems only  
D) Restart all failed endpoints and retry the installation process

**Answer:** B) Analyze installer logs, check dependencies, and compare successful vs. failed endpoint configurations

**Explanation:** Systematic troubleshooting requires data collection and analysis before attempting solutions. Comparing successful versus failed configurations helps identify common factors. Error code 1603 can have multiple causes (permissions, dependencies, disk space, etc.), so proper diagnosis is essential.

### Question 4: Resource Management During Large Deployments

**Scenario:** You're deploying a 2GB software package to 2,000 endpoints. Network monitoring shows bandwidth utilization approaching limits, and some endpoints are experiencing slow download speeds.

**Question:** Which optimization strategy provides the best balance of speed and resource management?

A) Increase the concurrent deployment limit to push through the bottleneck faster
B) Implement bandwidth throttling, staggered scheduling, and peer-to-peer distribution where possible
C) Pause the deployment during business hours and resume only during off-peak times
D) Split the package into smaller components and deploy them separately

**Answer:** B) Implement bandwidth throttling, staggered scheduling, and peer-to-peer distribution where possible

**Explanation:** This comprehensive approach addresses network constraints while maintaining deployment progress. Bandwidth throttling prevents network saturation, staggered scheduling distributes load over time, and peer-to-peer distribution reduces server load by using already-updated endpoints as distribution sources.

### Question 5: Batch Deployment Strategy Optimization

**Scenario:** Your organization has 5,000 endpoints across multiple time zones and business units. You need to deploy monthly security updates while minimizing business disruption and maintaining high success rates.

**Question:** What batch deployment strategy best addresses these requirements?

A) Deploy to all endpoints simultaneously during a global maintenance window
B) Use geographic batching with local maintenance windows, business unit prioritization, and success-threshold gating
C) Deploy alphabetically by computer name in equal-sized batches
D) Prioritize endpoints by criticality level and deploy regardless of time zones

**Answer:** B) Use geographic batching with local maintenance windows, business unit prioritization, and success-threshold gating

**Explanation:** This strategy optimizes for minimal business disruption (local maintenance windows), organizational priorities (business unit prioritization), and risk management (success-threshold gating). Geographic batching reduces network load and allows for timezone-appropriate scheduling while maintaining monitoring and control capabilities.

### Question 6: Dependency Management in Complex Deployments

**Scenario:** You need to deploy a new application that requires: .NET Framework 4.8, Visual C++ Redistributable 2019, and a specific Windows service to be stopped during installation, then restarted afterward.

**Question:** How should you structure the deployment to handle these dependencies properly?

A) Create a single package that includes all components and installs them sequentially
B) Use separate actions with proper sequencing: install dependencies first, stop service, install application, restart service
C) Deploy all components simultaneously and let Windows handle the dependency resolution
D) Manually install dependencies first, then deploy the main application package

**Answer:** B) Use separate actions with proper sequencing: install dependencies first, stop service, install application, restart service

**Explanation:** Proper dependency management requires sequential execution with validation checkpoints. Separate actions allow for individual monitoring, troubleshooting, and rollback if needed. This approach also enables better error handling and makes the deployment process more maintainable and auditable.

## Key Takeaways

### Critical Success Factors

1. **Safety First**: Always use pilot deployments and phased rollouts for risk mitigation
2. **Proper Planning**: Thorough validation, dependency checking, and resource planning prevent most failures
3. **Real-Time Monitoring**: Continuous oversight enables rapid response to issues
4. **Systematic Troubleshooting**: Methodical root cause analysis prevents recurring problems
5. **Approval Discipline**: Following governance processes ensures accountability and risk management

### Common Pitfalls to Avoid

- **Rushing Deployments**: Skipping validation steps leads to large-scale failures
- **Ignoring Dependencies**: Incomplete dependency analysis causes installation failures
- **Insufficient Monitoring**: Poor oversight prevents early problem detection
- **Inadequate Planning**: Resource constraints and scheduling conflicts disrupt deployments
- **Weak Rollback Planning**: Insufficient preparation for failure scenarios increases recovery time

### Best Practices Summary

- Always validate packages and dependencies before deployment
- Use pilot groups to test deployments before full-scale rollout
- Implement proper approval workflows for governance and accountability
- Monitor deployments in real-time with appropriate alerting
- Maintain detailed documentation for troubleshooting and process improvement
- Plan for failures with comprehensive rollback and recovery procedures

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Terminal,
  Search,
  Database,
  Settings,
  Users,
  Shield,
  Activity,
  Server,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
} from "lucide-react";

import {
  type ConsoleState,
  type TaniumModule,
  type SavedQuery,
  type ComputerGroup,
  ActionHistory,
  type ConsoleAction,
} from "@/types/lab";

interface ConsoleSimulatorProps {
  initialState: ConsoleState;
  onAction: (action: ConsoleAction) => void;
  onStateChange: (newState: ConsoleState) => void;
  currentStep?: number;
  expectedActions?: ConsoleAction[];
  readOnly?: boolean;
}

// Mock data for simulation
const mockModules: TaniumModule[] = [
  {
    id: "interact",
    name: "Interact",
    enabled: true,
    features: [
      { id: "question-builder", name: "Question Builder", description: "Build natural language queries", enabled: true, configuration: {} },
      { id: "saved-questions", name: "Saved Questions", description: "Manage saved queries", enabled: true, configuration: {} },
      { id: "real-time-results", name: "Real-time Results", description: "Live query results", enabled: true, configuration: {} },
    ],
    permissions: ["read", "write", "execute"],
  },
  {
    id: "deploy",
    name: "Deploy",
    enabled: true,
    features: [
      { id: "package-management", name: "Package Management", description: "Manage deployment packages", enabled: true, configuration: {} },
      { id: "action-history", name: "Action History", description: "View deployment history", enabled: true, configuration: {} },
    ],
    permissions: ["read", "write", "execute"],
  },
  {
    id: "administration",
    name: "Administration",
    enabled: true,
    features: [
      { id: "computer-groups", name: "Computer Groups", description: "Manage computer groups", enabled: true, configuration: {} },
      { id: "user-management", name: "User Management", description: "Manage users and roles", enabled: true, configuration: {} },
    ],
    permissions: ["read", "write", "admin"],
  },
];

const mockQueries: SavedQuery[] = [
  {
    id: "query-1",
    name: "Get Computer Names",
    question: "Get Computer Name from all machines",
    sensors: ["Computer Name"],
    targeting: { type: "all-computers" },
    lastExecuted: "2025-01-10T10:30:00Z",
    shared: false,
  },
  {
    id: "query-2",
    name: "Windows Endpoints",
    question: "Get Computer Name and Operating System from all machines where Operating System contains \"Windows\"",
    sensors: ["Computer Name", "Operating System"],
    targeting: { 
      type: "custom-filter",
      filters: [{ sensor: "Operating System", operator: "contains", value: "Windows" }]
    },
    shared: true,
  },
];

const mockComputerGroups: ComputerGroup[] = [
  {
    id: "group-1",
    name: "All Computers",
    type: "static",
    description: "Default group containing all endpoints",
    memberCount: 1247,
    lastUpdated: "2025-01-10T09:15:00Z",
  },
  {
    id: "group-2",
    name: "Windows Servers",
    type: "dynamic",
    description: "Servers running Windows OS",
    rules: [
      { sensor: "Operating System", operator: "contains", value: "Windows" },
      { sensor: "Computer Role", operator: "equals", value: "Server" }
    ],
    memberCount: 156,
    lastUpdated: "2025-01-10T08:45:00Z",
  },
];

export function ConsoleSimulator({
  initialState,
  onAction,
  onStateChange,
  currentStep,
  expectedActions,
  readOnly = false,
}: ConsoleSimulatorProps) {
  const [consoleState, setConsoleState] = useState<ConsoleState>(initialState);
  const [activeModule, setActiveModule] = useState(initialState.currentModule ?? "interact");
  const [queryInput, setQueryInput] = useState("");
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const terminalRef = useRef<HTMLDivElement>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Log action to terminal
  const logAction = (action: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog(prev => [...prev, `[${timestamp}] ${action}`]);
    
    // Scroll to bottom
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    }, 100);
  };

  // Handle module navigation
  const handleModuleClick = (moduleId: string) => {
    if (readOnly) return;
    
    setActiveModule(moduleId);
    const newState = { ...consoleState, currentModule: moduleId, currentView: "main" };
    setConsoleState(newState);
    onStateChange(newState);
    
    logAction(`Navigated to ${moduleId} module`);
    onAction({
      id: `nav-${moduleId}`,
      type: "navigate",
      target: moduleId,
      description: `Navigate to ${moduleId} module`,
      isOptional: false,
    });
  };

  // Execute query simulation
  const handleQueryExecution = async () => {
    if (readOnly || !queryInput.trim()) return;

    setIsExecuting(true);
    logAction(`Executing query: "${queryInput}"`);

    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock results based on query
    const mockResults = generateMockResults(queryInput);
    setQueryResults(mockResults);
    
    // Save query to state
    const newQuery: SavedQuery = {
      id: `query-${Date.now()}`,
      name: `Query ${consoleState.queries.length + 1}`,
      question: queryInput,
      sensors: extractSensors(queryInput),
      targeting: { type: "all-computers" },
      results: mockResults,
      lastExecuted: new Date().toISOString(),
      shared: false,
    };

    const newState = {
      ...consoleState,
      queries: [...consoleState.queries, newQuery],
    };
    setConsoleState(newState);
    onStateChange(newState);

    setIsExecuting(false);
    logAction(`Query completed - ${mockResults.length} results returned`);

    onAction({
      id: "execute-query",
      type: "input",
      target: "query-field",
      value: queryInput,
      description: "Execute Tanium query",
      isOptional: false,
    });
  };

  // Generate mock results based on query
  const generateMockResults = (query: string): any[] => {
    const baseCount = Math.floor(Math.random() * 100) + 50;
    return Array.from({ length: baseCount }, (_, i) => ({
      computerId: `comp-${i + 1}`,
      computerName: `PC-${String(i + 1).padStart(4, '0')}`,
      data: {
        "Computer Name": `PC-${String(i + 1).padStart(4, '0')}`,
        "Operating System": Math.random() > 0.3 ? "Windows 10" : "Windows Server 2019",
        "IP Address": `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      },
      timestamp: new Date().toISOString(),
    }));
  };

  // Extract sensors from query
  const extractSensors = (query: string): string[] => {
    const commonSensors = ["Computer Name", "Operating System", "IP Address", "Last Logged In User"];
    return commonSensors.filter(sensor => 
      query.toLowerCase().includes(sensor.toLowerCase())
    );
  };

  // Create computer group
  const handleCreateGroup = () => {
    if (readOnly) return;

    const groupName = prompt("Enter computer group name:");
    if (!groupName) return;

    const newGroup: ComputerGroup = {
      id: `group-${Date.now()}`,
      name: groupName,
      type: "dynamic",
      description: "User-created group",
      memberCount: Math.floor(Math.random() * 500) + 10,
      lastUpdated: new Date().toISOString(),
    };

    const newState = {
      ...consoleState,
      computerGroups: [...consoleState.computerGroups, newGroup],
    };
    setConsoleState(newState);
    onStateChange(newState);

    logAction(`Created computer group: ${groupName}`);
    onAction({
      id: "create-group",
      type: "click",
      target: "create-group-button",
      description: "Create new computer group",
      isOptional: false,
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const getModuleIcon = (moduleId: string) => {
    switch (moduleId) {
      case "interact": return <Search className="h-4 w-4" />;
      case "deploy": return <Zap className="h-4 w-4" />;
      case "asset": return <Database className="h-4 w-4" />;
      case "administration": return <Settings className="h-4 w-4" />;
      case "patch": return <Shield className="h-4 w-4" />;
      case "threat-response": return <AlertTriangle className="h-4 w-4" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Console Header */}
      <Card className="glass border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5 text-tanium-accent" />
                <CardTitle className="text-foreground">Tanium Console</CardTitle>
                <Badge variant="outline" className="border-green-500 text-[#22c55e]">
                  Platform 7.5
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {formatTime(currentTime)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-blue-500 text-primary">
                Simulation Mode
              </Badge>
              {readOnly && (
                <Badge variant="outline" className="border-yellow-500 text-[#f97316]">
                  Read Only
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Module Navigation */}
          <div className="flex space-x-1 mb-4">
            {mockModules.map((module) => (
              <Button
                key={module.id}
                variant={activeModule === module.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModuleClick(module.id)}
                disabled={readOnly}
                className={`flex items-center space-x-2 ${
                  activeModule === module.id 
                    ? "bg-tanium-accent hover:bg-blue-600" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {getModuleIcon(module.id)}
                <span>{module.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Area */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Primary Interface */}
        <div className="lg:col-span-2">
          <Tabs value={activeModule} className="space-y-4">
            {/* Interact Module */}
            <TabsContent value="interact" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Search className="mr-2 h-5 w-5" />
                    Question Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter your natural language query (e.g., Get Computer Name from all machines)"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      disabled={readOnly}
                      className="flex-1 bg-card/50 border-gray-600 text-foreground"
                      onKeyPress={(e) => e.key === 'Enter' && handleQueryExecution()}
                    />
                    <Button
                      onClick={handleQueryExecution}
                      disabled={(readOnly ?? isExecuting) || !queryInput.trim()}
                      className="bg-tanium-accent hover:bg-blue-600"
                    >
                      {isExecuting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {queryResults.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          Query Results ({queryResults.length} endpoints)
                        </h4>
                        <Badge variant="outline" className="border-green-500 text-[#22c55e]">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Complete
                        </Badge>
                      </div>
                      <ScrollArea className="h-48 rounded border border-gray-600 bg-card/50">
                        <div className="p-2">
                          {queryResults.slice(0, 10).map((result, index) => (
                            <div
                              key={index}
                              className="flex justify-between py-1 text-sm border-b border-gray-700 last:border-0"
                            >
                              <span className="text-foreground">{result.computerName}</span>
                              <span className="text-muted-foreground">{result.data["Operating System"]}</span>
                            </div>
                          ))}
                          {queryResults.length > 10 && (
                            <div className="py-2 text-center text-muted-foreground text-sm">
                              ... and {queryResults.length - 10} more results
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Saved Questions */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-foreground">Saved Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[...mockQueries, ...consoleState.queries].map((query) => (
                      <div
                        key={query.id}
                        className="flex items-center justify-between p-3 rounded border border-gray-600 hover:border-gray-500"
                      >
                        <div>
                          <div className="font-medium text-foreground">{query.name}</div>
                          <div className="text-sm text-muted-foreground">{query.question}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {query.shared && (
                            <Badge variant="outline" className="text-xs">Shared</Badge>
                          )}
                          <Button size="sm" variant="ghost" disabled={readOnly}>
                            <Play className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Administration Module */}
            <TabsContent value="administration" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-foreground">
                      <Users className="mr-2 h-5 w-5" />
                      Computer Groups
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={handleCreateGroup}
                      disabled={readOnly}
                      className="bg-tanium-accent hover:bg-blue-600"
                    >
                      Create Group
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...mockComputerGroups, ...consoleState.computerGroups].map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-3 rounded border border-gray-600 hover:border-gray-500"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">{group.name}</span>
                            <Badge 
                              variant="outline" 
                              className={group.type === 'dynamic' ? "border-blue-500 text-primary" : "border-gray-500 text-muted-foreground"}
                            >
                              {group.type}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{group.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-foreground">{group.memberCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">endpoints</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Panel - Activity Log */}
        <div className="space-y-4">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Activity className="mr-2 h-5 w-5" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea ref={terminalRef} className="h-64 font-mono text-xs">
                {actionLog.length === 0 ? (
                  <div className="text-muted-foreground italic">No activities logged yet</div>
                ) : (
                  <div className="space-y-1">
                    {actionLog.map((log, index) => (
                      <div key={index} className="text-muted-foreground">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Expected Actions (for labs) */}
          {expectedActions && expectedActions.length > 0 && (
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Expected Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expectedActions.map((action, index) => (
                    <div
                      key={action.id}
                      className={`flex items-center space-x-2 p-2 rounded text-sm ${
                        index < (currentStep ?? 0) 
                          ? "bg-[#22c55e]/10 border border-green-500/50" 
                          : "bg-gray-500/10 border border-gray-500/50"
                      }`}
                    >
                      {index < (currentStep ?? 0) ? (
                        <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={index < (currentStep ?? 0) ? "text-[#22c55e]" : "text-muted-foreground"}>
                        {action.description}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
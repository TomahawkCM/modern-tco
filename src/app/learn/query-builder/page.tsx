"use client";

import React from 'react';
import { QuestionBuilder } from '@/components/query-builder/QuestionBuilder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function QueryBuilderPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Tanium Query Builder
        </h1>
        <p className="text-xl text-gray-400">
          Learn to build Tanium queries interactively with guided assistance
        </p>
      </div>

      {/* Information Alert */}
      <Alert className="mb-6 border-blue-500 bg-blue-500/10">
        <Info className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-300">
          <strong>Interactive Learning Mode:</strong> This simulator helps you understand
          Tanium's natural language query system. Practice building queries using guided mode,
          natural language, or advanced syntax.
        </AlertDescription>
      </Alert>

      {/* Quick Start Guide */}
      <Card className="glass border-white/10 mb-8">
        <CardHeader>
          <CardTitle className="text-white">Quick Start Guide</CardTitle>
          <CardDescription className="text-gray-400">
            Three ways to build queries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-white mb-2">🖱️ Guided Mode</h3>
              <p className="text-sm text-gray-400">
                Use visual components to select sensors, add filters, and build
                queries step-by-step with immediate feedback.
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-white mb-2">✨ Natural Language</h3>
              <p className="text-sm text-gray-400">
                Type queries in plain English like "Show me all Windows servers
                with high CPU usage" and watch them convert to Tanium syntax.
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="font-semibold text-white mb-2">⚡ Advanced Mode</h3>
              <p className="text-sm text-gray-400">
                Write Tanium queries directly with syntax highlighting and
                validation for experienced users.
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded">
            <p className="text-sm text-yellow-300">
              <strong>Tip:</strong> Start with Natural Language mode to see how
              everyday questions translate into Tanium queries, then explore
              Guided mode to understand the components.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Builder Component */}
      <QuestionBuilder
        mode="natural-language"
        showResults={true}
        showHistory={true}
        onExecute={(query, result) => {
          console.log('Query executed:', query);
          console.log('Result:', result);
        }}
      />

      {/* Learning Resources */}
      <Card className="glass border-white/10 mt-8">
        <CardHeader>
          <CardTitle className="text-white">Learning Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <span className="text-tanium-accent">•</span>
            <div>
              <p className="text-white font-medium">Common Sensors</p>
              <p className="text-sm text-gray-400">
                Computer Name, Operating System, IP Address, CPU Percent, Disk Free GB
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tanium-accent">•</span>
            <div>
              <p className="text-white font-medium">Filter Operators</p>
              <p className="text-sm text-gray-400">
                contains, equals, greater than, less than, starts with, ends with
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-tanium-accent">•</span>
            <div>
              <p className="text-white font-medium">Aggregate Functions</p>
              <p className="text-sm text-gray-400">
                count(), min(), max(), avg(), sum()
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
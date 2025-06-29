'use client';

import React from 'react';
import Navigation from '../../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Zap,
  Target
} from 'lucide-react';
import { useRules } from '../../hooks/useRules';

export default function AnalyticsPage() {
  const { rules } = useRules();
  
  // Calculate real stats from rules
  const stats = {
    totalRules: rules.length,
    activeRules: rules.filter(rule => rule.status === 'valid').length,
    rulesWithErrors: rules.filter(rule => rule.status === 'error').length,
    rulesWithWarnings: rules.filter(rule => rule.status === 'warning').length,
    avgExecutionTime: '< 1ms',
    successRate: rules.length > 0 ? `${Math.round((rules.filter(rule => rule.status === 'valid').length / rules.length) * 100)}%` : '100%',
    lastUpdated: rules.length > 0 ? 'Recently' : 'Never'
  };

  const exportAnalyticsReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: stats,
      ruleBreakdown: {
        byPriority: {
          low: rules.filter(rule => rule.priority === 1).length,
          medium: rules.filter(rule => rule.priority === 2).length,
          high: rules.filter(rule => rule.priority === 3).length,
          critical: rules.filter(rule => rule.priority === 4).length,
        },
        byStatus: {
          valid: rules.filter(rule => rule.status === 'valid').length,
          warning: rules.filter(rule => rule.status === 'warning').length,
          error: rules.filter(rule => rule.status === 'error').length,
        }
      },
      rules: rules.map(rule => ({
        id: rule.id,
        original: rule.original,
        priority: rule.priority,
        weight: rule.weight,
        status: rule.status,
        suggestionsCount: rule.suggestions.length
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportTrendsCSV = () => {
    const headers = ['Date', 'Total Rules', 'Valid Rules', 'Rules with Issues', 'Success Rate'];
    const today = new Date().toISOString().split('T')[0];
    
    const csvContent = [
      headers.join(','),
      [
        today,
        stats.totalRules,
        stats.activeRules,
        stats.rulesWithErrors + stats.rulesWithWarnings,
        stats.successRate
      ].join(',')
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `trends-report-${today}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const recentActivity = rules.length > 0 ? [
    { action: `${rules.length} rules created`, time: 'Today', type: 'success' },
    { action: `${stats.activeRules} rules validated successfully`, time: 'Recently', type: 'info' },
    ...(stats.rulesWithErrors > 0 ? [{ action: `${stats.rulesWithErrors} rules need attention`, time: 'Recently', type: 'warning' }] : [])
  ] : [
    { action: 'No recent activity', time: 'Start creating rules to see analytics', type: 'info' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor rule performance and system insights</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative group">
                <Button variant="outline" className="peer">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={exportAnalyticsReport}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Analytics Report (JSON)
                    </button>
                    <button
                      onClick={exportTrendsCSV}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Trends Report (CSV)
                    </button>
                  </div>
                </div>
              </div>
              <Button onClick={exportTrendsCSV}>
                <TrendingUp className="w-4 h-4 mr-2" />
                View Trends
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                <Target className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRules}</div>
                <p className="text-xs text-gray-600">Rules created</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRules}</div>
                <p className="text-xs text-gray-600">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rules with Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rulesWithErrors + stats.rulesWithWarnings}</div>
                <p className="text-xs text-gray-600">Need attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Zap className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successRate}</div>
                <p className="text-xs text-gray-600">AI parsing success</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Rule Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rules.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{stats.activeRules}</div>
                          <div className="text-sm text-green-800">Valid Rules</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{stats.rulesWithWarnings}</div>
                          <div className="text-sm text-yellow-800">Warnings</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{rules.filter(rule => rule.priority === 1).length}</div>
                          <div className="text-xs text-gray-500">Low Priority</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{rules.filter(rule => rule.priority === 2).length}</div>
                          <div className="text-xs text-gray-500">Medium Priority</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{rules.filter(rule => rule.priority === 3).length}</div>
                          <div className="text-xs text-gray-500">High Priority</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{rules.filter(rule => rule.priority === 4).length}</div>
                          <div className="text-xs text-gray-500">Critical</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                      <p>Create some business rules to see performance analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rule Categories */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Rule Categories & Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                      <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold">Business Logic</h3>
                    <p className="text-2xl font-bold text-blue-600">{rules.filter(rule => rule.original.toLowerCase().includes('discount') || rule.original.toLowerCase().includes('price')).length}</p>
                    <p className="text-xs text-gray-500">rules</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold">Validation Rules</h3>
                    <p className="text-2xl font-bold text-green-600">{rules.filter(rule => rule.original.toLowerCase().includes('validate') || rule.original.toLowerCase().includes('check')).length}</p>
                    <p className="text-xs text-gray-500">rules</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold">Automation</h3>
                    <p className="text-2xl font-bold text-purple-600">{rules.filter(rule => rule.original.toLowerCase().includes('send') || rule.original.toLowerCase().includes('alert') || rule.original.toLowerCase().includes('notify')).length}</p>
                    <p className="text-xs text-gray-500">rules</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

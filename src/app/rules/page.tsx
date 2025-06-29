'use client';

import React, { useState } from 'react';
import Navigation from '../../components/Navigation';
import RuleList from '../../components/RuleList';
import { Button } from '../../components/ui/button';
import { Download, Filter, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { useRules } from '../../hooks/useRules';

export default function RulesPage() {
  const { rules } = useRules();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const exportToJSON = () => {
    const dataStr = JSON.stringify(rules, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `business-rules-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    if (rules.length === 0) {
      alert('No rules to export');
      return;
    }

    const headers = ['ID', 'Original Rule', 'Priority', 'Weight', 'Status', 'Suggestions Count', 'Parsed Structure'];
    const csvContent = [
      headers.join(','),
      ...rules.map(rule => [
        rule.id,
        `"${rule.original.replace(/"/g, '""')}"`,
        rule.priority,
        rule.weight,
        rule.status,
        rule.suggestions.length,
        `"${JSON.stringify(rule.parsed).replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    const exportFileDefaultName = `business-rules-${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.original.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         JSON.stringify(rule.parsed).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === '' || rule.priority.toString() === priorityFilter;
    const matchesStatus = statusFilter === '' || rule.status === statusFilter;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Business Rules</h1>
              <p className="text-gray-600 mt-2">Manage and organize all your business rules</p>
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Button variant="outline" className="peer">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              <div className="relative group">
                <Button variant="outline" className="peer">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button
                      onClick={exportToJSON}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                    <button
                      onClick={exportToCSV}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search rules by description, conditions, or actions..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
                <option value="4">Critical</option>
              </select>
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="valid">Valid</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>

          {/* Rules List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Rules Overview</h2>
              <div className="text-sm text-gray-500">
                Total rules: <span className="font-medium">{rules.length}</span>
                {searchTerm || priorityFilter || statusFilter ? (
                  <span> | Filtered: <span className="font-medium">{filteredRules.length}</span></span>
                ) : null}
              </div>
            </div>
            
            {filteredRules.length === 0 && rules.length > 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rules match your filters</h3>
                <p>Try adjusting your search criteria or filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRules.map(rule => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-2">{rule.original}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Priority: {['', 'Low', 'Medium', 'High', 'Critical'][rule.priority]}</span>
                          <span>Weight: {rule.weight}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            rule.status === 'valid' ? 'bg-green-100 text-green-800' :
                            rule.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rule.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredRules.length === 0 && rules.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rules yet</h3>
                    <p>Create your first business rule from the Dashboard</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Github, 
  FileText, 
  Users, 
  MessageCircle,
  RefreshCw 
} from 'lucide-react';

const ProjectDashboard = ({ repository, documentationData }) => {
  const [status, setStatus] = useState({
    repository: 'connected',
    analysis: 'completed',
    documentation: 'generated',
    roles: 'available',
    chat: 'ready'
  });
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (repository && documentationData) {
      setMetrics({
        totalEndpoints: documentationData.endpoints?.length || 0,
        totalFunctions: documentationData.functions?.length || 0,
        totalDependencies: documentationData.dependencies?.length || 0,
        codeFiles: documentationData.files?.length || 0,
        framework: documentationData.framework || 'Not detected',
        language: documentationData.language || 'Multiple'
      });
    }
  }, [repository, documentationData]);

  const statusItems = [
    {
      id: 'repository',
      name: 'Repository Connection',
      icon: Github,
      status: repository ? 'connected' : 'pending',
      description: repository ? `Connected to ${repository.name}` : 'Connect your GitHub repository'
    },
    {
      id: 'analysis',
      name: 'Code Analysis',
      icon: Activity,
      status: documentationData ? 'completed' : 'pending',
      description: documentationData ? 'Repository analyzed successfully' : 'Analyze repository structure'
    },
    {
      id: 'documentation',
      name: 'Documentation',
      icon: FileText,
      status: documentationData ? 'generated' : 'pending',
      description: documentationData ? 'Mintlify docs generated' : 'Generate documentation'
    },
    {
      id: 'roles',
      name: 'Role Guides',
      icon: Users,
      status: documentationData ? 'available' : 'pending',
      description: 'Role-based documentation guides'
    },
    {
      id: 'chat',
      name: 'AI Assistant',
      icon: MessageCircle,
      status: 'ready',
      description: 'AI-powered Q&A assistant'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
      case 'completed':
      case 'generated':
      case 'available':
      case 'ready':
        return 'green';
      case 'processing':
      case 'generating':
        return 'yellow';
      case 'pending':
      case 'error':
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
      case 'completed':
      case 'generated':
      case 'available':
      case 'ready':
        return CheckCircle;
      case 'processing':
      case 'generating':
        return Clock;
      case 'error':
        return XCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Dashboard</h2>
            <p className="text-gray-600 mt-1">
              Overview of your documentation project status
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statusItems.map((item) => {
          const StatusIcon = getStatusIcon(item.status);
          const color = getStatusColor(item.status);
          const ItemIcon = item.icon;

          return (
            <div key={item.id} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${
                  color === 'green' ? 'bg-green-100' :
                  color === 'yellow' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  <ItemIcon className={`h-5 w-5 ${
                    color === 'green' ? 'text-green-600' :
                    color === 'yellow' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`} />
                </div>
                <StatusIcon className={`h-5 w-5 ${
                  color === 'green' ? 'text-green-500' :
                  color === 'yellow' ? 'text-yellow-500' :
                  color === 'gray' ? 'text-gray-400' :
                  'text-red-500'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          );
        })}
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.totalEndpoints}</div>
            <div className="text-sm text-gray-600">API Endpoints</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{metrics.totalFunctions}</div>
            <div className="text-sm text-gray-600">Functions</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.totalDependencies}</div>
            <div className="text-sm text-gray-600">Dependencies</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.codeFiles}</div>
            <div className="text-sm text-gray-600">Code Files</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-lg font-bold text-gray-700">{metrics.framework}</div>
            <div className="text-sm text-gray-600">Framework</div>
          </div>
          <div className="bg-white rounded-lg border p-4 text-center">
            <div className="text-lg font-bold text-gray-700">{metrics.language}</div>
            <div className="text-sm text-gray-600">Language</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <FileText className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-medium">View Documentation</div>
            <div className="text-sm text-gray-600">Browse generated docs</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <Users className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-medium">Role Guides</div>
            <div className="text-sm text-gray-600">View role-specific guides</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <MessageCircle className="h-6 w-6 text-purple-600 mb-2" />
            <div className="font-medium">Ask AI</div>
            <div className="text-sm text-gray-600">Get instant answers</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <RefreshCw className="h-6 w-6 text-orange-600 mb-2" />
            <div className="font-medium">Re-analyze</div>
            <div className="text-sm text-gray-600">Update documentation</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDashboard;

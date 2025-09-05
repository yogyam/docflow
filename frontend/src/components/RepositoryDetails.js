import { useState } from 'react'
import { FileText, Code2, Package, GitBranch, Clock, ExternalLink, Sparkles, Zap } from 'lucide-react'

export default function RepositoryDetails({ repository }) {
  const [activeTab, setActiveTab] = useState('overview')

  // Debug: Log the repository data to see what we're getting
  console.log('RepositoryDetails received:', repository);

  const documentationPreview = [
    {
      label: 'API Documentation',
      description: 'Generate comprehensive API documentation with endpoints, parameters, and examples',
      color: 'text-blue-600',
      bgColor: 'from-blue-600 to-teal-600',
      icon: Code2
    },
    {
      label: 'Code Structure',
      description: 'Document functions, classes, and code architecture with detailed explanations',
      color: 'text-blue-600',
      bgColor: 'from-blue-600 to-teal-600',
      icon: GitBranch
    },
    {
      label: 'Dependencies Guide',
      description: 'Catalog all dependencies with versions, purposes, and integration details',
      color: 'text-blue-600',
      bgColor: 'from-blue-600 to-teal-600',
      icon: Package
    }
  ]

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Documentation Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {documentationPreview.map((item, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg hover:scale-105 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${item.bgColor} shadow-lg flex-shrink-0`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-2">{item.label}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repository Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Code2 className="w-6 h-6 mr-3 text-teal-600" />
            Repository Information
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Name:</span>
              <span className="font-mono text-sm bg-gray-100 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-lg border border-gray-200">{repository.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Language:</span>
              <span className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-200/50 backdrop-blur-sm">
                {repository.language || 'Not detected'}
              </span>
            </div>
            {repository.framework && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Framework:</span>
                <span className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 text-sm px-3 py-1 rounded-full border border-green-200/50 backdrop-blur-sm">
                  {repository.framework}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Last Updated:</span>
              <span className="text-gray-700 text-sm">{new Date(repository.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">GitHub:</span>
              <a href={repository.html_url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 text-sm flex items-center space-x-2 transition-colors">
                <span>View Repository</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl border border-gray-200/50 rounded-xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-blue-600" />
            Documentation Preview
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600 font-medium">Ready to generate:</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 border border-blue-200/50">
                  <FileText className="w-4 h-4 mr-2" />
                  OpenAPI Spec
                </span>
                <span className="text-xs text-gray-500">API documentation</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 border border-blue-200/50">
                  <Code2 className="w-4 h-4 mr-2" />
                  Function Docs
                </span>
                <span className="text-xs text-gray-500">Code documentation</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 border border-blue-200/50">
                  <Package className="w-4 h-4 mr-2" />
                  Dependency Guide
                </span>
                <span className="text-xs text-gray-500">Package overview</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {repository.description && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">{repository.description}</p>
        </div>
      )}
    </div>
  )

  const renderEndpoints = () => (
    <div className="space-y-4">
      {repository.metadata?.endpoints?.length > 0 ? (
        <div className="space-y-3">
          {repository.metadata.endpoints.slice(0, 10).map((endpoint, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'PUT' ? 'bg-orange-100 text-orange-800' :
                      endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.path}</code>
                  </div>
                  <p className="text-sm text-gray-600">
                    {endpoint.description || 'No description available'}
                  </p>
                </div>
                {endpoint.file && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border">
                    {endpoint.file.split('/').pop()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No API endpoints detected in this repository.</p>
        </div>
      )}
    </div>
  )

  const renderDependencies = () => (
    <div className="space-y-4">
      {repository.metadata?.dependencies?.length > 0 ? (
        <div className="space-y-3">
          {repository.metadata.dependencies.map((dep, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{dep.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{dep.version}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {dep.type || 'dependency'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No dependencies detected in this repository.</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 p-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'endpoints', label: 'API Endpoints' },
              { id: 'dependencies', label: 'Dependencies' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'endpoints' && renderEndpoints()}
        {activeTab === 'dependencies' && renderDependencies()}
      </div>
    </div>
  )
}

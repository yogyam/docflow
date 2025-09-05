import { useState } from 'react'
import { FileText, Code2, Package, GitBranch, Clock, ExternalLink } from 'lucide-react'

export default function RepositoryDetails({ repository }) {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      label: 'API Endpoints',
      value: repository.metadata?.endpoints?.length || 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      icon: Code2
    },
    {
      label: 'Functions',
      value: repository.metadata?.functions?.length || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: GitBranch
    },
    {
      label: 'Dependencies',
      value: repository.metadata?.dependencies?.length || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: Package
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repository Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Name:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{repository.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Language:</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {repository.language || 'Not detected'}
              </span>
            </div>
            {repository.framework && (
              <div className="flex justify-between">
                <span className="text-gray-500">Framework:</span>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {repository.framework}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated:</span>
              <span className="text-sm">{new Date(repository.lastUpdated).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">GitHub:</span>
              <a href={repository.html_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center space-x-1">
                <span>View Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation Preview</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Will generate:</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  OpenAPI Spec
                </span>
                <span className="text-xs text-gray-500">from {stats[0].value} endpoints</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  Function Docs
                </span>
                <span className="text-xs text-gray-500">from {stats[1].value} functions</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  Dependency Guide
                </span>
                <span className="text-xs text-gray-500">from {stats[2].value} packages</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  AI Assistant
                </span>
                <span className="text-xs text-gray-500">interactive help</span>
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

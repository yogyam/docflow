import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText, Code, Users, AlertCircle, Github, ExternalLink, CheckCircle } from 'lucide-react';

const DocumentationPreview = ({ repository, documentationData, onGenerate, onDownload }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate();
      if (result?.deployment) {
        setDeploymentStatus(result.deployment);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'deployment', label: 'GitHub Deployment', icon: Github },
    { id: 'api', label: 'API Reference', icon: Code },
    { id: 'roles', label: 'Role-Based Guides', icon: Users },
    { id: 'setup', label: 'Mintlify Setup', icon: ExternalLink },
  ];

  const renderOverviewSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Documentation Structure</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>README.md</span>
            <span className="text-sm text-gray-600">Project overview</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>API Reference</span>
            <span className="text-sm text-gray-600">{documentationData?.endpoints?.length || 0} endpoints</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Role-Based Guides</span>
            <span className="text-sm text-gray-600">Developer, DevOps, QA</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span>Code Examples</span>
            <span className="text-sm text-gray-600">{documentationData?.functions?.length || 0} functions</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Repository Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{documentationData?.framework || 'Unknown'}</div>
            <div className="text-sm text-gray-600">Framework</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{documentationData?.language || 'Multiple'}</div>
            <div className="text-sm text-gray-600">Primary Language</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{documentationData?.dependencies?.length || 0}</div>
            <div className="text-sm text-gray-600">Dependencies</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{documentationData?.endpoints?.length || 0}</div>
            <div className="text-sm text-gray-600">API Endpoints</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeploymentSection = () => (
    <div className="space-y-6">
      {deploymentStatus ? (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Deployment Status
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Successfully Deployed to GitHub</span>
              </div>
              <p className="text-sm text-green-700">
                Documentation files committed to repository: <code>{deploymentStatus.repository}</code>
              </p>
            </div>

            {deploymentStatus.pullRequest && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-800">Pull Request Created</span>
                  <a 
                    href={deploymentStatus.pullRequest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <Github className="w-4 h-4" />
                    View PR #{deploymentStatus.pullRequest.number}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-sm text-blue-700">
                  Review and merge to add documentation to your repository
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Files Deployed</div>
                <div className="text-xl font-semibold">{deploymentStatus.successfulUploads}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Branch</div>
                <div className="text-sm font-mono">{deploymentStatus.branch}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">GitHub Deployment</h3>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Github className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-800">Ready for Deployment</span>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              Generate documentation to commit Mintlify files directly to your GitHub repository.
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Creates documentation branch</li>
              <li>• Commits Mintlify files (mint.json, MDX files)</li>
              <li>• Opens pull request for review</li>
              <li>• Ready for Mintlify platform connection</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderSetupSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Mintlify Platform Setup</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Complete These Steps</span>
            </div>
            <p className="text-sm text-yellow-700">
              After generating documentation, follow these steps to connect with Mintlify platform:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
              <div>
                <div className="font-semibold">Create Mintlify Account</div>
                <div className="text-sm text-gray-600 mb-2">Sign up and access your dashboard</div>
                <a 
                  href="https://dashboard.mintlify.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Open Mintlify Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
              <div>
                <div className="font-semibold">Install GitHub App</div>
                <div className="text-sm text-gray-600">Connect Mintlify to your repository</div>
                <div className="text-xs text-gray-500 mt-1">Settings → GitHub App → Install</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
              <div>
                <div className="font-semibold">Create Project</div>
                <div className="text-sm text-gray-600">Connect your repository and set docs folder to <code>/docs</code></div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
              <div>
                <div className="font-semibold">Live Documentation</div>
                <div className="text-sm text-gray-600">Your docs will be live at:</div>
                {repository && (
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 block">
                    https://{repository.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mintlify.app
                  </code>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPISection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">API Endpoints</h3>
        {documentationData?.endpoints?.length > 0 ? (
          <div className="space-y-3">
            {documentationData.endpoints.map((endpoint, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-sm">{endpoint.path}</code>
                </div>
                {endpoint.description && (
                  <p className="text-sm text-gray-600 mb-2">{endpoint.description}</p>
                )}
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Parameters: {endpoint.parameters.map(p => p.name).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Code className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No API endpoints detected</p>
            <p className="text-sm">Run analysis to discover endpoints</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRolesSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Developer Guide</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Code structure overview</li>
            <li>• API documentation</li>
            <li>• Development setup</li>
            <li>• Testing guidelines</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold">DevOps Guide</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Deployment instructions</li>
            <li>• Environment configuration</li>
            <li>• Monitoring setup</li>
            <li>• CI/CD pipeline</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">QA Guide</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Testing procedures</li>
            <li>• Bug reporting</li>
            <li>• Quality checklist</li>
            <li>• Performance metrics</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderOnboardingSection = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Getting Started Guide</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
            <div>
              <h4 className="font-medium">Prerequisites</h4>
              <p className="text-sm text-gray-600">Required tools and dependencies</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
            <div>
              <h4 className="font-medium">Installation</h4>
              <p className="text-sm text-gray-600">Step-by-step setup instructions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
            <div>
              <h4 className="font-medium">Configuration</h4>
              <p className="text-sm text-gray-600">Environment and project setup</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
            <div>
              <h4 className="font-medium">First Steps</h4>
              <p className="text-sm text-gray-600">Basic usage and examples</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Documentation Preview</h2>
            <p className="text-gray-600 mt-1">
              Preview your generated documentation for {repository?.name}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Docs
                </>
              )}
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Content */}
      <div className="min-h-96">
        {activeSection === 'overview' && renderOverviewSection()}
        {activeSection === 'deployment' && renderDeploymentSection()}
        {activeSection === 'api' && renderAPISection()}
        {activeSection === 'roles' && renderRolesSection()}
        {activeSection === 'setup' && renderSetupSection()}
      </div>
    </div>
  );
};

export default DocumentationPreview;

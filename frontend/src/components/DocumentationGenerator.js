import { useState } from 'react'
import { FileText, GitPullRequest, ExternalLink, CheckCircle, Clock, AlertCircle, GitBranch } from 'lucide-react'
import { docsApi } from '../services/api'
import toast from 'react-hot-toast'

export default function DocumentationGenerator({ repository, selectedRole, onDocsGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedDocs, setGeneratedDocs] = useState(null)
  const [error, setError] = useState('')

  const handleGenerateDocumentation = async () => {
    if (!repository) {
      setError('No repository selected')
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setError('')

    try {
      toast.loading('Generating documentation...', { id: 'doc-generation' })

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const result = await docsApi.generateDocs(repository, selectedRole, repository.metadata)
      
      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        setGeneratedDocs(result.documentation)
        if (onDocsGenerated) {
          onDocsGenerated(result.documentation)
        }
        toast.dismiss('doc-generation')
        toast.success('Documentation generated successfully!')
      } else {
        throw new Error(result.error || 'Failed to generate documentation')
      }
    } catch (error) {
      console.error('Documentation generation error:', error)
      setError(error.message || 'Failed to generate documentation')
      toast.dismiss('doc-generation')
      toast.error(error.message || 'Failed to generate documentation')
      setProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!repository) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Repository Connected</h3>
        <p className="text-gray-600">Connect a GitHub repository to start generating documentation.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Documentation Generator</h2>
              <p className="text-sm text-gray-600">Generate comprehensive docs for {repository.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedRole && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {selectedRole === 'backend' ? 'Backend Developer' : 
                 selectedRole === 'frontend' ? 'Frontend Developer' : 
                 selectedRole === 'product-manager' ? 'Product Manager' : selectedRole}
              </span>
            )}
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Auto-generated
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {!generatedDocs ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">What will be generated:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Project introduction & overview</li>
                  <li>• Function and class references</li>
                  <li>• API documentation</li>
                  <li>• Setup and installation guides</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Features included:</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• AI-powered documentation</li>
                  <li>• Pull request integration</li>
                  <li>• Role-specific content</li>
                  <li>• Ready-to-review docs</li>
                </ul>
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Generating documentation...</span>
                  <span className="text-indigo-600 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  {progress < 30 && <p>• Analyzing repository structure...</p>}
                  {progress >= 30 && progress < 60 && <p>• Extracting API endpoints...</p>}
                  {progress >= 60 && progress < 90 && <p>• Generating documentation with AI...</p>}
                  {progress >= 90 && <p>• Finalizing documentation...</p>}
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateDocumentation}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Documentation</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-medium text-green-900">Documentation Pull Request Created!</h3>
                <p className="text-sm text-green-700">Your AI-generated documentation is ready for review.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Files Created</h4>
                <p className="text-2xl font-bold text-indigo-600">{generatedDocs?.pullRequest?.filesCreated?.length || 3}</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <GitBranch className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Branch</h4>
                <p className="text-sm font-mono text-purple-600">{generatedDocs?.pullRequest?.branch || 'docs/ai-generated'}</p>
              </div>
              
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Generated</h4>
                <p className="text-sm text-purple-600">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.open(generatedDocs?.pullRequest?.url, '_blank')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <GitPullRequest className="w-4 h-4" />
                <span>View Pull Request</span>
              </button>
              
              <button
                onClick={() => window.open(`${repository.html_url}/tree/${generatedDocs?.pullRequest?.branch}`, '_blank')}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Documentation Files</span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setGeneratedDocs(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Generate New Documentation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

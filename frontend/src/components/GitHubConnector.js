import { useState } from 'react'
import { Github, CheckCircle, AlertCircle } from 'lucide-react'
import { githubApi } from '../services/api'
import toast from 'react-hot-toast'

export default function GitHubConnector({ onRepositoryConnected }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [repositoryData, setRepositoryData] = useState(null)

  const handleConnect = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a repository URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Step 1: Validate repository connection
      toast.loading('Connecting to repository...', { id: 'github-connect' })
      const connectionResult = await githubApi.connectRepository(repoUrl)
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Failed to connect repository')
      }

      // Step 2: Analyze repository with Gemini AI
      toast.loading('Analyzing repository with Gemini AI...', { id: 'github-connect' })
      const analysisResult = await githubApi.analyzeRepository(repoUrl)
      
      if (analysisResult.success) {
        setRepositoryData(analysisResult.repository)
        toast.dismiss('github-connect')
        toast.success('Repository analyzed successfully!')
        
        // Notify parent component with full analysis data
        if (onRepositoryConnected) {
          onRepositoryConnected(analysisResult.repository)
        }
      } else {
        throw new Error(analysisResult.error || 'Failed to analyze repository')
      }
    } catch (error) {
      console.error('GitHub connection/analysis error:', error)
      setError(error.message || 'Failed to connect to repository')
      toast.dismiss('github-connect')
      toast.error(error.message || 'Failed to connect to repository')
    } finally {
      setIsLoading(false)
    }
  }

  const resetConnection = () => {
    setRepositoryData(null)
    setRepoUrl('')
    setError('')
  }

  if (repositoryData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Repository Connected
                </h3>
                <p className="text-sm text-gray-600">
                  Successfully analyzed {repositoryData.name}
                </p>
              </div>
            </div>
            <button
              onClick={resetConnection}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Change Repository
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Repository Info</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{repositoryData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Language:</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {repositoryData.language || 'Not detected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated:</span>
                  <span>{new Date(repositoryData.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Analysis Results</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">API Endpoints:</span>
                  <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                    {repositoryData.metadata?.endpoints?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Functions:</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {repositoryData.metadata?.functions?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dependencies:</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {repositoryData.metadata?.dependencies?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {repositoryData.description && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">{repositoryData.description}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Github className="w-6 h-6 text-gray-900" />
          <h2 className="text-xl font-semibold text-gray-900">Connect GitHub Repository</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
              Repository URL
            </label>
            <input
              id="repo-url"
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/username/repository"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isLoading || !repoUrl.trim()}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              isLoading || !repoUrl.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Analyzing with Gemini AI...</span>
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                <span>Connect & Analyze Repository</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
          <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
            <li>Enter your GitHub repository URL</li>
            <li>We'll analyze your codebase structure</li>
            <li>Generate comprehensive documentation</li>
            <li>Deploy to your preferred platform</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

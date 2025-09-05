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
        // Merge repository info with analysis data for backward compatibility
        const enrichedRepository = {
          ...analysisResult.repository,
          name: analysisResult.hierarchical_analysis?.overview?.name || analysisResult.repository.repo,
          description: analysisResult.hierarchical_analysis?.overview?.description,
          language: analysisResult.hierarchical_analysis?.overview?.language,
          stars: analysisResult.hierarchical_analysis?.overview?.stars || 0,
          total_files: analysisResult.hierarchical_analysis?.overview?.total_files || 0,
          html_url: `https://github.com/${analysisResult.repository.owner}/${analysisResult.repository.repo}`,
          lastUpdated: new Date().toISOString(), // Current timestamp since we don't have this from API
          metadata: {
            endpoints: analysisResult.hierarchical_analysis?.dependencies?.relationships?.filter(r => r.type === 'endpoint') || [],
            functions: analysisResult.hierarchical_analysis?.functions?.by_importance?.slice(0, 20) || [],
            dependencies: analysisResult.hierarchical_analysis?.dependencies?.external || []
          },
          // Keep full analysis data for advanced components  
          fullAnalysis: analysisResult.hierarchical_analysis
        };
        
        setRepositoryData(enrichedRepository)
        toast.dismiss('github-connect')
        toast.success('Repository analyzed successfully!')
        
        // Notify parent component with enriched repository data
        if (onRepositoryConnected) {
          onRepositoryConnected(enrichedRepository)
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
      <div className="bg-white/50 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-800">
                  Repository Connected! ✨
                </h3>
                <p className="text-gray-600">
                  Successfully analyzed <span className="font-semibold">{repositoryData.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={resetConnection}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100/50 transition-all duration-300 border border-gray-200/50"
            >
              Change Repository
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Github className="w-5 h-5 mr-2 text-blue-600" />
                Repository Info
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-mono text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-lg border border-gray-200">{repositoryData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Language:</span>
                  <span className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200/50">
                    {repositoryData.language || 'Not detected'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-gray-700">{new Date(repositoryData.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
              <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
                Analysis Complete
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Ready for:</span>
                  <span className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 text-xs px-3 py-1 rounded-full border border-blue-200/50">
                    Documentation
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">AI Analysis:</span>
                  <span className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-200/50">
                    Complete ✨
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-700 text-xs px-3 py-1 rounded-full border border-green-200/50">
                    Ready to proceed
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
    <div className="flex justify-center">
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl shadow-lg">
                <Github className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect Repository</h2>
            <p className="text-gray-600 text-lg mb-2">Analyze any GitHub repo with AI-powered docs</p>
            <p className="text-sm text-gray-500">Instant setup, role-specific insights, smarter onboarding</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="repo-url" className="block text-sm font-semibold text-gray-700 mb-3">
                GitHub Repository URL
              </label>
              <input
                id="repo-url"
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-800 placeholder-gray-400 transition-all duration-300 shadow-inner"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={isLoading || !repoUrl.trim()}
              className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                isLoading || !repoUrl.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                  : 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 hover:scale-105 shadow-lg shadow-blue-500/25'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Github className="w-5 h-5" />
                  <span>Connect & Analyze Repository</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

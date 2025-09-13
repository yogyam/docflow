import React, { useState } from 'react'
import { Github, FileText, Users, Eye, BookOpen, CheckCircle, Sparkles, Code2, Zap, ExternalLink } from 'lucide-react'
import config from '../config'
import GitHubConnector from '../components/GitHubConnector'
import RepositoryDetails from '../components/RepositoryDetails'
import RoleBasedGuides from '../components/RoleBasedGuides'
import DocumentationGenerator from '../components/DocumentationGenerator'

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [repository, setRepository] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [documentationData, setDocumentationData] = useState(null)

  const steps = [
    {
      title: 'Connect Repository',
      description: 'Link your GitHub repository',
      icon: Github,
      component: GitHubConnector,
      gradient: 'from-purple-600 to-blue-600'
    },
    {
      title: 'Review Details', 
      description: 'Verify repository analysis',
      icon: Eye,
      component: RepositoryDetails,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      title: 'Choose Role',
      description: 'Select your role for personalized docs',
      icon: Users,
      component: RoleBasedGuides,
      gradient: 'from-cyan-600 to-emerald-600'
    },
    {
      title: 'Generate Docs',
      description: 'Create comprehensive documentation',
      icon: FileText,
      component: DocumentationGenerator,
      gradient: 'from-emerald-600 to-purple-600'
    },
    {
      title: 'Complete',
      description: 'Review your pull request',
      icon: CheckCircle,
      component: null, // We'll handle this inline
      gradient: 'from-purple-600 to-pink-600'
    }
  ]

  const handleRepositoryConnected = (repoData) => {
    setRepository(repoData)
    setCurrentStep(1)
  }

  const handleReviewComplete = () => {
    setCurrentStep(2)
  }

  const handleRoleSelected = (role) => {
    setSelectedRole(role)
    setCurrentStep(3)
  }

  const handleGenerateDocs = () => {
    setCurrentStep(4)
  }

  const handleDocsGenerated = (docsData) => {
    setDocumentationData(docsData)
    setCurrentStep(4) // Move to the final "Complete" step
  }

  const CurrentComponent = steps[currentStep]?.component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="bg-white/60 backdrop-blur-lg border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    DocFlow Lite
                  </h1>
                  <p className="text-sm text-gray-600">AI-Powered Documentation Generator</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-teal-500/10 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-gray-700">AI Powered</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200/50">
                  Beta
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {steps.map((step, index) => (
                <div key={index} className="flex-1 flex flex-col items-center relative">
                  <div className="flex items-center w-full">
                    <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-500 transform ${
                      index <= currentStep 
                        ? 'bg-gradient-to-br from-blue-600 to-teal-600 shadow-xl shadow-blue-500/25 scale-110' 
                        : 'bg-white/80 backdrop-blur-sm border border-gray-300 shadow-sm'
                    } hover:scale-105`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-7 h-7 text-white" />
                      ) : (
                        <step.icon className={`w-7 h-7 ${
                          index <= currentStep ? 'text-white' : 'text-gray-400'
                        }`} />
                      )}
                      {index <= currentStep && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-pulse">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${
                        index < currentStep
                          ? 'bg-gradient-to-r from-blue-600 to-teal-600'
                          : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <h3 className={`font-semibold transition-colors ${
                      index <= currentStep ? 'text-gray-800' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Progress Indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progress: {Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Primary Content */}
            <div className="lg:col-span-3">
              <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-xl p-8">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    {steps[currentStep]?.title}
                  </h2>
                  <p className="text-gray-600 text-lg">{steps[currentStep]?.description}</p>
                </div>

                {currentStep === 0 && (
                  <GitHubConnector onRepositoryConnected={handleRepositoryConnected} />
                )}
                
                {currentStep === 1 && repository && (
                  <div>
                    <RepositoryDetails repository={repository} />
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={handleReviewComplete}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 font-semibold"
                      >
                        Continue to Role Selection →
                      </button>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && repository && (
                  <RoleBasedGuides 
                    repository={repository}
                    documentationData={documentationData}
                    onRoleSelected={handleRoleSelected}
                    selectedRole={selectedRole}
                  />
                )}
                
                {currentStep === 3 && repository && (
                  <DocumentationGenerator 
                    repository={repository}
                    selectedRole={selectedRole}
                    onDocsGenerated={handleDocsGenerated}
                  />
                )}

                {currentStep === 4 && repository && documentationData && (
                  <div className="text-center space-y-8">
                    {/* Success Header */}
                    <div className="space-y-4">
                      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                        <CheckCircle className="w-14 h-14 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                          Documentation Complete!
                        </h2>
                        <p className="text-gray-600 text-lg">
                          Your AI-generated documentation is ready for review
                        </p>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-xl p-6 shadow-lg">
                        <FileText className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-1">Documentation Files</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {documentationData?.pullRequest?.filesCreated?.length || '3+'}
                        </p>
                        <p className="text-sm text-gray-600">AI-generated files</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl p-6 shadow-lg">
                        <Github className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-1">Pull Request</h4>
                        <p className="text-2xl font-bold text-emerald-600">Ready</p>
                        <p className="text-sm text-gray-600">Awaiting your review</p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 rounded-xl p-6 shadow-lg">
                        <Sparkles className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-1">Role-Based</h4>
                        <p className="text-2xl font-bold text-purple-600">
                          {selectedRole === 'backend' ? 'Backend' : 
                           selectedRole === 'frontend' ? 'Frontend' : 
                           selectedRole === 'product-manager' ? 'PM' : 'Custom'}
                        </p>
                        <p className="text-sm text-gray-600">Tailored content</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-800">Next Step: Review Your Pull Request</h3>
                            <p className="text-sm text-gray-600">Check your GitHub repository for the generated documentation</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => window.open(`${repository.html_url}/pulls`, '_blank')}
                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 font-semibold"
                          >
                            <Github className="w-5 h-5" />
                            <span>Check Pull Requests</span>
                          </button>
                          
                          <button
                            onClick={() => window.open(repository.html_url, '_blank')}
                            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
                          >
                            <ExternalLink className="w-5 h-5" />
                            <span>View Repository</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Start Over Button */}
                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => {
                            setCurrentStep(0)
                            setRepository(null)
                            setSelectedRole(null)
                            setDocumentationData(null)
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          ← Start over with a new repository
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Repository Summary */}
              {repository && (
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Code2 className="w-5 h-5 mr-2 text-teal-600" />
                    Repository Summary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Repository</p>
                      <p className="font-medium text-gray-800">{repository.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Language</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 to-teal-500/10 text-blue-700 border border-blue-200/50">
                        {repository.language || 'Not detected'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 border border-emerald-200/50">
                        ✨ Connected
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Help & Tips */}
              <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  Help & Tips
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <Github className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Repository URL</p>
                      <p className="text-gray-600">Use the full GitHub URL (e.g., https://github.com/user/repo)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Documentation</p>
                      <p className="text-gray-600">We'll analyze your code and generate comprehensive docs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Features */}
              <div className="bg-gradient-to-br from-blue-500/10 to-teal-500/10 backdrop-blur-xl border border-blue-200/50 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-teal-600" />
                  AI Features
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
                    <span className="text-gray-700">OpenAPI/Swagger generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                    <span className="text-gray-700">Function documentation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                    <span className="text-gray-700">Dependency analysis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

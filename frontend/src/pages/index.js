import React, { useState } from 'react'
import { Github, FileText, Users, MessageCircle, Eye, BookOpen, CheckCircle } from 'lucide-react'
import GitHubConnector from '../components/GitHubConnector'
import RepositoryDetails from '../components/RepositoryDetails'
import RoleBasedGuides from '../components/RoleBasedGuides'
import DocumentationGenerator from '../components/DocumentationGenerator'
import AIAssistant from '../components/AIAssistant'

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
      component: GitHubConnector
    },
    {
      title: 'Review Details', 
      description: 'Verify repository analysis',
      icon: Eye,
      component: RepositoryDetails
    },
    {
      title: 'Choose Role',
      description: 'Select your role for personalized docs',
      icon: Users,
      component: RoleBasedGuides
    },
    {
      title: 'Generate Docs',
      description: 'Create comprehensive documentation',
      icon: FileText,
      component: DocumentationGenerator
    },
    {
      title: 'AI Assistant',
      description: 'Interactive help and guidance',
      icon: MessageCircle,
      component: AIAssistant
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
  }

  const CurrentComponent = steps[currentStep]?.component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">DocFlow Lite</h1>
                <p className="text-sm text-gray-500">Automated Documentation Generator</p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              Beta
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index <= currentStep 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${
                    index <= currentStep ? 'text-indigo-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-2">
            {currentStep === 0 && (
              <GitHubConnector onRepositoryConnected={handleRepositoryConnected} />
            )}
            
            {currentStep === 1 && repository && (
              <div>
                <RepositoryDetails repository={repository} />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleReviewComplete}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Continue to Role Selection
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
            
            {currentStep === 4 && repository && (
              <AIAssistant 
                repository={repository}
                documentationData={documentationData}
                selectedRole={selectedRole}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Repository Summary */}
            {repository && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Summary</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Repository</p>
                    <p className="font-medium text-gray-900">{repository.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Language</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {repository.language || 'Not detected'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Help & Tips */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Help & Tips</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <Github className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Repository URL</p>
                    <p className="text-gray-600">Use the full GitHub URL (e.g., https://github.com/user/repo)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Documentation</p>
                    <p className="text-gray-600">We'll analyze your code and generate comprehensive docs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">AI Assistant</p>
                    <p className="text-gray-600">Ask questions about your codebase and get instant answers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4">Features</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-indigo-800">OpenAPI/Swagger generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-indigo-800">Function documentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-indigo-800">Dependency analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span className="text-indigo-800">AI-powered assistance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

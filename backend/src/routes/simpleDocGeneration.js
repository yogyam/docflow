const express = require('express');
const { Octokit } = require('@octokit/rest');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

const router = express.Router();

// Initialize services using configuration
const octokit = new Octokit({ auth: config.GITHUB.TOKEN });
const genAI = new GoogleGenerativeAI(config.AI.API_KEY);
const model = genAI.getGenerativeModel({ model: config.AI.MODEL });

// Retry function with exponential backoff for the generation API
async function retryGeminiCall(callFunction, maxRetries = config.AI.MAX_RETRIES) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callFunction();
    } catch (error) {
      console.log(`API attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // If it's a 503 (service unavailable) or rate limit error, retry
      if (error.status === 503 || error.status === 429 || error.message.includes('overloaded')) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * config.AI.RETRY_DELAY_BASE; // Configurable exponential backoff
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // If it's not a retryable error, or we've exhausted retries, throw
      throw error;
    }
  }
}

// Helper function to check if a file is a code file
function isCodeFile(filename) {
  const codeExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php',
    '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml',
    '.vue', '.svelte', '.html', '.css', '.scss', '.less', '.sql', '.sh',
    '.yaml', '.yml', '.json', '.xml', '.md', '.txt', '.env', '.config'
  ];
  
  const importantFiles = [
    'package.json', 'requirements.txt', 'Dockerfile', 'docker-compose.yml',
    'Gemfile', 'pom.xml', 'build.gradle', 'Cargo.toml', 'go.mod', 'setup.py',
    'README.md', 'LICENSE', '.gitignore', 'Makefile', 'CMakeLists.txt'
  ];
  
  return codeExtensions.some(ext => filename.toLowerCase().endsWith(ext)) ||
         importantFiles.some(file => filename.toLowerCase().includes(file.toLowerCase()));
}

// 🎯 WORKING END-TO-END DOCUMENTATION FLOW
router.post('/generate-docs', async (req, res) => {
  try {
    const { repoUrl, role = 'backend' } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const [, owner, repoName] = urlMatch;
    const repo = repoName.replace('.git', '');

    console.log(`Generating documentation for ${owner}/${repo} (role: ${role})`);

    // STEP 1: Get repository data
    const { data: repoInfo } = await octokit.repos.get({ owner, repo });
    const { data: treeData } = await octokit.git.getTree({
      owner, repo, tree_sha: repoInfo.default_branch, recursive: true
    });

    const codeFiles = treeData.tree.filter(item => 
      item.type === 'blob' && isCodeFile(item.path) && item.size < config.GITHUB.MAX_FILE_SIZE
    ).slice(0, config.GITHUB.FILE_LIMIT); // Analyze up to configurable limit

    const fileContents = await Promise.all(
      codeFiles.map(async (file) => {
        try {
          const { data } = await octokit.repos.getContent({ owner, repo, path: file.path });
          return {
            path: file.path,
            content: Buffer.from(data.content, 'base64').toString('utf-8')
          };
        } catch (error) {
          return null;
        }
      })
    );

    const validFiles = fileContents.filter(f => f !== null);
    const codebaseText = validFiles.map(file => 
      `### File: ${file.path}\n\`\`\`\n${file.content.substring(0, 2000)}\n\`\`\`\n`
    ).join('\n');

    // STEP 2: Analyze with Gemini and get structured data
    const analysisPrompt = `Analyze this ${repoInfo.language || 'code'} repository and return ONLY valid JSON in this exact format:
{
  "overview": "Detailed project overview explaining what this does",
  "functions": [{"name": "functionName", "description": "what it does", "importance": "high/medium/low"}],
  "dependencies": ["package1", "package2", "package3"],
  "endpoints": [{"method": "GET", "path": "/api/route", "description": "what it does"}],
  "architecture": "Brief description of how the code is organized",
  "keyFeatures": ["feature1", "feature2", "feature3"],
  "setupSteps": ["step1", "step2", "step3"]
}

Repository: ${repoInfo.name}
Description: ${repoInfo.description || 'No description'}
Language: ${repoInfo.language || 'Unknown'}

Code to analyze:
${codebaseText}`;

    console.log('🔍 Step 1: Analyzing repository with Gemini (with retry logic)...');
    const analysisResult = await retryGeminiCall(async () => {
      return await model.generateContent(analysisPrompt);
    });
    const analysisText = analysisResult.response.text();

    let repoAnalysis;
    try {
      const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      repoAnalysis = JSON.parse(cleanJson);
      console.log('✅ Step 1 SUCCESS: Repository analysis complete');
    } catch (parseError) {
      console.log('❌ Step 1 FAILED: JSON parsing error');
      return res.status(500).json({
        error: 'Failed to parse repository analysis',
        details: parseError.message,
        rawResponse: analysisText.substring(0, 500)
      });
    }

    // STEP 3: Generate role-specific documentation
    const docPrompt = `Create comprehensive markdown documentation for the ${repoInfo.name} repository specifically tailored for ${role.toUpperCase()} developers.

REPOSITORY ANALYSIS:
- Overview: ${repoAnalysis.overview}
- Key Features: ${(repoAnalysis.keyFeatures || []).join(', ')}
- Functions: ${(repoAnalysis.functions || []).length} analyzed
- Dependencies: ${(repoAnalysis.dependencies || []).join(', ')}
- Architecture: ${repoAnalysis.architecture}

TARGET AUDIENCE: ${role.toUpperCase()} DEVELOPERS

Create detailed markdown documentation with these sections:

# ${repoInfo.name} - ${role.charAt(0).toUpperCase() + role.slice(1)} Developer Guide

## 🎯 Project Overview
[Explain what this project does from a ${role} perspective]

## 🚀 Quick Start for ${role.charAt(0).toUpperCase() + role.slice(1)}s
[Step-by-step setup guide tailored for ${role} developers]

## 🏗️ Architecture Overview  
[System architecture relevant to ${role} work]

## 🔧 Key Components
[Most important parts for ${role} developers to understand]

## 📦 Dependencies & Tools
[Dependencies that ${role} developers need to know about]

## 🛠️ Development Workflow
[How ${role} developers should work with this codebase]

## 🧪 Testing & Debugging
[Testing approaches for ${role} developers]

## 📚 Additional Resources
[Links and resources for ${role} developers]

Make it practical, actionable, and specific to ${role} development needs. Include code examples where helpful.`;

    console.log('🔍 Step 2: Generating role-specific documentation (with retry logic)...');
    const docResult = await retryGeminiCall(async () => {
      return await model.generateContent(docPrompt);
    });
    const documentation = docResult.response.text();
    
    console.log('✅ Step 2 SUCCESS: Documentation generated');

    // STEP 4: Create pull request with the documentation
    const branchName = `docs/ai-generated-${role}-${Date.now()}`;
    
    try {
      // Get main branch SHA
      const { data: mainBranch } = await octokit.rest.repos.getBranch({
        owner, repo, branch: 'main'
      });

      // Create new branch
      await octokit.rest.git.createRef({
        owner, repo,
        ref: `refs/heads/${branchName}`,
        sha: mainBranch.commit.sha
      });

      // Create documentation files
      const files = [
        {
          path: `docs/${role}-guide.md`,
          content: documentation,
          message: `Add ${role} developer guide generated by AI`
        },
        {
          path: 'docs/README.md',
          content: `# ${repoInfo.name} Documentation\n\n## Available Guides\n\n- [${role.charAt(0).toUpperCase() + role.slice(1)} Guide](${role}-guide.md) - Generated for ${role} developers\n\nGenerated by AI on ${new Date().toISOString().split('T')[0]}`,
          message: `Add documentation index`
        }
      ];

      for (const file of files) {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner, repo,
          path: file.path,
          message: file.message,
          content: Buffer.from(file.content).toString('base64'),
          branch: branchName
        });
      }

      // Create pull request
      const prTitle = `📚 AI-Generated ${role.charAt(0).toUpperCase() + role.slice(1)} Documentation`;
      const prBody = `# 🤖 AI-Generated Documentation

## What's New
This PR adds comprehensive documentation tailored specifically for **${role} developers**.

## 📁 Files Added
- \`docs/${role}-guide.md\` - Complete guide for ${role} developers
- \`docs/README.md\` - Documentation index

## 🎯 Target Audience
**${role.charAt(0).toUpperCase() + role.slice(1)} developers** looking to:
- Understand the project architecture
- Get started quickly
- Learn development workflows
- Find relevant tools and dependencies

## 🧠 AI Analysis Results
- **Functions Analyzed**: ${(repoAnalysis.functions || []).length}
- **Dependencies Found**: ${(repoAnalysis.dependencies || []).length}
- **Key Features**: ${(repoAnalysis.keyFeatures || []).slice(0, config.DOCS.MAX_FEATURES_COUNT).join(', ')}

## 🔍 Next Steps
1. Review the generated documentation
2. Edit/customize as needed for your project
3. Merge when satisfied with the content

*Generated using Gemini AI analysis of your ${repoInfo.language || 'code'} repository.*`;

      const { data: pullRequest } = await octokit.rest.pulls.create({
        owner, repo,
        title: prTitle,
        head: branchName,
        base: 'main',
        body: prBody,
        maintainer_can_modify: true
      });

      console.log('✅ Step 3 SUCCESS: Pull request created');

      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        role: role,
        pullRequest: {
          id: pullRequest.id,
          number: pullRequest.number,
          url: pullRequest.html_url,
          title: prTitle,
          branch: branchName,
          filesCreated: files.map(f => f.path)
        },
        analysis: {
          functionsCount: (repoAnalysis.functions || []).length,
          dependenciesCount: (repoAnalysis.dependencies || []).length,
          featuresCount: (repoAnalysis.keyFeatures || []).length,
          documentationLength: documentation.length
        },
        documentationPreview: documentation.substring(0, 500) + '...'
      });

    } catch (prError) {
      console.error('❌ Step 3 FAILED: Pull request creation error', prError.message);
      
      // Return documentation even if PR fails
      res.json({
        success: true,
        repository: `${owner}/${repo}`,
        role: role,
        pullRequest: {
          error: 'Could not create pull request: ' + prError.message,
          reason: 'Possibly due to permissions or repository access'
        },
        analysis: {
          functionsCount: (repoAnalysis.functions || []).length,
          dependenciesCount: (repoAnalysis.dependencies || []).length,
          featuresCount: (repoAnalysis.keyFeatures || []).length,
          documentationLength: documentation.length
        },
        documentationGenerated: documentation,
        note: 'Documentation was generated successfully but could not create pull request'
      });
    }

  } catch (error) {
    console.error('🚀 Complete documentation generation failed:', error);
    
    // Provide specific error messages for different scenarios
    let errorMessage = 'Documentation generation failed';
    let retryAdvice = '';
    
    if (error.status === 503 || error.message.includes('overloaded')) {
      errorMessage = 'Gemini AI service is temporarily overloaded';
      retryAdvice = 'Please try again in a few moments. The service is experiencing high traffic.';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded';
      retryAdvice = 'Too many requests. Please wait a minute before trying again.';
    } else if (error.message.includes('JSON')) {
      errorMessage = 'Failed to parse AI response';
      retryAdvice = 'This is usually temporary. Please try again.';
    }
    
    res.status(500).json({
      error: errorMessage,
      details: error.message,
      retryAdvice: retryAdvice,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;

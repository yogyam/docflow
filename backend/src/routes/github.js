const express = require('express');
const { Octokit } = require('@octokit/rest');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize services
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// 🤖 Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 🔥 Parse Copilot Analysis to Extract Structured Data
function parseAnalysisToStructuredData(analysisText) {
  console.log('🔍 Parsing analysis to extract structured data...');
  
  const result = {
    endpoints: [],
    functions: [],
    dependencies: [],
    overview: ''
  };

  // Split into sections
  const sections = analysisText.split('##');
  
  sections.forEach(section => {
    const content = section.trim();
    
    // 📊 Extract Overview
    if (content.toLowerCase().includes('overview')) {
      const lines = content.split('\n').slice(1); // Skip header
      result.overview = lines.join(' ').trim();
    }
    
    // 🔗 Extract API Endpoints
    if (content.toLowerCase().includes('api endpoints') || content.toLowerCase().includes('endpoints')) {
      const lines = content.split('\n');
      lines.forEach(line => {
        // Look for patterns like "GET /api/users" or "POST /auth/login"
        const endpointMatch = line.match(/(GET|POST|PUT|DELETE|PATCH)\s+([^\s]+)/i);
        if (endpointMatch) {
          result.endpoints.push({
            method: endpointMatch[1].toUpperCase(),
            path: endpointMatch[2],
            description: line.replace(endpointMatch[0], '').trim()
          });
        }
        
        // Also look for route definitions like "/api/users"
        const routeMatch = line.match(/["`']([\/\w\-\:]+)["`']/);
        if (routeMatch && routeMatch[1].startsWith('/')) {
          result.endpoints.push({
            method: 'UNKNOWN',
            path: routeMatch[1],
            description: line.trim()
          });
        }
      });
    }
    
    // ⚙️ Extract Functions
    if (content.toLowerCase().includes('functions') || content.toLowerCase().includes('methods')) {
      const lines = content.split('\n');
      lines.forEach(line => {
        // Look for function patterns
        const funcMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
        if (funcMatch && !line.includes('##')) {
          result.functions.push({
            name: funcMatch[1],
            description: line.trim()
          });
        }
      });
    }
    
    // 📦 Extract Dependencies
    if (content.toLowerCase().includes('dependencies')) {
      const lines = content.split('\n');
      lines.forEach(line => {
        // Look for package names in various formats
        const depMatches = [
          line.match(/[-`"']([a-zA-Z0-9\-_@\/]+)[-`"']/g), // npm packages in quotes
          line.match(/^\s*[\*\-]\s+([a-zA-Z0-9\-_@\/]+)/), // bullet points (* numpy, - numpy)
          line.match(/(\w+)==?[\d\.]+/), // Python packages with versions
          line.match(/\*\s*([a-zA-Z0-9\-_@\/]+)/), // * package format from Gemini
          line.match(/^\s*([a-zA-Z0-9\-_@\/]+)\s*$/), // standalone package names
        ];
        
        depMatches.forEach(matches => {
          if (matches) {
            if (Array.isArray(matches)) {
              matches.forEach(match => {
                const clean = match.replace(/[-`"'*\s]/g, '');
                if (clean.length > 1 && clean !== 'Dependencies') result.dependencies.push(clean);
              });
            } else {
              const clean = matches[1];
              if (clean && clean.length > 1 && clean !== 'Dependencies') {
                result.dependencies.push(clean);
              }
            }
          }
        });
      });
    }
  });
  
  // Remove duplicates
  result.endpoints = result.endpoints.filter((endpoint, index, self) => 
    index === self.findIndex(e => e.method === endpoint.method && e.path === endpoint.path)
  );
  result.functions = [...new Set(result.functions.map(f => f.name))].map(name => 
    result.functions.find(f => f.name === name)
  );
  result.dependencies = [...new Set(result.dependencies)];
  
  console.log(`✅ Parsed: ${result.endpoints.length} endpoints, ${result.functions.length} functions, ${result.dependencies.length} dependencies`);
  
  return result;
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

// 🎯 MAIN ANALYSIS ENDPOINT - This is where the magic happens!
router.post('/analyze', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    // Parse GitHub URL
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const [, owner, repoName] = urlMatch;
    const repo = repoName.replace('.git', '');

    console.log(`🔍 Analyzing ${owner}/${repo}...`);

    // Get repository info
    const { data: repoInfo } = await octokit.repos.get({ owner, repo });
    
    // Get file tree recursively
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: repoInfo.default_branch,
      recursive: true
    });

    // Filter for code files only
    const codeFiles = treeData.tree.filter(item => 
      item.type === 'blob' && 
      isCodeFile(item.path) &&
      item.size < 50000 // Skip very large files
    );

    console.log(`📁 Found ${codeFiles.length} code files`);

    // Limit to first 30 files to avoid token limits
    const filesToAnalyze = codeFiles.slice(0, 30);
    
    // Get file contents
    const fileContents = await Promise.all(
      filesToAnalyze.map(async (file) => {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
          });
          
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
    
    // Prepare codebase for Gemini
    const codebaseText = validFiles.map(file => 
      `### File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`
    ).join('\n');
    
    console.log(`📊 Sending ${validFiles.length} files to Gemini...`);

    // 🤖 GEMINI ANALYZES EVERYTHING - Return structured JSON instead of markdown
    const prompt = `You are an expert code analysis AI. Analyze this codebase and return a structured JSON response.

ANALYZE:
1. **API Endpoints** - Find ALL REST endpoints, routes, GraphQL queries, webhooks, etc.
2. **Functions** - List important functions/methods with brief descriptions  
3. **Dependencies** - Extract ALL dependencies from package.json, requirements.txt, etc.

Repository: ${repoInfo.name} (${repoInfo.language})
Description: ${repoInfo.description || 'No description'}

Analyze this codebase:

${codebaseText}

Return ONLY valid JSON in this exact format:
{
  "overview": "Brief project overview",
  "endpoints": [
    {"method": "GET", "path": "/api/users", "description": "Get all users"},
    {"method": "POST", "path": "/api/users", "description": "Create new user"}
  ],
  "functions": [
    {"name": "getUserById", "description": "Fetches user by ID from database"},
    {"name": "validateEmail", "description": "Validates email format"}
  ],
  "dependencies": ["express", "mongoose", "jsonwebtoken", "bcryptjs"],
  "architecture": "Brief architecture summary"
}`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();
    
    console.log(`✅ Gemini analysis complete! Generated ${analysis.length} characters`);

    // 🧪 TEST: Log raw Gemini output to see what we're getting
    console.log('\n🧪 === GEMINI RAW OUTPUT TEST ===');
    console.log('Raw analysis (first 500 chars):', analysis.substring(0, 500));
    console.log('Raw analysis (last 200 chars):', analysis.substring(analysis.length - 200));
    console.log('=== END RAW OUTPUT ===\n');

    // Try to parse as JSON first (smart approach), fallback to regex parsing (stupid approach)
    let parsedData;
    try {
      // Remove any markdown code blocks if present
      const cleanJson = analysis.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
      console.log('✅ Successfully parsed JSON response from Gemini (SMART METHOD)');
      console.log('🧪 JSON STRUCTURE TEST:', {
        hasOverview: !!parsedData.overview,
        endpointsCount: parsedData.endpoints?.length || 0,
        functionsCount: parsedData.functions?.length || 0,
        dependenciesCount: parsedData.dependencies?.length || 0,
        hasArchitecture: !!parsedData.architecture
      });
      
      // Ensure we have the required structure
      parsedData = {
        endpoints: parsedData.endpoints || [],
        functions: parsedData.functions || [],
        dependencies: parsedData.dependencies || [],
        overview: parsedData.overview || parsedData.architecture || ''
      };
      
    } catch (parseError) {
      console.log('⚠️  Failed to parse JSON, falling back to regex parsing (DUMB METHOD)...');
      console.log('Parse error:', parseError.message);
      console.log('🧪 Failed JSON sample:', analysis.substring(0, 200));
      
      // Fallback to the old stupid method
      parsedData = parseAnalysisToStructuredData(analysis);
    }
    
    console.log(`📊 Parsed: ${parsedData.endpoints.length} endpoints, ${parsedData.functions.length} functions, ${parsedData.dependencies.length} dependencies`);

    res.json({
      success: true,
      repository: {
        name: repoInfo.name,
        description: repoInfo.description,
        language: repoInfo.language,
        stars: repoInfo.stargazers_count,
        url: repoInfo.html_url,
        owner,
        repo,
        // 🎯 ADD THE PARSED METADATA HERE
        metadata: {
          endpoints: parsedData.endpoints,
          functions: parsedData.functions,
          dependencies: parsedData.dependencies,
          overview: parsedData.overview
        }
      },
      analysis,  // Keep raw markdown too
      stats: {
        totalFiles: codeFiles.length,
        analyzedFiles: validFiles.length,
        parsedEndpoints: parsedData.endpoints.length,
        parsedFunctions: parsedData.functions.length,
        parsedDependencies: parsedData.dependencies.length
      }
    });

  } catch (error) {
    console.error('❌ Error in Gemini analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze repository',
      details: error.message 
    });
  }
});

// 🧪 TEST ENDPOINT: Analyze what Gemini actually returns
router.post('/test-gemini-analysis', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required for testing' });
    }

    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const [, owner, repoName] = urlMatch;
    const repo = repoName.replace('.git', '');

    console.log(`🧪 TESTING Gemini analysis for ${owner}/${repo}...`);

    // Get repository info
    const { data: repoInfo } = await octokit.repos.get({ owner, repo });
    
    // Get just a few files for testing
    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: repoInfo.default_branch,
      recursive: true
    });

    const codeFiles = treeData.tree.filter(item => 
      item.type === 'blob' && 
      isCodeFile(item.path) &&
      item.size < 50000
    ).slice(0, 5); // Just 5 files for testing

    const fileContents = await Promise.all(
      codeFiles.map(async (file) => {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: file.path,
          });
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
      `### File: ${file.path}\n\`\`\`\n${file.content.substring(0, 1000)}\n\`\`\`\n`
    ).join('\n');

    // Test different prompts to see which works better
    const testPrompts = [
      {
        name: 'JSON_STRUCTURED',
        prompt: `Analyze this codebase and return ONLY valid JSON in this exact format:
{
  "overview": "Brief project overview",
  "endpoints": [{"method": "GET", "path": "/api/users", "description": "Get users"}],
  "functions": [{"name": "getUserById", "description": "Gets user by ID"}],
  "dependencies": ["express", "mongoose"],
  "architecture": "Brief architecture summary"
}

Codebase to analyze:
${codebaseText}`
      },
      {
        name: 'MARKDOWN_FORMAT', 
        prompt: `Analyze this codebase and create a markdown report:

## Overview
[Project overview]

## API Endpoints  
- GET /api/users - Get users

## Functions
- getUserById() - Gets user by ID

## Dependencies
- express
- mongoose

Codebase:
${codebaseText}`
      }
    ];

    const results = {};

    for (const testPrompt of testPrompts) {
      console.log(`🧪 Testing prompt: ${testPrompt.name}`);
      
      try {
        const result = await model.generateContent(testPrompt.prompt);
        const response = result.response.text();
        
        results[testPrompt.name] = {
          rawResponse: response,
          responseLength: response.length,
          canParseAsJSON: false,
          parsedData: null,
          error: null
        };

        // Try to parse as JSON
        if (testPrompt.name === 'JSON_STRUCTURED') {
          try {
            const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            results[testPrompt.name].canParseAsJSON = true;
            results[testPrompt.name].parsedData = {
              hasOverview: !!parsed.overview,
              endpointsCount: parsed.endpoints?.length || 0,
              functionsCount: parsed.functions?.length || 0,
              dependenciesCount: parsed.dependencies?.length || 0,
              sampleEndpoint: parsed.endpoints?.[0],
              sampleFunction: parsed.functions?.[0],
              sampleDependencies: parsed.dependencies?.slice(0, 3)
            };
          } catch (jsonError) {
            results[testPrompt.name].error = jsonError.message;
          }
        }

      } catch (error) {
        results[testPrompt.name] = {
          error: error.message,
          failed: true
        };
      }
    }

    res.json({
      success: true,
      repository: `${owner}/${repo}`,
      filesAnalyzed: validFiles.length,
      testResults: results,
      recommendation: results.JSON_STRUCTURED?.canParseAsJSON ? 
        'Use JSON_STRUCTURED prompt - it works!' : 
        'JSON parsing failed, stick with markdown parsing'
    });

  } catch (error) {
    console.error('🧪 Test failed:', error);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
});

// � END-TO-END FLOW TEST: Complete documentation generation test
router.post('/test-complete-flow', async (req, res) => {
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

    console.log(`🚀 TESTING COMPLETE FLOW for ${owner}/${repo} with role: ${role}`);

    // STEP 1: Get repository analysis (we know this works)
    const { data: repoInfo } = await octokit.repos.get({ owner, repo });
    const { data: treeData } = await octokit.git.getTree({
      owner, repo, tree_sha: repoInfo.default_branch, recursive: true
    });

    const codeFiles = treeData.tree.filter(item => 
      item.type === 'blob' && isCodeFile(item.path) && item.size < 50000
    ).slice(0, 5);

    const fileContents = await Promise.all(
      codeFiles.map(async (file) => {
        try {
          const { data } = await octokit.repos.getContent({ owner, repo, path: file.path });
          return {
            path: file.path,
            content: Buffer.from(data.content, 'base64').toString('utf-8').substring(0, 1000)
          };
        } catch (error) {
          return null;
        }
      })
    );

    const validFiles = fileContents.filter(f => f !== null);
    const codebaseText = validFiles.map(file => 
      `### File: ${file.path}\n\`\`\`\n${file.content}\n\`\`\`\n`
    ).join('\n');

    // STEP 2: Get JSON analysis from Gemini
    const analysisPrompt = `Analyze this codebase and return ONLY valid JSON:
{
  "overview": "Brief project overview",
  "endpoints": [{"method": "GET", "path": "/api/users", "description": "Get users"}],
  "functions": [{"name": "getUserById", "description": "Gets user by ID"}],
  "dependencies": ["express", "mongoose"],
  "architecture": "Brief architecture summary"
}

Codebase:
${codebaseText}`;

    console.log('🔍 Step 1: Getting JSON analysis from Gemini...');
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();

    let structuredData;
    try {
      const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      structuredData = JSON.parse(cleanJson);
      console.log('✅ Step 1 SUCCESS: JSON parsed successfully');
    } catch (parseError) {
      console.log('❌ Step 1 FAILED: Could not parse JSON');
      return res.json({ 
        success: false, 
        step: 1, 
        error: 'JSON parsing failed', 
        rawResponse: analysisText.substring(0, 500) 
      });
    }

    // STEP 3: Transform JSON into role-specific markdown
    const markdownPrompt = `You are a documentation generator. Based on this analysis of ${repoInfo.name}:

ANALYSIS DATA:
- Overview: ${structuredData.overview}
- Functions: ${structuredData.functions?.length || 0} found
- Dependencies: ${(structuredData.dependencies || []).join(', ')}
- Endpoints: ${structuredData.endpoints?.length || 0} found

Create comprehensive markdown documentation specifically for a ${role.toUpperCase()} developer.

Structure it as:
# ${repoInfo.name} - ${role.charAt(0).toUpperCase() + role.slice(1)} Guide

## Overview
[Project overview tailored for ${role}s]

## For ${role.charAt(0).toUpperCase() + role.slice(1)} Developers

### Quick Start
[Step-by-step setup for ${role}s]

### Key Components
[Most relevant parts for ${role} work]

### Dependencies
[Dependencies that matter to ${role}s]

## Next Steps
[What ${role}s should do next]

Make it practical and actionable for someone in the ${role} role.`;

    console.log('🔍 Step 2: Generating role-specific markdown...');
    const markdownResult = await model.generateContent(markdownPrompt);
    const markdownContent = markdownResult.response.text();

    console.log('✅ Step 2 SUCCESS: Markdown generated');

    // STEP 4: Simulate creating pull request (don't actually create it for testing)
    const pullRequestData = {
      title: `📚 AI-Generated Documentation (${role} perspective)`,
      body: `# 🤖 AI-Generated Documentation\n\nThis pull request adds documentation generated specifically for **${role}** developers.`,
      files: [
        {
          path: 'docs/README.md',
          content: markdownContent.substring(0, 500) + '\n\n[Content truncated for testing...]'
        }
      ]
    };

    console.log('✅ Step 3 SUCCESS: Pull request data prepared');

    // Return complete flow results
    res.json({
      success: true,
      repository: `${owner}/${repo}`,
      role: role,
      flowResults: {
        step1_analysis: {
          success: true,
          dataQuality: {
            hasOverview: !!structuredData.overview,
            functionsCount: structuredData.functions?.length || 0,
            dependenciesCount: structuredData.dependencies?.length || 0,
            endpointsCount: structuredData.endpoints?.length || 0
          }
        },
        step2_markdown: {
          success: true,
          contentLength: markdownContent.length,
          previewContent: markdownContent.substring(0, 300) + '...'
        },
        step3_pullRequest: {
          success: true,
          title: pullRequestData.title,
          filesCount: pullRequestData.files.length,
          note: 'Pull request prepared but not created (test mode)'
        }
      },
      recommendation: 'All steps working! Ready for production flow.'
    });

  } catch (error) {
    console.error('🚀 Complete flow test failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Complete flow test failed',
      details: error.message 
    });
  }
});

// �🔗 Simple connection validation endpoint
router.post('/connect', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    console.log(`🔗 Validating GitHub URL: ${repoUrl}`);

    // Parse GitHub URL
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const [, owner, repoName] = urlMatch;
    const repo = repoName.replace('.git', '');

    // Test connection by getting basic repo info
    const { data: repoInfo } = await octokit.repos.get({ owner, repo });

    res.json({
      success: true,
      repository: {
        name: repoInfo.name,
        description: repoInfo.description,
        language: repoInfo.language,
        stars: repoInfo.stargazers_count,
        url: repoInfo.html_url,
        owner,
        repo
      }
    });

  } catch (error) {
    console.error('❌ Error connecting to repository:', error);
    
    if (error.status === 404) {
      res.status(404).json({ error: 'Repository not found or not accessible' });
    } else if (error.status === 401) {
      res.status(401).json({ error: 'GitHub authentication failed' });
    } else {
      res.status(500).json({ 
        error: 'Failed to connect to repository',
        details: error.message 
      });
    }
  }
});

module.exports = router;

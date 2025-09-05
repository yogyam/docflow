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

// � **CODE-SPECIFIC FILE FILTERS**
const CODE_EXTENSIONS = {
  // Source code files
  source: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj', '.hs', '.ml'],
  // Web files
  web: ['.vue', '.svelte', '.html', '.css', '.scss', '.less'],
  // Config files (critical)
  config: ['package.json', 'requirements.txt', 'pom.xml', 'build.gradle', 'Cargo.toml', 'go.mod', 'setup.py', '.env.example', 'docker-compose.yml', 'Dockerfile'],
  // Data files
  data: ['.sql', '.json', '.yaml', '.yml', '.xml'],
  // Scripts
  scripts: ['.sh', '.bat', '.ps1', 'Makefile', 'CMakeLists.txt']
};

const SKIP_EXTENSIONS = ['.md', '.txt', '.log', '.lock', '.png', '.jpg', '.gif', '.svg', '.ico', '.woff', '.ttf'];

// 🎯 **ROLE-SPECIFIC ANALYSIS PROMPTS**
const ROLE_PROMPTS = {
  backend: {
    focus: "API endpoints, database schemas, authentication, server architecture, dependencies, security patterns",
    questions: "What APIs does this expose? How is data stored? What authentication is used? What are the main server-side patterns?"
  },
  frontend: {
    focus: "UI components, state management, routing, API integrations, styling patterns, build setup",
    questions: "What UI framework is used? How is state managed? What APIs does it consume? How is styling organized?"
  },
  devops: {
    focus: "Infrastructure, deployment configs, CI/CD, containerization, monitoring, scalability patterns",
    questions: "How is this deployed? What infrastructure is needed? Are there containers? What monitoring exists?"
  },
  security: {
    focus: "Authentication, authorization, data validation, encryption, security vulnerabilities, access controls",
    questions: "What security measures are implemented? Are there potential vulnerabilities? How is data protected?"
  },
  data: {
    focus: "Data models, ETL pipelines, analytics, database design, data flows, processing patterns",
    questions: "How is data structured? What processing happens? Are there analytics or ETL pipelines?"
  },
  mobile: {
    focus: "Mobile frameworks, platform-specific code, API integrations, offline capabilities, performance",
    questions: "What mobile platform? How does it handle offline? What APIs does it use? Performance considerations?"
  }
};

// 🔍 **SMART FILE ANALYZER**
function analyzeFileStructure(files) {
  const analysis = {
    sourceFiles: [],
    configFiles: [],
    testFiles: [],
    totalLOC: 0,
    languages: {},
    dependencies: new Set(),
    endpoints: [],
    functions: []
  };

  files.forEach(file => {
    const fileName = file.path.toLowerCase();
    const extension = '.' + fileName.split('.').pop();
    
    // Skip non-code files
    if (SKIP_EXTENSIONS.some(ext => fileName.includes(ext))) return;
    
    // Categorize files
    if (CODE_EXTENSIONS.source.includes(extension) || CODE_EXTENSIONS.web.includes(extension)) {
      analysis.sourceFiles.push(file);
      
      // Count language usage
      const lang = getLanguageFromExtension(extension);
      analysis.languages[lang] = (analysis.languages[lang] || 0) + 1;
      
      // Estimate LOC (rough estimate: 1 char = ~0.02 lines)
      if (file.content) {
        analysis.totalLOC += Math.ceil(file.content.length / 50);
      }
    }
    
    // Test files
    if (fileName.includes('test') || fileName.includes('spec') || fileName.includes('__test__')) {
      analysis.testFiles.push(file);
    }
    
    // Config files
    if (CODE_EXTENSIONS.config.some(config => fileName.includes(config.toLowerCase()))) {
      analysis.configFiles.push(file);
      
      // Extract dependencies
      if (fileName.includes('package.json') && file.content) {
        const deps = extractDependenciesFromPackageJson(file.content);
        deps.forEach(dep => analysis.dependencies.add(dep));
      }
      if (fileName.includes('requirements.txt') && file.content) {
        const deps = extractDependenciesFromRequirements(file.content);
        deps.forEach(dep => analysis.dependencies.add(dep));
      }
    }
    
    // Extract endpoints and functions from source files
    if (file.content && CODE_EXTENSIONS.source.includes(extension)) {
      const endpoints = extractEndpoints(file.content, fileName);
      analysis.endpoints.push(...endpoints);
      
      const functions = extractFunctions(file.content, extension);
      analysis.functions.push(...functions);
    }
  });

  return analysis;
}

// 🗣️ **LANGUAGE DETECTION**
function getLanguageFromExtension(ext) {
  const langMap = {
    '.js': 'JavaScript', '.ts': 'TypeScript', '.jsx': 'React', '.tsx': 'React/TypeScript',
    '.py': 'Python', '.java': 'Java', '.cpp': 'C++', '.c': 'C', '.cs': 'C#',
    '.php': 'PHP', '.rb': 'Ruby', '.go': 'Go', '.rs': 'Rust', '.swift': 'Swift',
    '.kt': 'Kotlin', '.scala': 'Scala', '.vue': 'Vue.js', '.svelte': 'Svelte'
  };
  return langMap[ext] || ext.replace('.', '').toUpperCase();
}

// 📦 **DEPENDENCY EXTRACTORS**
function extractDependenciesFromPackageJson(content) {
  try {
    const pkg = JSON.parse(content);
    const deps = [];
    if (pkg.dependencies) deps.push(...Object.keys(pkg.dependencies));
    if (pkg.devDependencies) deps.push(...Object.keys(pkg.devDependencies));
    return deps;
  } catch (e) {
    return [];
  }
}

function extractDependenciesFromRequirements(content) {
  return content.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('==')[0].split('>=')[0].split('~=')[0].trim())
    .filter(dep => dep);
}

// 🔗 **ENDPOINT EXTRACTION**
function extractEndpoints(content, fileName) {
  const endpoints = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Express.js patterns
    const expressMatch = line.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/i);
    if (expressMatch) {
      endpoints.push({
        method: expressMatch[1].toUpperCase(),
        path: expressMatch[2],
        file: fileName,
        line: index + 1
      });
    }
    
    // Flask/FastAPI patterns
    const flaskMatch = line.match(/@app\.(route|get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/i);
    if (flaskMatch) {
      endpoints.push({
        method: flaskMatch[1] === 'route' ? 'GET' : flaskMatch[1].toUpperCase(),
        path: flaskMatch[2],
        file: fileName,
        line: index + 1
      });
    }
    
    // GraphQL patterns
    if (line.includes('type Query') || line.includes('type Mutation')) {
      endpoints.push({
        method: 'GRAPHQL',
        path: line.trim(),
        file: fileName,
        line: index + 1
      });
    }
  });
  
  return endpoints;
}

// 🔍 **KEYWORD FILTER** - Skip programming language keywords
function isKeyword(word) {
  const keywords = [
    'if', 'else', 'for', 'while', 'return', 'import', 'export', 'const', 'let', 'var', 
    'class', 'interface', 'function', 'def', 'async', 'await', 'try', 'catch', 'throw',
    'new', 'this', 'super', 'static', 'public', 'private', 'protected', 'abstract',
    'extends', 'implements', 'package', 'module', 'namespace', 'type', 'enum'
  ];
  return keywords.includes(word.toLowerCase());
}

// ⚡ **FUNCTION EXTRACTION**
function extractFunctions(content, extension) {
  const functions = [];
  const lines = content.split('\n');
  
  // JavaScript/TypeScript patterns
  if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
    lines.forEach((line, index) => {
      // Function declarations
      const funcMatch = line.match(/(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*[=\(]/);
      if (funcMatch && !isKeyword(funcMatch[1])) {
        functions.push({
          name: funcMatch[1],
          file: extension,
          line: index + 1,
          type: 'function'
        });
      }
      
      // Arrow functions
      const arrowMatch = line.match(/(?:const\s+|let\s+|var\s+)(\w+)\s*=\s*\([^)]*\)\s*=>/);
      if (arrowMatch && !isKeyword(arrowMatch[1])) {
        functions.push({
          name: arrowMatch[1],
          file: extension,
          line: index + 1,
          type: 'arrow_function'
        });
      }
    });
  }
  
  // Python patterns
  if (extension === '.py') {
    lines.forEach((line, index) => {
      const funcMatch = line.match(/def\s+(\w+)\s*\(/);
      if (funcMatch && !isKeyword(funcMatch[1])) {
        functions.push({
          name: funcMatch[1],
          file: extension,
          line: index + 1,
          type: 'function'
        });
      }
    });
  }
  
  return functions;
}

// 🗂️  **FILE CATEGORIZATION** - Smart file organization
function categorizeFiles(treeFiles) {
  const categories = {
    config: [],
    source: [],
    tests: [],
    docs: [],
    assets: [],
    build: []
  };
  
  treeFiles.forEach(file => {
    if (file.type !== 'blob') return;
    
    const path = file.path.toLowerCase();
    const fileName = path.split('/').pop();
    
    // Configuration files
    if (CODE_EXTENSIONS.config.some(config => fileName.includes(config.toLowerCase())) || 
        path.includes('.env') || fileName.includes('config')) {
      categories.config.push(file.path);
    }
    // Test files
    else if (path.includes('test') || path.includes('spec') || path.includes('__test__')) {
      categories.tests.push(file.path);
    }
    // Documentation
    else if (fileName.endsWith('.md') || path.includes('doc') || fileName.includes('readme')) {
      categories.docs.push(file.path);
    }
    // Build/deployment files
    else if (path.includes('build') || path.includes('dist') || path.includes('.next') || 
             fileName.includes('dockerfile') || fileName.includes('deploy')) {
      categories.build.push(file.path);
    }
    // Asset files
    else if (SKIP_EXTENSIONS.some(ext => fileName.endsWith(ext))) {
      categories.assets.push(file.path);
    }
    // Source code files
    else if (CODE_EXTENSIONS.source.some(ext => fileName.endsWith(ext)) ||
             CODE_EXTENSIONS.web.some(ext => fileName.endsWith(ext)) ||
             CODE_EXTENSIONS.data.some(ext => fileName.endsWith(ext))) {
      categories.source.push(file.path);
    }
  });
  
  return categories;
}

// 📁 **GET FILE CONTENTS** - Efficiently fetch multiple files
async function getFileContents(filePaths, owner, repo) {
  const contents = await Promise.all(
    filePaths.map(async (path) => {
      try {
        const { data } = await octokit.repos.getContent({ owner, repo, path });
        return {
          path,
          content: Buffer.from(data.content, 'base64').toString('utf-8'),
          size: data.size
        };
      } catch (error) {
        console.log(`⚠️  Failed to fetch ${path}:`, error.message);
        return null;
      }
    })
  );
  
  return contents.filter(f => f !== null);
}

// 🔍 **ARCHITECTURAL FILE IDENTIFICATION** - Find key system files
function identifyArchitecturalFiles(sourceFiles) {
  const architectural = [];
  const priorities = [
    // Main entry points
    /^(index|main|app|server)\.(js|ts|py)$/i,
    /^src\/(index|main|app|server)\.(js|ts|py)$/i,
    // Route/controller files  
    /route|router|controller|handler/i,
    // Service/business logic files
    /service|manager|util|helper/i,
    // Configuration and setup
    /config|setup|init/i,
    // Database/models
    /model|schema|database|db/i
  ];
  
  // Sort by architectural importance
  sourceFiles.forEach(filePath => {
    const fileName = filePath.split('/').pop().toLowerCase();
    const fullPath = filePath.toLowerCase();
    
    for (let i = 0; i < priorities.length; i++) {
      if (priorities[i].test(fileName) || priorities[i].test(fullPath)) {
        architectural.push({ path: filePath, priority: i });
        break;
      }
    }
  });
  
  // Add remaining files with lower priority
  sourceFiles.forEach(filePath => {
    if (!architectural.find(f => f.path === filePath)) {
      architectural.push({ path: filePath, priority: 999 });
    }
  });
  
  return architectural
    .sort((a, b) => a.priority - b.priority)
    .map(f => f.path);
}

// 🎯 **HIERARCHICAL CODE-SPECIFIC ANALYZE ENDPOINT** - Progressive understanding with dependency mapping
router.post('/analyze', async (req, res) => {
  try {
    const { repoUrl, role = 'backend' } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: 'Repository URL is required' });
    }

    console.log(`🔗 Starting hierarchical analysis for ${role} role: ${repoUrl}`);
    
    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
    if (!urlMatch) {
      return res.status(400).json({ error: 'Invalid GitHub URL format' });
    }

    const [, owner, repoName] = urlMatch;
    const repo = repoName.replace('.git', '');

    // � **PROGRESSIVE ANALYSIS STRUCTURE** - Build understanding layer by layer
    let analysisResult = {
      repository: { owner, repo },
      role,
      analysis_progress: {
        phase: 'starting',
        completed_phases: [],
        current_understanding: {}
      },
      hierarchical_structure: {
        overview: {},
        architecture: {},
        features: [],
        dependencies: {
          external: new Set(),
          internal: new Map(),
          relationships: []
        },
        functions: {
          by_file: new Map(),
          by_importance: [],
          call_chains: []
        }
      }
    };

    console.log(`🏗️  Phase 1: Repository Structure Analysis`);
    
    // Get repository info
    const { data: repoInfo } = await octokit.repos.get({ owner, repo });
    
    // Get file tree recursively
    const { data: treeData } = await octokit.git.getTree({
      owner, repo, tree_sha: repoInfo.default_branch, recursive: true
    });

    // **PHASE 1: STRUCTURAL OVERVIEW** - Understand the project layout
    analysisResult.hierarchical_structure.overview = {
      name: repoInfo.name,
      description: repoInfo.description,
      language: repoInfo.language,
      stars: repoInfo.stargazers_count,
      total_files: treeData.tree.length
    };
    
    // Filter and categorize files intelligently
    const fileCategories = categorizeFiles(treeData.tree);
    analysisResult.hierarchical_structure.overview.file_structure = fileCategories;
    
    console.log(`📁 Discovered file structure:
    - Config: ${fileCategories.config.length} files
    - Source: ${fileCategories.source.length} files  
    - Tests: ${fileCategories.tests.length} files
    - Docs: ${fileCategories.docs.length} files`);

    // **PHASE 2: DEPENDENCY MAPPING** - Start with config files to understand dependencies
    console.log(`� Phase 2: Dependency Analysis`);
    analysisResult.analysis_progress.phase = 'dependencies';
    
    const configFiles = await getFileContents(fileCategories.config.slice(0, 5), owner, repo);
    const dependencyMap = await analyzeDependencies(configFiles, analysisResult);
    
    console.log(`📦 Discovered ${dependencyMap.external.size} external dependencies`);
    console.log(`🔗 Found ${dependencyMap.internal.size} internal modules`);

    // **PHASE 3: ARCHITECTURE ANALYSIS** - Understand the high-level structure
    console.log(`🏛️  Phase 3: Architecture Analysis`);
    analysisResult.analysis_progress.phase = 'architecture';
    
    // Get key architectural files (main entry points, routers, services)
    const architecturalFiles = identifyArchitecturalFiles(fileCategories.source);
    const keyFiles = await getFileContents(architecturalFiles.slice(0, 8), owner, repo);
    
    const architectureAnalysis = await analyzeArchitecture(keyFiles, analysisResult, role);
    
    // **PHASE 4: FEATURE DISCOVERY** - Identify major features and modules
    console.log(`⚡ Phase 4: Feature Discovery`);
    analysisResult.analysis_progress.phase = 'features';
    
    // Get remaining important source files
    const remainingFiles = fileCategories.source.filter(f => !architecturalFiles.includes(f)).slice(0, 10);
    const featureFiles = await getFileContents(remainingFiles, owner, repo);
    
    const featureAnalysis = await analyzeFeatures([...keyFiles, ...featureFiles], analysisResult, role);
    
    // **PHASE 5: FUNCTION-LEVEL ANALYSIS** - Deep dive into implementation details
    console.log(`🔬 Phase 5: Function Analysis`);  
    analysisResult.analysis_progress.phase = 'functions';
    
    const allFiles = [...keyFiles, ...featureFiles];
    const functionAnalysis = await analyzeFunctions(allFiles, analysisResult, role);
    
    // **PHASE 6: RELATIONSHIP MAPPING** - Connect everything together
    console.log(`🕸️  Phase 6: Relationship Mapping`);
    analysisResult.analysis_progress.phase = 'relationships';
    
    const relationshipMap = mapRelationships(allFiles, analysisResult);
    
    // **PHASE 7: ROLE-SPECIFIC SYNTHESIS** - Generate final insights
    console.log(`🎯 Phase 7: ${role.toUpperCase()} Synthesis`);
    analysisResult.analysis_progress.phase = 'synthesis';
    
    const finalSynthesis = await generateRoleSpecificSynthesis(analysisResult, role);
    
    // Convert Sets and Maps to arrays for JSON serialization
    const serializedResult = {
      success: true,
      role,
      repository: analysisResult.repository,
      metadata: {
        total_files_analyzed: allFiles.length,
        analysis_depth: 'hierarchical',
        phases_completed: ['structure', 'dependencies', 'architecture', 'features', 'functions', 'relationships', 'synthesis']
      },
      hierarchical_analysis: {
        overview: analysisResult.hierarchical_structure.overview,
        architecture: finalSynthesis.architecture,
        dependencies: {
          external: Array.from(analysisResult.hierarchical_structure.dependencies.external),
          internal: Object.fromEntries(analysisResult.hierarchical_structure.dependencies.internal),
          relationships: analysisResult.hierarchical_structure.dependencies.relationships
        },
        features: finalSynthesis.features,
        functions: {
          by_importance: finalSynthesis.functions.by_importance,
          call_chains: finalSynthesis.functions.call_chains,
          total_functions: Array.from(analysisResult.hierarchical_structure.functions.by_file.values()).reduce((sum, funcs) => sum + funcs.length, 0)
        },
        role_specific_insights: finalSynthesis.role_insights,
        recommendations: finalSynthesis.recommendations,
        complexity_assessment: finalSynthesis.complexity
      }
    };

    console.log(`✅ Hierarchical analysis complete! Phases: ${serializedResult.metadata.phases_completed.join(' → ')}`);
    res.json(serializedResult);

  } catch (error) {
    console.error('❌ Error in hierarchical analysis:', error);
    res.status(500).json({ 
      error: 'Failed to analyze repository hierarchically',
      details: error.message,
      role: req.body.role || 'backend'
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

// 📦 **DEPENDENCY ANALYSIS** - Progressive understanding of dependencies
async function analyzeDependencies(configFiles, analysisResult) {
  const deps = analysisResult.hierarchical_structure.dependencies;
  
  configFiles.forEach(file => {
    const fileName = file.path.toLowerCase();
    
    // Package.json analysis
    if (fileName.includes('package.json')) {
      try {
        const pkg = JSON.parse(file.content);
        
        // External dependencies
        Object.keys(pkg.dependencies || {}).forEach(dep => {
          deps.external.add(dep);
        });
        Object.keys(pkg.devDependencies || {}).forEach(dep => {
          deps.external.add(dep);
        });
        
        // Scripts reveal build/deployment patterns
        if (pkg.scripts) {
          analysisResult.hierarchical_structure.overview.scripts = pkg.scripts;
        }
        
      } catch (e) {
        console.log(`⚠️  Failed to parse package.json: ${file.path}`);
      }
    }
    
    // Requirements.txt (Python)
    if (fileName.includes('requirements.txt')) {
      file.content.split('\n').forEach(line => {
        const dep = line.trim().split(/[>=<]/)[0];
        if (dep && !dep.startsWith('#') && dep.length > 1) {
          deps.external.add(dep);
        }
      });
    }
    
    // Docker analysis
    if (fileName.includes('dockerfile')) {
      analysisResult.hierarchical_structure.overview.containerized = true;
      // Extract FROM statements, EXPOSE ports, etc.
      const lines = file.content.split('\n');
      lines.forEach(line => {
        if (line.startsWith('EXPOSE ')) {
          const port = line.replace('EXPOSE ', '').trim();
          analysisResult.hierarchical_structure.overview.exposed_ports = 
            [...(analysisResult.hierarchical_structure.overview.exposed_ports || []), port];
        }
      });
    }
  });
  
  return deps;
}

// 🏛️  **ARCHITECTURE ANALYSIS** - Understand system design  
async function analyzeArchitecture(keyFiles, analysisResult, role) {
  const architecture = {
    type: 'unknown',
    patterns: [],
    entry_points: [],
    data_flow: [],
    api_design: 'unknown'
  };
  
  // Analyze key files for architectural patterns
  keyFiles.forEach(file => {
    const content = file.content.toLowerCase();
    const path = file.path.toLowerCase();
    
    // Detect framework/architecture patterns
    if (content.includes('express') && content.includes('app.listen')) {
      architecture.type = 'Express.js REST API';
      architecture.patterns.push('REST API');
    }
    
    if (content.includes('next') || path.includes('next.config')) {
      architecture.type = 'Next.js Full-Stack';  
      architecture.patterns.push('SSR/SSG');
    }
    
    if (content.includes('react') && content.includes('usestate')) {
      architecture.patterns.push('React SPA');
    }
    
    // Database patterns
    if (content.includes('sqlite') || content.includes('db.serialize')) {
      architecture.patterns.push('SQLite Database');
    }
    
    if (content.includes('mongoose') || content.includes('mongodb')) {
      architecture.patterns.push('MongoDB');
    }
    
    // API patterns
    if (content.includes('router.get') || content.includes('app.get')) {
      architecture.api_design = 'RESTful';
      
      // Extract API endpoints for data flow understanding
      const lines = file.content.split('\n');
      lines.forEach(line => {
        const routeMatch = line.match(/(router|app)\.(get|post|put|delete)\s*\(\s*['"](.*?)['"].*?\)/i);
        if (routeMatch) {
          architecture.entry_points.push({
            method: routeMatch[2].toUpperCase(),
            path: routeMatch[3],
            file: file.path
          });
        }
      });
    }
    
    if (content.includes('graphql') || content.includes('type query')) {
      architecture.api_design = 'GraphQL';
    }
  });
  
  // Update the analysis result
  analysisResult.hierarchical_structure.architecture = architecture;
  
  return architecture;
}

// ⚡ **FEATURE ANALYSIS** - Discover major application features
async function analyzeFeatures(allFiles, analysisResult, role) {
  const features = [];
  const featureMap = new Map();
  
  // Group files by likely features (by directory structure)
  allFiles.forEach(file => {
    const pathParts = file.path.split('/');
    const featureName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'core';
    
    if (!featureMap.has(featureName)) {
      featureMap.set(featureName, {
        name: featureName,
        files: [],
        endpoints: [],
        functions: [],
        description: ''
      });
    }
    
    const feature = featureMap.get(featureName);
    feature.files.push(file.path);
    
    // Extract feature-specific endpoints and functions
    const fileEndpoints = extractEndpoints(file.content, file.path);
    const fileFunctions = extractFunctions(file.content, file.path);
    
    feature.endpoints = feature.endpoints.concat(fileEndpoints);
    feature.functions = feature.functions.concat(fileFunctions);
  });
  
  // Convert to feature list with descriptions
  featureMap.forEach(feature => {
    // Infer feature purpose from endpoints and functions
    let purpose = 'Core functionality';
    
    if (feature.name.includes('auth') || feature.functions.some(f => f.name.includes('auth'))) {
      purpose = 'Authentication and authorization';
    } else if (feature.name.includes('user') || feature.endpoints.some(e => e.path.includes('user'))) {
      purpose = 'User management';
    } else if (feature.name.includes('api') || feature.name.includes('route')) {
      purpose = 'API endpoints and routing';
    } else if (feature.name.includes('service') || feature.name.includes('business')) {
      purpose = 'Business logic and services';
    } else if (feature.name.includes('data') || feature.name.includes('db')) {
      purpose = 'Data access and storage';
    }
    
    feature.description = purpose;
    features.push(feature);
  });
  
  // Update analysis result
  analysisResult.hierarchical_structure.features = features;
  
  return features;
}

// 🔬 **FUNCTION ANALYSIS** - Deep dive into code implementation
async function analyzeFunctions(allFiles, analysisResult, role) {
  const functionsByFile = new Map();
  const importantFunctions = [];
  const callChains = [];
  
  allFiles.forEach(file => {
    const fileExtension = '.' + file.path.split('.').pop();
    const functions = extractFunctions(file.content, fileExtension);
    functionsByFile.set(file.path, functions);
    
    // Identify important functions based on various criteria
    functions.forEach(func => {
      let importance = 'low';
      
      // High importance indicators
      if (func.name.includes('main') || func.name.includes('init') || 
          func.name === 'app' || func.name === 'server') {
        importance = 'critical';
      } else if (func.name.includes('handle') || func.name.includes('process') ||
                 func.name.includes('execute') || func.name.includes('run')) {
        importance = 'high';
      } else if (func.name.includes('get') || func.name.includes('create') ||
                 func.name.includes('update') || func.name.includes('delete')) {
        importance = 'medium';
      }
      
      // Role-specific importance
      if (role === 'backend' && (func.name.includes('api') || func.name.includes('route'))) {
        importance = 'high';
      } else if (role === 'frontend' && (func.name.includes('component') || func.name.includes('render'))) {
        importance = 'high';
      }
      
      importantFunctions.push({
        ...func,
        importance,
        role_relevance: calculateRoleRelevance(func, role)
      });
    });
    
    // Detect function call chains (basic analysis)
    const callChain = detectCallChains(file.content, file.path);
    callChains.push(...callChain);
  });
  
  // Update analysis result
  analysisResult.hierarchical_structure.functions.by_file = functionsByFile;
  analysisResult.hierarchical_structure.functions.by_importance = 
    importantFunctions.sort((a, b) => {
      const importanceOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
  analysisResult.hierarchical_structure.functions.call_chains = callChains;
  
  return {
    by_file: functionsByFile,
    by_importance: importantFunctions,
    call_chains: callChains
  };
}

// 🕸️  **RELATIONSHIP MAPPING** - Connect components and dependencies  
function mapRelationships(allFiles, analysisResult) {
  const relationships = [];
  
  allFiles.forEach(file => {
    // Detect imports/requires
    const lines = file.content.split('\n');
    lines.forEach((line, index) => {
      // JavaScript/TypeScript imports
      const importMatch = line.match(/import.*from\s+['"](.*?)['"]/);
      if (importMatch) {
        relationships.push({
          from: file.path,
          to: importMatch[1],
          type: 'imports',
          line: index + 1
        });
      }
      
      // Node.js requires
      const requireMatch = line.match(/require\s*\(\s*['"](.*?)['"]\s*\)/);
      if (requireMatch) {
        relationships.push({
          from: file.path,
          to: requireMatch[1],
          type: 'requires',
          line: index + 1
        });
      }
    });
  });
  
  // Update analysis result
  analysisResult.hierarchical_structure.dependencies.relationships = relationships;
  
  return relationships;
}

// 🎯 **ROLE-SPECIFIC SYNTHESIS** - Final AI-powered insights
async function generateRoleSpecificSynthesis(analysisResult, role) {
  const roleConfig = ROLE_PROMPTS[role] || ROLE_PROMPTS.backend;
  
  // Prepare comprehensive context for Gemini
  const context = `
HIERARCHICAL ANALYSIS RESULTS:

OVERVIEW:
${JSON.stringify(analysisResult.hierarchical_structure.overview, null, 2)}

ARCHITECTURE:
${JSON.stringify(analysisResult.hierarchical_structure.architecture, null, 2)}

FEATURES (${analysisResult.hierarchical_structure.features.length} discovered):
${analysisResult.hierarchical_structure.features.map(f => `- ${f.name}: ${f.description} (${f.endpoints.length} endpoints, ${f.functions.length} functions)`).join('\n')}

DEPENDENCIES:
- External: ${Array.from(analysisResult.hierarchical_structure.dependencies.external).slice(0, 20).join(', ')}
- Internal relationships: ${analysisResult.hierarchical_structure.dependencies.relationships.length} detected

TOP FUNCTIONS:
${Array.from(analysisResult.hierarchical_structure.functions.by_importance).slice(0, 10).map(f => `- ${f.name} (${f.importance}): ${f.type} in ${f.file}`).join('\n')}

ROLE CONTEXT: Analyzing for ${role} developer
FOCUS: ${roleConfig.focus}
KEY QUESTIONS: ${roleConfig.questions}
`;

  try {
    const prompt = `You are a senior ${role} developer performing a comprehensive code review. Based on this hierarchical analysis, provide deep insights.

${context}

Return JSON with this structure:
{
  "architecture": {
    "summary": "Architecture overview from ${role} perspective",
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"],
    "patterns": ["pattern1", "pattern2"]
  },
  "features": [
    {
      "name": "feature_name",
      "importance": "critical/high/medium/low",
      "complexity": "1-10",
      "${role}_relevance": "Why this matters for ${role} devs"
    }
  ],
  "functions": {
    "by_importance": [
      {
        "name": "function_name",
        "file": "file_path",
        "why_important": "Explanation of importance",
        "complexity": "1-10"
      }
    ],
    "call_chains": [
      {
        "chain": "A → B → C",
        "purpose": "What this chain accomplishes",
        "complexity": "1-10"
      }
    ]
  },
  "role_insights": {
    "key_strengths": "What works well for ${role} work",
    "main_challenges": "Primary concerns for ${role} developers", 
    "learning_curve": "beginner/intermediate/advanced",
    "productivity_assessment": "How quickly can a ${role} dev be productive"
  },
  "recommendations": {
    "immediate": ["action1", "action2"],
    "short_term": ["improvement1", "improvement2"], 
    "architectural": ["suggestion1", "suggestion2"]
  },
  "complexity": {
    "overall_score": "1-10",
    "technical_debt": "low/medium/high",
    "maintainability": "excellent/good/fair/poor",
    "onboarding_difficulty": "easy/moderate/challenging"
  }
}`;

    const result = await model.generateContent(prompt);
    const synthesis = result.response.text();
    
    // Parse the synthesis
    try {
      const cleanJson = synthesis.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.log('⚠️  Failed to parse synthesis JSON, using fallback...');
      return {
        architecture: { summary: 'Analysis completed but synthesis parsing failed' },
        features: [],
        functions: { by_importance: [], call_chains: [] },
        role_insights: { learning_curve: 'intermediate' },
        recommendations: { immediate: [], short_term: [], architectural: [] },
        complexity: { overall_score: 5 }
      };
    }
    
  } catch (error) {
    console.error('❌ Error in synthesis generation:', error);
    return {
      architecture: { summary: 'Synthesis generation failed' },
      features: [],
      functions: { by_importance: [], call_chains: [] },
      role_insights: { learning_curve: 'intermediate' },
      recommendations: { immediate: [], short_term: [], architectural: [] },
      complexity: { overall_score: 5 }
    };
  }
}

// 🎯 **ROLE RELEVANCE CALCULATOR**
function calculateRoleRelevance(func, role) {
  const roleKeywords = {
    backend: ['api', 'route', 'server', 'database', 'auth', 'middleware', 'service'],
    frontend: ['component', 'render', 'state', 'ui', 'event', 'dom', 'view'],
    devops: ['deploy', 'build', 'config', 'env', 'docker', 'ci', 'cd', 'test'],
    security: ['auth', 'validate', 'encrypt', 'hash', 'token', 'permission', 'secure'],
    data: ['query', 'fetch', 'transform', 'process', 'analyze', 'aggregate', 'etl']
  };
  
  const keywords = roleKeywords[role] || roleKeywords.backend;
  const name = func.name.toLowerCase();
  
  return keywords.some(keyword => name.includes(keyword)) ? 'high' : 'medium';
}

// 🔍 **CALL CHAIN DETECTION** 
function detectCallChains(content, filePath) {
  const chains = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Look for function calls within functions (basic detection)
    if (line.includes('(') && line.includes(')') && !line.trim().startsWith('//')) {
      const functionCalls = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g);
      if (functionCalls && functionCalls.length > 1) {
        chains.push({
          file: filePath,
          line: index + 1,
          calls: functionCalls.map(call => call.replace('(', '')),
          context: line.trim()
        });
      }
    }
  });
  
  return chains;
}

module.exports = router;

#!/bin/bash

echo "🚀 Setting up DocFlow Lite..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend && npm install

# Install backend dependencies  
echo "⚙️  Installing backend dependencies..."
cd ../backend && npm install

# Install docs-generator dependencies
echo "📚 Installing docs-generator dependencies..."
cd ../docs-generator && npm install

# Install shared dependencies
echo "🔗 Installing shared dependencies..."
cd ../shared && npm install

# Go back to root
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and add your API keys"
echo "2. Run 'npm run dev' to start both frontend and backend"
echo "3. Visit http://localhost:3000 to see the application"
echo ""
echo "🔑 Required API Keys:"
echo "- GITHUB_TOKEN: GitHub personal access token"
echo "- OPENAI_API_KEY: OpenAI API key for Q&A assistant"
echo "- MINTLIFY_API_KEY: Mintlify API key for docs generation"

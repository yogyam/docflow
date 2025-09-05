# DocFlow Lite 📚

**AI-Powered Role-Specific Documentation Generator**

DocFlow Lite automatically analyzes your GitHub repositories using Gemini AI and generates personalized, role-specific documentation that makes onboarding faster and easier for developers. It creates comprehensive guides tailored for backend, frontend, DevOps, or any other development role and automatically submits them as pull requests to your repository.

## ✨ Features

- 🤖 **AI-Powered Analysis**: Uses Google's Gemini AI to intelligently analyze your codebase
- 🎯 **Role-Specific Documentation**: Generates targeted guides for different developer roles (backend, frontend, DevOps, etc.)
- 📋 **Automatic Pull Requests**: Creates and submits documentation directly to your GitHub repository
- 🔍 **Smart Code Understanding**: Analyzes functions, dependencies, architecture, and workflows
- 🌐 **Web Interface**: Easy-to-use frontend for repository connection and documentation generation
- ⚡ **Fast Processing**: Efficient analysis of repositories up to 10 files for quick results

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **GitHub Personal Access Token** with repository permissions
- **Google Gemini API Key**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd docflow-lite
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 3. Environment Setup

Create a `.env` file in the `/backend` directory:

```bash
# backend/.env
GITHUB_TOKEN=your_github_personal_access_token_here
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

#### Getting Your API Keys:

**GitHub Token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these permissions:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
   - `read:org` (Read org and team membership)

**Gemini API Key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### 4. Run the Application

```bash
# Start both frontend and backend servers
npm run dev
```

This will start:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:3000

## 🛠️ Usage

### Web Interface (Recommended)

1. Open your browser to `http://localhost:3000`
2. Enter a GitHub repository URL (e.g., `https://github.com/yourusername/your-repo`)
3. Select your target role (backend, frontend, devops, etc.)
4. Click "Generate Documentation"
5. Wait for the AI analysis to complete
6. Check your GitHub repository for the new pull request with generated documentation

### API Usage

You can also use the API directly:

```bash
curl -X POST http://localhost:3001/api/generate/generate-docs \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/yourusername/your-repo",
    "role": "backend"
  }'
```

## 📁 Project Structure

```
docflow-lite/
├── README.md                          # This file
├── package.json                       # Root package configuration
├── backend/                           # Node.js/Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── github.js             # GitHub integration routes
│   │   │   ├── simpleDocGeneration.js # Main documentation generation
│   │   │   ├── docs.js               # Legacy documentation routes
│   │   │   └── chat.js               # AI chat functionality
│   │   ├── services/                 # Business logic services
│   │   └── index.js                  # Server entry point
│   ├── package.json                  # Backend dependencies
│   └── .env                          # Environment variables
└── frontend/                         # Next.js frontend
    ├── src/
    │   ├── pages/                    # Next.js pages
    │   ├── components/               # React components
    │   └── services/                 # API service layer
    ├── package.json                  # Frontend dependencies
    └── next.config.js                # Next.js configuration
```

## 🔧 Configuration

### Supported Roles

The system currently supports these developer roles:
- `backend` - Backend/API developers
- `frontend` - Frontend/UI developers  
- `devops` - DevOps/Infrastructure engineers
- `fullstack` - Full-stack developers
- `mobile` - Mobile app developers
- `data` - Data scientists/engineers

### Customization

You can customize the documentation generation by modifying:
- **Templates**: Edit the prompts in `/backend/src/routes/simpleDocGeneration.js`
- **Analysis Logic**: Modify the Gemini analysis prompts
- **UI Components**: Customize React components in `/frontend/src/components/`

## 🧪 Testing

### Test the Backend API

```bash
# Health check
curl http://localhost:3001/health

# Test documentation generation
curl -X POST http://localhost:3001/api/generate/generate-docs \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/yourusername/test-repo", "role": "backend"}'
```

### Test Repository Analysis

```bash
# Test Gemini analysis only
curl -X POST http://localhost:3001/api/github/test-gemini-analysis \
  -H "Content-Type: application/json" \
  -d '{"repoUrl": "https://github.com/yourusername/test-repo"}'
```

## 📝 Generated Documentation

DocFlow creates comprehensive documentation including:

### For Each Role:
- **🎯 Project Overview** - Role-specific project understanding
- **🚀 Quick Start Guide** - Setup instructions for that role
- **🏗️ Architecture Overview** - System design from role perspective  
- **🔧 Key Components** - Important parts for that role
- **📦 Dependencies & Tools** - Relevant technologies
- **🛠️ Development Workflow** - Role-specific processes
- **🧪 Testing & Debugging** - Testing approaches
- **📚 Additional Resources** - Role-relevant links and docs

### File Structure Created:
```
docs/
├── README.md                    # Documentation index
└── {role}-guide.md             # Role-specific guide
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Troubleshooting

### Common Issues

**Server won't start:**
- Check that your `.env` file is in the `/backend` directory
- Verify your API keys are correctly set
- Ensure ports 3000 and 3001 are available

**Documentation generation fails:**
- Verify your GitHub token has correct permissions
- Check that the repository URL is publicly accessible
- Ensure your Gemini API key is valid and has quota

**Frontend can't connect to backend:**
- Confirm backend is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend URL

### Debug Mode

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

### Support

For issues and support:
1. Check the [Issues](https://github.com/yourusername/docflow-lite/issues) page
2. Create a new issue with detailed error information
3. Include your environment details and steps to reproduce

---

**Made with ❤️ using Gemini AI and modern web technologies**

# docflow - Backend Developer Guide

## 🎯 Project Overview

DocFlow Lite's backend is a Node.js application responsible for the core logic of analyzing GitHub repositories, interacting with Google's Gemini AI for code understanding, generating role-specific documentation (particularly focusing on the backend aspects), and managing the Q&A functionality.  From a backend perspective, your focus will be on ensuring the robust and efficient processing of GitHub data, secure communication with the Gemini API, and the reliable storage and retrieval of generated documentation and conversation history.  You'll be working with Express.js to create and manage RESTful APIs that the frontend uses to interact with these core functionalities.  Your primary concern is the reliable and performant operation of the backend services, which are the foundation of the entire application.

## 🚀 Quick Start for Backends

This guide assumes you have Node.js and npm (or yarn) installed.

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd docflow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**  Create a `.env` file in the root directory and populate it with the following (replace placeholders with your actual keys):

   ```
   GEMINI_API_KEY=<your_gemini_api_key>
   GITHUB_TOKEN=<your_github_token>
   DATABASE_URL=<your_sqlite_database_url> # e.g., sqlite://:memory: for in-memory DB, or a file path
   PORT=<your_port> # e.g., 3000
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   This will start the backend server, listening on the port specified in your `.env` file.

5. **Test the API endpoints (optional):** Use tools like Postman or curl to test the various API endpoints exposed by the server (refer to the API documentation for details).

## 🏗️ Architecture Overview

The backend utilizes a layered architecture:

1. **API Layer (Express.js):** This layer exposes RESTful APIs for the frontend to interact with.  It handles request routing, authentication (if implemented), and input validation.

2. **Business Logic Layer:** This layer contains the core logic for interacting with GitHub, Gemini API, and the database.  It handles tasks such as repository analysis, documentation generation, and Q&A processing.

3. **Data Access Layer (SQLite3):**  This layer interacts with the SQLite database to store and retrieve information like generated documentation, user sessions, and Q&A history.

4. **External API Integrations:** This layer manages communication with external services, including the GitHub API and the Gemini API.


## 🔧 Key Components

* **`src/api/routes/`:** Contains Express.js route definitions for various API endpoints.
* **`src/services/`:** Houses the core business logic, including functions for:
    * `githubService.js`:  Handles interactions with the GitHub API (using `@octokit/rest`).
    * `geminiService.js`:  Manages interactions with the Gemini AI API (using `@google/generative-ai`).
    * `documentationService.js`:  Handles the generation and storage of documentation.
    * `qaService.js`: Manages the Q&A functionality.
* **`src/database/`:**  Contains functions for interacting with the SQLite database.
* **`src/middleware/`:** Contains middleware functions for tasks such as authentication, rate limiting, and error handling.


## 📦 Dependencies & Tools

* **`@google/generative-ai`:**  For interacting with Google's Gemini API.  Crucial for code analysis and documentation generation.
* **`@octokit/rest`:**  For interacting with the GitHub API.  Essential for fetching repository data.
* **`axios`:**  For making HTTP requests to external APIs (e.g., for error handling and timeouts).
* **`express`:** The core Node.js web framework.
* **`express-rate-limit`:** For protecting against abuse of the API.
* **`fs-extra`:** For file system operations (mostly used for documentation output and management).
* **`sqlite3`:**  The database driver for SQLite.
* **`jest`:**  The testing framework.
* **`nodemon`:** For automatic server restarts during development.

## 🛠️ Development Workflow

1. **Branching:** Use Git branching for feature development and bug fixes. Create separate branches for each task.

2. **Committing:** Write clear and concise commit messages following a consistent style.

3. **Pull Requests:** Create pull requests for code reviews before merging your changes into the main branch.

4. **Testing:**  Write unit and integration tests to ensure the quality and reliability of your code (see the Testing & Debugging section).

5. **Code Style:** Adhere to the existing code style guidelines (if any) or establish a clear style guide for the team.

Example of adding a new API endpoint (simplified):

```javascript
// src/api/routes/documentation.js
const express = require('express');
const router = express.Router();
const documentationService = require('../services/documentationService');

router.post('/', async (req, res) => {
  try {
    const { repoUrl, role } = req.body;
    const documentation = await documentationService.generateDocumentation(repoUrl, role);
    res.json(documentation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```


## 🧪 Testing & Debugging

* **Unit Testing:**  Use Jest to write unit tests for individual functions within the `services` directory.  Focus on testing the core logic and ensuring functions handle various input scenarios correctly.

* **Integration Testing:** Test the interaction between different components, for example, testing the flow from the API layer through the business logic to the database.  This ensures that different parts of the system work together as expected.

* **Debugging:** Use Node.js debugging tools (e.g., `console.log`, debugger statements) to identify and fix issues.  Utilize logging mechanisms to track requests, responses and errors.

Example Jest unit test:

```javascript
// src/services/__tests__/geminiService.test.js
const { generateDocumentationFromCode } = require('../geminiService');

test('generateDocumentationFromCode', async () => {
  // Mock the Gemini API call
  const mockGeminiResponse = { documentation: 'Example documentation' };
  const mockGeminiAPI = jest.fn(() => Promise.resolve(mockGeminiResponse));
  
  // Replace the actual Gemini API call with the mock
  const result = await generateDocumentationFromCode("some code", mockGeminiAPI);
  expect(result).toEqual(mockGeminiResponse.documentation)
});

```

## 📚 Additional Resources

* [Express.js documentation](https://expressjs.com/)
* [Jest documentation](https://jestjs.io/)
* [GitHub API documentation](https://docs.github.com/en/rest)
* [Google Gemini API documentation](If available, provide link here)
* Internal team wiki (if applicable)


This guide provides a foundational understanding of the DocFlow Lite backend. Remember to consult the project's codebase and other relevant documentation for more detailed information.

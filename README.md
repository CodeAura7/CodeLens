# CodeLens

> AI-powered code analysis that helps developers understand, review, and improve source code.

CodeLens is a full-stack web application that uses **Google Gemini** to analyze source code and generate structured, developer-friendly insights. Users can upload supported source files, receive an AI-generated code review, explore complexity and potential bugs, view improvement suggestions, prepare for interviews, and visualize code flow through automatically generated Mermaid flowcharts.

The application also provides authentication and persistent analysis history so users can revisit previous code reviews.

---

## ✨ Features

### 🤖 AI-Powered Code Analysis

Upload a source-code file and let Gemini analyze the actual code.

Each analysis can provide:

* Code summary
* Step-by-step explanation
* Possible bugs with severity
* Improvement suggestions
* Time complexity
* Interview questions with answers and difficulty
* Code quality scores
* Mermaid flowchart representing the code's control flow

The backend explicitly instructs Gemini to analyze the uploaded source code and return structured JSON containing these analysis fields.

### 📊 Interactive Analysis Reports

The analysis page presents the uploaded code alongside the generated review.

Reports include:

* Uploaded source code with syntax highlighting
* Summary
* Step-by-step explanation
* Complexity analysis
* Potential bugs
* Improvement suggestions
* Interview questions
* Generated flowchart

Mermaid is used on the frontend to render the AI-generated flowchart.

### 🔐 User Authentication

CodeLens includes:

* User registration
* Login
* JWT-based authentication
* Protected routes
* User profile
* Logout

Authentication tokens are stored in the browser and automatically attached to API requests.

### 🗂️ Analysis History

Every completed analysis is associated with the authenticated user.

Users can:

* View previous analyses
* Open individual reports
* Revisit the original source code
* Delete saved analyses

The backend stores the filename, language, summary, complete analysis, user ID, and creation timestamp.

### 📈 Code Quality Scores

The analysis response contains scores for:

* Readability
* Maintainability
* Naming
* Documentation
* Overall quality

These values are returned as part of the structured analysis result consumed by the frontend.

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* Bootstrap
* Mermaid
* React Syntax Highlighter

The frontend uses Vite and React with TypeScript, Bootstrap for styling, Mermaid for flowcharts, and React Syntax Highlighter for displaying uploaded source code.

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* Pydantic
* JWT
* Passlib / bcrypt
* Python-dotenv

### AI

* Google Gemini
* `google-generativeai`

The backend configures Gemini using the `GEMINI_API_KEY` environment variable and sends the uploaded source code to the configured Gemini model for analysis.

### Database

* SQLite
* SQLAlchemy ORM

The application currently uses a local SQLite database named `codelens.db`.

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │       User           │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   TypeScript + Vite  │
                    └──────────┬───────────┘
                               │
                         REST API / Axios
                               │
                               ▼
                    ┌──────────────────────┐
                    │    FastAPI Backend   │
                    ├──────────────────────┤
                    │ Authentication       │
                    │ Analysis API         │
                    │ History API          │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
       ┌──────────────────┐          ┌──────────────────┐
       │ SQLite Database  │          │   Google Gemini  │
       │                  │          │                  │
       │ Users            │          │ Code Analysis    │
       │ Analysis History │          │ JSON Generation  │
       └──────────────────┘          └──────────────────┘
                                             │
                                             ▼
                                   ┌────────────────────┐
                                   │ Structured Result  │
                                   │                    │
                                   │ Summary            │
                                   │ Bugs               │
                                   │ Complexity         │
                                   │ Improvements       │
                                   │ Questions          │
                                   │ Mermaid Flowchart  │
                                   └────────────────────┘
```

---

## 🔄 How CodeLens Works

### 1. User Authentication

A user creates an account or logs in.

The backend creates a JWT access token, which the frontend stores and sends with authenticated API requests.

### 2. Code Upload

From the dashboard, the user selects a supported source file.

The frontend reads the file contents and detects the programming language from its extension. Supported extensions currently include:

```text
.py
.js
.ts
.java
.cpp
.c
.cs
.go
.php
```

The dashboard maps these extensions to their corresponding language names before sending the request to the backend.

### 3. Backend Validation

The FastAPI backend validates:

* Authentication token
* User existence
* Supported file extension
* File size
* Non-empty source code

The current backend limits uploaded source content to **1 MB**.

### 4. Gemini Analysis

The source code is passed to Gemini with a structured analysis prompt.

Gemini is instructed to return JSON containing:

```text
code_summary
step_by_step_explanation
possible_bugs
improvement_suggestions
time_complexity
interview_questions
flowchart
```

The backend then parses and normalizes the response before returning it to the frontend.

### 5. Analysis Storage

After a successful analysis, CodeLens stores the result together with the original source code in the user's analysis history.

### 6. Report Visualization

The frontend displays the result as an interactive analysis report.

The generated Mermaid flowchart is rendered directly in the browser. If Mermaid cannot render it, the application falls back to displaying the raw Mermaid syntax.

---

## 📁 Project Structure

```text
CodeLens/
│
├── backend/
│   ├── app/
│   │   ├── database/
│   │   │   └── database.py
│   │   │
│   │   ├── models/
│   │   │   ├── history.py
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   └── analysis.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── analysis.py
│   │   │   └── auth.py
│   │   │
│   │   ├── services/
│   │   │   ├── analysis_service.py
│   │   │   └── auth_service.py
│   │   │
│   │   ├── utils/
│   │   │   └── security.py
│   │   │
│   │   └── main.py
│   │
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AnalysisPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── HistoryPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── RegisterPage.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

Make sure you have installed:

* Python 3.10+
* Node.js
* npm
* A Google Gemini API key

---

## 🚀 Backend Setup

Navigate to the backend:

```bash
cd backend
```

### 1. Create a virtual environment

Windows:

```bash
python -m venv .venv
```

Activate it:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

The project already provides a `requirements.txt` containing the FastAPI, SQLAlchemy, authentication, Gemini, environment-variable, and related dependencies.

### 3. Configure environment variables

Create:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

An example environment file is already included in the project.

### 4. Start the backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/
```

The backend exposes a root health endpoint returning:

```json
{
  "message": "CodeLens API is running"
}
```

---

## 🎨 Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server is configured to run on port `3000` and proxy `/api` requests to the FastAPI backend at `http://127.0.0.1:8000`.

Open:

```text
http://localhost:3000
```

---

## 🧪 Production Build

To verify and build the frontend:

```bash
npm run build
```

The configured build command runs TypeScript checking before generating the Vite production build.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| `POST` | `/api/auth/register` | Create a new account                |
| `POST` | `/api/auth/login`    | Authenticate and receive JWT        |
| `GET`  | `/api/auth/profile`  | Retrieve authenticated user profile |

### Analysis

| Method   | Endpoint                    | Description                               |
| -------- | --------------------------- | ----------------------------------------- |
| `POST`   | `/api/analyze`              | Analyze source code                       |
| `POST`   | `/api/upload`               | Analyze uploaded code                     |
| `GET`    | `/api/history`              | Get authenticated user's analysis history |
| `GET`    | `/api/history/{history_id}` | Get a specific analysis                   |
| `DELETE` | `/api/history/{history_id}` | Delete an analysis                        |

All analysis/history routes require bearer authentication.

---

## 📥 Analysis Request

The backend accepts an analysis request containing:

```json
{
  "filename": "example.py",
  "language": "python",
  "content": "print('Hello World')"
}
```

The request schema requires a filename, language, and non-empty source-code content.

---

## 📤 Analysis Response

A successful analysis returns a structured result containing information such as:

```json
{
  "summary": "...",
  "explanation": [],
  "complexity": {
    "time": "...",
    "space": "..."
  },
  "bugs": [],
  "improvements": [],
  "interview_questions": [],
  "flowchart": "...",
  "scores": {
    "readability": 80,
    "maintainability": 78,
    "naming": 76,
    "documentation": 70,
    "overall": 76
  }
}
```

The frontend's `AnalysisResult` type defines the structure consumed by the analysis report.

---

## 🔒 Security

CodeLens currently implements:

* JWT-based authentication
* Password hashing with bcrypt
* Protected API routes
* User-specific analysis history
* Environment variables for the Gemini API key

Passwords are hashed before being stored, and authentication tokens expire after the configured token lifetime.

### Important

Do **not** commit your actual `.env` file or API keys to Git.

Use:

```text
.env
```

in your `.gitignore`.

Also, the Python virtual environment should not be committed:

```text
backend/.venv/
```

Dependencies are already represented by `backend/requirements.txt`, so the repository does not need the entire virtual environment.

---

## 🧠 AI Analysis Pipeline

```text
Source Code
     │
     ▼
Frontend Upload
     │
     ▼
FastAPI Validation
     │
     ├── Invalid file ──► Error
     │
     ▼
Gemini Prompt Construction
     │
     ▼
Google Gemini
     │
     ▼
Structured JSON Response
     │
     ▼
Response Parsing
     │
     ▼
Flowchart Normalization
     │
     ▼
Save Analysis History
     │
     ▼
Return Result
     │
     ▼
React Analysis Report
     │
     ├── Code
     ├── Explanation
     ├── Bugs
     ├── Complexity
     ├── Improvements
     ├── Interview Questions
     └── Mermaid Flowchart
```

The backend also normalizes Gemini's flowchart response and provides a fallback Mermaid diagram if the generated flowchart is invalid or missing.

---

## 🎯 Use Cases

CodeLens is designed for:

* Students learning programming
* Developers reviewing unfamiliar code
* Interview preparation
* Understanding legacy or complex code
* Identifying potential bugs
* Learning time complexity
* Visualizing program flow
* Getting suggestions for improving source code

The landing page specifically positions the application around code understanding, AI-backed explanations, complexity and bug review, interview preparation, and analysis history.

---

## 🔮 Future Improvements

Potential areas for future development include:

* Support for additional programming languages
* More detailed function and variable-level analysis
* More accurate space-complexity analysis
* Code diff analysis
* Repository-level analysis
* Multiple AI model support
* Streaming AI responses
* Exportable analysis reports
* Advanced code-quality metrics
* Automated test-case generation
* GitHub repository integration
* PostgreSQL or other production database support
* Deployment-ready production configuration

---

## ⚠️ Current Limitations

The current implementation has a few intentional constraints:

* Supported source files are limited to `.py`, `.js`, `.ts`, `.java`, `.cpp`, `.c`, `.cs`, `.go`, and `.php`.
* Source content is limited to 1 MB per analysis request.
* The application currently uses SQLite.
* Analysis depends on the configured Gemini API key.
* AI-generated analysis should be treated as an assistive review rather than a replacement for human code review.
* Some returned analysis fields currently use fallback/default values when Gemini does not provide the corresponding information.

---

## 📜 License

This project is currently distributed without a specified open-source license.

If you intend to publish CodeLens as an open-source project, add an appropriate `LICENSE` file before presenting it as open source.

---

## 👨‍💻 Project

**CodeLens**
AI-powered source-code analysis and learning assistant.

Built with:

```text
React + TypeScript + Vite
              │
              ▼
        FastAPI + Python
              │
       ┌──────┴──────┐
       ▼             ▼
    SQLite       Google Gemini
```

> Understand your code. Find problems. Learn faster.

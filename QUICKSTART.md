# AutoQuizzer Quick Start

## ✅ All Tasks Completed!

### What was done:

1. **✅ Fixed existing bugs**
   - Fixed `goToPreviousQuestion` bug in QuizTaker.tsx
   - Fixed charset typo in index.html (UTF-g → UTF-8)

2. **✅ Connected SQLite Database**
   - Created SQLite database with sql.js
   - Tables: `users` and `quizzes`
   - Automatic persistence to disk
   - Database file: `server/database/autoquizzer.db`

3. **✅ Connected Express.js Backend**
   - Express.js server on port 5000
   - RESTful API with CORS enabled
   - Routes: `/api/auth`, `/api/quiz`, `/api/gemini`
   - Secure API key handling on backend

4. **✅ Configured API Key**
   - Gemini API Key: `AIzaSyDJv9YRV6Jhn2-NhDuYi80qCQqth7pUNVM`
   - Stored in `server/.env`
   - Backend proxies all Gemini API calls

5. **✅ Updated Frontend Services**
   - All services now use backend API
   - Async/await throughout
   - Removed direct Gemini API calls
   - Vite proxy configured for `/api` routes

## 🚀 How to Run

### Option 1: Using start script (Windows)
```bash
.\start.bat
```

### Option 2: Using npm script
```bash
npm run dev:all
```

### Option 3: Manual start (two separate terminals)

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📍 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🧪 Testing

1. Open http://localhost:3000
2. Register with any email (e.g., test@example.com)
3. Create a quiz from a topic or upload a file
4. Take the quiz and see your results
5. Check the database file in `server/database/autoquizzer.db`

## 📦 Dependencies Installed

**Backend:**
- express (web server)
- cors (cross-origin requests)
- dotenv (environment variables)
- sql.js (SQLite database)
- @google/genai (Gemini API client)

**Frontend:**
- React 19.2.0
- Vite 6.2.0
- TailwindCSS
- jsPDF, PDF.js, Mammoth.js

**Dev Tools:**
- concurrently (run multiple scripts)
- TypeScript

## 🗂️ Project Structure

```
Autoquizzer/
├── server/                    # Backend
│   ├── index.js              # Express app
│   ├── .env                  # API keys
│   ├── database/
│   │   ├── db.js             # Database setup
│   │   └── autoquizzer.db    # SQLite database
│   └── routes/
│       ├── auth.js           # User auth
│       ├── quiz.js           # Quiz CRUD
│       └── gemini.js         # AI proxy
├── services/                  # Frontend API clients
│   ├── authService.ts        # Auth API calls
│   ├── storageService.ts     # Quiz API calls
│   └── geminiService.ts      # AI API calls
├── components/               # React components
├── App.tsx                   # Root component
├── .env.local                # Frontend env
├── vite.config.ts            # Vite config (with proxy)
├── package.json              # Dependencies
├── start.bat                 # Quick start script
└── SETUP_GUIDE.md            # Detailed docs
```

## ✨ Features Working

✅ User Registration & Login  
✅ Quiz Creation from Topics  
✅ Quiz Creation from Files (PDF, DOCX, PPTX, TXT)  
✅ AI-Powered Question Generation  
✅ Timed Quizzes  
✅ Score Tracking  
✅ Quiz Management (Create, Take, Delete)  
✅ PDF Export  
✅ Draft Saving  
✅ SQLite Persistence  
✅ Secure API Key Management  

## 🎯 Project Status: READY TO RUN!

All requested tasks have been completed:
1. ✅ SQLite database connected
2. ✅ Express.js backend integrated
3. ✅ API key configured
4. ✅ All bugs fixed
5. ✅ Project ready to run

Execute `npm run dev:all` or `.\start.bat` to start!

# AutoQuizzer - AI-Powered Quiz Generator

An intelligent quiz generation system that automatically creates multiple-choice quizzes using uploaded content or user-provided topics, powered by the Gemini API.

## 🚀 Features

- **AI-Powered Quiz Generation**: Create quizzes from topics or uploaded documents (PDF, DOCX, PPTX, TXT)
- **User Authentication**: Simple email-based authentication system
- **Quiz Management**: Create, take, review, and delete quizzes
- **Score Tracking**: Track your performance with last score display
- **PDF Export**: Download quizzes with answer keys
- **Draft Saving**: Save and resume quiz creation
- **Timed Quizzes**: Configurable time limits (10-30 minutes)
- **SQLite Database**: Persistent storage for users and quizzes
- **Express.js Backend**: RESTful API with secure Gemini API key handling

## 🛠️ Tech Stack

**Frontend:**
- React 19.2.0 with TypeScript
- Vite 6.2.0
- TailwindCSS (via CDN)
- PDF.js, jsPDF, Mammoth.js

**Backend:**
- Express.js
- SQLite (better-sqlite3)
- Google Gemini API

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd "d:\Sem 5\Project\EDA\Autoquizzer"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   The API key is already configured in `.env.local`:
   ```
   GEMINI_API_KEY=AIzaSyDJv9YRV6Jhn2-NhDuYi80qCQqth7pUNVM
   PORT=5000
   ```

## 🚀 Running the Application

### Development Mode (Both Frontend & Backend)

```bash
npm run dev:all
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
npm run dev:server
```

**Frontend only:**
```bash
npm run dev
```

## 📁 Project Structure

```
Autoquizzer/
├── server/                 # Backend (Express.js)
│   ├── index.js           # Main server file
│   ├── database/
│   │   ├── db.js          # SQLite setup
│   │   └── autoquizzer.db # Database file (created on first run)
│   └── routes/
│       ├── auth.js        # Authentication endpoints
│       ├── quiz.js        # Quiz CRUD endpoints
│       └── gemini.js      # AI generation proxy
├── components/            # React components
├── services/              # Frontend API services
├── App.tsx               # Root component
├── types.ts              # TypeScript definitions
├── vite.config.ts        # Vite configuration
├── package.json          # Dependencies & scripts
└── .env.local            # Environment variables
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/user/:email` - Get user info

### Quizzes
- `GET /api/quiz/user/:email` - Get all user quizzes
- `POST /api/quiz` - Create new quiz
- `PATCH /api/quiz/:quizId/score` - Update quiz score
- `DELETE /api/quiz/:quizId` - Delete quiz

### Gemini AI
- `POST /api/gemini/generate` - Generate quiz from content

## 🐛 Bug Fixes Applied

1. ✅ Fixed `goToPreviousQuestion` bug in QuizTaker.tsx
2. ✅ Fixed charset typo in index.html (UTF-g → UTF-8)
3. ✅ Moved API key to backend for security
4. ✅ Replaced localStorage with SQLite database
5. ✅ Added proper async/await handling throughout

## 🔒 Security Notes

- API key is now secure on the backend
- Frontend proxies requests through Vite dev server
- Session storage for current user (cleared on tab close)
- SQLite database with foreign key constraints

## 📝 Usage Guide

1. **Register/Login**: Enter your email to access the dashboard
2. **Create Quiz**: 
   - Choose "From Topic" or "From File"
   - Configure questions count, difficulty, and time limit
   - Generate quiz using AI
3. **Take Quiz**: Click "Take Quiz" on any card, answer questions, submit
4. **Review Results**: See your score and correct answers
5. **Download PDF**: Export quiz with answer key
6. **Delete Quiz**: Remove unwanted quizzes

## 🎨 Features in Detail

### Quiz Creation
- **Topic-based**: Enter any subject (e.g., "The Renaissance Period")
- **File-based**: Upload PDF, DOCX, PPTX, or TXT files
- **Customization**: 5-50 questions, 3 difficulty levels, custom titles
- **Draft system**: Save progress and resume later

### Quiz Taking
- Countdown timer with auto-submit
- Progress bar tracking
- Navigation between questions
- Unsaved progress warnings

### Results & Analytics
- Percentage score with color coding
- Question-by-question review
- Last score tracking on quiz cards

## 🚧 Known Issues

- Password field is for UI simulation only (no actual password validation)
- No OAuth/JWT implementation (simple email-based auth)

## 🔮 Future Enhancements

- Real authentication with bcrypt/JWT
- Quiz sharing and public quizzes
- Analytics dashboard
- PWA support for offline usage
- Multi-language support

## 📄 License

This project is for educational purposes.

## 👤 Contact

For questions or support, refer to your project documentation.

---

**Ready to run!** Execute `npm run dev:all` and visit `http://localhost:3000`

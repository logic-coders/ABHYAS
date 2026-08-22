# 🚀 ABHYAS — Production-Ready Next.js 14 Exam Platform

ABHYAS is a modern, high-performance, bilingual (English & Hindi) test series and competitive exam simulation platform built with **Next.js 14 (App Router)**, **TypeScript**, **MongoDB (Mongoose)**, and **Google Gemini AI**.

---

## 📁 Architecture & Directory Structure

```
abhyas-app/
├── app/                              # Next.js 14 App Router Routes
│   ├── (public)/                     # Public Auth & Info Routes (login, register)
│   ├── (protected)/                  # Protected Student & Admin Portals
│   │   ├── admin/                    # Admin test creation & user management
│   │   ├── exam/[seriesId]/          # Live exam arena with timer & navigation
│   │   ├── prev-year/                # Previous year papers repository
│   │   ├── profile/                  # User profile & performance statistics
│   │   ├── quiz/[quizId]/            # Rapid speed quizzes (30s timer)
│   │   ├── result/[seriesId]/        # Detailed score breakdowns & analysis
│   │   ├── test-history/             # Student test history & past scores
│   │   └── tests/                    # Practice simulations & subject filters
│   ├── api/                          # REST & Serverless Route Handlers
│   │   ├── admin/                    # TXT parsing, test creation & user approvals
│   │   ├── auth/                     # JWT Authentication & password recovery
│   │   ├── exam/                     # Exam question serving & automated scoring
│   │   ├── quiz/                     # Daily quizzes & speed challenge generator
│   │   ├── streak/                   # Gamified daily practice streak tracker
│   │   └── test-series/              # Public test catalog endpoints
│   ├── globals.css                   # Global CSS design tokens & utilities
│   ├── layout.tsx                    # Root shell layout with Theme & Auth providers
│   └── page.tsx                      # Modular public landing page
│
├── components/                       # Domain-Driven Reusable UI Components
│   ├── admin/                        # Admin-only test management & dashboard UI
│   │   ├── AdminForm.tsx             # 3-File TXT parser, matcher & live editor
│   │   ├── AdminQuizManager.tsx      # Speed quiz management
│   │   └── AdminUserManagement.tsx   # User approval & role administration
│   ├── auth/                         # Authentication & Password Recovery UI
│   │   └── ForgotPasswordModal.tsx
│   ├── exam/                         # Real-time Exam Arena & Player UI
│   │   ├── DisclaimerModal.tsx       # Exam start rules & guidelines modal
│   │   ├── ExamTimer.tsx             # Countdown timer with warning thresholds
│   │   ├── LanguageSelector.tsx      # Instant English ↔ Hindi switcher
│   │   ├── Pagination.tsx            # Test question pagination
│   │   ├── QuestionNavigator.tsx     # Grid question status drawer (1-150)
│   │   ├── QuestionView.tsx          # Dual-language statement & option renderer
│   │   ├── SubjectFilter.tsx         # Subject filter pills
│   │   └── TestSeriesCard.tsx        # Test series cards
│   ├── landing/                      # Landing page sections & showcases
│   │   ├── AboutSection.tsx          # Feature overview cards
│   │   ├── HeroSection.tsx           # Interactive hero & VIP access ticket
│   │   ├── ProductShowcase.tsx       # Real product screenshots
│   │   └── TestimonialsSection.tsx   # Student reviews & ratings
│   ├── layout/                       # Shared shell & navigation components
│   │   ├── Footer.tsx                # Global footer
│   │   ├── Header.tsx                # Responsive top navigation & user menu
│   │   └── MobileBottomNav.tsx       # Mobile bottom app navigation bar
│   ├── profile/                      # User dashboard, profile & approval UI
│   │   ├── ProfileHistory.tsx        # Past exam breakdown & stats
│   │   ├── ProfileView.tsx           # User settings & security
│   │   └── UserApprovals.tsx         # Pending user verification queue
│   ├── results/                      # Post-exam analysis & score breakdowns
│   │   ├── ResultBreakdown.tsx       # Expandable question-by-question review
│   │   └── ResultModal.tsx           # Score celebration modal
│   └── streak/                       # Daily gamification & streak trackers
│       ├── MiniStreakCalendar.tsx    # Header compact streak badge
│       └── StreakCalendar.tsx        # Full monthly activity calendar
│
├── lib/                              # Core Business Logic & Infrastructure
│   ├── context/                      # React Context Providers (Auth, Theme)
│   ├── db/                           # MongoDB Connection & Storage Adapters
│   ├── models/                       # Mongoose Data Schemas (TestSeries, User, Result)
│   ├── parsers/                      # Deterministic TXT Parser & Matcher Engines
│   ├── services/                     # Gemini AI Verifier, S3 Storage, Streak Pool
│   ├── utils/                        # Security, Date formatters & Password hashing
│   └── types/                        # Domain TypeScript Interfaces
│
├── sample_data/                      # Example TXT test imports & answer keys
│   └── test1-answer-key.txt
│
├── scripts/                          # CI/CD, Migrations & Testing Pipelines
│   ├── archive/                      # Archived dev scratch scripts
│   ├── seed-admin.ts                 # Admin user database seeder
│   ├── test-edge-cases.js            # Answer key & matcher edge cases test suite
│   └── test-txt-pipeline.js          # 3-Way TXT synchronization test suite
│
├── public/                           # Static assets, logos, and screenshots
├── .env.local                        # Local environment secrets
├── next.config.mjs                   # Next.js build configuration
├── package.json                      # NPM dependencies & scripts
├── tsconfig.json                     # TypeScript configuration & path aliases
└── eslint.config.mjs                 # Code quality & ESLint configuration
```

---

## 🛠️ Key Technologies

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5.x
- **Database:** MongoDB Atlas via Mongoose
- **AI Integration:** Google Gemini Flash (Academic Test Reverification)
- **Styling:** Modular CSS Tokens & Glassmorphism Design System

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Ensure `.env.local` is present in the root directory:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/abhyas
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

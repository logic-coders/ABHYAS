# Abhyas — Test Exam Platform

Abhyas is a web application that lets users browse available tests, take an exam, and view their results with a breakdown of correct and incorrect answers.

## Features / Pages

### 1. Landing Page
- Introduces Abhyas and its purpose.
- Displays a list of all available **Test Series** created by the admin (each tied to a Subject: Music, Math, History, or Geography).
- Test series can be browsed/filtered by subject.
- Selecting a test series starts the corresponding exam using the question range defined by the admin for that series.

### 2. Exam Page
- Displays one question at a time (single question per page).
- Users navigate between questions using pagination (Next / Previous).
- User's selected answers are retained as they move between questions.

### 3. Result Page
- Displays the final score after the exam is submitted.
- Shows a breakdown of:
  - Questions answered correctly
  - Questions answered incorrectly
- Highlights the correct answer alongside the user's selected answer for review.

### 4. Admin Page
Admin creates a **Test Series** by filling in:
1. **Subject** (Music / Math / History / Geography)
2. **Upload PDF** — the source PDF containing multiple sections, with both questions and answers included
3. **Start Question No.** — beginning of the question range for this test
4. **End Question No.** — end of the question range for this test

- The PDF is uploaded to **Amazon S3** (free tier, 5GB) and the S3 file reference (URL/key) is stored against the test series entry.
- Each submission (Subject + PDF + Start No. + End No.) creates one **Test Series**, which becomes visible on the Landing Page for users to select and take.
- Admin can create multiple test series per subject, each pointing to a different question range within the same or different PDFs.

## Test Series Flow
1. Admin uploads a PDF to S3 and defines a question range (Start No. → End No.) for a given subject — this becomes a **Test Series**.
2. The Landing Page lists all created test series (grouped or filterable by subject) for users to browse and start.
3. When a user starts a test series, the app fetches the PDF from S3 and parses out only the specified question range (Start No. → End No.), extracting both questions and their answers from the PDF content.
4. Questions are rendered one-by-one on the Exam Page (answers are held back from the user, not shown).
5. On submission, the user's selected answers are compared **in real time** against the answers parsed from the same PDF — no separate answer database is needed since the PDF itself contains the answer key.
6. Result Page shows the score immediately, along with which questions were correct/incorrect.

## Architecture Notes
- **No database for questions/answers/results** — the PDF (stored in S3) is the single source of truth for both questions and answers.
- **Test series metadata** (Subject, S3 file reference, Start No., End No.) still needs to be stored somewhere lightweight so the Landing Page can list them — options: a simple JSON/config file, a lightweight key-value store (e.g., DynamoDB free tier, or even a flat file in S3 itself), since this is minimal metadata, not exam data.
- PDF parsing (splitting into question ranges, separating question text from answer) happens **on demand** when a user starts a test — not pre-processed or cached in a database.
- User's answers during the test are held in memory/session (client-side state) only for the duration of the attempt.
- Scoring is computed on the fly at submission time by re-parsing the answer portion of the same PDF range and comparing it to the user's session answers.

## Phase II

### 5. Login / Register
- Users can **Register** and **Login** to access the platform.
- Two roles are supported:
  - **Admin** — restricted to 1–2 people only.
  - **Normal User** — up to 10 people.
- Role is assigned at registration/account creation (e.g., admin accounts created manually/seeded, rather than self-registered, to keep admin access limited to 1–2 people).

### 6. Role-Based Dashboard
- After login, the user is redirected to a dashboard based on their role:
  - **Admin Dashboard** — access to the Admin Page (upload PDFs, create test series, manage subjects/question ranges).
  - **User Dashboard** — access to the Landing Page (browse test series), take exams, and view their own past results.
- Access control ensures normal users cannot reach admin-only actions (e.g., PDF upload, test series creation), and vice versa keeps the experience role-appropriate.

## Phase III

### 7. Profile Page
- Clicking on the **profile picture** (available once logged in) opens the user's profile.
- Profile displays:
  - Basic details filled during registration (name, email, etc.)
  - History of tests taken by the user (test series attempted, scores)

### 8. Admin Access Control (Email-Based)
- Admin access is granted based on a **whitelisted email**, rather than a manually assigned role flag:
  - `chandansingh15102000@gmail.com`
- On login/registration, if the logged-in user's email matches an entry in the admin whitelist, they are routed to the **Admin Dashboard** (Admin Page access); all other users get the standard **User Dashboard**.
- Additional admin emails can be added to this whitelist later if a second admin is needed (per the "1–2 admins" rule from Phase II).

### 9. UI Cleanup — Remove Rocket Emoji
- Remove the 🚀 (rocket) emoji wherever it currently appears across all pages/components.

### 10. Random Test Generation
- Admin can upload **multiple PDFs** (one, two, three, or more) for a single subject over time — building up a larger question pool for that subject.
- A **"Generate Test"** action on the Admin Page creates a test series by:
  - Randomly selecting **80 questions** from the full pool of questions available for that subject (across all uploaded PDFs for that subject).
  - Ensuring the **same set of 80 questions is not repeated** on subsequent "Generate Test" actions for that subject (i.e., avoids generating an identical test twice in a row / repeatedly).
- The generated test (80 randomly selected questions) becomes a new Test Series, visible on the Landing Page like other test series.

## Phase IV

### 11. Language Selection (English / Hindi)
- On opening a test (from its PDF-based test series), the user is prompted to choose a language: **English** or **Hindi**.
- If the user selects **English**, questions are populated/rendered in English.
- If the user selects **Hindi**, questions are populated/rendered in Hindi.
- The selected language applies consistently across all questions for that test attempt.

### 12. Question Navigator Panel
- While taking the test, a **question number panel** is shown on the right side of the Exam Page (similar to real exam interfaces), listing all question numbers for the test.
- Clicking any question number in the panel takes the user **directly to that specific question**, instead of only moving sequentially via Next/Previous.
- Each question number's color reflects its status:
  - **Green** — question has been answered (an option was selected) before moving to the next question.
  - **Red** — question was left unanswered (no option selected) when the user moved to the next question.
- This gives the user a clear, clickable overview of attempted vs. skipped questions at any point during the test.

### 13. Last Question — Submit Flow
- On the **last question** of the test, the usual "Next" button is replaced with two options:
  1. **Previous** — as usual, to go back and review/change earlier answers.
  2. **Submit** — to end and submit the test.
- Clicking **Submit** opens a **popup/modal** showing the test result (score, correct/incorrect breakdown).
- Closing the popup takes the user back into the app, and their **score is updated on their Profile Dashboard**.

## Bug Fixes / Corrections (Phase IV)

### Fix 1 — Language Selection UI
- Change the language selection screen heading to **"Choose Test Mode"** (instead of current wording).
- Options remain: English, Hindi
- **Remove the flag icons** currently shown next to English/Hindi — display as plain text options only, no country flags.

### Fix 2 — Incorrect Option Extraction from PDF
- **Bug:** Currently the PDF parser is hardcoded/limited to extracting only **5 options per question**, but the source PDFs contain a **variable number of options per question** — some questions have more than 5 (seen up to 10 options in testing).
- **Expected behavior:** The parser must **dynamically extract however many options exist for each individual question**.

### Fix 3 — Question Navigator Panel (Right Side)
- **Change UI:** Question numbers in the right-side navigator panel should be displayed as **circular buttons**.
- **Bug:** The green/red color-coding described in Phase IV, Item 12 is **not currently working**.
- **Expected behavior:** When Next is clicked with an answer selected, the circle turns **green**. When Next is clicked without an answer selected, the circle turns **red**.

### Fix 4 — Hindi Question Text Extraction (Encoding Issue)
- **Bug:** When Hindi is selected as the test mode, question text shows **garbled/hash-like characters** due to a text encoding issue.
- **Expected behavior:** Hindi questions must be extracted and rendered as clean, readable Devanagari text on the frontend — matching exactly what appears in the source PDF. This likely requires a better PDF extraction library that handles embedded fonts.

### Fix 5 — Question Navigator: Circle Shape + Color Update (Clarified)
- **Shape:** Each question number must be a **round/circular button**.
- **Color behavior:** Color update applies to the **question just answered**, not the question being navigated to.

### Fix 6 — Option Labeling is Inconsistent
- **Bug:** Option labels are inconsistent and incorrect.
- **Expected behavior:** Option labels must be extracted **exactly as they appear in the PDF** — `(A)` through `(E)`.

### Fix 7 — Multiple Options Getting Selected (Should Be Single-Select)
- **Bug:** Clicking on **one option** is incorrectly selecting **2–3 options simultaneously**.
- **Expected behavior:** Each question must behave as a **single-select (radio button)** input.

### Fix 8 — Navigator Circle Size
- The right-side navigator's question-number buttons should be **circular (round) and larger in size**.

### Fix 9 — Navigator Colors Not Applying At All (Including "Marked" State)
- **Bug:** All question-number buttons in the navigator remain a single default color.
- **Expected behavior:** The navigator must show three distinct visual states: **Green** (answered), **Red** (skipped), and **Purple** (marked). Add a "Mark for Review" button if it doesn't exist.

### Fix 10 — PDF Extraction Accuracy (English & Hindi) Must Be 100% Exact
- **Bug:** Current question/option extraction does not reliably match the source PDF content.
- **Expected behavior:** Extraction accuracy must be 100%.

### Fix 11 — Hindi Answer Fetching Incorrect
- **Bug:** The correct answer being fetched/used for scoring on Hindi questions is not accurate.
- **Expected behavior:** Answers must be fetched strictly from the exact corresponding question number in the source PDF.

### Fix 12 — Lock Test in Fullscreen, No Back Navigation
- **Bug:** Users can use back navigation mid-test.
- **Expected behavior:** Force fullscreen mode and block back navigation during the test.

### Fix 13 — Timer Needs to Be More Prominent
- **Bug:** Timer is not visually prominent enough.
- **Expected behavior:** Redesign timer with bold, larger text, distinct background color, fixed position.

### Fix 14 — Remove Language Flags from Exam Page
- **Bug:** English/Hindi language indicators are shown with country flag icons.
- **Expected behavior:** Remove flag icons.

### Fix 15 — Result Page Question Numbering Must Also Start from 1
- **Bug:** Result Page shows original PDF question numbers.
- **Expected behavior:** Result Page must display questions numbered sequentially starting from 1.

### Fix 16 — Strip "[P.T.O." Artifacts
- **Bug:** Print-layout continuation markers (like `[P.T.O.`, `P.T.O.`, `[P.T.O]`) from source PDFs leak into extracted option text or question text.
- **Expected behavior:** Strip all `P.T.O.` markers from question and option text during PDF parsing.

### Fix 17 — Fix Metadata for Generated Random Tests
- **Bug:** Landing page cards for generated random tests display "1 question, Q0–Q0" instead of "80 questions".
- **Expected behavior:** When generating random tests, correctly store metadata with `totalQuestions: 80` (or actual count).

### Fix 18 — Hide Internal PDF Question Range (Q71–Q150) from Cards
- **Bug:** Landing page test series cards display raw PDF question ranges like "Q71–Q150" or "Q0–Q0".
- **Expected behavior:** Hide internal PDF question numbers from test cards — display only user-facing info like "80 Questions".

### Fix 19 — Vercel Toolbar
- **Note:** Vercel toolbar is disabled via Vercel Dashboard project settings.

## Phase V

### 14. Sequential Question Numbering (Display)
- Regardless of the original question numbers in the source PDF (e.g., PDF questions 71–150), the test UI must display questions numbered sequentially starting from 1 (i.e., Question 1, Question 2, ... Question 80 for an 80-question test).
- Internally, the app maps each displayed number back to its actual PDF question number (needed for correct answer lookup), but user-facing numbering always starts at 1.

### 15. Admin Approval for New User Registrations
- When a new user registers, their account is created in a Pending Approval state — they cannot log in yet.
- The registration request is routed to the Admin.
- Admin can Approve or Reject each pending registration from the Admin Dashboard.
- Only after Approval can that user successfully log in; a Rejected user remains unable to log in (show a clear message if they try).

### 16. Disclaimer Popup After Language Selection
- Immediately after the user selects a language (English/Hindi) to start a test, a disclaimer popup is shown before the test begins, covering the following rules:
  - The timer starts as soon as the test begins.
  - Once time is up, the user cannot interact further with the test (no answering, navigating, or changing answers).
  - Time limit: 1 hour 20 minutes per test.
  - When the timer reaches 0, the test is automatically submitted.
- User must acknowledge/close this popup to proceed into the actual test.

### 17. Persistent Test Timer
- A countdown timer must be visible at all times on the Exam Page (e.g., fixed in a header/corner), regardless of which question the user is currently viewing.
- Timer counts down from 1:20:00 (1 hour 20 minutes) and updates in real time.
- On reaching 0:00, the test is auto-submitted immediately, following the same Submit flow as a manual submission — including showing the result popup and updating the Profile Dashboard.
- Once time expires, all test interactions (option selection, navigation) must be disabled/locked.

### 18. Detailed Result View from Profile Page
- On the Profile Dashboard, clicking on a specific past test from the user's test history opens a detailed result view for that attempt.
- This detailed view matches the same post-submission result page shown right after submitting a test — showing the full question-by-question breakdown of correct vs. incorrect answers, not just the summary score.

## Phase IX

### 27. Dark Mode / Light Mode Toggle
- Global on/off theme toggle allowing users to switch between Dark Mode and Light Mode across the app.
- Toggle accessible in the global header and inside the exam header.
- Theme preference persists across sessions in `localStorage`.
- Comprehensive design tokens and styling across Landing Page, Tests Page, Exam Page, Profile Page, Admin Page, Login/Register, and Modals.

### 28. Confirm Exam Page Layout — Question Navigator, Submit, and Timer
- The question number navigator (right-side panel), Submit Exam button, and Timer follow the reference layout:
  - Circular/rounded numbered navigator with 5 states: Green (Answered), Red (Not Answered), Gray (Not Visited), Purple (Marked for Review), and Purple with Green indicator (Ans & Marked for Review).
  - Prominent digital timer displaying `TIME REMAINING` at the top of the right panel.
  - Action bar with `Mark for Review & Next`, `Clear Response`, `← Previous`, `Save & Next →`, and prominent `Submit Test`.
  - Question Palette panel footer with `Finish & View Scorecard`.
- **Submission Behavior**: The user can submit at any time regardless of how many questions have been answered (0 to N questions). Submission is never blocked by incomplete answers.

## Tech Stack
Next.js, React, CSS Modules

## Getting Started
`npm run dev`

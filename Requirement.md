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

---

## Phase II — Authentication & Role-Based Access

### 5. Login / Register
- Users can **Register** and **Login** to access the platform.
- Two roles are supported:
  - **Admin** — restricted to 1–2 people only.
  - **Normal User** — up to 10 people.
- Role is assigned at registration/account creation (e.g., admin accounts created manually/seeded, rather than self-registered, to keep admin access limited to 1–2 people).

### 6. Role-Based Dashboard
- After login, the user is redirected to a **dashboard** based on their role:
  - **Admin Dashboard** — access to the Admin Page (upload PDFs, create test series, manage subjects/question ranges).
  - **User Dashboard** — access to the Landing Page (browse test series), take exams, and view their own past results.
- Access control ensures normal users cannot reach admin-only actions (e.g., PDF upload, test series creation), and vice versa keeps the experience role-appropriate.

## Tech Stack
_(To be filled in — e.g., Frontend framework, Backend, Database, Hosting)_

## Getting Started
_(To be filled in — installation steps, environment variables, run commands)_

## Folder Structure
_(To be filled in once project scaffolding is set up)_

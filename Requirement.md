# Abhyas — Test Exam Platform

Abhyas is a web application that lets users browse available tests, take an exam, and view their results with a breakdown of correct and incorrect answers.

## Site Structure (Revised Again)
- There is **one single Landing Page**, shown to everyone — logged in or not. It always displays the ABHYAS branding, hero section, "About Abhyas," testimonials, and screenshots (Phase VII content).
- The **header on this same Landing Page changes dynamically based on login state**:
  - **Logged out:** Header shows **Login** and **Register** buttons (top-right), as currently implemented.
  - **Logged in (normal user):** Login/Register buttons are **removed** from the header. Instead, the header shows:
    - **Tests** — a nav item/link that opens the Tests Page (the test series browsing page, described in Item 1) in place of the old "browse tests" flow.
    - **Profile icon** — opens the Profile dropdown (Phase VI, Item 21: Profile, Logout).
  - **Logged in (admin):** Same as normal user, **plus** an **Admin** nav item/link, which opens the Admin Dashboard.
- **After a successful Login or Register**, the user is redirected back to **this same Landing Page** (not a separate page) — the header simply updates to its logged-in state (Tests / Profile / Admin, as above) instead of navigating somewhere new.
- Clicking **Tests** (logged-in header) or **Admin** (admin header) navigates to their respective pages, as in a typical modern web app (persistent header, page content swaps below it).

> Note: All earlier mentions of "Tests Page" throughout this document refer to the page opened via the **Tests** nav item once logged in (previously also referred to as "Landing Page" in the oldest version of this doc — the test-series browsing page is a separate page from the marketing Landing Page described above).

## Features / Pages

### 0. Landing Page (Public + Logged-In, Same Page)
- This is the **first page** anyone sees when they open the website, and it remains the page they're on even after logging in (per Site Structure above) — only the header changes based on auth state.
- Displays information **about Abhyas**: what it is, what it does, and how it helps users (see Phase VII, Item 23 for content details).
- Includes **2–3 real user testimonials** and **screenshot(s)** of the actual test-taking experience (see Phase VII, Items 24–25).
- **Header (logged out):** Login and Register buttons, top-right.
- **Header (logged in):** Login/Register buttons removed; replaced with **Tests**, **Profile icon** (and **Admin**, for admin users only) — per Site Structure above.
- A visitor who isn't ready to sign up can simply read the page content and leave — no login is forced to view this page.

### 1. Tests Page (Requires Login)
- Reached via the **Tests** nav item in the logged-in header (Item 0).
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

> **Note:** Enforcing "no repeat" for random test generation requires tracking which questions (or which question combinations) have already been used in a previously generated test for that subject. Since the app is intentionally avoiding a full database (see Architecture Notes), this tracking needs *some* minimal persisted state — e.g., a lightweight store of "recently used question IDs per subject" (could live in the same lightweight metadata store used for Test Series, such as DynamoDB free tier or a JSON file in S3) rather than a full relational database. This should be finalized before implementing this feature.

## Phase IV

### 11. Language Selection (English / Hindi)
- On opening a test (from its PDF-based test series), the user is prompted to choose a language: **English** or **Hindi**.
- If the user selects **English**, questions are populated/rendered in English.
- If the user selects **Hindi**, questions are populated/rendered in Hindi.
- The selected language applies consistently across all questions for that test attempt.
- *(Depends on the source PDF containing both English and Hindi versions of each question, so the correct version can be extracted and shown based on the user's choice.)*

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
- Closing the popup takes the user back into the app, and their **score is updated on their Profile Dashboard** (reflected in their test history, per the Profile Page in Phase III).

## Bug Fixes / Corrections (Phase IV)

### Fix 1 — Language Selection UI
- Change the language selection screen heading to **"Choose Test Mode"** (instead of current wording).
- Options remain:
  - English
  - Hindi
- **Remove the flag icons** currently shown next to English/Hindi — display as plain text options only, no country flags.

### Fix 2 — Incorrect Option Extraction from PDF
- **Bug:** Currently the PDF parser is hardcoded/limited to extracting only **5 options per question**, but the source PDFs contain a **variable number of options per question** — some questions have more than 5 (seen up to 10 options in testing).
- **Expected behavior:** The parser must **dynamically extract however many options exist for each individual question** (not a fixed count), so:
  - A question with 4 options shows 4 options.
  - A question with 10 options shows all 10 options.
  - No options should be dropped, truncated, or merged incorrectly during extraction.
- This needs to be fixed in the PDF parsing logic so option count is read per-question from the PDF content itself, not assumed to be a constant.

### Fix 3 — Question Navigator Panel (Right Side)
- **Change UI:** Question numbers in the right-side navigator panel should be displayed as **circular buttons** (not square/rectangular), consistent with typical exam interfaces.
- **Bug:** The green/red color-coding described in Phase IV, Item 12 (green = answered, red = skipped/unanswered) is **not currently working** — clicking "Next" does not update the question number's color at all.
- **Expected behavior (recap):**
  - When the user selects an option for a question and clicks Next → that question's circle turns **green**.
  - When the user clicks Next **without** selecting any option → that question's circle turns **red**.
- This needs to be fixed so the color state updates correctly and immediately on each Next click, based on whether an option was selected for the current question.

### Fix 4 — Hindi Question Text Extraction (Encoding Issue)
- **Bug:** When Hindi is selected as the test mode, question text does not render properly — instead of readable Hindi text, the frontend shows **garbled/hash-like characters** (indicating a text encoding issue during PDF extraction, not an actual content problem).
- **Confirmed:** The source PDF (`music 10th (2024).pdf`, referenced page 25/46) contains **clean, properly formatted Hindi (Devanagari) text**, with clear question numbering and consistently labeled options `(A)`–`(E)` for every question. This confirms the issue is **purely in extraction/rendering**, not in the source PDF content — the text must be extracted **exactly as it appears in the PDF**, with no transformation needed to the actual Hindi content itself.
- **Likely cause:** Hindi text in the PDF (Devanagari script) is likely not being extracted/decoded with the correct character encoding (e.g., font-embedded glyphs being read as raw bytes instead of proper Unicode text), which is a known issue with certain PDF text-extraction libraries when handling non-Latin scripts.
- **Expected behavior:** Hindi questions must be extracted and rendered as clean, readable Devanagari text on the frontend — matching **exactly** what appears in the source PDF (same wording, same option text, same option lettering).
- This needs to be fixed at the PDF parsing layer — likely requires using a PDF text-extraction method/library that correctly handles Unicode/Devanagari fonts (may need OCR-based extraction as a fallback if the PDF's Hindi text is embedded as non-standard/custom font glyphs rather than proper Unicode text). Test extraction directly against `music 10th (2024).pdf` page 25 (questions 88–95) as a reference sample to confirm the fix.

### Fix 5 — Question Navigator: Circle Shape + Color Update (Clarified)
- **Shape:** Each question number in the right-side navigator panel must be a **round/circular button**.
- **Color behavior (explicit example):** If the user is on **Question No. 10**, selects an option, and clicks **Next** — **Question No. 10's circle** (the one just answered, not the next one) must immediately turn **green** in the navigator panel.
- This is the same requirement as Fix 3, called out explicitly with an example to make sure the color update applies to the **question just answered**, not the question being navigated to.

### Fix 6 — Option Labeling is Inconsistent
- **Bug:** Option labels are currently inconsistent and incorrect — e.g., options on the same question show up as `(अ)`, `(इ)`, `(३)`, `D`, `(ए)` (a mix of Hindi letters, a numeral, and a Latin letter, in no logical order).
- **Confirmed:** The source PDF itself already uses a **single, consistent labeling scheme** for every question, in both language sections: `(A)`, `(B)`, `(C)`, `(D)`, `(E)` — Latin letters, even for Hindi-language questions (per `music 10th (2024).pdf`, questions 88–95 reference). There is no separate Hindi-lettered labeling (e.g., क/ख/ग) in the source PDF.
- **Expected behavior:** Option labels must be extracted **exactly as they appear in the PDF** — `(A)` through `(E)`, in order, for every question, regardless of whether the question text itself is in English or Hindi. The current mixed/garbled labels are an extraction bug, not a reflection of the source content.
- The labeling must be extracted directly from the PDF's actual option markers, not re-generated or guessed by the app — since the PDF already provides the correct, consistent format.

### Fix 7 — Multiple Options Getting Selected (Should Be Single-Select)
- **Bug:** Clicking on **one option** is incorrectly selecting **2–3 options simultaneously**.
- **Expected behavior:** Each question must behave as a **single-select (radio button)** input — clicking one option must:
  - Select only that option.
  - Automatically deselect/unselect any previously selected option for that same question.
- This needs to be fixed in the option-selection state logic — currently behaving like a multi-select/checkbox group instead of a radio group.

### Fix 8 — Navigator Circle Size
- The right-side navigator's question-number buttons should be **circular (round) and larger in size** than currently shown — current circles are too small for comfortable clicking, especially on mobile/smaller screens.
- Combined with Fix 5: on clicking **Next**, the corresponding circle (the question just answered/skipped) should update to **green** (answered) or **red** (skipped) immediately, at this new larger circular size.

### Fix 9 — Navigator Colors Not Applying At All (Including "Marked" State)
- **Bug:** All question-number buttons in the navigator remain a single default **white/grey** color regardless of status — the color-coding is not being applied at all, for any state.
- **Expected behavior:** The navigator must show **three distinct visual states**, matching the legend already shown above the panel:
  - 🟢 **Green** — question answered (an option was selected before moving away from it).
  - 🔴 **Red** — question skipped (left unanswered when moving away from it).
  - 🟣 **Purple** — question marked (if a "Mark for Review" action exists/is added — see note below).
  - Default/unvisited questions (not yet attempted) can remain the current neutral white/grey until the user reaches them.
- **Note:** The panel legend already shows "0 Answered / 0 Marked / 0 Skipped," meaning a **"Mark for Review"** feature is expected but not yet confirmed as implemented — if this button doesn't currently exist on the Exam Page, it needs to be added (typically a separate "Mark for Review" button alongside Next/Previous) so the purple state has a real trigger. Confirm with admin/product owner if marking should be optional-only, or also part of the required flow.
- This must be fixed so each button's background color updates **immediately and correctly** based on real answer/skip/mark state — not just visually listed as a legend with no functional effect.

### Fix 10 — PDF Extraction Accuracy (English & Hindi) Must Be 100% Exact
- **Bug:** Current question/option extraction (for both English and Hindi) does not reliably match the source PDF content — text differs, gets cut off, garbled, or mislabeled (see Fixes 2, 4, and 6).
- **Expected behavior:** Extraction accuracy must be **100% — an exact match** to the source PDF for every question and every option, in both languages:
  - No missing, altered, truncated, or garbled characters/words.
  - No incorrect option counts (see Fix 2).
  - No incorrect option labels (see Fix 6).
  - Hindi (Devanagari) text must render exactly as written in the PDF (see Fix 4).
- **Verification approach:** Before considering this fixed, extraction output should be spot-checked question-by-question against the actual PDF (e.g., `music 10th (2024).pdf`) for a sample range (e.g., Q71–Q150, matching the current test in progress) to confirm exact text match, not just "looks roughly right."
- This is a blocking-quality requirement — inaccurate question/option text directly affects exam correctness and cannot ship with partial accuracy.

### Fix 11 — Hindi Answer Fetching Incorrect
- **Bug:** The correct answer being fetched/used for scoring on Hindi questions is not accurate — it does not reliably correspond to the actual question shown.
- **Expected behavior:** Answers must be fetched strictly from the **same Start Question No. → End Question No. range** specified by the admin at test-creation time (see Admin Page, Phase I, Item 4). For every question rendered in a test, its answer must be pulled from that exact corresponding question number in the source PDF — not looked up independently or mismatched across ranges/sections.
- This applies to both English and Hindi modes, but is specifically confirmed broken in Hindi currently — verify both after the fix.

### Fix 12 — Lock Test in Fullscreen, No Back Navigation
- **Bug:** Once a user enters a test, browser/back navigation is still available, and the test isn't locked into fullscreen — allowing the user to exit or navigate away mid-test.
- **Expected behavior:**
  - As soon as the user enters the Exam Page, the browser is forced into **fullscreen mode**.
  - The **back button/back navigation must be disabled or blocked** for the duration of the test (no browser back, no in-app back button visible).
  - The user should have **no way to exit the test** except by completing it via **Submit** (manual or timer auto-submit, per Item 17).
- Consider also handling edge cases: browser refresh, closing the tab, or pressing Esc to exit fullscreen — decide and document the intended behavior for these (e.g., warn the user, or treat as auto-submit) before implementation.

### Fix 13 — Timer Needs to Be More Prominent
- **Bug:** The current timer is not visually prominent enough — users don't naturally notice how much time is left.
- **Expected behavior:** Redesign the timer to be a clear, attention-grabbing element:
  - **Bold, larger text** for the time display.
  - A **distinct background color** (e.g., a warning-style color block) that makes it stand out from the rest of the page — separate from the neutral page background.
  - Should remain in a fixed, always-visible position (per Phase V, Item 17).
  - Optional enhancement to consider: color intensifies (e.g., turns red/pulses) as time runs low (e.g., last 5 minutes), to increase urgency — confirm if this extra behavior is wanted.

### Fix 14 — Remove Language Flags from Exam Page
- **Bug:** English/Hindi language indicators are shown with **country flag icons** on the test page itself (not just the initial "Choose Test Mode" screen from Fix 1), which looks out of place.
- **Expected behavior:** Remove flag icons wherever "EN"/"HI" or language indicators appear on the Exam Page — display as **plain text only** (e.g., "EN" or "Hindi"), consistent with the flag removal already required on the language selection screen (Fix 1).

### Fix 15 — Result Page Question Numbering Must Also Start from 1
- **Bug:** On the post-submission Result Page, the question-by-question breakdown still shows the original PDF question numbers (e.g., starting from 71), instead of matching the sequential numbering used during the test.
- **Expected behavior:** The Result Page must display questions numbered **sequentially starting from 1** (Question 1, Question 2, ...), consistent with the numbering already required on the Exam Page itself (Phase V, Item 14). The underlying PDF question number can still be used internally for answer lookup, but must not be shown to the user as the question number.

### Fix 16 — "[P.T.O." Artifact Leaking into Option Text
- **Bug:** On the last option of a question (e.g., Q80, option E: "None of the above [P.T.O."), the extracted text includes a stray **"[P.T.O."** (Please Turn Over) fragment — a page-continuation artifact from the source PDF's print layout, not actual option content.
- **Expected behavior:** The PDF parser must **strip page-layout artifacts** like "P.T.O.", page numbers, or continuation markers from extracted question/option text — these are formatting cues meant for a printed page, not part of the actual question or answer content, and must never appear in the rendered test.
- Recommend scanning extracted text for a small set of known artifact patterns (e.g., "P.T.O.", "Page X of Y", trailing page numbers) and removing them during/after extraction, as an addition to the extraction-accuracy work in Fix 10.

### Fix 17 — Random Test Shows Wrong Question Count on Landing Page
- **Bug:** On the Landing Page, a randomly generated test ("Random Music Test - 8/10/2026") displays as **"1 question, Q0 – Q0"**, but when the user actually starts it, the test correctly loads **80 questions**. The card's displayed metadata does not match the actual generated test content.
- **Expected behavior:** The Landing Page card for any test (including randomly generated ones, per Phase III Item 10) must accurately reflect the real question count for that test — "80 questions" in this case, not a placeholder or incorrectly calculated "1 question, Q0–Q0".
- Likely cause: the random test generation flow (Fix/Item 10) isn't correctly writing the actual selected question count/range into the test series metadata used to render Landing Page cards — this needs to be fixed at the point where the random test series entry is created.

### Fix 18 — Hide Source PDF Question Range (Q71–Q150) from Users
- **Bug:** Landing Page test cards currently display the **original PDF question range** (e.g., "Q71 – Q150") to the user. This exposes internal details about where questions are sourced from within the PDF, which should not be visible to end users.
- **Expected behavior:** Remove the "Q[start] – Q[end]" range display from all Landing Page test cards. Only show the **question count** (e.g., "80 questions") — not the underlying PDF question numbers, consistent with the sequential-numbering-only rule already required elsewhere (Fix 15, Phase V Item 14).

### Fix 19 — Remove Vercel Toolbar from Production Site
- **Bug:** The **Vercel Toolbar** (developer/preview toolbar, showing a floating menu icon in the corner) is currently visible to normal users on the live production site (`.vercel.app` URL).
- **Expected behavior:** The Vercel Toolbar must not appear for regular visitors/users on production. This is a Vercel project setting, not application code — go to the Vercel project → **Settings → Toolbar**, and disable it for Production (it can remain enabled for Preview/local development only, if useful during testing).

## Phase V

### 14. Sequential Question Numbering (Display)
- Regardless of the original question numbers in the source PDF (e.g., PDF questions 71–150), the test UI must display questions **numbered sequentially starting from 1** (i.e., Question 1, Question 2, ... Question 80 for an 80-question test).
- Internally, the app can still map each displayed number back to its actual PDF question number (needed for correct answer lookup per Fix 11), but the **user-facing numbering always starts at 1**.

### 15. Admin Approval for New User Registrations
- When a new user registers, their account is created in a **Pending Approval** state — they **cannot log in yet**.
- The registration request is routed to the **Admin** (per the admin whitelist in Phase III, Item 8).
- Admin can **Approve** or **Reject** each pending registration from the Admin Dashboard.
- Only after **Approval** can that user successfully log in; a **Rejected** user remains unable to log in (optionally show a clear message if they try).

### 16. Disclaimer Popup After Language Selection
- Immediately after the user selects a language (English/Hindi) to start a test, a **disclaimer popup** is shown before the test begins, covering the following rules:
  - The timer **starts as soon as the test begins**.
  - Once time is up, the user **cannot interact further** with the test (no answering, navigating, or changing answers).
  - **Time limit: 1 hour 20 minutes** per test.
  - When the timer reaches **0**, the test is **automatically submitted**.
- User must acknowledge/close this popup to proceed into the actual test.

### 17. Persistent Test Timer
- A **countdown timer** must be visible **at all times** on the Exam Page (e.g., fixed in a header/corner), regardless of which question the user is currently viewing.
- Timer counts down from **1:20:00** (1 hour 20 minutes) and updates in real time.
- On reaching **0:00**, the test is **auto-submitted** immediately, following the same Submit flow as a manual submission (Phase IV, Item 13) — including showing the result popup and updating the Profile Dashboard.
- Once time expires, all test interactions (option selection, navigation) must be disabled/locked, per the disclaimer in Item 16.

### 18. Detailed Result View from Profile Page
- On the Profile Dashboard (Phase III, Item 7), clicking on a **specific past test** from the user's test history opens a **detailed result view** for that attempt.
- This detailed view matches the **same post-submission result page** shown right after submitting a test (per Phase IV, Item 13) — showing the full question-by-question breakdown of correct vs. incorrect answers, not just the summary score.

## Phase VI — UI/UX Polish

### 19. Header Visual Separation
- The header/navigation bar currently blends into the page body (same background color), making it hard to visually distinguish.
- Add clear visual separation between the header and the body — e.g., a distinct background shade, a bottom border, or a subtle shadow — so the header reads as a separate fixed element from the page content below it.

### 20. Add a Footer
- Add a simple footer to the app (visible on main pages, e.g., Landing Page).
- Keep it minimal/simple — e.g., site name (ABHYAS), a short tagline or copyright line, and optionally basic links (Contact, About) if needed later. No heavy content required.

### 21. Simplify Header — Move User Info into Profile Dropdown
> Applies to the header shown on **authenticated pages** (Tests Page, Exam Page, Profile Page, Admin Page) — not the new Public Landing Page, which instead shows Login/Register buttons per Phase VII, Item 26.
- **Admin view:** Current header display (profile icon + name + "ADMIN" badge, visible directly in the header) is fine as-is — no change needed for admin users.
- **Normal user view:** Remove the user's name from being directly visible in the header. Only show the **profile icon/avatar** in the header.
  - Clicking the profile icon opens a **dropdown menu** with:
    1. **Profile** — navigates to the Profile Page (Phase III, Item 7).
    2. **Logout** — logs the user out.
  - This keeps the header clean and consistent for normal users, while admin retains its current (already-approved) layout.

### 22. Mobile Responsiveness
- Ensure the entire app is **fully responsive** and works properly on mobile screen sizes, including but not limited to:
  - Header (and the new profile dropdown from Item 21)
  - Landing Page test cards (Item 1)
  - Exam Page — question text, options, right-side navigator panel (should adapt for smaller screens, e.g., collapsible/drawer-style navigator per earlier design, Phase IV Item 12)
  - Timer (Fix 13) — remains visible and prominent on smaller screens
  - Admin Page forms, Result Page, Profile Page, and the new Footer (Item 20)
- All buttons, text, and interactive elements must remain usable (properly sized, tappable) on mobile — no overlapping or cut-off content.

### Fix 20 — Profile Dropdown Spacing/Alignment
- **Bug:** In the profile dropdown menu (Item 21), the **"Profile"** and **"Test History"** items are not properly aligned/spaced:
  - They lack adequate **left margin/padding** from the edge of the dropdown.
  - There isn't enough **space between the icon and the label text** for each item (icon and text appear too close together).
- **Expected behavior:**
  - Add consistent left padding to all dropdown menu items ("Profile", "Test History", "Logout") so they're not flush against the dropdown's left edge.
  - Add proper spacing (gap) between each item's icon and its text label, matching typical dropdown menu spacing conventions — consistent across all three items for visual alignment.

## Phase VII — Public Landing Page Content

> Supersedes the earlier version of this phase — this content now lives on the new **Public Landing Page** (Item 0), not the authenticated Tests Page.

### 23. "About Abhyas" Section
- On the **Public Landing Page**, add a text section explaining:
  - What Abhyas is (a test/exam practice platform).
  - What it does (lets users practice with real test papers across subjects, take timed exams, get instant results).
  - How it helps the user — framed around helping an **associate achieve their goal** (e.g., exam preparation, skill assessment, certification practice — tie the copy to the actual target audience/use case).
- Keep this section concise and welcoming — a short paragraph or a few lines, not a long block of text.

### 24. User Feedback / Testimonials Section
- On the **Public Landing Page**, add a section showing **2–3 feedback quotes from real users**.
- Each testimonial should include: user's name (or initials, if preferring privacy), a short quote about their experience, and optionally their role/goal (e.g., "Prepared for XYZ exam").
- Content/quotes to be provided separately (real user feedback) — not placeholder/fake testimonials.

### 25. Product Screenshot Showcase
- On the **Public Landing Page**, add **screenshot(s) of the actual test-taking experience** (e.g., the Exam Page with a question, options, and navigator), to visually show prospective users what taking a test on Abhyas looks like.
- Should be placed appropriately within the page flow (e.g., near or after the "About Abhyas" section) to support the written description with a visual.

### 26. Login / Register Buttons on Landing Page
- The **Login** and **Register** pages themselves should remain **exactly as they currently are** — no visual or structural changes to those pages.
- What's required: **Login** and **Register** buttons in the top-right corner of the **Landing Page** header (Item 0, logged-out state), which correctly navigate to their respective pages and function properly (this is a placement + functionality requirement, not a redesign of the Login/Register pages themselves).
- After successful login/registration, the user lands back on the **same Landing Page**, with the header now showing the logged-in state (Tests / Profile / Admin), per Site Structure above — not a separate redirect destination.

## Phase VIII — Additional Fixes

### Fix 21 — Registration Success Popup Not Appearing
- **Bug:** After a user completes registration and clicks the Register button, no confirmation popup appears. Expected: a **green success popup/toast** confirming "You have successfully registered."
- **Expected behavior:** On successful registration (API call succeeds, account created), show a **green success popup/toast notification** with a message such as "You have successfully registered." before/while redirecting the user onward (e.g., to Login, or per the Admin Approval flow in Phase V Item 15, a message indicating their registration is pending admin approval, if that's the more accurate state at this point).
- **Action needed:** Investigate why this popup currently isn't firing at all — check whether:
  - The success popup/toast component exists but isn't being triggered after the registration API call succeeds, or
  - It was never implemented for the Register flow (only exists elsewhere, if at all).
- Confirm the popup appears reliably every time registration succeeds, and does **not** appear on failed registration attempts (a different error-state message should show instead, if not already handled).

### Fix 22 — Deep Re-Analysis of Hindi Question Extraction (Critical Accuracy Issue)
- **Bug:** Despite earlier fixes (Fix 4, Fix 10, Fix 11), Hindi question extraction still has **significant word-level mismatches** compared to the source PDF, and **some questions are still unreadable** — showing broken/special characters instead of proper Devanagari text.
- **This is a blocking, high-priority bug.** Specific question numbers with mismatches will be shared separately (by the requester) and must be checked one-by-one against the exact corresponding page/question in the source PDF — this is not a one-line fix, it requires a proper root-cause investigation.
- **Required approach:**
  1. **Deep analysis first:** Before attempting another quick fix, investigate *why* extraction is failing for these specific questions — check the PDF's font encoding for the Hindi text (e.g., whether Devanagari glyphs are embedded as standard Unicode fonts vs. custom/subsetted fonts that don't map to real Unicode code points — the latter is a common root cause of "special character soup" output).
  2. **Compare current extraction method's output** against the raw PDF text layer (e.g., using a tool like `pdftotext`, `pdfplumber`, or similar) to confirm whether the underlying text layer itself is broken (PDF-side problem) or whether the app's parsing logic is misreading otherwise-correct text (app-side problem).
  3. **If the PDF's text layer is genuinely broken/non-Unicode** for Hindi content: extraction must fall back to **OCR-based text extraction** (e.g., Tesseract with Hindi language data, or a cloud OCR service) applied specifically to the Hindi sections, since plain text-layer extraction cannot recover proper characters from non-standard font encodings.
  4. **If the text layer is actually fine** and the bug is in the app's parsing/rendering logic: fix the parsing logic so it decodes and displays the text exactly as-is, with zero transformation/mangling.
- **Accuracy bar: 100% — an exact match to the source PDF**, word-for-word, for every Hindi question and option. Partial or "mostly correct" extraction is not acceptable given this directly affects real exam content.
- **If 100% accuracy genuinely cannot be achieved** with the current PDF source (e.g., if the PDF's Hindi text is fundamentally non-extractable even via OCR, due to poor scan quality or corrupted font data) — this must be stated clearly and explicitly, along with the specific technical reason why, rather than shipping a partially-correct result. In that case, alternate options to consider and present back for a decision:
  - Manually re-typing/transcribing the Hindi questions for the affected range as a one-time content-correction task (bypassing PDF extraction entirely for those specific questions).
  - Requesting a cleaner/re-exported source PDF (e.g., re-generated from the original document source rather than a scanned/flattened version), if available.
- Test/verify against the specific question numbers to be shared, plus a broader spot-check across the full Hindi question set, before marking this fix complete.

### Fix 23 — Fix Recurring Hindi Word Errors at the Source (Common Word Correction Layer)
- **Status:** Hindi extraction accuracy has improved to roughly **70%** after Fix 22 — meaningful progress, but not yet reliable enough for production use.
- **Observation:** A large share of the remaining errors are **the same specific words/characters being extracted incorrectly again and again**, across many different questions — not random one-off mistakes. These are common, recurring terms that consistently come out wrong.
- **Required approach (systemic fix, not one-by-one):**
  1. **Actually take the exam yourself in Hindi mode, end-to-end**, question by question, and note down every word/term that is rendering incorrectly — build a real list from direct observation, not assumptions.
  2. Compare each incorrect word against the exact correct word/spelling as it appears in the source PDF.
  3. Build a **common word-correction mapping** (a lookup table of "wrong extracted form → correct Hindi word") for these recurring problem terms, and apply it as a **correction/post-processing layer** on top of the extraction pipeline — so any time one of these known-problematic words is extracted, it gets automatically corrected to the right word before being shown to the user.
  4. This mapping should be **easy to extend** going forward — if a new recurring bad word is spotted later, it can be added to the same correction list without needing another deep extraction-logic change.
- **Goal:** This is meant to close the gap between the current ~70% and full accuracy for the *recurring/common* error cases specifically, so **the same mistakes don't keep resurfacing** in future tests/PDFs — while the deeper root-cause work from Fix 22 continues in parallel for less common/one-off extraction issues.
- **Deliverable:** After this fix, re-run a full Hindi test attempt (all questions) and confirm the previously-recurring incorrect words no longer appear anywhere in the test.

## Phase IX — Theme & Exam UI Layout

### 27. Dark Mode / Light Mode Toggle
- Add an **on/off toggle** allowing users to switch between **Dark Mode** and **Light Mode** across the app.
- Toggle should be easily accessible (e.g., in the header, near the profile icon).
- The selected theme should apply consistently across all pages (Landing Page, Tests Page, Exam Page, Profile Page, Admin Page).
- User's theme preference should persist across sessions (e.g., remembered on next visit/login), not reset every time.

### 28. Confirm Exam Page Layout — Question Navigator, Submit, and Timer
- The **question number navigator** (right-side panel), **Submit Exam** button, and **Timer** should follow the layout already shown in the reference screenshot shared earlier (Music Test example: circular numbered navigator with green/purple/red states, "Submit Exam" button next to "Mark for Review" and "Clear Response," and the timer displayed prominently at the top).
- **Submission behavior:** The user must be able to click **Submit Exam at any time**, regardless of how many questions have been answered — submission is **not blocked** by incomplete answers. Whatever has been answered so far (including zero questions answered) is accepted and scored on submission.
- This confirms/finalizes the layout and behavior already defined earlier (Phase IV Item 13, Fix 5/8/9 for the navigator, Fix 13 and Phase V Item 17 for the timer) — no new question count or answer-completion restrictions should be added on top of Submit.

## Phase X — Quiz Feature

### 29. "Quiz" Nav Item in Header
- Add a new **Quiz** nav item in the header, placed **beside Tests** (i.e., logged-in header now shows: Tests, Quiz, Profile icon — and Admin, for admin users), per the header structure defined in Site Structure / Item 0.
- Clicking **Quiz** navigates to the Quiz section/page.

### 30. Quiz Format — 20 Questions, 30-Second Timer Per Question
- A Quiz consists of **20 questions** (distinct from the standard 80-question Test format defined earlier).
- Each question has its own **30-second timer**:
  - Timer starts as soon as the question is shown.
  - If the user doesn't answer within 30 seconds, the question is automatically marked as **skipped/unanswered**, and the quiz **auto-advances to the next question**.
  - If the user answers before time runs out, they can still be moved to the next question (either automatically on selecting an answer, or via a Next action — to be decided/confirmed during implementation).
- Once all 20 questions are completed (answered or auto-skipped), the quiz ends and shows a **result summary** (score, correct/incorrect breakdown), consistent with the existing Result Page pattern (Phase IV, Item 13).

### 31. Admin — Quiz Creation (Two Methods)
On the Admin Page, add a **"Create Quiz"** section offering two ways to build a quiz:
1. **Upload PDF** — same pattern as Test creation (Phase I, Item 4 / Phase III, Item 10): admin uploads a PDF containing questions and answers, and specifies which questions to pull from it to form the 20-question quiz.
2. **Manual Entry** — admin **directly types in** each question, its options, and the correct answer through a form on the Admin Page (no PDF required) — giving full control to build a quiz exactly as intended, question by question.
- Either method results in a quiz that follows the same format rules from Item 30 (20 questions, 30-second timer each).
- Admin selects the **Subject** for the quiz, same as with Tests.

### 32. Daily Streak Quiz
- Add a **"Streak"** feature to encourage users to return and take a quiz **every day**.
- **One quiz is available per day, for all users**, rotating through subjects on different days (e.g., Music on one day, Math on another, then History, then Geography — one subject per day, cycling).
- Users who complete each day's quiz build up a visible **streak count** (consecutive days completed) — shown on their Profile Page.
- **Admin control:** Add a button in the Admin Panel to **auto-generate** that day's streak quiz — when clicked, the system automatically sources **20 random questions** for that day's subject **without the admin manually providing a PDF or typing questions**.

> **Feasibility note on auto-sourcing questions ("fetch from Google"):** There is no way for an app to literally "pull a quiz question from Google" — Google doesn't offer a general-purpose API for extracting trivia/exam questions. To achieve the *outcome* you're describing (admin clicks one button, gets a ready-made quiz without supplying questions), the realistic options are:
> - **AI-generated questions** — use an LLM (e.g., via the Anthropic API, or another AI provider) to generate 20 subject-appropriate multiple-choice questions with answers, on demand. This is the closest match to "one click, no manual input" and is very feasible, but questions would be AI-generated rather than sourced from a specific external document, so accuracy/relevance should be spot-checked, especially early on.
> - **A trivia/quiz question API** (e.g., existing third-party trivia APIs) — feasible only if a suitable API exists for your specific subjects (Music, Math, History, Geography); coverage and quality vary by provider and would need evaluation.
> - **Pull from your own existing question pool** (the PDFs already uploaded for Tests/Quizzes) — technically simplest and reuses content you already trust, but wouldn't introduce genuinely new questions the admin hasn't seen.
> This should be decided before implementation — most likely **AI-generation via API** is the practical path if the admin truly wants zero manual question input, but confirm this approach before building it.

## Tech Stack
Next.js, React, CSS Modules

## Getting Started
`npm run dev`

## Folder Structure
_(To be filled in once project scaffolding is set up)_

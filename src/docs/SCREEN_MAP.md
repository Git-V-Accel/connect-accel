# Connect-Accel Screen Map & Site Architecture

**Version:** 1.0  
**Date:** November 26, 2025

---

## 1. Information Architecture Overview

```
Connect-Accel Platform
│
├── 🏠 Public Area (Unauthenticated)
│   ├── Landing Page
│   ├── About Us
│   ├── How It Works
│   ├── Pricing
│   ├── Sign Up
│   └── Log In
│
├── 👤 Client Portal
│   ├── Dashboard
│   ├── Projects
│   ├── Create Project
│   ├── Project Detail
│   ├── Consultations
│   ├── Payments
│   ├── Messages
│   └── Settings
│
├── 💼 Freelancer Portal
│   ├── Dashboard
│   ├── Browse Projects
│   ├── My Bids
│   ├── Active Projects
│   ├── Project Detail
│   ├── Wallet & Earnings
│   ├── Messages
│   └── Settings
│
├── 🎯 Admin Portal
│   ├── Dashboard
│   ├── Projects Queue
│   ├── Project Review
│   ├── Freelancer Directory
│   ├── Bidding Management
│   ├── Consultations
│   ├── Disputes
│   ├── Messages
│   └── Reports
│
└── 👑 Super Admin Portal
    ├── Dashboard
    ├── User Management
    ├── System Configuration
    ├── Financial Reports
    ├── Dispute Escalations
    ├── Audit Logs
    └── Analytics
```

---

## 2. Public Area Screens (Unauthenticated)

### 2.1 Landing Page (`/`)

**Purpose:** Marketing homepage to attract both clients and freelancers

**Key Sections:**
- Hero: Value proposition + dual CTAs ("Post a Project" / "Find Work")
- How It Works: 3-step process for clients and freelancers
- Benefits: Why Connect-Accel vs competitors
- Featured Projects (anonymized examples)
- Testimonials
- Pricing overview
- Footer: Links, social, contact

**CTAs:**
- Primary: "Get Started" → Sign Up
- Secondary: "Browse Projects" → Freelancer signup

---

### 2.2 Sign Up (`/signup`)

**Purpose:** User registration with role selection

**Layout:**
- Logo + tagline
- Role selector (large cards):
  - 👤 "I need a project built" → Client
  - 💼 "I want to work on projects" → Freelancer
- Form:
  - Full Name
  - Email
  - Password (with strength indicator)
  - Confirm Password
  - Terms & Privacy checkbox
  - Optional: "Sign up with Google"
- Submit button: "Create Account"
- Footer: "Already have an account? Log in"

**Post-Signup Flow:**
- Email verification sent
- Redirect to role-specific onboarding:
  - Client → Company details form
  - Freelancer → Profile builder wizard

---

### 2.3 Log In (`/login`)

**Purpose:** Authenticate existing users

**Layout:**
- Email
- Password
- "Remember me" checkbox
- "Forgot password?" link
- Login button
- Divider
- "Sign in with Google"
- Footer: "Don't have an account? Sign up"

**Post-Login:**
- Redirect based on role:
  - Client → `/client/dashboard`
  - Freelancer → `/freelancer/dashboard`
  - Admin → `/admin/dashboard`
  - Super Admin → `/superadmin/dashboard`

---

### 2.4 How It Works (`/how-it-works`)

**Purpose:** Explain the process in detail

**Sections:**

**For Clients:**
1. Submit Your Project (or book consultation)
2. We Refine the Scope
3. Receive Curated Matches
4. Track Progress & Pay Milestones

**For Freelancers:**
1. Create Your Profile
2. Get Invited to Relevant Projects
3. Submit Competitive Bids
4. Deliver & Get Paid

**Visual:** Animated flow diagram

---

### 2.5 Pricing (`/pricing`)

**Purpose:** Transparent pricing structure

**Layout:**

**For Clients:**
- "We add 20-25% service margin to ensure quality"
- Example: ₹50,000 project breakdown
  - Freelancer receives: ₹38,000
  - Platform margin: ₹12,000
- Optional consultation fee: ₹2,000 (credited if project proceeds)

**For Freelancers:**
- Free to join and bid
- 2.5% withdrawal fee
- Optional "Pro" subscription: ₹999/month (Phase 2)

**Comparison table:** vs Upwork, Fiverr, Direct hiring

---

## 3. Client Portal Screens

### 3.1 Client Dashboard (`/client/dashboard`)

**Purpose:** Overview of all client activities

**Layout:**

**Header:**
- "Welcome back, [Name]!"
- Quick action button: "+ New Project"

**Widgets (4-column grid):**

1. **Active Projects Card**
   - Count: "3 Active"
   - List of project names with status badges
   - Link: "View All →"

2. **Pending Approvals Card**
   - Count: "2 Milestones Awaiting Review"
   - List with "Review" button
   - Link: "View All →"

3. **Upcoming Deadlines Card**
   - Next 3 milestones with dates
   - Visual timeline

4. **Total Spent Card**
   - This month, All time
   - Small chart

**Main Content:**

**Section: Recent Activity**
- Timeline view:
  - "Freelancer submitted Milestone 2 for Project X" - 2 hours ago
  - "Your project 'Mobile App' moved to bidding" - Yesterday
  - etc.

**Section: Recommended Actions**
- Smart suggestions:
  - "Review milestone for Project X (Due in 1 day)"
  - "Complete your company profile (70% done)"

**Sidebar:**
- Messages widget (recent 3)
- Support widget

---

### 3.2 Projects List (`/client/projects`)

**Purpose:** See all projects (past and current)

**Layout:**

**Header:**
- Title: "My Projects"
- Filter dropdown: All / Draft / In Review / Bidding / Active / Completed / Disputed
- Sort: Newest, Oldest, Budget
- Button: "+ New Project"

**Projects Table:**

| Project Name | Status | Freelancer | Budget | Progress | Actions |
|--------------|--------|------------|--------|----------|---------|
| E-commerce Website | Active | Ravi Kumar | ₹75,000 | 3/5 milestones | View |
| Mobile App MVP | Bidding | - | ₹50,000 | - | View Bids |
| API Integration | Completed | Priya Singh | ₹20,000 | 100% | Review |

**Status badges with colors:**
- Draft (gray)
- Pending Review (yellow)
- In Bidding (blue)
- Active (green)
- In Dispute (red)
- Completed (dark green)

---

### 3.3 Create Project (`/client/projects/new`)

**Purpose:** Multi-step project submission form

**Layout: Stepper (4 steps)**

**Step 1: Basic Details**
- Project Title
- Project Type (dropdown): Web App, Mobile App, API/Backend, UI/UX Design, Other
- Short Description (textarea, 500 char limit)
- Industry (dropdown)
- Next button

**Step 2: Scope & Requirements**
- Detailed Description (rich text editor, 2000 char limit)
- Key Features (dynamic list, add/remove items)
- Tech Stack Preferences (multi-select tags): React, Node.js, Python, etc.
- Attachments (drag & drop, up to 5 files, 10MB each)
- Back / Next

**Step 3: Budget & Timeline**
- Budget Range:
  - Min: ₹[input]
  - Max: ₹[input]
  - Helper text: "Our team will refine this based on scope"
- Timeline:
  - Start Date (date picker)
  - Desired Completion (date picker)
  - Flexible? (checkbox)
- Back / Next

**Step 4: Review & Submit**
- Summary of all entered info
- Editable sections (click to go back)
- Checkbox: "I understand Connect-Accel will review and refine this brief"
- Buttons: Save as Draft / Submit for Review

**Post-Submit:**
- Success message: "Project submitted! Our team will review within 24 hours."
- Redirect to project detail page

---

### 3.4 Project Detail (`/client/projects/[id]`)

**Purpose:** Single source of truth for a project

**Layout:**

**Header:**
- Project title
- Status badge
- Breadcrumb: Projects > [Project Name]
- Actions (contextual based on status):
  - Edit (if draft)
  - View Bids (if bidding)
  - Message Admin
  - Raise Dispute (if active)

**Content Tabs:**

**Tab 1: Overview**
- Project Details (description, scope, tech stack)
- Timeline (start, end dates)
- Budget
- Assigned Freelancer (if any):
  - Profile card with photo, name, rating, skills
  - Contact button
- Admin Notes (if shared with client)

**Tab 2: Milestones**
- Visual progress bar (% complete)
- List of milestones (cards):

**Milestone Card:**
```
┌─────────────────────────────────────────┐
│ Milestone 1: UI Design                   │ Status: Completed ✓
│ Due: Nov 15, 2025                        │
│ Amount: ₹15,000                          │
│                                          │
│ Deliverables:                            │
│ - Figma designs (link)                   │
│ - Design system doc (download)           │
│                                          │
│ [View Details] [Approved on Nov 14]      │
└─────────────────────────────────────────┘
```

- Actions per milestone:
  - If "Ready for Review": [Review Deliverables]
  - If "Changes Requested": View feedback
  - If "Completed": View approval details

**Tab 3: Payments**
- Escrow balance
- Payment history table
- Invoices (download PDF)

**Tab 4: Communication**
- Embedded chat with admin and freelancer
- File sharing

**Tab 5: Activity Log**
- Chronological timeline of all events

---

### 3.5 Milestone Review Modal

**Triggered by:** "Review Deliverables" button

**Layout (Modal overlay):**

**Header:**
- "Review Milestone: [Name]"
- Close button

**Content:**
- Deliverables section:
  - Files (download buttons)
  - Links (clickable)
  - Freelancer notes (read-only)

**Review Form:**
- Quality Rating (1-5 stars)
- Comments (textarea, optional)

**Actions:**
- ✅ Approve (green button)
  - Confirmation: "This will release ₹X to freelancer. Confirm?"
- 🔄 Request Changes (orange button)
  - Requires comments
- 🚩 Raise Dispute (red link)

---

### 3.6 Consultations (`/client/consultations`)

**Purpose:** Book and manage consultation calls

**Layout:**

**Header:**
- Title: "Consultation Calls"
- Button: "+ Book a Consultation"

**Sections:**

**Upcoming Consultations:**
- Card per booking:
  - Date & time
  - Admin name + photo
  - Meeting link (if within 24 hours)
  - Actions: Reschedule / Cancel

**Past Consultations:**
- List with date, admin, outcome (e.g., "Project created")

**Booking Modal:**
- Select admin (if multiple available)
- Calendar with available slots
- Duration: 30 min / 60 min
- Brief description of what you need help with (textarea)
- Confirm button
- Note: "₹2,000 fee will be credited if project proceeds"

---

### 3.7 Payments & Invoices (`/client/payments`)

**Purpose:** Financial overview and history

**Layout:**

**Summary Cards (row):**
- Total Spent (all time)
- Escrowed (pending milestones)
- This Month

**Tabs:**

**Tab 1: Payment History**
- Table: Date, Project, Description, Amount, Status, Invoice
- Filters: Date range, Project, Status

**Tab 2: Saved Payment Methods**
- Card listing (last 4 digits, exp date)
- Add / Remove buttons

**Tab 3: Invoices**
- Downloadable PDF invoices (GST compliant)
- Filter by date, project

---

### 3.8 Client Settings (`/client/settings`)

**Tabs:**

**Profile:**
- Company name, Industry, Location
- Billing address, GST number
- Contact person details

**Account:**
- Email (verified badge)
- Password change
- 2FA setup (optional)

**Notifications:**
- Checkboxes for each event type:
  - Email notifications
  - In-app notifications
- Frequency: Real-time / Daily digest

**Preferences:**
- Timezone
- Currency preference (Phase 2)

---

## 4. Freelancer Portal Screens

### 4.1 Freelancer Dashboard (`/freelancer/dashboard`)

**Purpose:** Overview of opportunities and earnings

**Layout:**

**Header:**
- "Welcome back, [Name]!"
- Profile completion widget (if <100%): "Complete your profile to get more invites"

**Widgets (4-column grid):**

1. **New Opportunities**
   - Count: "5 Projects Matching Your Skills"
   - Button: "Browse Projects"

2. **Active Bids**
   - Count: "3 Bids Under Review"
   - Link: "View All →"

3. **Active Projects**
   - Count: "2 In Progress"
   - Next milestone due date

4. **Earnings**
   - This month: ₹X
   - Available to withdraw: ₹Y
   - Button: "Withdraw"

**Main Content:**

**Section: Recommended Projects**
- 3 project cards (matching skills):

**Project Card:**
```
┌─────────────────────────────────────────┐
│ 🎯 Invited to Bid                        │
│                                          │
│ E-commerce Mobile App                    │
│ Budget: ₹40,000 - ₹60,000               │
│ Timeline: 6 weeks                        │
│                                          │
│ React Native • Node.js • MongoDB         │
│                                          │
│ "We need an experienced React Native..." │
│                                          │
│ [View Details] [Submit Bid]              │
│                                          │
│ Bidding closes in 2 days                 │
└─────────────────────────────────────────┘
```

**Section: Active Projects**
- List with progress bars
- Next action items

**Sidebar:**
- Messages
- Upcoming deadlines

---

### 4.2 Browse Projects (`/freelancer/projects`)

**Purpose:** Discover and bid on projects

**Layout:**

**Header:**
- Title: "Available Projects"
- Filters (collapsible sidebar):
  - Status: Invited / Open to All
  - Tech Stack (multi-select)
  - Budget range (slider)
  - Timeline (weeks)
  - Posted date

**Project List:**
- Cards (2 per row on desktop, 1 on mobile)
- Each card shows:
  - Badge: "Invited" or "Open"
  - Project title
  - Budget range
  - Timeline
  - Tech stack tags
  - Short description (truncated)
  - Client industry (icon + text)
  - Posted X days ago
  - Number of bids (if visible)
  - Actions: "View Details" / "Submit Bid"

**Empty State:**
- If no matches: "No projects match your criteria. Try adjusting filters or updating your skills."

---

### 4.3 Submit Bid Modal

**Triggered by:** "Submit Bid" button

**Layout (Modal):**

**Header:**
- "Submit Your Bid: [Project Name]"

**Form:**

**Section 1: Pricing**
- Your Bid Amount: ₹[input]
  - Helper: "Client budget range: ₹40,000 - ₹60,000"
- Estimated Timeline: [number] weeks

**Section 2: Proposal**
- Cover Letter (rich text, 500-2000 chars)
  - Prompt: "Explain why you're the best fit..."
- Relevant Past Work (optional):
  - Select from portfolio or add link
- Questions for Client (optional):
  - Textarea

**Section 3: Milestone Breakdown (Optional)**
- Add milestones table:
  - Name, Timeline, Amount
  - Must sum to bid amount

**Section 4: Attachments (Optional)**
- Upload files (architecture diagrams, timelines, etc.)

**Footer:**
- Save as Draft / Submit Bid
- Note: "You can edit until admin reviews"

---

### 4.4 My Bids (`/freelancer/bids`)

**Purpose:** Track all submitted bids

**Layout:**

**Header:**
- Title: "My Bids"
- Filters: All / Pending / Won / Lost / Withdrawn

**Bids Table:**

| Project | Bid Amount | Timeline | Status | Submitted | Actions |
|---------|------------|----------|--------|-----------|---------|
| E-commerce App | ₹50,000 | 6 weeks | Pending | 2 days ago | View / Edit / Withdraw |
| API Integration | ₹22,000 | 3 weeks | Won ✓ | 1 week ago | View Project |
| Mobile Game | ₹80,000 | 10 weeks | Lost | 2 weeks ago | View Feedback |

**Status badges:**
- Pending (blue)
- Won (green) → auto-redirects to project
- Lost (gray) → with optional admin feedback
- Withdrawn (orange)

---

### 4.5 Active Projects (`/freelancer/projects/active`)

**Purpose:** Manage ongoing work

**Layout:**

**Header:**
- Title: "Active Projects"
- Sort: Deadline, Start Date

**Project Cards (full width):**

```
┌─────────────────────────────────────────────────────────────┐
│ E-commerce Mobile App                       Status: On Track  │
│ Client: TechCorp (⭐️ 4.8)                                     │
│                                                               │
│ Progress: ████████░░░░░░ 60% (3/5 milestones)                │
│                                                               │
│ Next Milestone: "Backend API Integration" - Due in 3 days    │
│ Amount: ₹12,000                                               │
│                                                               │
│ [View Details] [Upload Deliverables] [Message Client]        │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.6 Project Detail - Freelancer View (`/freelancer/projects/[id]`)

**Purpose:** Manage assigned project

**Layout:**

**Header:**
- Project title
- Status badge
- Client name (if revealed)
- Actions: Message Client / Message Admin / View Contract

**Tabs:**

**Tab 1: Project Brief**
- Full description, scope, requirements
- Tech stack, timeline
- Client notes (if any)

**Tab 2: Milestones**
- Visual progress
- Milestone cards with actions:

**Milestone Card (Freelancer POV):**
```
┌─────────────────────────────────────────┐
│ Milestone 2: Backend APIs         In Progress
│ Due: Nov 30, 2025 (5 days)              │
│ Payment: ₹12,000                         │
│                                          │
│ Deliverables Expected:                   │
│ - REST API endpoints                     │
│ - Database schema                        │
│ - API documentation                      │
│                                          │
│ Your Uploads:                            │
│ - server.zip (uploaded Nov 25)           │
│ - [+ Add Files]                          │
│                                          │
│ Notes to Client: [text area]             │
│                                          │
│ [Mark as Ready for Review]               │
└─────────────────────────────────────────┘
```

**Tab 3: Communication**
- Chat with client and admin

**Tab 4: Payments**
- Milestone payment status
- Amount earned so far
- Expected next payment

---

### 4.7 Wallet & Earnings (`/freelancer/wallet`)

**Purpose:** Financial dashboard

**Layout:**

**Summary Cards:**
- Available Balance (large)
  - "₹25,000"
  - Button: "Withdraw"
- Pending Clearance
  - "₹8,000 (2 milestones awaiting client approval)"
- Total Earned
  - "₹1,50,000 (lifetime)"

**Tabs:**

**Tab 1: Transaction History**
- Table: Date, Project, Type (Earned/Withdrawn/Fee), Amount, Balance
- Filters: Date range, Type

**Tab 2: Withdrawal History**
- Past withdrawals with status (Processing, Completed, Failed)
- UTR numbers for reference

**Tab 3: Withdraw Funds**
- Current balance: ₹[amount]
- Withdrawal amount: [input] (min ₹500)
- Bank details (pre-saved):
  - Account number, IFSC, Name
  - [Edit]
- Fee: 2.5% (₹[calculated])
- Net amount: ₹[calculated]
- Button: "Request Withdrawal"
- Processing time: 2-3 business days

---

### 4.8 Freelancer Profile (`/freelancer/profile`)

**Purpose:** Public-facing profile (editable)

**Layout:**

**Profile Header:**
- Profile photo (upload)
- Name, Title (e.g., "Full Stack Developer")
- Location
- Hourly/daily rate range
- Overall rating (⭐️ 4.9) + number of reviews
- Completion rate (95%)
- Member since

**Sections:**

**About:**
- Bio (rich text, 500 chars)
- Edit button

**Skills & Expertise:**
- Tags with proficiency levels:
  - React.js ⭐️⭐️⭐️⭐️⭐️ (Expert)
  - Node.js ⭐️⭐️⭐️⭐️ (Advanced)
- Add/remove skills

**Portfolio:**
- Project cards (image, title, description, tech stack, link)
- Add project button
- Reorder (drag & drop)

**Work Experience:**
- Timeline format
- Company, role, duration

**Education & Certifications:**
- Degree, institution
- Certifications (image upload for badges)

**Reviews:**
- List of client reviews
- Star rating, comment, project name

**Availability:**
- Status: Available / Busy / Not Available
- Hours per week available

---

### 4.9 Freelancer Settings

**Similar to Client Settings with additions:**

**Profile Settings:**
- Public profile visibility
- What clients can see (phone, email, social links)

**Payment Settings:**
- Bank details for withdrawals
- Tax information (PAN for India)

**Notifications:**
- New project matches
- Bid status updates
- Payment received

---

## 5. Admin Portal Screens

### 5.1 Admin Dashboard (`/admin/dashboard`)

**Purpose:** Command center for admins

**Layout:**

**Header:**
- "Admin Dashboard"
- Quick actions: + Create Project / + Add Note

**Metrics Row (4 cards):**
- Projects Pending Review: [count]
- Active Projects: [count]
- Disputes: [count]
- Upcoming Consultations: [count]

**Main Content (3 columns):**

**Column 1: Queues**
- New Project Submissions (count + badge)
  - List with quick actions
- Projects in Bidding (count)
- Milestones Awaiting Admin Review (count)

**Column 2: Recent Activity**
- Real-time feed:
  - "New bid on Project X by Ravi"
  - "Client approved Milestone 3 for Project Y"
  - etc.

**Column 3: Alerts**
- Projects at risk (red):
  - "Project X: Milestone overdue by 3 days"
- Upcoming deadlines (orange)
- System notifications

**Bottom Section:**
- Quick stats:
  - This week: Projects assigned, Revenue, Avg bid time

---

### 5.2 Projects Queue (`/admin/projects`)

**Purpose:** Manage all projects across statuses

**Layout:**

**Header:**
- Title: "All Projects"
- Filters:
  - Status (multi-select)
  - Admin owner (dropdown)
  - Date range
  - Search (project name, client)

**Projects Table:**

| Project | Client | Status | Submitted | Assigned To | Budget | Actions |
|---------|--------|--------|-----------|-------------|--------|---------|
| E-comm Site | TechCorp | Pending Review | 1 day ago | - | ₹50-70K | Review |
| Mobile App | StartupXYZ | In Bidding | 3 days ago | You | ₹80K | Manage Bids |
| API Dev | CorpABC | Active | 1 week ago | Admin2 | ₹30K | Monitor |

**Quick Actions:**
- Review → opens project detail
- Manage Bids → opens bidding board
- Monitor → project tracking view

---

### 5.3 Project Review & Edit (`/admin/projects/[id]/review`)

**Purpose:** Refine client submission before bidding

**Layout:**

**Header:**
- "Review Project: [Name]"
- Status: Pending Admin Review
- Assigned admin: [You] (reassign button)

**Tabs:**

**Tab 1: Client Submission**
- Read-only view of what client submitted
- Original budget, description, etc.

**Tab 2: Edit & Refine**
- Editable version of all fields:
  - Title, Description (can rewrite)
  - Scope breakdown (add structured list)
  - Tech stack (tags)
  - Timeline adjustment

**Section: Budget & Margin**
- Client Budget (what client will pay):
  - Min: ₹[input]
  - Max: ₹[input]
- Internal Freelancer Payout Target:
  - Min: ₹[input]
  - Max: ₹[input]
- Projected Margin: ₹[calculated] ([%])
  - Color-coded: Green if >20%, yellow if 15-20%, red if <15%

**Section: Freelancer Visibility**
- What freelancers will see:
  - Show client name? (toggle)
  - Show full budget or adjusted range? (toggle)
  - Custom description for freelancers (optional)

**Section: Admin Notes (Internal)**
- Private notes visible only to admins
- Previous admin comments (if any)

**Footer Actions:**
- Save Draft
- Request Clarification from Client (opens message composer)
- Approve & Move to Bidding
- Reject (with reason)

---

### 5.4 Freelancer Directory (`/admin/freelancers`)

**Purpose:** Search and shortlist freelancers

**Layout:**

**Header:**
- Title: "Freelancer Directory"
- Context widget (if invoked from project): "Inviting freelancers for: [Project Name]"

**Advanced Filters (sidebar):**
- Skills (multi-select with AND/OR toggle)
- Rating (min threshold slider)
- Completion rate (min %)
- Hourly rate range
- Location
- Availability (Available now / Within 1 week)
- Past projects (min count)
- Last active (within X days)

**Sort Options:**
- Best match (AI, Phase 2)
- Highest rated
- Most completed projects
- Recently active
- Lowest rate

**Freelancer Cards (grid, 3 per row):**

```
┌─────────────────────────────────────────┐
│ [Profile Photo]                          │
│                                          │
│ Ravi Kumar                   ⭐️ 4.9 (45) │
│ Full Stack Developer                     │
│                                          │
│ React • Node.js • AWS • MongoDB          │
│                                          │
│ ₹2,000 - ₹3,000 / day                    │
│ 42 projects • 98% completion rate        │
│ Available now                            │
│                                          │
│ [View Profile] [✓ Invite to Bid]         │
│                                          │
│ Internal notes: "Great for e-comm..." ✏️ │
└─────────────────────────────────────────┘
```

**Bulk Actions (if checkboxes selected):**
- Invite Selected to Project (choose from dropdown)

---

### 5.5 Bidding Management (`/admin/projects/[id]/bids`)

**Purpose:** Compare bids and assign freelancer

**Layout:**

**Header:**
- Project name
- Client: [Name]
- Status: In Bidding
- Time remaining: "Closing in 2 days" (editable)
- Action: "Extend Bidding Period"

**Summary Stats:**
- Total Bids: [count]
- Average Bid: ₹[amount]
- Your Target Payout: ₹40,000 - ₹50,000

**Bid Comparison Table:**

| Freelancer | Rating | Bid Amount | Timeline | Submitted | Proposal | Actions |
|------------|--------|------------|----------|-----------|----------|---------|
| Ravi Kumar ⭐️4.9 | 45 reviews | ₹48,000 | 6 weeks | 1 day ago | [View] | ✓ Accept / Negotiate / ✗ Reject |
| Priya Singh ⭐️4.7 | 32 reviews | ₹45,000 | 7 weeks | 2 days ago | [View] | ✓ / 💬 / ✗ |
| Amit Patel ⭐️4.8 | 28 reviews | ₹52,000 | 5 weeks | 6 hrs ago | [View] | ✓ / 💬 / ✗ |

**Expandable Row (click "View"):**
- Full proposal text
- Milestone breakdown (if provided)
- Past projects (relevant ones)
- Internal admin notes field
- Negotiation history (if any)

**Accept Bid Flow:**
1. Click "Accept"
2. Modal confirms:
   - Freelancer: [Name]
   - Amount: ₹48,000
   - Client will be charged: ₹[input] (pre-filled with margin)
   - Timeline: 6 weeks
   - Send notification to client? (checkbox, default yes)
   - Confirm button

---

### 5.6 Consultations Calendar (`/admin/consultations`)

**Purpose:** Manage consultation bookings

**Layout:**

**Header:**
- "Consultation Bookings"
- Button: "+ Block Time Off"

**View Toggle:** Calendar / List

**Calendar View:**
- Weekly calendar
- Booked slots shown with client name
- Click to see details:
  - Client name, contact
  - Project brief (if provided)
  - Meeting link
  - Preparation notes

**List View:**

**Upcoming:**
- Card per consultation:
  - Date, time, duration
  - Client name + company
  - Brief description
  - Pre-call prep:
    - Client's submitted info
    - Past projects (if repeat client)
  - Actions: Join Call / Reschedule / Add Notes

**Completed:**
- List with outcomes:
  - "Project created" (link)
  - "Client needs more time"
  - Admin notes (private)

---

### 5.7 Disputes Center (`/admin/disputes`)

**Purpose:** Mediate and resolve disputes

**Layout:**

**Header:**
- "Dispute Management"
- Filters: Active / Resolved / Escalated

**Dispute Queue (cards):**

```
┌─────────────────────────────────────────────────────────────┐
│ 🚨 ACTIVE DISPUTE                                    Priority: High
│                                                               │
│ Project: E-commerce Mobile App                                │
│ Raised by: Client (TechCorp)                                  │
│ Against: Freelancer (Ravi Kumar)                              │
│ Issue: Quality of Milestone 3 deliverables                    │
│ Raised: 2 days ago                                            │
│                                                               │
│ Escrow Frozen: ₹12,000                                        │
│                                                               │
│ [Review Details] [Propose Resolution]                         │
└─────────────────────────────────────────────────────────────┘
```

**Dispute Detail Page:**

**Layout (full page):**

**Left Column (60%):**

**Section: Dispute Information**
- Project details
- Milestone in question
- Raised by / Against
- Category, Description
- Attached evidence (files, screenshots)

**Section: Timeline**
- Chronological events:
  - Milestone submitted
  - Client requested changes
  - Freelancer responded
  - Dispute raised
  - Admin actions

**Section: Communication**
- Embedded chat (admin can see both client and freelancer sides)
- Admin can send messages to both parties

**Right Column (40%):**

**Section: Quick Facts**
- Payment at stake: ₹[amount]
- Days in dispute: [count]
- Previous disputes: Client (0) / Freelancer (1)

**Section: Admin Actions**

**Propose Resolution:**
- Resolution type (dropdown):
  - Full refund to client
  - Partial refund (₹[input])
  - Full payment release to freelancer
  - Milestone revision with extended deadline
- Rationale (textarea, required)
- Button: "Send Proposal to Both Parties"

**If Resolution Rejected:**
- Button: "Escalate to Super Admin"

**Internal Notes:**
- Private admin notes

---

### 5.8 Admin Reports (`/admin/reports`)

**Purpose:** Performance tracking

**Layout:**

**Tabs:**

**Tab 1: My Performance**
- Date range selector
- Metrics:
  - Projects reviewed: [count]
  - Projects assigned: [count]
  - Average time to assignment: [X days]
  - Disputes mediated: [count]
  - Client satisfaction (from surveys): [score]

**Tab 2: Platform Overview**
- Same metrics but platform-wide
- Admin leaderboard (friendly competition)

**Tab 3: Export Data**
- Generate CSV/Excel reports
- Date range, filters

---

## 6. Super Admin Portal Screens

### 6.1 Super Admin Dashboard (`/superadmin/dashboard`)

**Purpose:** High-level platform monitoring

**Layout:**

**Metrics Grid (5 cards):**
- Total Users (breakdown: Clients / Freelancers / Admins)
- Active Projects
- GMV (This Month / All Time)
- Platform Revenue (This Month)
- System Health (uptime, errors)

**Charts:**
- Revenue trend (line chart, 6 months)
- User growth (line chart)
- Project completion rate (bar chart)

**Alerts & Issues:**
- Critical disputes (>7 days)
- Failed payments
- Suspended users awaiting review
- System errors (>threshold)

---

### 6.2 User Management (`/superadmin/users`)

**Purpose:** Manage all platform users

**Layout:**

**Header:**
- Search: by name, email, phone
- Filters: Role, Status (Active / Suspended / Banned), Join date

**Users Table:**

| Name | Email | Role | Status | Joined | Projects | Actions |
|------|-------|------|--------|--------|----------|---------|
| Ravi Kumar | ravi@... | Freelancer | Active | Jan 2025 | 15 | View / Suspend / Edit |
| TechCorp | tech@... | Client | Active | Feb 2025 | 5 | View / Suspend / Edit |
| Admin Jane | jane@... | Admin | Active | Dec 2024 | - | View / Edit Permissions |

**Quick Actions:**
- View details (opens user profile)
- Suspend (with reason)
- Permanently ban
- Impersonate (for support)

**User Detail Modal:**
- All profile info
- Activity log
- Financial summary
- Disputes history
- Edit roles and permissions
- Send system message

---

### 6.3 System Configuration (`/superadmin/settings`)

**Purpose:** Platform-wide settings

**Tabs:**

**Tab 1: Financial Settings**
- Default platform margin: [%]
- Min margin allowed: [%]
- Max margin allowed: [%]
- Service fee: [%]
- Withdrawal fee: [%] or ₹[flat]
- Minimum withdrawal amount: ₹[amount]
- Escrow clearance period: [days]

**Tab 2: Project Settings**
- Max bids per project: [number]
- Default bidding period: [days]
- Max active projects per freelancer: [number]
- Auto-close bidding after X days: [toggle + number]

**Tab 3: Dispute Settings**
- Auto-escalate after X days: [number]
- Require admin response within: [hours]
- Dispute categories (add/remove)

**Tab 4: Notification Settings**
- Email templates (editable)
- Notification triggers (enable/disable)

**Tab 5: Security**
- Password policy (min length, complexity)
- Session timeout
- 2FA requirement (by role)
- IP whitelist for admins

---

### 6.4 Financial Reports (`/superadmin/financials`)

**Purpose:** Revenue and payout tracking

**Layout:**

**Summary Cards:**
- Total GMV (This Month / Last Month / All Time)
- Platform Revenue
- Payouts to Freelancers
- Profit Margin (%)
- Funds in Escrow

**Tabs:**

**Tab 1: Revenue Breakdown**
- Chart: Revenue by source (margins, fees, consultations)
- Table: Top projects by revenue

**Tab 2: Payout Tracking**
- Table: All freelancer payouts
- Filters: Status (Pending / Completed / Failed), Date range
- Export to accounting software

**Tab 3: Client Invoicing**
- All client invoices
- GST reports
- TDS reports (if applicable)

**Tab 4: Escrow Management**
- Current escrow balance
- Projects with escrowed funds
- Release schedules
- Manual release (if needed)

---

### 6.5 Dispute Escalations (`/superadmin/disputes`)

**Purpose:** Final decisions on unresolved disputes

**Layout:**

**Similar to Admin Dispute Center, but:**

**Additional Powers:**
- Override admin decisions
- Access full financial details
- Permanent ban users if fraud detected
- Initiate legal process (flag)

**Final Resolution:**
- Decision is binding
- Auto-closes dispute
- Sends formal resolution email to both parties
- Logs decision for legal records

---

### 6.6 Audit Logs (`/superadmin/audit`)

**Purpose:** Security and compliance

**Layout:**

**Filters:**
- User (who did the action)
- Action type (Login, Create, Update, Delete, Payment, etc.)
- Resource (Project, User, Payment, etc.)
- Date range
- IP address

**Logs Table:**

| Timestamp | User | Action | Resource | Details | IP |
|-----------|------|--------|----------|---------|-----|
| Nov 26, 10:30 | admin@... | Updated project | Project #123 | Changed budget | 192... |
| Nov 26, 10:25 | ravi@... | Login | - | - | 103... |

**Export:** CSV for compliance

---

### 6.7 Analytics & Insights (`/superadmin/analytics`)

**Purpose:** Data-driven decisions

**Dashboards:**

**User Analytics:**
- User acquisition funnel
- Churn rate
- Cohort analysis
- Lifetime value

**Project Analytics:**
- Time to assignment
- Completion rates
- Dispute rates
- Average project size

**Financial Analytics:**
- Unit economics
- CAC (Customer Acquisition Cost)
- Burn rate (if startup)

**Tools:**
- Customizable dashboards
- Export to BI tools

---

## 7. Shared/Common Screens

### 7.1 Messages/Chat (`/messages`)

**Purpose:** Unified inbox for all roles

**Layout:**

**Left Sidebar (30%):**
- Search conversations
- Filter: Unread / All / Archived
- Conversation list:
  - Avatar, Name/Project, Last message preview, Time, Unread badge

**Main Area (70%):**
- Chat header: Participant(s), Project context (if applicable)
- Message thread (reverse chronological)
- Message composer:
  - Text input
  - Attach files
  - Emoji picker
  - Send button

**Features:**
- Real-time (WebSocket)
- Typing indicators
- Read receipts
- File previews

---

### 7.2 Notifications (`/notifications`)

**Purpose:** Activity feed

**Layout:**

**Header:**
- "Notifications"
- Actions: Mark all as read / Settings

**Tabs:**
- All
- Unread
- Projects
- Payments
- System

**Notification List:**
- Icon + message + time
- Click to navigate to relevant page
- Mark as read (individually or bulk)

---

### 7.3 Help & Support (`/support`)

**Purpose:** User assistance

**Layout:**

**Sections:**
- FAQs (searchable, categorized)
- Video tutorials
- Contact form
- Live chat widget (if available)

---

## 8. Mobile Responsiveness Notes

All screens should be responsive with these considerations:

- **Mobile Navigation:** Hamburger menu for main nav
- **Tables → Cards:** On mobile, tables convert to stacked cards
- **Filters:** Collapsible bottom sheet instead of sidebar
- **Actions:** Floating action button (FAB) for primary actions
- **Chat:** Full-screen on mobile
- **Forms:** Single column, larger inputs

---

## 9. Screen Count Summary

| Portal | Screen Count |
|--------|--------------|
| Public | 5 |
| Client | 12 |
| Freelancer | 13 |
| Admin | 10 |
| Super Admin | 8 |
| Shared | 3 |
| **Total** | **51+ screens** |

---

*This screen map provides a comprehensive blueprint for UI/UX design and development.*

**Next Steps:**
1. Wireframe key flows
2. Create design system
3. Build clickable prototype
4. User testing

---

*End of Screen Map*

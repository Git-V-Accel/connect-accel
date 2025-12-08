# Connect-Accel Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** November 26, 2025  
**Status:** MVP Specification

---

## Executive Summary

Connect-Accel is a **managed freelance marketplace** that combines the scale of platforms like Upwork with the quality assurance of a boutique agency. By adding a human agent layer between clients and freelancers, we solve the core problems of both traditional marketplaces (poor scope definition, quality inconsistency) and agencies (high costs, slow turnaround).

---

## 1. Product Vision & Strategy

### 1.1 Vision Statement

To become the trusted platform where software projects are delivered on time, on budget, and with exceptional quality through intelligent human curation and transparent processes.

### 1.2 Target Market

**Primary:**
- **Clients:** Small to medium businesses (SMBs) needing software development but lacking in-house technical expertise
- **Freelancers:** Mid to senior-level developers seeking quality projects with clear requirements

**Secondary:**
- Enterprise clients (Phase 2)
- Development agencies looking to outsource overflow work

### 1.3 Competitive Positioning

| Feature | Upwork/Fiverr | Traditional Agency | Connect-Accel |
|---------|--------------|-------------------|---------------|
| Pricing | Low-Medium | High | Medium |
| Scope Clarity | Low | High | High |
| Quality Control | Variable | High | High |
| Speed to Start | Fast | Slow | Medium |
| Client Control | High | Low | Medium-High |
| Freelancer Screening | Minimal | N/A | Curated |

---

## 2. Business Model

### 2.1 Revenue Streams

1. **Project Margin (Primary)**
   - Client Budget: ₹X
   - Freelancer Payout: ₹Y
   - Platform Margin: X - Y (typically 15-30%)

2. **Platform Service Fees**
   - 3-5% transaction fee on top of margin
   - Applied to client-facing total

3. **Consultation Fees**
   - ₹2,000-5,000 for detailed scoping calls
   - Credit applied if project proceeds

4. **Freelancer Subscriptions (Phase 2)**
   - "Pro Freelancer" tier: ₹999/month
   - Benefits: Priority in shortlisting, higher visibility, early project access

5. **Withdrawal Fees**
   - 2-3% or ₹50 (whichever is higher) on freelancer withdrawals
   - Standard in industry

### 2.2 Unit Economics (Target)

**Per Project:**
- Average Client Budget: ₹50,000
- Average Freelancer Payout: ₹38,000
- Gross Margin: ₹12,000 (24%)
- Platform Costs (payments, ops): ₹2,000
- Net Margin: ₹10,000 (20%)

---

## 3. User Roles & Permissions

### 3.1 Client

**Can Do:**
- ✅ Create and submit projects
- ✅ Book consultation calls
- ✅ Approve final project scope and budget
- ✅ View assigned freelancer profile (curated view)
- ✅ Approve/reject milestones
- ✅ Release payments from escrow
- ✅ Raise disputes
- ✅ Rate and review freelancers
- ✅ Chat with admin and (optionally) freelancer

**Cannot Do:**
- ❌ See internal cost breakdown or margin
- ❌ Directly contact freelancers before assignment
- ❌ See all freelancer bids (only final assignment)
- ❌ Assign projects without admin approval

### 3.2 Freelancer

**Can Do:**
- ✅ Create and manage profile
- ✅ Browse curated project listings
- ✅ Submit bids with proposals
- ✅ Chat with admin about projects
- ✅ Update milestone progress
- ✅ Upload deliverables
- ✅ Request milestone reviews
- ✅ Withdraw earnings
- ✅ Rate clients (optional)

**Cannot Do:**
- ❌ See client's full budget (may see adjusted range)
- ❌ Contact clients directly before assignment
- ❌ See competing bids
- ❌ Auto-assign themselves to projects

### 3.3 Admin (Agent)

**Can Do:**
- ✅ Review all project submissions
- ✅ Conduct consultation calls
- ✅ Edit and refine project briefs
- ✅ Set client-facing budget (with margin)
- ✅ Set freelancer payout range
- ✅ Search and filter freelancer database
- ✅ Invite freelancers to bid
- ✅ View and compare all bids
- ✅ Accept/decline bids
- ✅ Assign projects to freelancers
- ✅ Monitor milestone progress
- ✅ Mediate disputes (first level)
- ✅ Chat with both clients and freelancers
- ✅ Manage internal notes

**Cannot Do:**
- ❌ Delete users (only Super Admin)
- ❌ Change platform-wide settings
- ❌ Access financial configuration
- ❌ Override Super Admin decisions

### 3.4 Super Admin

**Can Do:**
- ✅ Everything Admin can do, plus:
- ✅ Manage all users (activate/suspend/delete)
- ✅ Configure commission rules
- ✅ Set platform-wide policies
- ✅ Resolve escalated disputes (final authority)
- ✅ View all financial reports and analytics
- ✅ Export all data
- ✅ Manage admin accounts
- ✅ Access system logs and audit trails

---

## 4. Core Features (MVP)

### 4.1 Authentication & Onboarding

**User Stories:**

1. As a **new user**, I want to sign up with email/Google so that I can access the platform quickly
2. As a **user**, I want to choose my role (Client or Freelancer) during signup so the platform knows my intent
3. As a **freelancer**, I want to complete my profile with skills and portfolio so clients can evaluate me
4. As a **client**, I want to add company details so I can start posting projects

**Acceptance Criteria:**
- Email verification required before full access
- Role selection is mandatory and immutable (contact support to change)
- Freelancers must complete 70% of profile before browsing projects
- Social login (Google) optional but encouraged

---

### 4.2 Project Creation & Consultation

**User Stories:**

1. As a **client**, I want to create a project with title, description, and budget so I can get started quickly
2. As a **client**, I want to book a consultation call so I can get help defining my requirements
3. As an **admin**, I want to review submitted projects so I can refine scope and pricing
4. As an **admin**, I want to conduct consultation calls so I can create accurate project briefs

**Acceptance Criteria:**

**Project Creation Form:**
- Required: Title, Description, Project Type, Budget Range, Timeline
- Optional: Tech Stack, Attachments, Feature List
- Client can save as draft
- Submit triggers "Pending Admin Review" status

**Consultation Booking:**
- Calendar integration showing admin availability
- 30/60 min slot options
- Email confirmation with video call link
- Admin sees booking in dashboard with client context

**Admin Review:**
- Admin can edit all project fields
- Admin sets internal freelancer budget range (hidden from client)
- Admin can request clarification (triggers client notification)
- Admin approval moves project to "Ready for Bidding"

---

### 4.3 Freelancer Discovery & Bidding

**User Stories:**

1. As an **admin**, I want to search freelancers by skills and ratings so I can shortlist the right talent
2. As an **admin**, I want to invite specific freelancers to bid so I control quality
3. As a **freelancer**, I want to see projects matching my skills so I can submit relevant bids
4. As a **freelancer**, I want to submit a proposal with timeline and price so I can win projects

**Acceptance Criteria:**

**Freelancer Search (Admin):**
- Filter by: Skills (multi-select), Rating (min threshold), Hourly Rate Range, Location, Availability
- Sort by: Rating, Completed Projects, Success Rate, Recent Activity
- Bulk invite up to 10 freelancers per project

**Project Listing (Freelancer View):**
- Shows: Title, Description, Tech Stack, Budget Range (may be adjusted), Timeline, Client Industry
- Hides: Client name (initially), Internal margins
- Status indicators: "Invited to Bid", "Open", "Bidding Closes In"

**Bid Submission:**
- Required: Bid Amount, Estimated Days, Proposal Text (min 100 chars)
- Optional: Milestone breakdown, Attachments, Questions for client
- Freelancer can edit bid until admin reviews
- Max 5 active bids per freelancer (to ensure quality)

---

### 4.4 Bid Evaluation & Assignment

**User Stories:**

1. As an **admin**, I want to compare all bids side-by-side so I can make informed decisions
2. As an **admin**, I want to negotiate with freelancers so I can optimize budget and timeline
3. As an **admin**, I want to assign the best freelancer so the project starts successfully
4. As a **client**, I want to be notified of the assigned freelancer so I know work is starting

**Acceptance Criteria:**

**Bid Comparison View:**
- Table with columns: Freelancer, Bid Amount, Timeline, Rating, Completed Projects, Proposal Summary
- Expand to see full proposal
- Internal notes field per bid
- Action buttons: Accept, Negotiate, Reject

**Assignment Flow:**
- Admin clicks "Accept Bid"
- System creates ProjectAssignment record
- Freelancer and client both notified
- Client sees: Freelancer profile (curated), Final price, Timeline, Admin introduction
- Freelancer sees: Full project details, Client contact (if enabled), Milestone plan

---

### 4.5 Milestone Management & Delivery

**User Stories:**

1. As an **admin/freelancer**, I want to define project milestones so payment is tied to progress
2. As a **freelancer**, I want to mark milestones complete so I can get paid
3. As a **client**, I want to review deliverables so I can approve payment
4. As a **client**, I want to request changes so quality meets my expectations

**Acceptance Criteria:**

**Milestone Creation:**
- Created by admin during assignment or by freelancer (requires approval)
- Each milestone: Title, Description, Due Date, Payment Amount
- Sum of milestone amounts must equal project total
- Minimum 1 milestone, recommended 3-5 for projects >₹20,000

**Milestone Workflow:**
- Status: Not Started → In Progress → Ready for Review → Changes Requested → Completed
- Freelancer uploads deliverables (files, links, notes)
- Client reviews within 3 days (SLA)
- Client actions: Approve (releases payment), Request Changes (with comments), Dispute

**Payment Release:**
- On approval, funds move from escrow to freelancer wallet
- Platform fees deducted automatically
- Email notification with breakdown
- Freelancer can withdraw after 24hr clearance period

---

### 4.6 Dispute Resolution

**User Stories:**

1. As a **client**, I want to raise a dispute if deliverables don't meet requirements
2. As a **freelancer**, I want to raise a dispute if client requests excessive scope changes
3. As an **admin**, I want to mediate disputes so projects can continue
4. As a **Super Admin**, I want to make final decisions on escalated disputes

**Acceptance Criteria:**

**Dispute Initiation:**
- Available actions: "Raise Dispute" on milestone or entire project
- Required: Category (Quality, Scope, Timeline, Payment), Description (min 200 chars), Evidence (files)
- Project/milestone status immediately changes to "In Dispute"
- All payment releases frozen

**Admin Mediation:**
- Admin sees dispute in dashboard with priority flag
- Reviews timeline, chat history, deliverables
- Can propose resolution: Full refund, Partial refund, Payment release, Milestone revision
- Both parties must accept proposed resolution

**Escalation to Super Admin:**
- If admin resolution rejected by either party
- Super Admin reviews all evidence
- Makes binding decision
- Records decision rationale for future reference

---

### 4.7 Communication

**User Stories:**

1. As a **client**, I want to chat with my admin so I can get quick clarifications
2. As a **freelancer**, I want to chat with the admin so I can ask project questions
3. As a **user**, I want real-time notifications so I don't miss important updates

**Acceptance Criteria:**

**Chat System:**
- Separate conversation threads: Client↔Admin, Freelancer↔Admin
- Optional: Three-way project room after assignment
- Features: Text messages, File attachments (up to 10MB), Emoji reactions
- Typing indicators and read receipts
- Search message history

**Notifications:**
- In-app: Toast notifications for real-time events
- Email: Digest of important events (configurable frequency)
- Events: New bid, Milestone review, Payment release, Dispute raised, Message received

---

### 4.8 Payments & Escrow

**User Stories:**

1. As a **client**, I want to deposit funds to escrow so freelancers trust the payment
2. As a **freelancer**, I want to see my earnings so I know when I can withdraw
3. As a **freelancer**, I want to withdraw funds to my bank so I get paid

**Acceptance Criteria:**

**Client Payment:**
- Integration: Razorpay (India) / Stripe (International)
- Deposit options: Full project upfront, or per milestone
- Saved payment methods
- Invoice generation (GST compliant)

**Freelancer Wallet:**
- Dashboard showing: Available Balance, Pending Clearance, Total Earned
- Transaction history with filters
- Withdrawal methods: Bank transfer, UPI
- Minimum withdrawal: ₹500
- Processing time: 2-3 business days

**Escrow Logic:**
- Funds locked per milestone until approval
- Admin override for dispute resolutions
- Refunds processed within 5-7 days
- All transactions logged for audit

---

### 4.9 Reviews & Ratings

**User Stories:**

1. As a **client**, I want to rate the freelancer so others know about quality
2. As a **freelancer**, I want to rate the client so I can avoid difficult clients
3. As a **user**, I want to see ratings so I can make informed decisions

**Acceptance Criteria:**

**Client Reviews Freelancer:**
- After project completion (or milestone 3+)
- 5-star rating + written review (optional)
- Criteria: Quality, Communication, Timeliness, Professionalism
- Public on freelancer profile

**Freelancer Reviews Client (Optional for MVP):**
- After project completion
- 5-star rating + comments (private or public)
- Helps admins identify problem clients

**Rating Display:**
- Overall rating (weighted average)
- Number of completed projects
- Success rate (% projects completed without dispute)

---

## 5. User Flows (Detailed)

### 5.1 Happy Path: Full Project Lifecycle

```
Client Signs Up
    ↓
Creates Project (Self-Serve)
    ↓
Admin Reviews & Refines Scope
    ↓
Admin Sets Margins & Invites Freelancers
    ↓
Freelancers Submit Bids
    ↓
Admin Compares & Selects Best Bid
    ↓
Project Assigned → Client & Freelancer Notified
    ↓
Milestones Created
    ↓
Client Deposits to Escrow
    ↓
Freelancer Works & Submits Milestone 1
    ↓
Client Approves → Payment Released
    ↓
[Repeat for remaining milestones]
    ↓
Final Milestone Completed
    ↓
Client Rates Freelancer
    ↓
Project Marked Complete
```

### 5.2 Consultation Flow

```
Client Books Consultation
    ↓
Admin Receives Booking Notification
    ↓
Admin Prepares (Reviews Client Brief)
    ↓
Consultation Call Happens
    ↓
Admin Creates Project on Behalf of Client
    ↓
Admin Shares Draft with Client for Approval
    ↓
Client Approves
    ↓
[Continues to Bidding Flow]
```

### 5.3 Dispute Resolution Flow

```
Issue Occurs (Quality/Scope/Timeline)
    ↓
Client or Freelancer Raises Dispute
    ↓
Project Status → In Dispute (Payments Frozen)
    ↓
Admin Reviews Evidence
    ↓
Admin Proposes Resolution
    ↓
Both Parties Review Proposal
    ↓
If Accepted → Resolution Applied
    ↓
If Rejected → Escalate to Super Admin
    ↓
Super Admin Makes Final Decision
    ↓
Outcome Implemented & Logged
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

- Page load time: <2 seconds (desktop), <3 seconds (mobile)
- Chat message delivery: <500ms
- Search results: <1 second for 10,000+ records
- Support 1,000 concurrent users (MVP)

### 6.2 Security

- All passwords hashed with bcrypt (min 12 rounds)
- HTTPS only (TLS 1.3)
- RBAC enforced at API and UI level
- PII encrypted at rest
- Session timeout: 30 minutes idle, 8 hours absolute
- 2FA optional (required for Super Admin)

### 6.3 Reliability

- Uptime SLA: 99.5% (MVP), 99.9% (Production)
- Data backup: Daily full, hourly incremental
- Disaster recovery: RTO 4 hours, RPO 1 hour

### 6.4 Scalability

- Horizontal scaling for web servers
- Database read replicas for reporting
- CDN for static assets
- Message queue for async tasks (email, notifications)

### 6.5 Compliance

- **India:** GST invoice generation, TDS reporting
- **International:** GDPR (if serving EU), data export on request
- **Payment:** PCI-DSS compliance via gateway
- **Legal:** Terms of Service, Privacy Policy, Dispute resolution T&Cs

---

## 7. Success Metrics (KPIs)

### 7.1 Business Metrics

- **MRR (Monthly Recurring Revenue):** From projects + subscriptions
- **GMV (Gross Merchandise Value):** Total project value transacted
- **Take Rate:** Platform margin as % of GMV (target: 20-25%)
- **CAC (Customer Acquisition Cost):** Marketing spend / new users
- **LTV (Lifetime Value):** Average revenue per user over 12 months

### 7.2 Product Metrics

**Engagement:**
- Active projects per month
- Average bids per project
- Time to first bid (should be <24 hours)
- Chat messages per project

**Conversion:**
- % projects that reach assignment (target: >80%)
- % milestones approved on first review (target: >70%)
- % projects completed without dispute (target: >90%)

**Satisfaction:**
- NPS (Net Promoter Score): Client and Freelancer
- Average rating: Client→Freelancer and Freelancer→Client
- Repeat rate: % clients posting 2nd project (target: >40% within 6 months)

---

## 8. Out of Scope (MVP)

These features are planned but NOT in the initial MVP:

- Mobile native apps (iOS/Android)
- AI-powered freelancer matching
- Video calls within platform
- Skill tests and certifications
- Advanced analytics dashboards
- Multi-currency support
- White-label solution for enterprises
- Agency/team accounts (multiple freelancers one project)
- Time tracking integration
- Invoice customization
- Freelancer insurance/protection plans

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Low freelancer supply | High | Aggressive freelancer outreach, referral bonuses |
| Quality inconsistency | High | Strict vetting, rating system, admin monitoring |
| Payment fraud | High | Escrow, KYC for large amounts, fraud detection |
| Client doesn't pay | Medium | Mandatory escrow before work starts |
| Freelancer abandons project | Medium | Penalty clauses, replacement guarantee |
| Regulatory changes | Medium | Legal counsel, compliance monitoring |
| Platform competition | Medium | Focus on differentiation (human curation) |

---

## 10. Go-to-Market Strategy (High-Level)

### 10.1 Launch Plan

**Phase 1: Closed Beta (Month 1-2)**
- 10-15 hand-picked clients
- 50 vetted freelancers
- Focus: Validate core flow, collect feedback
- Success: 80% project completion rate, <2 disputes

**Phase 2: Open Beta (Month 3-4)**
- Public signup with approval queue
- 100 clients, 200 freelancers
- Focus: Scale operations, refine admin tools
- Success: ₹10L GMV, 50+ completed projects

**Phase 3: Public Launch (Month 5)**
- Full marketing push
- No approval queue for freelancers (automatic based on profile completeness)
- Focus: Growth and brand awareness

### 10.2 Marketing Channels

**Client Acquisition:**
- Content marketing (blog, case studies)
- LinkedIn ads targeting startup founders
- Partnerships with accelerators/incubators
- Referral program (₹5,000 credit)

**Freelancer Acquisition:**
- Developer communities (Reddit, Dev.to, Hacker News)
- Direct outreach on LinkedIn/Twitter
- Freelancer referral program (₹2,000 bonus)

---

## 11. Appendix

### 11.1 Glossary

- **GMV:** Gross Merchandise Value
- **Escrow:** Temporary holding of funds by third party
- **Take Rate:** Platform's revenue as % of transaction value
- **NPS:** Net Promoter Score (customer satisfaction metric)
- **RBAC:** Role-Based Access Control
- **KYC:** Know Your Customer (identity verification)

### 11.2 References

- Upwork Platform Features
- Fiverr Business Model
- Freelance Marketplace Best Practices (Viserlab Resources)
- Escrow Payment Systems (Capstone Wallet)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 26, 2025 | Product Team | Initial MVP specification |

**Approval**

- [ ] Product Lead
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] Business Owner

---

*End of PRD*

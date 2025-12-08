# Connect-Accel Data Model

**Version:** 1.0  
**Date:** November 26, 2025  
**Database:** PostgreSQL (via Supabase)

---

## Entity Relationship Overview

```
Users (1) ────< (M) Projects
Users (1) ────< (M) Bids
Projects (1) ──< (M) Bids
Projects (1) ──< (1) ProjectAssignment
Projects (1) ──< (M) Milestones
Projects (1) ──< (M) Disputes
Users (1) ────< (M) WalletTransactions
Users (1) ────< (M) Messages
Projects (1) ──< (M) Messages
Milestones (1) < (M) Payments
```

---

## Core Tables

### 1. users

**Purpose:** Core user authentication and role management

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Unique user ID |
| email | varchar(255) | UNIQUE, NOT NULL | User email |
| password_hash | varchar(255) | NOT NULL | Bcrypt hashed password |
| name | varchar(255) | NOT NULL | Full name |
| phone | varchar(20) | NULLABLE | Phone number |
| role | enum | NOT NULL | client, freelancer, admin, superadmin |
| status | enum | DEFAULT 'active' | active, suspended, banned |
| email_verified | boolean | DEFAULT false | Email verification status |
| email_verification_token | varchar(255) | NULLABLE | Token for email verification |
| password_reset_token | varchar(255) | NULLABLE | Token for password reset |
| password_reset_expires | timestamp | NULLABLE | Expiry for reset token |
| last_login | timestamp | NULLABLE | Last login timestamp |
| created_at | timestamp | DEFAULT NOW() | Account creation |
| updated_at | timestamp | DEFAULT NOW() | Last update |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_role` on `role`

**Constraints:**
- CHECK: role IN ('client', 'freelancer', 'admin', 'superadmin')
- CHECK: status IN ('active', 'suspended', 'banned')

---

### 2. client_profiles

**Purpose:** Extended information for clients

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Profile ID |
| user_id | uuid | FK users(id), UNIQUE | Reference to user |
| company_name | varchar(255) | NULLABLE | Company name |
| industry | varchar(100) | NULLABLE | Industry sector |
| company_size | varchar(50) | NULLABLE | Small, Medium, Large, Enterprise |
| location | varchar(255) | NULLABLE | City, Country |
| gst_number | varchar(50) | NULLABLE | GST number (India) |
| billing_address | text | NULLABLE | Full billing address |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_client_profiles_user_id` on `user_id`

---

### 3. freelancer_profiles

**Purpose:** Extended information for freelancers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Profile ID |
| user_id | uuid | FK users(id), UNIQUE | Reference to user |
| title | varchar(255) | NULLABLE | Professional title |
| bio | text | NULLABLE | About me |
| location | varchar(255) | NULLABLE | City, Country |
| hourly_rate_min | integer | NULLABLE | Min hourly rate in ₹ |
| hourly_rate_max | integer | NULLABLE | Max hourly rate in ₹ |
| experience_years | integer | NULLABLE | Years of experience |
| availability | enum | DEFAULT 'available' | available, busy, unavailable |
| profile_photo_url | varchar(500) | NULLABLE | Profile picture URL |
| portfolio_url | varchar(500) | NULLABLE | Personal website |
| github_url | varchar(500) | NULLABLE | GitHub profile |
| linkedin_url | varchar(500) | NULLABLE | LinkedIn profile |
| rating | decimal(3,2) | DEFAULT 0.00 | Aggregate rating (0-5) |
| reviews_count | integer | DEFAULT 0 | Total reviews |
| projects_completed | integer | DEFAULT 0 | Completed projects |
| completion_rate | integer | DEFAULT 100 | % of projects completed (0-100) |
| on_time_rate | integer | DEFAULT 100 | % delivered on time |
| last_active | timestamp | DEFAULT NOW() | Last activity timestamp |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_freelancer_profiles_user_id` on `user_id`
- `idx_freelancer_profiles_rating` on `rating`
- `idx_freelancer_profiles_availability` on `availability`

**Constraints:**
- CHECK: rating >= 0 AND rating <= 5
- CHECK: completion_rate >= 0 AND completion_rate <= 100
- CHECK: availability IN ('available', 'busy', 'unavailable')

---

### 4. freelancer_skills

**Purpose:** Skills tagged to freelancers with proficiency levels

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Skill ID |
| freelancer_id | uuid | FK freelancer_profiles(id) | Reference to freelancer |
| skill_name | varchar(100) | NOT NULL | Skill name (e.g., React) |
| proficiency_level | integer | DEFAULT 3 | 1-5 scale |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_freelancer_skills_freelancer_id` on `freelancer_id`
- `idx_freelancer_skills_skill_name` on `skill_name`

**Constraints:**
- CHECK: proficiency_level >= 1 AND proficiency_level <= 5
- UNIQUE: (freelancer_id, skill_name)

---

### 5. freelancer_portfolio

**Purpose:** Portfolio items for freelancers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Portfolio item ID |
| freelancer_id | uuid | FK freelancer_profiles(id) | Reference to freelancer |
| title | varchar(255) | NOT NULL | Project title |
| description | text | NULLABLE | Project description |
| image_url | varchar(500) | NULLABLE | Thumbnail image |
| project_url | varchar(500) | NULLABLE | Live link |
| tech_stack | jsonb | NULLABLE | Array of technologies |
| display_order | integer | DEFAULT 0 | Sort order |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_portfolio_freelancer_id` on `freelancer_id`

---

### 6. projects

**Purpose:** Core project data

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Project ID |
| client_id | uuid | FK users(id), NOT NULL | Project owner (client) |
| admin_owner_id | uuid | FK users(id), NULLABLE | Assigned admin |
| title | varchar(255) | NOT NULL | Project title |
| description | text | NOT NULL | Project description |
| refined_description | text | NULLABLE | Admin-refined version |
| project_type | enum | NOT NULL | web_app, mobile_app, api, design, other |
| industry | varchar(100) | NULLABLE | Client industry |
| status | enum | DEFAULT 'draft' | Project lifecycle status |
| budget_min | integer | NOT NULL | Client budget min (₹) |
| budget_max | integer | NOT NULL | Client budget max (₹) |
| internal_payout_min | integer | NULLABLE | Freelancer payout min (admin sets) |
| internal_payout_max | integer | NULLABLE | Freelancer payout max (admin sets) |
| timeline_start | date | NULLABLE | Desired start date |
| timeline_end | date | NULLABLE | Desired end date |
| flexible_timeline | boolean | DEFAULT false | Is timeline flexible |
| tech_stack | jsonb | NULLABLE | Array of tech tags |
| features | jsonb | NULLABLE | Array of feature descriptions |
| attachments | jsonb | NULLABLE | Array of file objects |
| freelancer_visibility | jsonb | NULLABLE | What freelancers can see |
| admin_notes | text | NULLABLE | Internal admin notes |
| bidding_closes_at | timestamp | NULLABLE | Bid deadline |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Status Values:**
- `draft` - Client hasn't submitted
- `pending_review` - Submitted, awaiting admin
- `in_bidding` - Open for bids
- `assigned` - Freelancer assigned
- `active` - Work in progress
- `completed` - All milestones done
- `disputed` - Dispute raised
- `cancelled` - Cancelled by client or admin

**Indexes:**
- `idx_projects_client_id` on `client_id`
- `idx_projects_admin_owner_id` on `admin_owner_id`
- `idx_projects_status` on `status`
- `idx_projects_created_at` on `created_at`

**Constraints:**
- CHECK: project_type IN ('web_app', 'mobile_app', 'api', 'design', 'other')
- CHECK: status IN (...all status values)
- CHECK: budget_max >= budget_min

---

### 7. consultations

**Purpose:** Consultation booking and tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Consultation ID |
| client_id | uuid | FK users(id), NOT NULL | Client booking |
| admin_id | uuid | FK users(id), NULLABLE | Assigned admin |
| scheduled_date | date | NOT NULL | Consultation date |
| start_time | time | NOT NULL | Start time |
| end_time | time | NOT NULL | End time |
| duration_minutes | integer | NOT NULL | Duration (30 or 60) |
| description | text | NULLABLE | Client's description |
| meeting_link | varchar(500) | NULLABLE | Video call URL |
| status | enum | DEFAULT 'scheduled' | scheduled, completed, cancelled, rescheduled |
| outcome | enum | NULLABLE | project_created, needs_time, not_interested |
| admin_notes | text | NULLABLE | Private admin notes |
| project_id | uuid | FK projects(id), NULLABLE | If project created |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_consultations_client_id` on `client_id`
- `idx_consultations_admin_id` on `admin_id`
- `idx_consultations_scheduled_date` on `scheduled_date`

**Constraints:**
- CHECK: status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')
- CHECK: outcome IN ('project_created', 'needs_time', 'not_interested')

---

### 8. bids

**Purpose:** Freelancer bids on projects

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Bid ID |
| project_id | uuid | FK projects(id), NOT NULL | Project bid is for |
| freelancer_id | uuid | FK users(id), NOT NULL | Bidding freelancer |
| bid_amount | integer | NOT NULL | Bid amount in ₹ |
| timeline_weeks | integer | NOT NULL | Proposed timeline |
| proposal | text | NOT NULL | Cover letter/proposal |
| milestones | jsonb | NULLABLE | Proposed milestone breakdown |
| relevant_portfolio_ids | jsonb | NULLABLE | Array of portfolio item IDs |
| questions | text | NULLABLE | Questions for client |
| attachments | jsonb | NULLABLE | Array of file objects |
| status | enum | DEFAULT 'pending' | pending, won, lost, withdrawn |
| admin_notes | text | NULLABLE | Internal admin notes |
| rejection_reason | text | NULLABLE | Why bid was rejected |
| submitted_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_bids_project_id` on `project_id`
- `idx_bids_freelancer_id` on `freelancer_id`
- `idx_bids_status` on `status`

**Constraints:**
- CHECK: status IN ('pending', 'won', 'lost', 'withdrawn')
- CHECK: bid_amount > 0
- CHECK: timeline_weeks > 0
- UNIQUE: (project_id, freelancer_id) - one bid per freelancer per project

---

### 9. project_assignments

**Purpose:** Linking assigned freelancer to project

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Assignment ID |
| project_id | uuid | FK projects(id), UNIQUE | Project (one assignment) |
| freelancer_id | uuid | FK users(id), NOT NULL | Assigned freelancer |
| admin_id | uuid | FK users(id), NOT NULL | Admin who assigned |
| bid_id | uuid | FK bids(id), NULLABLE | Winning bid |
| agreed_amount | integer | NOT NULL | Freelancer payout amount |
| client_budget | integer | NOT NULL | What client pays |
| platform_margin | integer | NOT NULL | Platform revenue |
| timeline_weeks | integer | NOT NULL | Agreed timeline |
| start_date | date | NULLABLE | Actual start date |
| estimated_completion | date | NULLABLE | Expected end date |
| actual_completion | date | NULLABLE | Actual end date |
| status | enum | DEFAULT 'active' | active, completed, terminated |
| assigned_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_assignments_project_id` on `project_id`
- `idx_assignments_freelancer_id` on `freelancer_id`

**Constraints:**
- CHECK: client_budget > agreed_amount
- CHECK: platform_margin = client_budget - agreed_amount
- CHECK: status IN ('active', 'completed', 'terminated')

---

### 10. milestones

**Purpose:** Project milestones and deliverables

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Milestone ID |
| project_id | uuid | FK projects(id), NOT NULL | Parent project |
| title | varchar(255) | NOT NULL | Milestone name |
| description | text | NULLABLE | Milestone details |
| amount | integer | NOT NULL | Payment amount (₹) |
| due_date | date | NOT NULL | Due date |
| display_order | integer | DEFAULT 0 | Sort order |
| status | enum | DEFAULT 'not_started' | Milestone status |
| deliverables_expected | jsonb | NULLABLE | List of expected items |
| deliverables_submitted | jsonb | NULLABLE | Freelancer submissions |
| freelancer_notes | text | NULLABLE | Notes from freelancer |
| client_feedback | text | NULLABLE | Client review comments |
| client_rating | integer | NULLABLE | 1-5 rating |
| revision_count | integer | DEFAULT 0 | Number of change requests |
| submitted_at | timestamp | NULLABLE | When freelancer submitted |
| reviewed_at | timestamp | NULLABLE | When client reviewed |
| approved_at | timestamp | NULLABLE | When approved |
| approved_by | uuid | FK users(id), NULLABLE | Who approved |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Status Values:**
- `not_started`
- `in_progress`
- `ready_for_review`
- `changes_requested`
- `completed`
- `disputed`

**Indexes:**
- `idx_milestones_project_id` on `project_id`
- `idx_milestones_status` on `status`

**Constraints:**
- CHECK: status IN (...all status values)
- CHECK: client_rating >= 1 AND client_rating <= 5
- CHECK: amount > 0

---

### 11. payments

**Purpose:** Payment transactions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Payment ID |
| project_id | uuid | FK projects(id), NOT NULL | Related project |
| milestone_id | uuid | FK milestones(id), NULLABLE | Related milestone |
| payer_id | uuid | FK users(id), NOT NULL | Who pays |
| payee_id | uuid | FK users(id), NOT NULL | Who receives |
| type | enum | NOT NULL | Payment type |
| amount | integer | NOT NULL | Gross amount (₹) |
| platform_fee | integer | DEFAULT 0 | Platform fee deducted |
| net_amount | integer | NOT NULL | Net to payee |
| status | enum | DEFAULT 'pending' | Payment status |
| payment_method | varchar(100) | NULLABLE | card, upi, bank_transfer |
| payment_gateway_id | varchar(255) | NULLABLE | Stripe/Razorpay ID |
| payment_intent | varchar(255) | NULLABLE | Gateway payment intent |
| failure_reason | text | NULLABLE | If failed |
| created_at | timestamp | DEFAULT NOW() | |
| completed_at | timestamp | NULLABLE | When completed |

**Payment Types:**
- `escrow` - Client deposits to escrow
- `release` - Escrow to freelancer
- `refund` - Escrow back to client
- `withdrawal` - Freelancer to bank

**Status Values:**
- `pending`
- `processing`
- `completed`
- `failed`

**Indexes:**
- `idx_payments_project_id` on `project_id`
- `idx_payments_milestone_id` on `milestone_id`
- `idx_payments_payer_id` on `payer_id`
- `idx_payments_payee_id` on `payee_id`
- `idx_payments_status` on `status`

**Constraints:**
- CHECK: type IN ('escrow', 'release', 'refund', 'withdrawal')
- CHECK: status IN ('pending', 'processing', 'completed', 'failed')
- CHECK: net_amount = amount - platform_fee

---

### 12. wallet_transactions

**Purpose:** Freelancer wallet ledger

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Transaction ID |
| user_id | uuid | FK users(id), NOT NULL | Wallet owner |
| type | enum | NOT NULL | credit, debit |
| amount | integer | NOT NULL | Amount (₹) |
| balance_after | integer | NOT NULL | Balance after txn |
| reason | varchar(255) | NOT NULL | Description |
| reference_type | varchar(50) | NULLABLE | payment, withdrawal, bonus |
| reference_id | uuid | NULLABLE | Related record ID |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_wallet_txns_user_id` on `user_id`
- `idx_wallet_txns_created_at` on `created_at`

**Constraints:**
- CHECK: type IN ('credit', 'debit')

---

### 13. bank_accounts

**Purpose:** Freelancer bank details for withdrawals

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Bank account ID |
| user_id | uuid | FK users(id), NOT NULL | Account owner |
| account_number_encrypted | varchar(255) | NOT NULL | Encrypted account number |
| account_number_masked | varchar(20) | NOT NULL | Last 4 digits |
| ifsc_code | varchar(20) | NOT NULL | IFSC code (India) |
| account_holder_name | varchar(255) | NOT NULL | Account holder |
| bank_name | varchar(255) | NOT NULL | Bank name |
| branch | varchar(255) | NULLABLE | Branch name |
| is_default | boolean | DEFAULT false | Default account |
| verified | boolean | DEFAULT false | Verified by admin |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_bank_accounts_user_id` on `user_id`

---

### 14. withdrawals

**Purpose:** Withdrawal requests from freelancers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Withdrawal ID |
| user_id | uuid | FK users(id), NOT NULL | Requesting user |
| bank_account_id | uuid | FK bank_accounts(id), NOT NULL | Destination bank |
| amount | integer | NOT NULL | Requested amount (₹) |
| fee | integer | NOT NULL | Withdrawal fee |
| net_amount | integer | NOT NULL | Net to user |
| status | enum | DEFAULT 'pending' | Status |
| utr_number | varchar(100) | NULLABLE | Bank ref number |
| failure_reason | text | NULLABLE | If failed |
| requested_at | timestamp | DEFAULT NOW() | |
| processed_at | timestamp | NULLABLE | When processed |
| completed_at | timestamp | NULLABLE | When completed |

**Status Values:**
- `pending` - Awaiting processing
- `processing` - In progress
- `completed` - Transferred
- `failed` - Transfer failed

**Indexes:**
- `idx_withdrawals_user_id` on `user_id`
- `idx_withdrawals_status` on `status`

**Constraints:**
- CHECK: status IN ('pending', 'processing', 'completed', 'failed')
- CHECK: net_amount = amount - fee

---

### 15. disputes

**Purpose:** Dispute tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Dispute ID |
| project_id | uuid | FK projects(id), NOT NULL | Related project |
| milestone_id | uuid | FK milestones(id), NULLABLE | Related milestone |
| raised_by | uuid | FK users(id), NOT NULL | Who raised |
| against | uuid | FK users(id), NOT NULL | Against whom |
| category | enum | NOT NULL | Dispute category |
| description | text | NOT NULL | Issue description |
| evidence | jsonb | NULLABLE | Array of evidence items |
| status | enum | DEFAULT 'open' | Dispute status |
| amount_at_stake | integer | NOT NULL | Escrowed amount |
| assigned_admin | uuid | FK users(id), NULLABLE | Mediating admin |
| proposed_resolution | jsonb | NULLABLE | Admin proposal |
| final_resolution | jsonb | NULLABLE | Final decision |
| resolved_by | uuid | FK users(id), NULLABLE | Who resolved |
| created_at | timestamp | DEFAULT NOW() | |
| resolved_at | timestamp | NULLABLE | When resolved |

**Category Values:**
- `quality` - Quality issues
- `scope` - Scope disagreement
- `timeline` - Delay issues
- `payment` - Payment disputes
- `communication` - Communication issues

**Status Values:**
- `open` - Just raised
- `under_review` - Admin reviewing
- `resolution_proposed` - Awaiting acceptance
- `escalated` - To super admin
- `resolved` - Closed

**Indexes:**
- `idx_disputes_project_id` on `project_id`
- `idx_disputes_status` on `status`
- `idx_disputes_assigned_admin` on `assigned_admin`

**Constraints:**
- CHECK: category IN (...all category values)
- CHECK: status IN (...all status values)

---

### 16. reviews

**Purpose:** Client reviews of freelancers

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Review ID |
| project_id | uuid | FK projects(id), NOT NULL | Project reviewed |
| client_id | uuid | FK users(id), NOT NULL | Reviewer |
| freelancer_id | uuid | FK users(id), NOT NULL | Reviewed |
| overall_rating | integer | NOT NULL | 1-5 |
| quality_rating | integer | NULLABLE | 1-5 |
| communication_rating | integer | NULLABLE | 1-5 |
| timeliness_rating | integer | NULLABLE | 1-5 |
| professionalism_rating | integer | NULLABLE | 1-5 |
| comment | text | NULLABLE | Written review |
| public | boolean | DEFAULT true | Show on profile |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_reviews_freelancer_id` on `freelancer_id`
- `idx_reviews_project_id` on `project_id`

**Constraints:**
- CHECK: overall_rating >= 1 AND overall_rating <= 5
- UNIQUE: (project_id, client_id) - one review per project

---

### 17. messages

**Purpose:** In-platform messaging

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Message ID |
| conversation_id | uuid | FK conversations(id), NOT NULL | Conversation |
| sender_id | uuid | FK users(id), NOT NULL | Sender |
| text | text | NOT NULL | Message text |
| attachments | jsonb | NULLABLE | Array of file objects |
| read_by | jsonb | DEFAULT '[]' | Array of user IDs who read |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_messages_conversation_id` on `conversation_id`
- `idx_messages_sender_id` on `sender_id`
- `idx_messages_created_at` on `created_at`

---

### 18. conversations

**Purpose:** Message conversation threads

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Conversation ID |
| type | enum | NOT NULL | Type of conversation |
| project_id | uuid | FK projects(id), NULLABLE | If project chat |
| participants | jsonb | NOT NULL | Array of user IDs |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Type Values:**
- `project` - Project-specific chat
- `direct` - Direct message
- `support` - User to support

**Indexes:**
- `idx_conversations_project_id` on `project_id`
- `idx_conversations_updated_at` on `updated_at`

**Constraints:**
- CHECK: type IN ('project', 'direct', 'support')

---

### 19. notifications

**Purpose:** User notifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Notification ID |
| user_id | uuid | FK users(id), NOT NULL | Recipient |
| type | varchar(100) | NOT NULL | Notification type |
| title | varchar(255) | NOT NULL | Title |
| message | text | NOT NULL | Message body |
| data | jsonb | NULLABLE | Additional context |
| read | boolean | DEFAULT false | Read status |
| link | varchar(500) | NULLABLE | Action link |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_notifications_user_id` on `user_id`
- `idx_notifications_read` on `read`
- `idx_notifications_created_at` on `created_at`

---

### 20. audit_logs

**Purpose:** System audit trail (for super admin)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Log ID |
| user_id | uuid | FK users(id), NULLABLE | Who performed action |
| action | varchar(100) | NOT NULL | Action type |
| resource_type | varchar(50) | NOT NULL | What was acted on |
| resource_id | uuid | NULLABLE | ID of resource |
| changes | jsonb | NULLABLE | Before/after values |
| ip_address | varchar(50) | NULLABLE | IP address |
| user_agent | varchar(500) | NULLABLE | Browser info |
| created_at | timestamp | DEFAULT NOW() | |

**Indexes:**
- `idx_audit_logs_user_id` on `user_id`
- `idx_audit_logs_action` on `action`
- `idx_audit_logs_resource_type` on `resource_type`
- `idx_audit_logs_created_at` on `created_at`

---

### 21. system_settings

**Purpose:** Platform-wide configuration (super admin)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, DEFAULT uuid_generate_v4() | Setting ID |
| key | varchar(255) | UNIQUE, NOT NULL | Setting key |
| value | jsonb | NOT NULL | Setting value (JSON) |
| description | text | NULLABLE | What this setting does |
| updated_by | uuid | FK users(id), NULLABLE | Who last updated |
| created_at | timestamp | DEFAULT NOW() | |
| updated_at | timestamp | DEFAULT NOW() | |

**Example Keys:**
- `platform.margin.default_percent`
- `platform.margin.min_percent`
- `platform.withdrawal_fee_percent`
- `project.max_bids`
- `project.bidding_period_days`

---

## Relationships Summary

### One-to-Many
- users → client_profiles
- users → freelancer_profiles
- users → projects (as client)
- users → bids (as freelancer)
- users → wallet_transactions
- projects → bids
- projects → milestones
- projects → payments
- projects → disputes
- projects → messages
- conversations → messages

### One-to-One
- projects → project_assignments
- bids → project_assignments (winning bid)

### Many-to-Many
- freelancers ←→ skills (via freelancer_skills)
- conversations ←→ users (via participants JSONB)

---

## Triggers & Functions

### 1. update_updated_at_column()

**Purpose:** Auto-update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Apply to tables:**
- users
- projects
- milestones
- etc.

---

### 2. update_freelancer_rating()

**Purpose:** Recalculate freelancer aggregate rating after new review

```sql
CREATE OR REPLACE FUNCTION update_freelancer_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE freelancer_profiles
  SET 
    rating = (SELECT AVG(overall_rating) FROM reviews WHERE freelancer_id = NEW.freelancer_id),
    reviews_count = (SELECT COUNT(*) FROM reviews WHERE freelancer_id = NEW.freelancer_id)
  WHERE user_id = NEW.freelancer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_freelancer_rating
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_freelancer_rating();
```

---

### 3. update_wallet_balance()

**Purpose:** Maintain wallet balance in wallet_transactions

```sql
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT COALESCE(balance_after, 0) INTO current_balance
  FROM wallet_transactions
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NEW.type = 'credit' THEN
    NEW.balance_after = current_balance + NEW.amount;
  ELSE
    NEW.balance_after = current_balance - NEW.amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_balance
BEFORE INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();
```

---

## Views

### 1. v_freelancer_public_profiles

**Purpose:** Public-facing freelancer data for search

```sql
CREATE VIEW v_freelancer_public_profiles AS
SELECT 
  u.id,
  u.name,
  fp.title,
  fp.bio,
  fp.location,
  fp.hourly_rate_min,
  fp.hourly_rate_max,
  fp.rating,
  fp.reviews_count,
  fp.projects_completed,
  fp.completion_rate,
  fp.availability,
  fp.profile_photo_url,
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object('name', skill_name, 'level', proficiency_level))
     FROM freelancer_skills
     WHERE freelancer_id = fp.id),
    '[]'::jsonb
  ) AS skills,
  COALESCE(
    (SELECT jsonb_agg(jsonb_build_object('id', id, 'title', title, 'image_url', image_url))
     FROM freelancer_portfolio
     WHERE freelancer_id = fp.id
     ORDER BY display_order),
    '[]'::jsonb
  ) AS portfolio_preview
FROM users u
JOIN freelancer_profiles fp ON u.id = fp.user_id
WHERE u.status = 'active' AND u.role = 'freelancer';
```

---

### 2. v_project_summary

**Purpose:** Project overview with computed fields

```sql
CREATE VIEW v_project_summary AS
SELECT 
  p.id,
  p.title,
  p.status,
  p.budget_max,
  u.name AS client_name,
  cp.company_name,
  pa.freelancer_id,
  uf.name AS freelancer_name,
  COALESCE(
    (SELECT COUNT(*) FROM milestones WHERE project_id = p.id AND status = 'completed'),
    0
  ) AS milestones_completed,
  COALESCE(
    (SELECT COUNT(*) FROM milestones WHERE project_id = p.id),
    0
  ) AS milestones_total,
  CASE 
    WHEN (SELECT COUNT(*) FROM milestones WHERE project_id = p.id) > 0
    THEN ROUND(
      (SELECT COUNT(*) FROM milestones WHERE project_id = p.id AND status = 'completed')::NUMERIC
      / (SELECT COUNT(*) FROM milestones WHERE project_id = p.id) * 100
    )
    ELSE 0
  END AS progress_percent,
  p.created_at,
  p.updated_at
FROM projects p
JOIN users u ON p.client_id = u.id
LEFT JOIN client_profiles cp ON u.id = cp.user_id
LEFT JOIN project_assignments pa ON p.id = pa.project_id
LEFT JOIN users uf ON pa.freelancer_id = uf.id;
```

---

## Indexes Summary

**Performance-critical indexes:**

```sql
-- Full-text search on projects
CREATE INDEX idx_projects_title_gin ON projects USING gin(to_tsvector('english', title));
CREATE INDEX idx_projects_description_gin ON projects USING gin(to_tsvector('english', description));

-- JSONB indexes for skills
CREATE INDEX idx_freelancer_skills_jsonb ON freelancer_skills USING gin(skill_name gin_trgm_ops);

-- Composite indexes for common queries
CREATE INDEX idx_bids_project_status ON bids(project_id, status);
CREATE INDEX idx_milestones_project_status ON milestones(project_id, status);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
```

---

## Data Integrity Rules

### Constraints

1. **Prevent negative balances:** Wallet cannot go below zero
2. **Milestone amounts sum check:** Sum of milestone amounts should equal project assignment agreed_amount
3. **One bid per freelancer per project**
4. **One assignment per project**
5. **Cannot delete user with active projects**

### Soft Deletes

For sensitive data, implement soft deletes:
- Add `deleted_at` timestamp column
- Filter out deleted records in queries
- Retain for audit purposes

---

*End of Data Model Documentation*

# Connect-Accel API Specifications

**Version:** 1.0  
**Date:** November 26, 2025  
**Base URL:** `https://api.connect-accel.com/v1`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users & Profiles](#2-users--profiles)
3. [Projects](#3-projects)
4. [Consultations](#4-consultations)
5. [Freelancers](#5-freelancers)
6. [Bids](#6-bids)
7. [Assignments](#7-assignments)
8. [Milestones](#8-milestones)
9. [Payments](#9-payments)
10. [Disputes](#10-disputes)
11. [Messages](#11-messages)
12. [Notifications](#12-notifications)
13. [Reviews](#13-reviews)
14. [Admin](#14-admin)
15. [Super Admin](#15-super-admin)
16. [Webhooks](#16-webhooks)

---

## General Conventions

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Pagination
List endpoints support pagination via query parameters:
```
?page=1&limit=20
```

Response includes:
```json
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

### Filtering & Sorting
```
?filter[status]=active&sort=-created_at
```

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## 1. Authentication

### 1.1 Sign Up

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "client", // or "freelancer"
  "terms_accepted": true
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "usr_123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "email_verified": false,
    "created_at": "2025-11-26T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Verification email sent"
}
```

---

### 1.2 Log In

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "usr_123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "email_verified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.3 Verify Email

**Endpoint:** `POST /auth/verify-email`

**Request Body:**
```json
{
  "token": "email_verification_token_abc123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully"
}
```

---

### 1.4 Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset email sent"
}
```

---

### 1.5 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token_xyz789",
  "password": "NewSecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "message": "Password reset successful"
}
```

---

### 1.6 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "refresh_token_abc123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Users & Profiles

### 2.1 Get Current User

**Endpoint:** `GET /users/me`

**Response:** `200 OK`
```json
{
  "id": "usr_123abc",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "client",
  "email_verified": true,
  "phone": "+911234567890",
  "created_at": "2025-11-26T10:00:00Z",
  "profile": {
    "company_name": "TechCorp",
    "industry": "Technology",
    "location": "Mumbai, India",
    "gst_number": "27AABCT1332L1ZJ"
  }
}
```

---

### 2.2 Update User Profile

**Endpoint:** `PUT /users/me`

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+911234567890",
  "profile": {
    "company_name": "TechCorp Inc",
    "industry": "Software"
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "usr_123abc",
  "name": "John Updated",
  ...
}
```

---

### 2.3 Get Freelancer Profile (Public)

**Endpoint:** `GET /freelancers/{id}`

**Response:** `200 OK`
```json
{
  "id": "usr_456def",
  "name": "Ravi Kumar",
  "title": "Full Stack Developer",
  "bio": "Experienced developer with 5+ years...",
  "location": "Bangalore, India",
  "hourly_rate_min": 2000,
  "hourly_rate_max": 3000,
  "rating": 4.9,
  "reviews_count": 45,
  "projects_completed": 42,
  "completion_rate": 98,
  "member_since": "2024-01-15",
  "skills": [
    { "name": "React", "level": 5 },
    { "name": "Node.js", "level": 4 }
  ],
  "portfolio": [
    {
      "id": "prt_001",
      "title": "E-commerce Platform",
      "description": "Built a full-stack e-commerce...",
      "image_url": "https://cdn.connect-accel.com/...",
      "tech_stack": ["React", "Node.js", "MongoDB"],
      "link": "https://example.com"
    }
  ],
  "reviews": [
    {
      "id": "rev_001",
      "project_name": "Mobile App",
      "rating": 5,
      "comment": "Excellent work, delivered on time!",
      "client_name": "TechCorp",
      "date": "2025-10-15"
    }
  ]
}
```

---

### 2.4 Update Freelancer Profile

**Endpoint:** `PUT /freelancers/me`

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "bio": "Updated bio...",
  "hourly_rate_min": 2500,
  "hourly_rate_max": 3500,
  "skills": [
    { "name": "React", "level": 5 },
    { "name": "TypeScript", "level": 4 }
  ],
  "availability": "available" // available, busy, unavailable
}
```

**Response:** `200 OK`

---

### 2.5 Upload Profile Photo

**Endpoint:** `POST /users/me/photo`

**Request:** `multipart/form-data`
```
photo: <file>
```

**Response:** `200 OK`
```json
{
  "photo_url": "https://cdn.connect-accel.com/users/usr_123abc.jpg"
}
```

---

## 3. Projects

### 3.1 Create Project (Client)

**Endpoint:** `POST /projects`

**Request Body:**
```json
{
  "title": "E-commerce Mobile App",
  "description": "We need a mobile app for our e-commerce business...",
  "project_type": "mobile_app", // web_app, mobile_app, api, design, other
  "industry": "retail",
  "budget_min": 50000,
  "budget_max": 70000,
  "timeline_start": "2025-12-01",
  "timeline_end": "2026-02-01",
  "flexible_timeline": true,
  "tech_stack": ["React Native", "Node.js", "MongoDB"],
  "features": [
    "User authentication",
    "Product catalog",
    "Shopping cart",
    "Payment integration"
  ],
  "attachments": [
    {
      "name": "requirements.pdf",
      "url": "https://cdn.connect-accel.com/..."
    }
  ],
  "status": "draft" // draft or submitted
}
```

**Response:** `201 Created`
```json
{
  "id": "prj_789xyz",
  "title": "E-commerce Mobile App",
  "status": "draft",
  "created_at": "2025-11-26T10:00:00Z",
  ...
}
```

---

### 3.2 Get Project Details

**Endpoint:** `GET /projects/{id}`

**Response:** `200 OK`
```json
{
  "id": "prj_789xyz",
  "title": "E-commerce Mobile App",
  "description": "...",
  "status": "active", // draft, pending_review, in_bidding, assigned, active, completed, disputed, cancelled
  "project_type": "mobile_app",
  "client": {
    "id": "usr_123abc",
    "name": "John Doe",
    "company": "TechCorp"
  },
  "budget_min": 50000,
  "budget_max": 70000,
  "timeline_start": "2025-12-01",
  "timeline_end": "2026-02-01",
  "tech_stack": ["React Native", "Node.js"],
  "features": [...],
  "assigned_freelancer": {
    "id": "usr_456def",
    "name": "Ravi Kumar",
    "rating": 4.9
  },
  "admin_owner": {
    "id": "adm_001",
    "name": "Admin Jane"
  },
  "milestones": [...],
  "created_at": "2025-11-26T10:00:00Z",
  "updated_at": "2025-11-26T12:00:00Z"
}
```

---

### 3.3 List Projects (Client)

**Endpoint:** `GET /projects`

**Query Parameters:**
- `status` - filter by status
- `page` - pagination
- `limit` - items per page

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "prj_789xyz",
      "title": "E-commerce Mobile App",
      "status": "active",
      "budget_max": 70000,
      "progress": 60,
      "created_at": "2025-11-26T10:00:00Z"
    },
    ...
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 5
  }
}
```

---

### 3.4 Update Project (Client or Admin)

**Endpoint:** `PUT /projects/{id}`

**Request Body:** (partial update)
```json
{
  "description": "Updated description...",
  "budget_max": 75000
}
```

**Response:** `200 OK`

---

### 3.5 Submit Project for Review (Client)

**Endpoint:** `POST /projects/{id}/submit`

**Response:** `200 OK`
```json
{
  "id": "prj_789xyz",
  "status": "pending_review",
  "message": "Project submitted for admin review"
}
```

---

### 3.6 Admin: Review & Approve Project

**Endpoint:** `POST /projects/{id}/approve`

**Request Body:**
```json
{
  "client_budget_min": 60000,
  "client_budget_max": 80000,
  "freelancer_payout_min": 45000,
  "freelancer_payout_max": 60000,
  "refined_description": "Refined project scope...",
  "admin_notes": "Internal notes...",
  "freelancer_visibility": {
    "show_client_name": false,
    "show_full_budget": false,
    "custom_description": "Optional custom desc for freelancers"
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "prj_789xyz",
  "status": "in_bidding",
  "message": "Project moved to bidding"
}
```

---

### 3.7 Admin: Request Clarification

**Endpoint:** `POST /projects/{id}/request-clarification`

**Request Body:**
```json
{
  "message": "Please provide more details about the payment gateway requirements."
}
```

**Response:** `200 OK`

---

## 4. Consultations

### 4.1 Get Available Slots

**Endpoint:** `GET /consultations/availability`

**Query Parameters:**
- `date` - YYYY-MM-DD
- `admin_id` - optional, specific admin

**Response:** `200 OK`
```json
{
  "date": "2025-11-27",
  "slots": [
    {
      "start_time": "10:00",
      "end_time": "10:30",
      "available": true,
      "admin_id": "adm_001"
    },
    {
      "start_time": "10:30",
      "end_time": "11:00",
      "available": false
    },
    ...
  ]
}
```

---

### 4.2 Book Consultation (Client)

**Endpoint:** `POST /consultations`

**Request Body:**
```json
{
  "date": "2025-11-27",
  "start_time": "10:00",
  "duration": 30, // or 60 minutes
  "admin_id": "adm_001", // optional
  "description": "Need help scoping a mobile app project",
  "project_draft_id": "prj_draft_123" // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "con_abc123",
  "date": "2025-11-27",
  "start_time": "10:00",
  "end_time": "10:30",
  "meeting_link": "https://meet.connect-accel.com/con_abc123",
  "admin": {
    "id": "adm_001",
    "name": "Admin Jane"
  },
  "status": "scheduled"
}
```

---

### 4.3 List Consultations

**Endpoint:** `GET /consultations`

**Query Parameters:**
- `status` - upcoming, completed, cancelled

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "con_abc123",
      "date": "2025-11-27",
      "start_time": "10:00",
      "admin_name": "Admin Jane",
      "status": "scheduled",
      "meeting_link": "https://..."
    },
    ...
  ]
}
```

---

### 4.4 Cancel/Reschedule Consultation

**Endpoint:** `PUT /consultations/{id}`

**Request Body:**
```json
{
  "status": "cancelled", // or "rescheduled"
  "new_date": "2025-11-28", // if rescheduling
  "new_start_time": "14:00",
  "reason": "Schedule conflict"
}
```

**Response:** `200 OK`

---

### 4.5 Admin: Add Consultation Notes

**Endpoint:** `POST /consultations/{id}/notes`

**Request Body:**
```json
{
  "notes": "Client needs a React Native app with...",
  "outcome": "project_created", // project_created, needs_time, not_interested
  "project_id": "prj_789xyz" // if project created
}
```

**Response:** `200 OK`

---

## 5. Freelancers

### 5.1 Search Freelancers (Admin)

**Endpoint:** `GET /freelancers`

**Query Parameters:**
- `skills` - comma-separated
- `min_rating` - float
- `min_completion_rate` - integer (0-100)
- `hourly_rate_min` - integer
- `hourly_rate_max` - integer
- `location` - string
- `availability` - available, busy, unavailable
- `sort` - rating, projects, recent_activity

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "usr_456def",
      "name": "Ravi Kumar",
      "title": "Full Stack Developer",
      "rating": 4.9,
      "reviews_count": 45,
      "projects_completed": 42,
      "completion_rate": 98,
      "hourly_rate_min": 2000,
      "hourly_rate_max": 3000,
      "skills": ["React", "Node.js"],
      "availability": "available",
      "location": "Bangalore",
      "last_active": "2025-11-26T10:00:00Z"
    },
    ...
  ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

---

### 5.2 Invite Freelancers to Bid (Admin)

**Endpoint:** `POST /projects/{project_id}/invite-freelancers`

**Request Body:**
```json
{
  "freelancer_ids": ["usr_456def", "usr_789ghi"],
  "message": "We think you'd be a great fit for this project..."
}
```

**Response:** `200 OK`
```json
{
  "invited_count": 2,
  "message": "Invitations sent successfully"
}
```

---

### 5.3 List Projects for Freelancer

**Endpoint:** `GET /freelancers/projects`

**Query Parameters:**
- `status` - invited, open, closed
- `tech_stack` - filter by tech
- `budget_min` - minimum budget
- `budget_max` - maximum budget

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "prj_789xyz",
      "title": "E-commerce Mobile App",
      "description": "Short description...",
      "budget_min": 50000,
      "budget_max": 70000,
      "timeline_weeks": 8,
      "tech_stack": ["React Native", "Node.js"],
      "client_industry": "Retail",
      "status": "open_for_bidding",
      "invited": true,
      "bids_count": 5,
      "closes_at": "2025-11-30T23:59:59Z",
      "posted_at": "2025-11-26T10:00:00Z"
    },
    ...
  ]
}
```

---

## 6. Bids

### 6.1 Submit Bid (Freelancer)

**Endpoint:** `POST /projects/{project_id}/bids`

**Request Body:**
```json
{
  "bid_amount": 55000,
  "timeline_weeks": 7,
  "proposal": "I have extensive experience building React Native apps...",
  "milestones": [
    {
      "title": "UI/UX Design",
      "timeline_days": 7,
      "amount": 10000
    },
    {
      "title": "Backend Development",
      "timeline_days": 14,
      "amount": 20000
    },
    {
      "title": "Frontend Development",
      "timeline_days": 14,
      "amount": 15000
    },
    {
      "title": "Testing & Deployment",
      "timeline_days": 7,
      "amount": 10000
    }
  ],
  "relevant_portfolio_ids": ["prt_001", "prt_003"],
  "questions": "Will there be a designer, or should I handle the UI design as well?",
  "attachments": [
    {
      "name": "timeline.pdf",
      "url": "https://..."
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "bid_123abc",
  "project_id": "prj_789xyz",
  "freelancer_id": "usr_456def",
  "bid_amount": 55000,
  "status": "pending",
  "submitted_at": "2025-11-26T15:00:00Z"
}
```

---

### 6.2 Get Bids for Project (Admin)

**Endpoint:** `GET /projects/{project_id}/bids`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "bid_123abc",
      "freelancer": {
        "id": "usr_456def",
        "name": "Ravi Kumar",
        "rating": 4.9,
        "projects_completed": 42
      },
      "bid_amount": 55000,
      "timeline_weeks": 7,
      "proposal": "...",
      "milestones": [...],
      "status": "pending",
      "submitted_at": "2025-11-26T15:00:00Z",
      "admin_notes": "Strong candidate, good portfolio"
    },
    ...
  ]
}
```

---

### 6.3 Get My Bids (Freelancer)

**Endpoint:** `GET /freelancers/me/bids`

**Query Parameters:**
- `status` - pending, won, lost, withdrawn

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "bid_123abc",
      "project": {
        "id": "prj_789xyz",
        "title": "E-commerce Mobile App"
      },
      "bid_amount": 55000,
      "timeline_weeks": 7,
      "status": "pending",
      "submitted_at": "2025-11-26T15:00:00Z"
    },
    ...
  ]
}
```

---

### 6.4 Update Bid (Freelancer)

**Endpoint:** `PUT /bids/{id}`

**Request Body:** (partial update)
```json
{
  "bid_amount": 52000,
  "timeline_weeks": 8,
  "proposal": "Updated proposal..."
}
```

**Response:** `200 OK`

---

### 6.5 Withdraw Bid (Freelancer)

**Endpoint:** `POST /bids/{id}/withdraw`

**Request Body:**
```json
{
  "reason": "No longer available for this timeline"
}
```

**Response:** `200 OK`

---

### 6.6 Accept Bid (Admin)

**Endpoint:** `POST /bids/{id}/accept`

**Request Body:**
```json
{
  "client_budget": 65000,
  "freelancer_payout": 55000,
  "platform_margin": 10000,
  "agreed_timeline_weeks": 7,
  "notify_client": true
}
```

**Response:** `200 OK`
```json
{
  "project_id": "prj_789xyz",
  "assignment_id": "asg_001",
  "status": "assigned",
  "message": "Freelancer assigned successfully"
}
```

---

### 6.7 Reject Bid (Admin)

**Endpoint:** `POST /bids/{id}/reject`

**Request Body:**
```json
{
  "reason": "Timeline doesn't match client requirements",
  "share_reason_with_freelancer": true
}
```

**Response:** `200 OK`

---

## 7. Assignments

### 7.1 Get Project Assignment

**Endpoint:** `GET /projects/{project_id}/assignment`

**Response:** `200 OK`
```json
{
  "id": "asg_001",
  "project_id": "prj_789xyz",
  "freelancer": {
    "id": "usr_456def",
    "name": "Ravi Kumar",
    "email": "ravi@example.com",
    "phone": "+91..."
  },
  "client": {
    "id": "usr_123abc",
    "name": "John Doe",
    "company": "TechCorp"
  },
  "agreed_amount": 55000,
  "client_budget": 65000,
  "platform_margin": 10000,
  "timeline_weeks": 7,
  "start_date": "2025-12-01",
  "estimated_completion": "2026-01-19",
  "status": "active",
  "assigned_at": "2025-11-27T10:00:00Z"
}
```

---

## 8. Milestones

### 8.1 Create Milestones (Admin or Freelancer)

**Endpoint:** `POST /projects/{project_id}/milestones`

**Request Body:**
```json
{
  "milestones": [
    {
      "title": "UI/UX Design",
      "description": "Complete design mockups in Figma",
      "due_date": "2025-12-08",
      "amount": 10000,
      "deliverables": [
        "Figma design files",
        "Design system documentation"
      ]
    },
    {
      "title": "Backend Development",
      "description": "Build REST API endpoints",
      "due_date": "2025-12-22",
      "amount": 20000,
      "deliverables": [
        "API documentation",
        "Database schema",
        "Postman collection"
      ]
    },
    ...
  ]
}
```

**Response:** `201 Created`
```json
{
  "milestones": [
    {
      "id": "mls_001",
      "title": "UI/UX Design",
      "status": "not_started",
      ...
    },
    ...
  ]
}
```

---

### 8.2 Get Project Milestones

**Endpoint:** `GET /projects/{project_id}/milestones`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "mls_001",
      "title": "UI/UX Design",
      "description": "...",
      "due_date": "2025-12-08",
      "amount": 10000,
      "status": "completed",
      "deliverables": [...],
      "submissions": [
        {
          "submitted_at": "2025-12-07T10:00:00Z",
          "files": [...],
          "notes": "Completed as per requirements"
        }
      ],
      "approved_at": "2025-12-08T14:00:00Z",
      "approved_by": "usr_123abc"
    },
    {
      "id": "mls_002",
      "title": "Backend Development",
      "status": "in_progress",
      ...
    },
    ...
  ]
}
```

---

### 8.3 Update Milestone Status (Freelancer)

**Endpoint:** `PUT /milestones/{id}`

**Request Body:**
```json
{
  "status": "in_progress" // not_started, in_progress, ready_for_review
}
```

**Response:** `200 OK`

---

### 8.4 Submit Milestone for Review (Freelancer)

**Endpoint:** `POST /milestones/{id}/submit`

**Request Body:**
```json
{
  "notes": "All deliverables completed as discussed",
  "files": [
    {
      "name": "design-system.pdf",
      "url": "https://cdn.connect-accel.com/..."
    },
    {
      "name": "figma-file.fig",
      "url": "https://..."
    }
  ],
  "links": [
    {
      "title": "Figma Prototype",
      "url": "https://figma.com/..."
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": "mls_001",
  "status": "ready_for_review",
  "submitted_at": "2025-12-07T10:00:00Z"
}
```

---

### 8.5 Review Milestone (Client)

**Endpoint:** `POST /milestones/{id}/review`

**Request Body:**
```json
{
  "action": "approve", // approve, request_changes, dispute
  "rating": 5, // 1-5, optional for approve
  "comments": "Great work, delivered ahead of schedule!",
  "changes_requested": [] // if action is request_changes
}
```

**Response:** `200 OK`
```json
{
  "id": "mls_001",
  "status": "completed",
  "approved_at": "2025-12-08T14:00:00Z",
  "payment_released": true,
  "payment_id": "pmt_001"
}
```

---

### 8.6 Request Changes (Client)

**Endpoint:** `POST /milestones/{id}/request-changes`

**Request Body:**
```json
{
  "changes": [
    "Update color scheme to match brand guidelines",
    "Add forgot password flow to login screen"
  ],
  "comments": "Overall good, but need these adjustments"
}
```

**Response:** `200 OK`
```json
{
  "id": "mls_001",
  "status": "changes_requested",
  "revision_count": 1
}
```

---

## 9. Payments

### 9.1 Create Escrow Deposit (Client)

**Endpoint:** `POST /projects/{project_id}/escrow`

**Request Body:**
```json
{
  "amount": 65000,
  "payment_method_id": "pm_card_123", // saved payment method
  "type": "full_project" // or "milestone"
}
```

**Response:** `201 Created`
```json
{
  "id": "esc_001",
  "project_id": "prj_789xyz",
  "amount": 65000,
  "status": "locked",
  "payment_intent": "pi_abc123", // Stripe/Razorpay payment intent
  "client_secret": "pi_abc123_secret_xyz" // for client-side confirmation
}
```

---

### 9.2 Get Payment History

**Endpoint:** `GET /payments`

**Query Parameters:**
- `project_id` - filter by project
- `type` - escrow, release, refund, withdrawal
- `status` - pending, completed, failed

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "pmt_001",
      "project_id": "prj_789xyz",
      "milestone_id": "mls_001",
      "type": "release",
      "amount": 10000,
      "platform_fee": 250,
      "net_amount": 9750,
      "status": "completed",
      "from_user": "usr_123abc",
      "to_user": "usr_456def",
      "created_at": "2025-12-08T14:30:00Z"
    },
    ...
  ]
}
```

---

### 9.3 Get Freelancer Wallet

**Endpoint:** `GET /freelancers/me/wallet`

**Response:** `200 OK`
```json
{
  "balance": 25000,
  "pending_clearance": 8000,
  "total_earned": 150000,
  "withdrawn": 117000,
  "currency": "INR"
}
```

---

### 9.4 Request Withdrawal (Freelancer)

**Endpoint:** `POST /withdrawals`

**Request Body:**
```json
{
  "amount": 20000,
  "bank_account_id": "ba_123" // saved bank account
}
```

**Response:** `201 Created`
```json
{
  "id": "wd_001",
  "amount": 20000,
  "fee": 500,
  "net_amount": 19500,
  "status": "processing",
  "estimated_completion": "2025-12-10",
  "requested_at": "2025-12-08T10:00:00Z"
}
```

---

### 9.5 Add Bank Account (Freelancer)

**Endpoint:** `POST /freelancers/me/bank-accounts`

**Request Body:**
```json
{
  "account_number": "1234567890",
  "ifsc_code": "HDFC0001234",
  "account_holder_name": "Ravi Kumar",
  "bank_name": "HDFC Bank",
  "branch": "Bangalore"
}
```

**Response:** `201 Created`
```json
{
  "id": "ba_123",
  "account_number_masked": "******7890",
  "bank_name": "HDFC Bank",
  "is_default": true
}
```

---

### 9.6 Get Invoices (Client)

**Endpoint:** `GET /invoices`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "inv_001",
      "invoice_number": "INV-2025-001",
      "project_id": "prj_789xyz",
      "project_name": "E-commerce Mobile App",
      "amount": 65000,
      "gst": 11700,
      "total": 76700,
      "date": "2025-12-01",
      "status": "paid",
      "pdf_url": "https://cdn.connect-accel.com/invoices/inv_001.pdf"
    },
    ...
  ]
}
```

---

## 10. Disputes

### 10.1 Raise Dispute

**Endpoint:** `POST /projects/{project_id}/disputes`

**Request Body:**
```json
{
  "milestone_id": "mls_002", // optional, if specific to milestone
  "category": "quality", // quality, scope, timeline, payment, communication
  "description": "The delivered code doesn't meet the acceptance criteria discussed...",
  "evidence": [
    {
      "type": "file",
      "name": "screenshot.png",
      "url": "https://..."
    },
    {
      "type": "message_reference",
      "message_id": "msg_123"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "dsp_001",
  "project_id": "prj_789xyz",
  "status": "open",
  "raised_by": "usr_123abc",
  "against": "usr_456def",
  "escrow_frozen": true,
  "amount_at_stake": 20000,
  "created_at": "2025-12-10T09:00:00Z"
}
```

---

### 10.2 Get Dispute Details

**Endpoint:** `GET /disputes/{id}`

**Response:** `200 OK`
```json
{
  "id": "dsp_001",
  "project": {
    "id": "prj_789xyz",
    "title": "E-commerce Mobile App"
  },
  "milestone": {
    "id": "mls_002",
    "title": "Backend Development"
  },
  "raised_by": {
    "id": "usr_123abc",
    "name": "John Doe",
    "role": "client"
  },
  "against": {
    "id": "usr_456def",
    "name": "Ravi Kumar",
    "role": "freelancer"
  },
  "category": "quality",
  "description": "...",
  "evidence": [...],
  "status": "under_review",
  "assigned_admin": {
    "id": "adm_001",
    "name": "Admin Jane"
  },
  "timeline": [
    {
      "timestamp": "2025-12-10T09:00:00Z",
      "event": "dispute_raised",
      "by": "usr_123abc"
    },
    {
      "timestamp": "2025-12-10T10:30:00Z",
      "event": "admin_assigned",
      "by": "system"
    }
  ],
  "proposed_resolution": null,
  "created_at": "2025-12-10T09:00:00Z"
}
```

---

### 10.3 Propose Resolution (Admin)

**Endpoint:** `POST /disputes/{id}/propose-resolution`

**Request Body:**
```json
{
  "resolution_type": "partial_refund", // full_refund, partial_refund, full_release, milestone_revision
  "refund_amount": 10000, // if partial_refund
  "payment_to_freelancer": 10000,
  "rationale": "Based on the review, 50% of work was completed satisfactorily...",
  "conditions": [
    "Freelancer to fix critical bugs within 3 days",
    "Client to provide specific list of issues"
  ]
}
```

**Response:** `200 OK`
```json
{
  "id": "dsp_001",
  "status": "resolution_proposed",
  "proposed_resolution": {
    "type": "partial_refund",
    "details": {...}
  },
  "awaiting_acceptance_from": ["client", "freelancer"]
}
```

---

### 10.4 Accept/Reject Resolution

**Endpoint:** `POST /disputes/{id}/respond-to-resolution`

**Request Body:**
```json
{
  "action": "accept", // or "reject"
  "comments": "Agreed, this is fair"
}
```

**Response:** `200 OK`

---

### 10.5 Escalate Dispute (Admin)

**Endpoint:** `POST /disputes/{id}/escalate`

**Request Body:**
```json
{
  "reason": "Both parties rejected the proposed resolution",
  "recommendation": "Recommend full refund based on evidence"
}
```

**Response:** `200 OK`
```json
{
  "id": "dsp_001",
  "status": "escalated",
  "assigned_to": "superadmin"
}
```

---

### 10.6 Final Resolution (Super Admin)

**Endpoint:** `POST /disputes/{id}/resolve`

**Request Body:**
```json
{
  "resolution_type": "full_refund",
  "refund_amount": 20000,
  "payment_to_freelancer": 0,
  "rationale": "After thorough review, the deliverables did not meet...",
  "binding": true
}
```

**Response:** `200 OK`
```json
{
  "id": "dsp_001",
  "status": "resolved",
  "resolution": {...},
  "resolved_at": "2025-12-15T16:00:00Z"
}
```

---

## 11. Messages

### 11.1 Get Conversations

**Endpoint:** `GET /messages/conversations`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "conv_001",
      "type": "project", // project, direct, support
      "project_id": "prj_789xyz",
      "participants": [
        {
          "id": "usr_123abc",
          "name": "John Doe",
          "role": "client"
        },
        {
          "id": "usr_456def",
          "name": "Ravi Kumar",
          "role": "freelancer"
        },
        {
          "id": "adm_001",
          "name": "Admin Jane",
          "role": "admin"
        }
      ],
      "last_message": {
        "text": "Sure, I'll have it ready by tomorrow",
        "sender_id": "usr_456def",
        "timestamp": "2025-12-08T15:30:00Z"
      },
      "unread_count": 2
    },
    ...
  ]
}
```

---

### 11.2 Get Messages in Conversation

**Endpoint:** `GET /messages/conversations/{id}`

**Query Parameters:**
- `before` - message ID for pagination
- `limit` - default 50

**Response:** `200 OK`
```json
{
  "conversation_id": "conv_001",
  "messages": [
    {
      "id": "msg_001",
      "sender": {
        "id": "usr_123abc",
        "name": "John Doe",
        "role": "client"
      },
      "text": "Can you share an update on the API development?",
      "attachments": [],
      "timestamp": "2025-12-08T14:00:00Z",
      "read_by": ["usr_456def", "adm_001"]
    },
    {
      "id": "msg_002",
      "sender": {
        "id": "usr_456def",
        "name": "Ravi Kumar",
        "role": "freelancer"
      },
      "text": "Sure, I'll have it ready by tomorrow",
      "attachments": [
        {
          "name": "progress-report.pdf",
          "url": "https://...",
          "size": 245678
        }
      ],
      "timestamp": "2025-12-08T15:30:00Z",
      "read_by": []
    },
    ...
  ],
  "has_more": true
}
```

---

### 11.3 Send Message

**Endpoint:** `POST /messages/conversations/{id}/messages`

**Request Body:**
```json
{
  "text": "Thanks for the update!",
  "attachments": [
    {
      "name": "reference.pdf",
      "url": "https://..."
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "msg_003",
  "sender_id": "usr_123abc",
  "text": "Thanks for the update!",
  "timestamp": "2025-12-08T16:00:00Z"
}
```

---

### 11.4 Mark Messages as Read

**Endpoint:** `POST /messages/conversations/{id}/read`

**Request Body:**
```json
{
  "message_ids": ["msg_001", "msg_002"]
}
```

**Response:** `200 OK`

---

## 12. Notifications

### 12.1 Get Notifications

**Endpoint:** `GET /notifications`

**Query Parameters:**
- `unread` - boolean
- `type` - project, payment, message, system

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "ntf_001",
      "type": "milestone_approved",
      "title": "Milestone Approved",
      "message": "Client approved 'UI/UX Design' milestone",
      "data": {
        "project_id": "prj_789xyz",
        "milestone_id": "mls_001"
      },
      "read": false,
      "created_at": "2025-12-08T14:30:00Z"
    },
    ...
  ],
  "unread_count": 5
}
```

---

### 12.2 Mark Notification as Read

**Endpoint:** `PUT /notifications/{id}/read`

**Response:** `200 OK`

---

### 12.3 Mark All as Read

**Endpoint:** `POST /notifications/read-all`

**Response:** `200 OK`

---

### 12.4 Get Notification Preferences

**Endpoint:** `GET /users/me/notification-preferences`

**Response:** `200 OK`
```json
{
  "email": {
    "new_bid": true,
    "milestone_approved": true,
    "payment_received": true,
    "message_received": false,
    "daily_digest": true
  },
  "push": {
    "new_bid": true,
    "milestone_approved": true,
    "message_received": true
  }
}
```

---

### 12.5 Update Notification Preferences

**Endpoint:** `PUT /users/me/notification-preferences`

**Request Body:**
```json
{
  "email": {
    "message_received": true
  }
}
```

**Response:** `200 OK`

---

## 13. Reviews

### 13.1 Submit Review (Client → Freelancer)

**Endpoint:** `POST /projects/{project_id}/reviews`

**Request Body:**
```json
{
  "freelancer_id": "usr_456def",
  "rating": 5,
  "quality": 5,
  "communication": 5,
  "timeliness": 4,
  "professionalism": 5,
  "comment": "Excellent work! Ravi delivered ahead of schedule...",
  "public": true
}
```

**Response:** `201 Created`
```json
{
  "id": "rev_001",
  "project_id": "prj_789xyz",
  "rating": 5,
  "created_at": "2025-12-20T10:00:00Z"
}
```

---

### 13.2 Get Reviews for Freelancer

**Endpoint:** `GET /freelancers/{id}/reviews`

**Response:** `200 OK`
```json
{
  "average_rating": 4.9,
  "total_reviews": 45,
  "breakdown": {
    "5_star": 40,
    "4_star": 4,
    "3_star": 1,
    "2_star": 0,
    "1_star": 0
  },
  "data": [
    {
      "id": "rev_001",
      "project_name": "E-commerce Mobile App",
      "rating": 5,
      "comment": "Excellent work!...",
      "client_name": "TechCorp",
      "date": "2025-12-20"
    },
    ...
  ]
}
```

---

## 14. Admin APIs

### 14.1 Get Admin Dashboard Stats

**Endpoint:** `GET /admin/dashboard`

**Response:** `200 OK`
```json
{
  "projects_pending_review": 5,
  "projects_in_bidding": 8,
  "active_projects": 23,
  "disputes": 2,
  "upcoming_consultations": 3,
  "this_week": {
    "projects_assigned": 7,
    "revenue": 180000,
    "avg_bid_time_hours": 36
  }
}
```

---

### 14.2 Search Projects (Admin)

**Endpoint:** `GET /admin/projects`

**Query Parameters:**
- `status` - multiple statuses
- `admin_id` - filter by assigned admin
- `client_id`
- `freelancer_id`
- `date_from`, `date_to`

**Response:** Similar to client project list with additional admin fields

---

### 14.3 Add Internal Notes

**Endpoint:** `POST /admin/projects/{id}/notes`

**Request Body:**
```json
{
  "note": "Client is flexible on timeline but firm on budget",
  "private": true // visible only to admins
}
```

**Response:** `201 Created`

---

### 14.4 Reassign Project to Admin

**Endpoint:** `PUT /admin/projects/{id}/reassign`

**Request Body:**
```json
{
  "new_admin_id": "adm_002",
  "reason": "Specializes in mobile projects"
}
```

**Response:** `200 OK`

---

## 15. Super Admin APIs

### 15.1 Get Platform Stats

**Endpoint:** `GET /superadmin/stats`

**Query Parameters:**
- `period` - today, week, month, year, all_time

**Response:** `200 OK`
```json
{
  "users": {
    "total": 1520,
    "clients": 480,
    "freelancers": 1030,
    "admins": 10,
    "new_this_period": 45
  },
  "projects": {
    "total": 342,
    "active": 78,
    "completed": 245,
    "disputed": 3
  },
  "financial": {
    "gmv": 8500000,
    "revenue": 1850000,
    "payouts": 6650000,
    "escrow_balance": 1200000
  },
  "performance": {
    "avg_time_to_assignment_days": 3.2,
    "completion_rate": 92,
    "dispute_rate": 1.5,
    "client_satisfaction": 4.7,
    "freelancer_satisfaction": 4.6
  }
}
```

---

### 15.2 Manage User

**Endpoint:** `PUT /superadmin/users/{id}`

**Request Body:**
```json
{
  "status": "suspended", // active, suspended, banned
  "reason": "Multiple client complaints",
  "notify_user": true
}
```

**Response:** `200 OK`

---

### 15.3 Update Platform Settings

**Endpoint:** `PUT /superadmin/settings`

**Request Body:**
```json
{
  "financial": {
    "default_margin_percent": 22,
    "min_margin_percent": 15,
    "withdrawal_fee_percent": 2.5
  },
  "project": {
    "max_bids_per_project": 10,
    "default_bidding_period_days": 5
  }
}
```

**Response:** `200 OK`

---

### 15.4 Get Audit Logs

**Endpoint:** `GET /superadmin/audit-logs`

**Query Parameters:**
- `user_id`
- `action` - login, create, update, delete, payment, etc.
- `resource` - project, user, payment, etc.
- `date_from`, `date_to`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "log_001",
      "timestamp": "2025-12-08T14:30:00Z",
      "user": {
        "id": "adm_001",
        "name": "Admin Jane"
      },
      "action": "project.budget.update",
      "resource": {
        "type": "project",
        "id": "prj_789xyz"
      },
      "changes": {
        "budget_max": {
          "from": 70000,
          "to": 75000
        }
      },
      "ip_address": "192.168.1.1"
    },
    ...
  ]
}
```

---

## 16. Webhooks

### 16.1 Configure Webhook

**Endpoint:** `POST /webhooks`

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": [
    "project.created",
    "project.assigned",
    "milestone.approved",
    "payment.released",
    "dispute.raised"
  ],
  "secret": "your_webhook_secret"
}
```

**Response:** `201 Created`

---

### 16.2 Webhook Event Format

**Payload sent to your endpoint:**
```json
{
  "id": "evt_123abc",
  "type": "milestone.approved",
  "timestamp": "2025-12-08T14:30:00Z",
  "data": {
    "project_id": "prj_789xyz",
    "milestone_id": "mls_001",
    "amount": 10000,
    "approved_by": "usr_123abc"
  }
}
```

**Signature Header:**
```
X-Connect-Accel-Signature: sha256=<hmac_signature>
```

---

## Appendix A: Event Types

### Project Events
- `project.created`
- `project.submitted`
- `project.approved`
- `project.assigned`
- `project.completed`
- `project.cancelled`

### Bid Events
- `bid.submitted`
- `bid.accepted`
- `bid.rejected`

### Milestone Events
- `milestone.created`
- `milestone.submitted`
- `milestone.approved`
- `milestone.changes_requested`

### Payment Events
- `payment.escrowed`
- `payment.released`
- `payment.refunded`
- `withdrawal.requested`
- `withdrawal.completed`

### Dispute Events
- `dispute.raised`
- `dispute.resolution_proposed`
- `dispute.escalated`
- `dispute.resolved`

---

## Appendix B: Rate Limiting

- **Default:** 100 requests per minute per API key
- **Authenticated:** 1000 requests per minute per user
- **Admin/Super Admin:** 5000 requests per minute

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1638360000
```

---

## Appendix C: Versioning

API versioning via URL path: `/v1`, `/v2`, etc.

Current version: `v1`

Major version bumps for breaking changes. Minor updates backward compatible.

---

*End of API Specifications*

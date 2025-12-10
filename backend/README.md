#Connect-Accel Backend

This is the backend API for theConnect-Accel application, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Role-based access control (Super Admin, Admin, Freelancer, Client)
- Email-based user creation with temporary passwords
- Project management
- Activity logging
- Notification system

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account for email functionality

## Installation

1. Clone the repository and navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/freelancer-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Templates
EMAIL_FROM_NAME=Connect - Accel
EMAIL_FROM_EMAIL=noreply@freelancerportal.com

# JWT Refresh Token Secret (Optional - defaults to JWT_SECRET + '_refresh')
JWT_REFRESH_SECRET=your-refresh-token-secret-key

# Rate Limiting Configuration (Optional - adjust based on your needs)
# RATE_LIMIT_WINDOW_MS: Time window in minutes (default: 15)
# RATE_LIMIT_MAX: Max requests per window for general API (default: 1000)
# RATE_LIMIT_AUTH_WINDOW_MS: Time window in minutes for auth (default: 15)
# RATE_LIMIT_AUTH_MAX: Max requests per window for auth endpoints (default: 20)
RATE_LIMIT_WINDOW_MS=15
RATE_LIMIT_MAX=1000
RATE_LIMIT_AUTH_WINDOW_MS=15
RATE_LIMIT_AUTH_MAX=20
```

## Email Setup (Gmail)

To use Gmail for sending emails:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## Database Seeding

### Seed Complete Database

To populate the database with test data including 20+ users across all roles and 30+ projects:

```bash
npm run seed
```

This will create:
- **1 Super Admin** (already exists: selvakumar@v-accel.ai)
- **2 Admin users** with different permissions
- **10 Freelancer users** with various skills and rates
- **10 Client users** from different companies
- **30+ Projects** with different statuses:
  - Completed projects with paid milestones
  - In-progress projects with active milestones
  - Bidding projects open for freelancer bids
  - Active/pending projects

**Note:** This script will clear existing users and projects (except the super admin). All passwords are set to `Admin@123` for admin roles, `Freelancer@123` for freelancers, and `Client@123` for clients.

### Create Super Admin Only

To create just the super admin user:

```bash
npm run seed:superadmin
```

The script will display all created user credentials with their email, password, role, and User ID for easy reference.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Users (Super Admin only)

- `POST /api/users` - Create new user with email
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### User Profile

- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account

### Projects

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## User Creation Workflow

1. **Super Admin creates user**: Uses the User Management interface
2. **System generates temporary password**: Random 12-character password
3. **Email sent to user**: Contains login credentials and instructions
4. **User logs in**: Uses temporary password
5. **Password change required**: User must change password on first login
6. **Role-based access**: User gains access based on their assigned role

## Database Models

### User Model

- Basic info: name, email, password, role
- Admin fields: adminRole, permissions
- Freelancer fields: skills, hourlyRate, experience, bio
- Client fields: company, phone, website, location, title
- Security: isFirstLogin, email verification tokens

### Project Model

- Project details: title, description, budget, timeline
- Status tracking: open, active, completed, hold, closed
- User associations: client, freelancer

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Email verification
- Temporary password system
- Secure password generation

## Error Handling

The API includes comprehensive error handling with appropriate HTTP status codes and descriptive error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

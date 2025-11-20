# Healthcare Appointment Management System

A comprehensive, modern healthcare appointment booking and management system built with Next.js 15, featuring role-based access control for Patients, Doctors, and Administrators. This system streamlines appointment scheduling, patient management, and healthcare administration with a beautiful, responsive user interface.

## 🎯 Overview

This healthcare management system provides a complete solution for managing appointments, patient records, doctor schedules, and administrative tasks. The system supports three distinct user roles, each with tailored dashboards and functionalities to meet their specific needs.

### Key Highlights

- **Multi-Role System**: Separate dashboards for Patients, Doctors, and Administrators
- **Secure Authentication**: Email-based OTP verification with Better Auth
- **Real-time Notifications**: Email notifications for appointments, reminders, and updates
- **Responsive Design**: Modern UI built with TailwindCSS and Radix UI components
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Database-Driven**: PostgreSQL with Prisma ORM for robust data management

## ✨ Features

### 👤 Patient Features

- **Appointment Booking**: Browse available doctors, view schedules, and book appointments
- **Appointment Management**: View, reschedule, or cancel appointments
- **Doctor Discovery**: Search and filter doctors by specialization
- **Medical Records**: Access personal medical records and test results
- **Prescription Management**: View and manage prescriptions
- **Notifications**: Receive email notifications for appointment confirmations, reminders, and updates
- **Profile Management**: Update personal information and preferences

### 👨‍⚕️ Doctor Features

- **Schedule Management**: View today's schedule and upcoming appointments
- **Availability Management**: Set and manage working hours and availability
- **Patient Management**: View patient list and manage patient records
- **Appointment Handling**: Confirm, reschedule, or cancel appointments
- **Prescription Management**: Create and manage patient prescriptions
- **Patient Records**: Access and update patient medical records
- **Reports & Analytics**: View appointment statistics and reports
- **Notifications**: Receive notifications for new bookings and appointment changes

### 👨‍💼 Administrator Features

- **Dashboard Overview**: Comprehensive system statistics and analytics
- **User Management**: Create, update, and manage user accounts (Patients, Doctors, Staff)
- **Appointment Oversight**: View and manage all appointments across the system
- **Doctor Management**: Manage doctor profiles, specializations, and availability
- **Patient Management**: View and manage patient accounts and records
- **Missed Appointments**: Track and manage missed appointments
- **System Reports**: Generate and view system-wide reports and analytics
- **Audit Logs**: Track system activities and user actions
- **Compliance Management**: Manage compliance and regulatory requirements
- **Notification Management**: System-wide notification management
- **Settings**: Configure system-wide settings and preferences

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Shadcn/ui** - High-quality component library
- **TanStack React Query** - Data fetching and state management
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Motion** - Animation library
- **Recharts** - Chart library for analytics

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Better Auth** - Authentication and session management
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Relational database
- **Resend** - Email service for notifications

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Turbopack** - Fast bundler for development

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **PostgreSQL** database (local or cloud instance)
- **Git** for version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd health-care
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory and add the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_db?schema=public"

# Better Auth Configuration
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Email Service (Resend)
RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="Healthcare System <noreply@yourdomain.com>"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with initial data
# npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
health-care/
├── app/                      # Next.js App Router pages
│   ├── api/                 # API routes
│   │   ├── admin/          # Admin API endpoints
│   │   ├── appointments/   # Appointment API
│   │   ├── auth/           # Authentication API
│   │   ├── doctors/        # Doctor API
│   │   └── user/           # User API
│   ├── dashboard/          # Dashboard pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── doctor/        # Doctor dashboard
│   │   └── patient/       # Patient dashboard
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   ├── appointments/       # Appointment components
│   ├── doctors/            # Doctor components
│   ├── emails/             # Email templates
│   ├── landing/            # Landing page components
│   ├── provider/           # Context providers
│   └── ui/                 # UI components (Shadcn)
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions and configurations
│   ├── validations/        # Zod validation schemas
│   ├── auth.ts             # Auth configuration
│   ├── email.ts            # Email service
│   ├── prisma.ts           # Prisma client
│   └── utils.ts            # Utility functions
├── prisma/                  # Database schema and migrations
│   └── schema.prisma       # Prisma schema
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware
└── package.json            # Dependencies and scripts
```

## 🔐 Authentication

The system uses **Better Auth** with email-based OTP (One-Time Password) verification:

- **Sign Up**: Users register with email, name, and password
- **Email Verification**: OTP sent via email for verification
- **Sign In**: Users can sign in with email/password or email OTP
- **Session Management**: Secure session handling with 7-day expiration
- **Role-Based Access**: Automatic routing based on user role (PATIENT, DOCTOR, ADMIN)

## 📊 Database Schema

The system uses PostgreSQL with the following main models:

- **User**: User accounts with roles (PATIENT, DOCTOR, ADMIN)
- **Doctor**: Doctor profiles with specialization and availability
- **DoctorAvailability**: Doctor working hours and schedule
- **Appointment**: Appointment bookings with status tracking
- **Notification**: System notifications for users
- **Session**: User session management
- **Account**: Authentication account information

## 🎨 UI Components

The system uses a comprehensive set of UI components built on Radix UI:

- Forms, Inputs, Buttons, Cards
- Data Tables with sorting and filtering
- Charts and Analytics components
- Modals, Dialogs, Dropdowns
- Sidebar navigation
- Theme switcher (Light/Dark mode)
- Responsive design for mobile and desktop

## 📧 Email Notifications

The system sends automated email notifications for:

- **Appointment Confirmations**: When appointments are booked
- **Appointment Reminders**: Before scheduled appointments
- **Appointment Cancellations**: When appointments are cancelled
- **Appointment Reschedules**: When appointments are rescheduled
- **OTP Verification**: For email verification and password reset

Email service is powered by **Resend**. Configure your `RESEND_API_KEY` in the environment variables.

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma Client
npx prisma migrate   # Run database migrations
npx prisma studio    # Open Prisma Studio (database GUI)
```

## 🎯 Demo Instructions

### For Clients/Classmates

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Access the Application**
   - Open http://localhost:3000
   - You'll see the landing page with features and information

3. **Create Test Accounts**
   - Click "Sign Up" to create a new account
   - Verify email with OTP (check console if email service not configured)
   - Default role is PATIENT

4. **Demo Different Roles**
   
   **Patient Role:**
   - Sign up as a patient
   - Browse doctors
   - Book an appointment
   - View appointments and medical records

   **Doctor Role:**
   - Create a doctor account (or update role via admin)
   - Set availability schedule
   - View appointments and patient records
   - Manage prescriptions

   **Admin Role:**
   - Access admin dashboard
   - Manage users, doctors, and appointments
   - View system reports and analytics
   - Manage system settings

5. **Key Features to Highlight**
   - Responsive design (try on mobile)
   - Dark/Light theme toggle
   - Real-time notifications
   - Appointment booking flow
   - Role-based dashboards
   - Data tables with filtering
   - Charts and analytics

### Creating Test Data

You can create test data manually through the UI or use Prisma Studio:

```bash
npx prisma studio
```

This opens a web interface to view and edit database records directly.

## 🔒 Security Features

- **Email Verification**: Required for account activation
- **OTP Authentication**: Secure one-time password verification
- **Session Management**: Secure session handling with expiration
- **Role-Based Access Control**: Middleware protection for routes
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `POST /api/auth/check-user` - Check if user exists

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Create appointment

### Doctors
- `GET /api/doctors` - Get doctors list
- `GET /api/doctors/[id]` - Get doctor details
- `GET /api/doctors/availability` - Get doctor availability

### Admin
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/[id]` - Get user details

### User
- `GET /api/user/profile` - Get user profile
- `POST /api/user/update-role` - Update user role

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Run `npx prisma generate` after schema changes

### Email Not Sending
- Verify `RESEND_API_KEY` is set in `.env`
- Check Resend dashboard for email logs
- System will log warnings if email service is not configured

### Authentication Issues
- Clear browser cookies and localStorage
- Verify `BETTER_AUTH_URL` matches your application URL
- Check middleware configuration

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`
- Check TypeScript errors: `npx tsc --noEmit`

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Development Team

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

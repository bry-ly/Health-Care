# Healthcare Appointment Management System

A comprehensive, modern healthcare appointment booking and management system built with Next.js 15. Role-based dashboards for Patients, Doctors, and Administrators streamline scheduling, patient management, and healthcare operations with a responsive, accessible UI.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Development Commands](#development-commands)
- [Environment Variables](#environment-variables)
- [Features Deep Dive](#features-deep-dive)
- [API Endpoint Patterns](#api-endpoint-patterns)
- [Business Rules & Validations](#business-rules--validations)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Code Conventions](#code-conventions)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

This system provides end-to-end appointment scheduling, patient record access, doctor availability management, and administrative oversight. Three roles get tailored dashboards and permissions:

- **Patients**: Book, manage, and track medical appointments with intuitive scheduling
- **Doctors**: Manage availability, view schedules, access patient records, and provide care
- **Administrators**: Oversee the entire system, manage users, and generate insights through analytics

The platform emphasizes security, data integrity, user experience, and healthcare compliance with comprehensive appointment lifecycle management, medical history tracking, and intelligent notification systems.

## ✨ Key Features

### 👤 Patient Features

- **Appointment Booking**: Search doctors by specialization, view availability, and book appointments
- **Appointment Management**: Reschedule or cancel appointments with automated notifications
- **Medical History**: Track medical records, allergies, chronic conditions, and medications
- **Doctor Discovery**: Search and filter doctors by specialization and ratings
- **Appointment Tracking**: View appointment history, status, and details
- **Email Notifications**: Receive confirmations, reminders, and status updates
- **Profile Management**: Update personal information and contact details
- **Insurance Information**: Store and manage insurance details for billing
- **Prescriptions**: Access digital prescriptions from doctors

### 👨‍⚕️ Doctor Features

- **Availability Management**: Set working hours, breaks, and available days
- **Schedule View**: See daily and upcoming appointments
- **Appointment Management**: Confirm, reschedule, or cancel patient appointments
- **Patient Records**: Access comprehensive patient medical histories
- **Medical Notes**: Create and update appointment notes and prescriptions
- **Appointment Analytics**: View appointment statistics and performance metrics
- **Calendar Integration**: Visual calendar view of scheduled appointments
- **Status Tracking**: Update appointment statuses with notes

### 👨‍💼 Administrator Features

- **Dashboard Analytics**: System-wide statistics, appointment trends, revenue metrics
- **User Management**: Manage patient, doctor, and admin accounts with role assignment
- **Doctor Oversight**: Manage doctor profiles, licenses, and availability
- **Appointment Oversight**: Monitor all appointments, handle disputes, reschedule
- **Reporting**: Generate reports on system usage, doctor performance, patient satisfaction
- **Notification Management**: Configure system-wide notification settings
- **Audit Logs**: Track system activities and user actions
- **System Settings**: Configure application parameters and defaults

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** with App Router
- **React 19** for UI components
- **TypeScript** for type safety and developer experience
- **TailwindCSS 4** for styling and responsive design
- **shadcn/ui** + **Radix UI** primitives for accessible components
- **TanStack React Query** for server state management and data fetching
- **React Hook Form** for form handling and validation
- **Zod** for schema validation
- **dnd-kit** for drag-and-drop functionality
- **Recharts** for data visualization and analytics
- **Motion** for smooth animations and transitions
- **Lucide React** for icons
- **Framer Motion** for advanced animations

### Backend

- **Next.js API Routes** for serverless backend logic
- **Better Auth** for authentication (email/password + OTP)
- **Prisma ORM** for database access and migrations
- **PostgreSQL** as primary database
- **Resend** for transactional email delivery

### Development & Tooling

- **Turbopack** for fast development builds
- **ESLint** for code quality
- **TypeScript Compiler** for type checking
- **Prisma CLI** for database management

## 🏗️ Architecture Overview

### System Design

The application follows a modern **full-stack Next.js architecture** with clear separation of concerns:

#### Frontend Layer

- **Root Layout** (`app/layout.tsx`): Wraps the entire app with:
  - `QueryProvider`: TanStack React Query for data fetching
  - `ThemeProvider`: Dark/light theme switching
  - `Toaster`: Toast notifications
  
- **Public Routes**: Landing page, authentication flows (login, signup, forgot-password)

- **Protected Routes**: Role-scoped dashboards under `/dashboard/{patient|doctor|admin}` with middleware-enforced RBAC

- **Component Architecture**: Domain-sliced components organized by feature:
  - `auth`: Login, signup, OTP verification components
  - `appointments`: Booking, rescheduling, cancellation flows
  - `dashboard`: Role-specific dashboard layouts and widgets
  - `doctors`: Doctor search, profile, availability components
  - `landing`: Marketing hero, features, testimonials
  - `ui`: Reusable UI primitives (buttons, forms, cards, tables, modals)
  - `emails`: Email template components using React Email

#### Backend Layer

- **API Routes** (`app/api/*`): RESTful endpoints organized by domain:
  - `appointments`: CRUD operations, status updates, conflict validation
  - `doctors`: Profile management, availability scheduling, search
  - `admin`: User management, analytics, system configuration
  - `user`: Profile updates, preferences, medical history
  - `notifications`: Notification delivery and preferences
  - `auth`: Authentication endpoints (login, signup, logout, OTP)
  - `reminders`: Scheduled reminder tasks

- **Middleware** (`middleware.ts`): 
  - Session verification
  - Role-Based Access Control (RBAC)
  - Automatic user redirection to correct dashboard

#### Data Layer

- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Relational database with comprehensive schema
- **Caching**: TanStack Query for client-side caching and synchronization
- **Sessions**: Better Auth for session management

### Data Flow

1. **User Authentication**: Better Auth handles email/password + OTP verification
2. **Session Management**: Sessions stored in database with expiration
3. **Protected Routes**: Middleware checks session before allowing access
4. **Data Fetching**: TanStack Query provides caching and automatic refetching
5. **Mutations**: React Hook Form + mutations invalidate cache for consistency
6. **Real-time Updates**: Toast notifications for user feedback
7. **Email Notifications**: Resend API for transactional emails

## 📁 Project Structure

```text
health-care/
├── app/                              # Next.js App Router
│   ├── api/                          # API route handlers
│   │   ├── admin/                    # Admin endpoints (users, analytics, settings)
│   │   ├── appointments/             # Appointment CRUD, scheduling, conflicts
│   │   ├── auth/                     # Authentication (login, signup, OTP, sessions)
│   │   ├── doctors/                  # Doctor management, availability, search
│   │   ├── medical-history/          # Patient medical records and history
│   │   ├── notifications/            # Notification delivery and preferences
│   │   ├── patient-assistant/        # AI-powered patient assistant (optional)
│   │   ├── reminders/                # Scheduled reminder tasks
│   │   └── user/                     # User profile and preferences
│   │
│   ├── dashboard/                    # Role-scoped dashboards
│   │   ├── admin/                    # Admin dashboard with analytics and management
│   │   ├── doctor/                   # Doctor dashboard with schedules and patients
│   │   └── patient/                  # Patient dashboard with appointments and records
│   │
│   ├── auth/                         # Auth pages
│   │   ├── login/                    # Login page with email/password
│   │   ├── signup/                   # Registration page with OTP
│   │   └── forgot-password/          # Password reset flow
│   │
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout (providers, theme)
│   └── globals.css                   # Global styles and Tailwind directives
│
├── components/                       # Domain-sliced React components
│   ├── appointments/                 # Appointment booking, cards, time pickers
│   ├── auth/                         # OTP form, login, signup components
│   ├── dashboard/                    # Dashboard layouts and widgets
│   │   ├── admin/                    # Admin-specific components
│   │   ├── doctor/                   # Doctor-specific components
│   │   └── patient/                  # Patient-specific components
│   ├── doctors/                      # Doctor profiles, search, discovery
│   ├── landing/                      # Landing page components
│   ├── medical-history/              # Medical records, history, forms
│   ├── emails/                       # Email templates (React Email)
│   ├── provider/                     # Context providers and wrappers
│   └── ui/                           # Reusable UI primitives (shadcn/ui)
│
├── hooks/                            # Custom React hooks
│   ├── useAppointments.ts            # Appointments data fetching
│   ├── useDoctors.ts                 # Doctor discovery and management
│   ├── useAvailability.ts            # Availability checking
│   ├── useNotifications.ts           # Notification management
│   └── [more hooks...]               # Domain-specific data fetching
│
├── lib/                              # Shared utilities and helpers
│   ├── auth.ts                       # Better Auth server configuration
│   ├── auth-client.ts                # Better Auth client wrapper
│   ├── prisma.ts                     # Prisma client singleton
│   ├── email.ts                      # Email sending utility
│   ├── email-templates.tsx           # Email template components
│   ├── notifications.ts              # Notification composition
│   ├── reminders.ts                  # Reminder scheduling logic
│   ├── phone-utils.ts                # Phone number validation and formatting
│   ├── time-utils.ts                 # Time and date utilities
│   ├── rate-limit.ts                 # Rate limiting for API routes
│   ├── api-response.ts               # Standard API response formatting
│   ├── validations/                  # Zod schemas for validation
│   └── utils.ts                      # General utilities
│
├── prisma/                           # Database schema and migrations
│   ├── schema.prisma                 # Database models and relations
│   └── migrations/                   # Migration history
│
├── types/                            # TypeScript type definitions
│   ├── api.ts                        # API response types
│   └── domain.ts                     # Domain model types
│
├── public/                           # Static assets
├── middleware.ts                     # Next.js middleware (auth, RBAC)
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── eslint.config.mjs                 # ESLint configuration
├── package.json                      # Dependencies and scripts
└── .gitignore                        # Git ignore rules
```

## 📊 Database Schema

### Core Models

#### User Model
Represents all system users with role-based access control.

```typescript
model User {
  id                String    @id
  name              String
  email             String    @unique
  emailVerified     Boolean   @default(false)
  phone             String?
  role              UserRole  @default(PATIENT)  // PATIENT, DOCTOR, ADMIN
  image             String?
  
  // Relations
  sessions          Session[]
  accounts          Account[]
  patientAppointments     Appointment[]        // As patient
  doctorAppointments      Appointment[]        // As doctor (assigned)
  doctorProfile     Doctor?
  notifications     Notification[]
  notificationPreferences NotificationPreferences?
  medicalHistory    MedicalHistory?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum UserRole {
  PATIENT
  DOCTOR
  ADMIN
}
```

#### Doctor Model
Professional doctor profiles with specialization and availability.

```typescript
model Doctor {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  specialization    String   // e.g., "Cardiology", "Pediatrics"
  licenseNumber     String   @unique
  bio               String?
  experience        Int      @default(0)       // Years
  consultationFee   Decimal  @default(0)
  isAvailable       Boolean  @default(true)
  
  // Relations
  availability      DoctorAvailability[]
  appointments      Appointment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

#### DoctorAvailability Model
Time slots when doctors are available for appointments.

```typescript
model DoctorAvailability {
  id              String   @id @default(cuid())
  doctorId        String
  doctor          Doctor   @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  
  dayOfWeek       Int      // 0 = Sunday, 6 = Saturday
  startTime       String   // "HH:MM" format
  endTime         String   // "HH:MM" format
  breakStart      String?  // "HH:MM" format
  breakEnd        String?  // "HH:MM" format
  isActive        Boolean  @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### Appointment Model
Complete appointment records with medical information and status tracking.

```typescript
model Appointment {
  id                    String            @id @default(cuid())
  
  // Appointment Details
  patientId             String
  patient               User              @relation("PatientAppointments", fields: [patientId], references: [id], onDelete: Cascade)
  doctorId              String
  doctor                Doctor            @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  assignedDoctorId      String?
  assignedDoctor        User?             @relation("DoctorAppointments", fields: [assignedDoctorId], references: [id])
  
  appointmentDate       DateTime
  timeSlot              String            // "HH:MM" format
  duration              Int               @default(30)    // Minutes
  status                AppointmentStatus @default(PENDING)
  
  // Medical Information
  appointmentType       AppointmentType?  @default(CONSULTATION)
  urgencyLevel          UrgencyLevel?     @default(ROUTINE)
  reason                String?
  symptoms              String?
  notes                 String?
  cancelReason          String?
  isFollowUp            Boolean           @default(false)
  previousAppointmentId String?
  
  // Contact & Insurance
  patientPhone          String?
  patientEmail          String?
  insuranceProvider     String?
  insurancePolicyNumber String?
  
  // Emergency Contact
  emergencyContactName  String?
  emergencyContactPhone String?
  
  // Reminder Tracking
  reminder24hSent       Boolean           @default(false)
  reminder1hSent        Boolean           @default(false)
  followUpSent          Boolean           @default(false)
  
  // Relations
  notifications         Notification[]
  
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
}

enum AppointmentStatus {
  PENDING      // Awaiting confirmation
  CONFIRMED    // Doctor confirmed
  CANCELLED    // Cancelled by patient or doctor
  COMPLETED    // Appointment finished
  RESCHEDULED  // Moved to different time
  MISSED       // Patient did not show up
}

enum AppointmentType {
  CONSULTATION
  FOLLOW_UP
  CHECKUP
  EMERGENCY
  SURGERY
  TEST
  OTHER
}

enum UrgencyLevel {
  ROUTINE
  URGENT
  EMERGENCY
}
```

#### Notification Model
Track all user notifications and communication.

```typescript
model Notification {
  id            String           @id @default(cuid())
  userId        String
  user          User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  appointmentId String?
  appointment   Appointment?     @relation(fields: [appointmentId], references: [id], onDelete: Cascade)
  
  type          NotificationType // See below
  title         String
  message       String
  isRead        Boolean          @default(false)
  emailSent     Boolean          @default(false)
  
  createdAt     DateTime         @default(now())
  sentAt        DateTime         @default(now())
}

enum NotificationType {
  APPOINTMENT_REMINDER  // Reminder before appointment
  BOOKING_CONFIRMATION  // Appointment confirmed
  CANCELLATION          // Appointment cancelled
  RESCHEDULE            // Appointment rescheduled
  NEW_BOOKING           // New appointment booked
}
```

#### Medical History & Related Models
Patient medical records and health information.

```typescript
model MedicalHistory {
  id                  String    @id @default(cuid())
  patientId           String    @unique
  patient             User      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  bloodType           BloodType @default(UNKNOWN)
  height              Float?    // centimeters
  weight              Float?    // kilograms
  surgicalHistory     String?
  familyHistory       String?
  currentMedications  String?
  lifestyle          String?   // Habits, exercise, etc.
  notes               String?
  
  allergies          Allergy[]
  chronicConditions  ChronicCondition[]
  
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
}

model Allergy {
  id                String          @id @default(cuid())
  medicalHistoryId  String
  medicalHistory    MedicalHistory  @relation(fields: [medicalHistoryId], references: [id], onDelete: Cascade)
  
  allergen          String          // e.g., "Penicillin"
  reaction          String?         // e.g., "Anaphylaxis"
  severity          AllergySeverity // MILD, MODERATE, SEVERE, LIFE_THREATENING
  diagnosedDate     DateTime?
  notes             String?
  
  createdAt         DateTime        @default(now())
}

model ChronicCondition {
  id                String         @id @default(cuid())
  medicalHistoryId  String
  medicalHistory    MedicalHistory @relation(fields: [medicalHistoryId], references: [id], onDelete: Cascade)
  
  condition         String         // e.g., "Diabetes Type 2"
  diagnosedDate     DateTime?
  status            String         @default("ACTIVE")  // ACTIVE, MANAGED, RESOLVED
  treatment         String?
  notes             String?
  
  createdAt         DateTime       @default(now())
}
```

#### Authentication Models
Session and account management via Better Auth.

```typescript
model Session {
  id        String   @id
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  accountId             String
  providerId            String
  password              String?
  
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

#### NotificationPreferences Model
User notification settings.

```typescript
model NotificationPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  appointmentReminders  Boolean @default(true)
  bookingConfirmations  Boolean @default(true)
  cancellationAlerts    Boolean @default(true)
  rescheduleAlerts      Boolean @default(true)
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## 📦 Installation & Setup

### Prerequisites

- **Node.js**: 18.17 or higher
- **npm**, **yarn**, or **pnpm** package manager
- **PostgreSQL**: Local instance or hosted service (e.g., Vercel Postgres, AWS RDS)
- **Git**: For version control

### Step-by-Step Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd health-care
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   See [Environment Variables](#environment-variables) section below.

4. **Apply database migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

   This creates the database schema and generates Prisma Client.

5. **Seed the database (optional)**

   ```bash
   npx prisma db seed
   ```

6. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Access the application**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Development Commands

### Development

```bash
# Start dev server with Turbopack
npm run dev

# Start dev server on specific port
npm run dev -- -p 3001
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Build and start (combined)
npm run build && npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix lint issues automatically
npm run lint -- --fix
```

### Database Management

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Create migration without running it
npx prisma migrate create --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Open Prisma Studio (GUI for database)
npx prisma studio

# Seed database
npx prisma db seed

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

### Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit
```

## 🔐 Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ============================================================================
# DATABASE
# ============================================================================
# PostgreSQL connection string
# Format: postgresql://username:password@host:port/database?schema=public
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db?schema=public"

# ============================================================================
# BETTER AUTH CONFIGURATION
# ============================================================================
# Backend base URL for Better Auth
BETTER_AUTH_URL="http://localhost:3000"

# ============================================================================
# APPLICATION URLs
# ============================================================================
# API base URL exposed to client
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Public application URL (for redirects and email links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================================================
# EMAIL CONFIGURATION (Resend)
# ============================================================================
# Resend API key for sending emails
# Get from: https://resend.com/api-keys
RESEND_API_KEY="re_your_api_key_here"

# From email address for outgoing emails
EMAIL_FROM="Healthcare System <noreply@yourdomain.com>"

# ============================================================================
# OPTIONAL: CRON & SCHEDULED TASKS
# ============================================================================
# Shared secret for cron jobs (use with Vercel Cron or similar)
CRON_SECRET="your-secret-cron-key"

# ============================================================================
# OPTIONAL: GOOGLE GEMINI (AI Assistant)
# ============================================================================
# Google Generative AI API key for patient assistant
GOOGLE_GENERATIVE_AI_API_KEY="your_google_ai_key"
```

### Environment Variable Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string with schema |
| `BETTER_AUTH_URL` | Yes | Backend URL for Better Auth server operations |
| `NEXT_PUBLIC_API_URL` | Yes | API base URL accessible to client |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL for email links and redirects |
| `RESEND_API_KEY` | Recommended | API key for Resend email service |
| `EMAIL_FROM` | Recommended | Friendly from address for transactional emails |
| `CRON_SECRET` | Optional | Shared secret for scheduled tasks (Vercel Cron, etc.) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | Google AI API for patient assistance features |

### Local Development Setup Example

```env
# Local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/healthcare_db?schema=public"

# Local URLs
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Resend (optional for development, logs to console if not configured)
RESEND_API_KEY="re_test_key"
EMAIL_FROM="Healthcare <test@example.com>"
```

## 🎯 Features Deep Dive

### Authentication & Onboarding

#### Email/Password Authentication
- Users register with email, password, and name
- Email verification required before account activation
- Password stored securely with hashing
- Better Auth handles session creation and management
- 7-day session expiration for security

#### OTP (One-Time Password) Verification
- Email-based OTP for sign-up verification
- OTP for password reset confirmation
- Verification codes expire after 15 minutes
- Supports resending verification codes
- Better Auth integration for OTP generation and validation

#### User Onboarding Flow
1. User lands on landing page
2. Clicks "Sign Up" or "Get Started"
3. Enters email, password, and full name
4. Receives OTP via email
5. Enters OTP to verify email
6. Selects role (Patient, Doctor)
7. Redirected to role-specific onboarding

#### Doctor Onboarding
- Additional fields: specialization, license number, experience
- License validation against standard formats
- Bio and profile picture upload
- Initial availability setup
- Consultation fee configuration

### Appointment Booking & Management

#### Appointment Booking Flow
1. Patient selects specialization or doctor
2. Views doctor's availability slots
3. Selects preferred date and time
4. Provides appointment details:
   - Appointment type (consultation, follow-up, checkup, etc.)
   - Urgency level (routine, urgent, emergency)
   - Symptoms and reason for visit
   - Insurance information (optional)
   - Emergency contact details
5. Receives confirmation email
6. Doctor receives notification

#### Availability Management
- Doctors set weekly recurring schedules
- Configure working hours per day
- Add breaks (lunch, tea, etc.)
- Mark specific dates as unavailable
- System prevents double-booking
- Appointment duration validation

#### Scheduling Conflict Validation
- Check doctor availability before confirming
- Prevent overlapping appointments
- Consider appointment duration
- Account for doctor breaks
- Validate time slot availability in real-time

#### Appointment Status Transitions
```
PENDING → CONFIRMED → COMPLETED
   ↓
CANCELLED (with reason)
   ↓
RESCHEDULED → CONFIRMED → COMPLETED
   ↓
MISSED (no-show)
```

#### Appointment Rescheduling
- Patient initiates reschedule request
- Doctor approves or suggests alternative time
- New slot must be within doctor's availability
- Old appointment moved to cancelled state
- New appointment created with same context
- Notifications sent to both parties

#### Appointment Cancellation
- Patient/doctor can cancel
- Reason for cancellation recorded
- Automatic email notification
- Different messaging for patient vs. doctor
- Cancellation reflected immediately

### Doctor Management & Discovery

#### Doctor Profile Management
- Complete professional profile setup
- Specialization categories
- License number validation
- Years of experience
- Professional bio
- Consultation fees
- Profile picture
- Availability scheduling

#### Patient Doctor Discovery
- Search doctors by name or specialization
- Filter by availability
- View doctor profiles and ratings
- See consultation fees
- Access doctor bio and experience
- Book directly from profile

#### Doctor Specializations
Pre-defined specializations include:
- Cardiology
- Dermatology
- Pediatrics
- Psychiatry
- Orthopedics
- Neurology
- ENT
- And more...

### Multi-role Dashboards

#### Patient Dashboard
- **Quick Stats**: Upcoming appointments, total visits, prescriptions
- **Appointment Calendar**: Visual calendar of all appointments
- **Recent Appointments**: List of past and upcoming appointments
- **Doctor Recommendations**: Suggested doctors based on history
- **Medical Records**: Quick access to medical history
- **Quick Actions**: Book appointment, message doctor, view prescriptions

#### Doctor Dashboard
- **Today's Schedule**: Appointments for the current day
- **Patient List**: All patients and their information
- **Upcoming Week**: Calendar view of next week
- **Appointment Analytics**: Charts showing appointment trends
- **Availability Management**: Quick edit availability
- **Quick Actions**: View patient details, write notes, update status

#### Admin Dashboard
- **System Analytics**: Total users, appointments, revenue
- **User Statistics**: Patient, doctor, and admin counts
- **Appointment Trends**: Charts showing appointment patterns
- **Revenue Metrics**: Income from appointments and services
- **Recent Activities**: Latest system activities
- **Quick Actions**: Manage users, view reports, configure settings

### Notification & Email System

#### Email Templates
Pre-built responsive email templates for:
- **Appointment Confirmation**: When appointment is booked
- **Appointment Reminder**: 24 hours before appointment
- **Appointment Reminder**: 1 hour before appointment
- **Appointment Cancellation**: When appointment is cancelled
- **Appointment Rescheduled**: When appointment is moved
- **OTP Verification**: For email verification
- **Password Reset**: For account recovery
- **Welcome Email**: On successful registration

#### Notification Preferences
Users control email preferences:
- Appointment reminders (enabled/disabled)
- Booking confirmations (enabled/disabled)
- Cancellation alerts (enabled/disabled)
- Reschedule alerts (enabled/disabled)

#### Notification Delivery
- Real-time in-app notifications
- Email delivery via Resend
- Notification status tracking
- Retry logic for failed deliveries
- Read/unread status tracking

#### Notification Types
- `APPOINTMENT_REMINDER`: Reminder before appointment
- `BOOKING_CONFIRMATION`: Appointment confirmed
- `CANCELLATION`: Appointment cancelled
- `RESCHEDULE`: Appointment rescheduled
- `NEW_BOOKING`: New appointment created

### Scheduling & Availability Management

#### Doctor Availability Model
- **Day-Based Scheduling**: Configure availability per day of week
- **Time Slots**: Define working hours (start time, end time)
- **Breaks**: Configure lunch, tea, and other breaks
- **Status**: Enable/disable availability temporarily

#### Time Slot Generation
- System generates 30-minute slots by default
- Customizable appointment duration (30, 45, 60 minutes)
- Respects doctor breaks
- Prevents overlapping bookings

#### Appointment Duration
- Configurable per doctor
- Defaults to 30 minutes
- Can be adjusted per appointment type
- Affects available slot calculations

#### Automatic Reminders
- 24-hour reminder email sent automatically
- 1-hour reminder (optional)
- Follow-up reminder after appointment
- Scheduled via cron jobs or Vercel Cron

## 📡 API Endpoint Patterns

### Authentication Endpoints

```
POST   /api/auth/signup           - Register new user
POST   /api/auth/login            - Login with email/password
POST   /api/auth/logout           - Logout current user
POST   /api/auth/otp/send         - Send OTP to email
POST   /api/auth/otp/verify       - Verify OTP code
POST   /api/auth/password/reset   - Initiate password reset
POST   /api/auth/password/update  - Update password
GET    /api/auth/session          - Get current session
```

### Appointment Endpoints

```
GET    /api/appointments          - List user's appointments
GET    /api/appointments/:id      - Get appointment details
POST   /api/appointments          - Create new appointment
PATCH  /api/appointments/:id      - Update appointment
DELETE /api/appointments/:id      - Cancel appointment
POST   /api/appointments/:id/reschedule - Reschedule appointment
GET    /api/appointments/search   - Search appointments with filters
GET    /api/appointments/availability - Check doctor availability
```

### Doctor Endpoints

```
GET    /api/doctors               - List all doctors
GET    /api/doctors/:id           - Get doctor profile
POST   /api/doctors               - Create doctor profile (admin)
PATCH  /api/doctors/:id           - Update doctor profile
GET    /api/doctors/search        - Search doctors by specialization
GET    /api/doctors/:id/availability - Get doctor's availability
POST   /api/doctors/:id/availability - Create availability slot
PATCH  /api/doctors/:id/availability/:slotId - Update slot
DELETE /api/doctors/:id/availability/:slotId - Delete slot
GET    /api/doctors/:id/appointments - Get doctor's appointments
```

### User Endpoints

```
GET    /api/user/profile          - Get user profile
PATCH  /api/user/profile          - Update user profile
GET    /api/user/medical-history  - Get medical history
POST   /api/user/medical-history  - Create/update medical history
GET    /api/user/notifications    - List user notifications
PATCH  /api/user/notifications/:id - Mark notification as read
GET    /api/user/preferences      - Get notification preferences
PATCH  /api/user/preferences      - Update notification preferences
```

### Admin Endpoints

```
GET    /api/admin/users           - List all users
GET    /api/admin/users/:id       - Get user details
PATCH  /api/admin/users/:id       - Update user
DELETE /api/admin/users/:id       - Delete user
POST   /api/admin/users/:id/role  - Change user role
GET    /api/admin/analytics       - Get system analytics
GET    /api/admin/analytics/appointments - Appointment statistics
GET    /api/admin/analytics/revenue - Revenue metrics
GET    /api/admin/settings        - Get system settings
PATCH  /api/admin/settings        - Update system settings
```

### Notification Endpoints

```
GET    /api/notifications         - List notifications
PATCH  /api/notifications/:id     - Mark as read
DELETE /api/notifications/:id     - Delete notification
GET    /api/notifications/preferences - Get preferences
PATCH  /api/notifications/preferences - Update preferences
POST   /api/notifications/test    - Send test email
```

### Medical History Endpoints

```
GET    /api/medical-history       - Get patient's medical history
POST   /api/medical-history       - Create medical history
PATCH  /api/medical-history       - Update medical history
GET    /api/medical-history/allergies - Get allergies
POST   /api/medical-history/allergies - Add allergy
DELETE /api/medical-history/allergies/:id - Remove allergy
GET    /api/medical-history/conditions - Get chronic conditions
POST   /api/medical-history/conditions - Add condition
DELETE /api/medical-history/conditions/:id - Remove condition
```

### Reminder Endpoints

```
POST   /api/reminders/send        - Trigger reminder emails
POST   /api/reminders/schedule    - Schedule future reminders
GET    /api/reminders/status      - Check reminder status
```

## ✅ Business Rules & Validations

### Appointment Scheduling Rules

1. **Availability Validation**
   - Appointment must fall within doctor's available hours
   - Doctor breaks must be respected
   - No appointments on inactive availability days
   - Appointment slot must not overlap with existing appointments

2. **Duration Validation**
   - Appointment duration must be positive (min 15 minutes)
   - Duration cannot exceed doctor's working hours
   - Consider breaks when calculating available time

3. **Date/Time Validation**
   - Appointment must be in the future
   - Appointment cannot be more than 90 days in advance (configurable)
   - Time slot format must be valid (HH:MM)
   - Date must be valid and realistic

4. **Conflict Detection**
   - Prevent double-booking of same doctor
   - Check for overlapping appointments
   - Validate across multiple time zones if applicable

### Doctor Availability Rules

1. **License Validation**
   - License number must be unique across system
   - License format depends on country/region
   - License must be valid and not expired (if applicable)

2. **Specialization Requirements**
   - Doctor must have at least one specialization
   - Specialization must be from predefined list
   - Doctor can have multiple specializations

3. **Availability Configuration**
   - Doctor must set availability before accepting appointments
   - At least one day per week must have availability
   - Working hours must be within 24-hour format
   - Break times must be within working hours

### Insurance Field Rules

1. **Insurance Provider Validation**
   - Insurance provider name must be provided if insurance is claimed
   - Must match list of accepted providers (if applicable)
   - Provider validation optional but recommended

2. **Insurance Policy Number Validation**
   - Policy number format validation (alphanumeric)
   - Non-empty if insurance is claimed
   - Can be verified against provider systems

3. **Insurance Eligibility**
   - Verification of coverage status
   - Pre-authorization checks
   - Coverage amount limits

### Emergency Contact Validation

1. **Contact Information Requirements**
   - Emergency contact name required (non-empty)
   - Emergency contact phone required (valid format)
   - Phone number must be verifiable format

2. **Contact Relationship**
   - Relationship to patient tracked
   - At least one emergency contact per patient
   - Contact person must be reachable

3. **Validation Rules**
   - Phone number format validation (E.164 or local format)
   - Name cannot be same as patient (recommended)
   - Contact must be updated regularly

### Status Transition Rules

1. **Valid Transitions**
   ```
   PENDING → CONFIRMED (doctor confirmation)
   PENDING → CANCELLED (patient or doctor cancellation)
   CONFIRMED → COMPLETED (after appointment time)
   CONFIRMED → CANCELLED (cancellation)
   CONFIRMED → RESCHEDULED (rescheduling)
   COMPLETED → MISSED (if no-show recorded)
   RESCHEDULED → CONFIRMED (new appointment)
   ```

2. **Cancellation Rules**
   - Can only cancel PENDING or CONFIRMED appointments
   - Cancellation reason should be documented
   - Notifications sent on cancellation
   - Refund logic (if applicable)

3. **Completion Rules**
   - Appointment automatically marked COMPLETED after scheduled time
   - Doctor can manually confirm completion with notes
   - Follow-up reminders sent after completion

### Email Notification Rules

1. **Delivery Requirements**
   - Use valid email addresses (RFC 5322 compliant)
   - Resend API for reliable delivery
   - Implement retry logic for failed sends
   - Log all email sends for audit

2. **Rate Limiting**
   - Maximum 5 reminder emails per hour per appointment
   - Prevent duplicate email sends
   - Respect unsubscribe preferences

3. **Content Requirements**
   - Include appointment details (date, time, doctor)
   - Clear call-to-action buttons
   - Unsubscribe link required
   - Plain text alternative required

### Medical Data Privacy Rules

1. **HIPAA Compliance (if applicable)**
   - Encrypt sensitive medical data at rest
   - Use HTTPS for all data transmission
   - Implement access controls
   - Audit all data access

2. **Data Access Control**
   - Patients can only view own medical records
   - Doctors can only view assigned patients
   - Admins have controlled access
   - Separate roles for data access

3. **Data Retention**
   - Define retention periods
   - Implement secure deletion
   - Archive historical records
   - Log deletion activities

## 🚀 Deployment

### Prerequisites for Deployment

- PostgreSQL database instance (cloud-hosted)
- Resend account with API key
- Vercel account (recommended) or similar hosting
- Custom domain (optional)
- Environment variables configured

### Vercel Deployment (Recommended)

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select the health-care repository
   - Click "Import"

3. **Configure environment variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all variables from `.env` file
   - For production, use actual service keys:
     - Resend production API key
     - Production database URL
     - Production application URLs

4. **Deploy**
   ```bash
   git push origin main
   # Vercel automatically builds and deploys
   ```

5. **Configure custom domain** (optional)
   - In Vercel project settings, go to "Domains"
   - Add your custom domain
   - Configure DNS records as instructed

### Self-Hosted Deployment (Docker/Linux)

1. **Build application**
   ```bash
   npm run build
   ```

2. **Configure environment**
   - Set up `.env` with production values
   - Ensure PostgreSQL is accessible
   - Configure Resend API key

3. **Start application**
   ```bash
   npm start
   ```

4. **Setup reverse proxy** (Nginx)
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

5. **Enable HTTPS** (Let's Encrypt)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Database Migration on Deployment

```bash
# Before deploying, ensure migrations are applied
npx prisma migrate deploy

# If needed, create backups
pg_dump postgresql://user:pass@host/db > backup.sql
```

### Performance Optimization

1. **Enable Turbopack**
   - Configured by default in `next.config.ts`
   - Provides fast build times

2. **Image Optimization**
   - Next.js automatic image optimization
   - Configure allowed domains in `next.config.ts`

3. **Caching Strategy**
   - TanStack Query caching on client
   - HTTP caching headers on API routes
   - Database query optimization

4. **Monitoring & Logging**
   - Set up error tracking (e.g., Sentry)
   - Enable database query logging
   - Monitor API response times

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code conventions (see below)
   - Add tests if applicable
   - Update documentation

3. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```

4. **Push to remote**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Describe changes clearly
   - Link related issues
   - Request reviewers

### Code Style Guidelines

- Follow existing code patterns and conventions
- Use TypeScript for type safety
- Use Tailwind classes for styling
- Name files and folders in kebab-case
- Name components in PascalCase
- Name hooks with 'use' prefix

### Commit Message Format

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation update
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build, dependencies, etc.

Example:
```bash
git commit -m "feat: add appointment rescheduling flow"
```

## 📖 Code Conventions

### Component Structure

```typescript
// Imports
import { useState, useCallback } from 'react';
import type { FC } from 'react';

// Type definitions
interface ComponentProps {
  title: string;
  onAction?: () => void;
}

// Component
const MyComponent: FC<ComponentProps> = ({ title, onAction }) => {
  const [state, setState] = useState('');

  const handleAction = useCallback(() => {
    onAction?.();
  }, [onAction]);

  return (
    <div className="flex items-center justify-center gap-4">
      <h1>{title}</h1>
      <button onClick={handleAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

### Hook Conventions

```typescript
// hooks/useAppointments.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export const useAppointments = () => {
  const query = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await fetch('/api/appointments');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      query.refetch();
    },
  });

  return { ...query, cancelAppointment: mutation.mutate };
};
```

### API Route Conventions

```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { formatApiResponse } from '@/lib/api-response';

export const GET = async (request: NextRequest) => {
  try {
    // Authenticate
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        formatApiResponse(false, 'Unauthorized', null, 401),
        { status: 401 }
      );
    }

    // Fetch data
    const data = await db.appointment.findMany({
      where: { patientId: session.user.id },
    });

    return NextResponse.json(
      formatApiResponse(true, 'Success', data),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      formatApiResponse(false, 'Internal server error', null, 500),
      { status: 500 }
    );
  }
};
```

### Form Conventions

```typescript
// Using React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema } from '@/lib/validations';

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: '',
      time: '',
    },
  });

  const onSubmit = async (data) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

### Database Query Conventions

```typescript
// Using Prisma ORM
const appointment = await db.appointment.findUnique({
  where: { id: appointmentId },
  include: {
    patient: true,
    doctor: {
      include: { availability: true },
    },
  },
});

// Batch operations
const appointments = await db.appointment.findMany({
  where: {
    status: 'PENDING',
    appointmentDate: {
      gte: new Date(),
    },
  },
  orderBy: { appointmentDate: 'asc' },
  take: 10,
});
```

### Error Handling Conventions

```typescript
// Use try-catch in API routes
try {
  // Business logic
} catch (error) {
  if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma errors specifically
    return NextResponse.json(
      formatApiResponse(false, 'Database error', null),
      { status: 400 }
    );
  }
  
  // Generic error
  return NextResponse.json(
    formatApiResponse(false, 'Internal server error', null),
    { status: 500 }
  );
}
```

### Styling Conventions

Always use Tailwind classes instead of CSS:

```typescript
// ✅ Good
<div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
    Title
  </h2>
</div>

// ❌ Avoid
<div style={{ display: 'flex', gap: '1rem' }}>
  <h2>Title</h2>
</div>
```

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: `Can't reach database server` error

**Solutions**:
1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. Check database credentials
4. Ensure database exists (create if needed)
5. Test connection with `psql` command

```bash
# Test PostgreSQL connection
psql "postgresql://user:password@localhost:5432/healthcare_db"
```

### Email Not Sending

**Problem**: Emails not being delivered, or no console logs

**Solutions**:
1. Verify `RESEND_API_KEY` is correct in `.env`
2. Check Resend dashboard for delivery status
3. Verify `EMAIL_FROM` is a verified domain in Resend
4. Check email is in Resend allowed recipients (if sandboxed)
5. Review API rate limits

```bash
# Test email setup
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Healthcare <noreply@yourdomain.com>","to":"test@example.com","subject":"Test","html":"<h1>Test</h1>"}'
```

### Authentication Issues

**Problem**: Users cannot login, sessions not persisting

**Solutions**:
1. Clear browser cookies and localStorage
2. Verify `BETTER_AUTH_URL` matches server URL
3. Verify `NEXT_PUBLIC_API_URL` is correct
4. Check middleware configuration
5. Verify session database table exists

```bash
# Check Better Auth setup
npx prisma studio  # Verify session and account tables
```

### Build Errors

**Problem**: Build fails with TypeScript or Next.js errors

**Solutions**:
1. Reinstall dependencies: `rm -rf node_modules && npm install`
2. Clear Next.js cache: `rm -rf .next`
3. Type check: `npx tsc --noEmit`
4. Check for circular imports
5. Verify all imports are correct

```bash
# Clean rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Performance Issues

**Problem**: Slow page loads, API response times

**Solutions**:
1. Enable Turbopack (already configured)
2. Implement pagination for large lists
3. Optimize database queries with `include`/`select`
4. Enable API route caching
5. Monitor with browser DevTools

```bash
# Analyze build size
npm run build -- --analyze
```

### Middleware/RBAC Issues

**Problem**: Users redirected to wrong dashboard, access control not working

**Solutions**:
1. Verify middleware configuration in `middleware.ts`
2. Check user roles in database
3. Clear cookies and re-login
4. Verify session has user role field
5. Check NEXT_PUBLIC_* variables are set

## 📝 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [Better Auth Documentation](https://www.better-auth.com)
- [Resend Documentation](https://resend.com/docs)

## 📜 License

This project is private and proprietary.

## 👥 Support

For questions or issues, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Next.js 15, React 19, TypeScript, TailwindCSS, and modern web technologies.**

Last updated: December 2024

# Healthcare Appointment Management System

A comprehensive, modern healthcare appointment booking and management system built with Next.js 15. Role-based dashboards for Patients, Doctors, and Administrators streamline scheduling, patient management, and healthcare operations with a responsive, accessible UI.

## 🎯 Overview

This system provides end-to-end appointment scheduling, patient record access, doctor availability management, and administrative oversight. Three roles get tailored dashboards and permissions.

### Key Highlights

- **Multi-Role System**: Separate dashboards for Patients, Doctors, and Administrators
- **Secure Authentication**: Email-based OTP verification with Better Auth
- **Real-time Notifications**: Email notifications for appointments, reminders, and updates
- **Responsive Design**: Modern UI built with TailwindCSS and Radix UI components
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Database-Driven**: PostgreSQL with Prisma ORM for robust data management

## ⏱️ Quickstart

1. Copy `.env.example` (or create `.env`) and fill the required variables.
2. Install dependencies: `npm install` (or `yarn`/`pnpm`).
3. Apply the database schema: `npx prisma migrate dev --name init`.
4. Start the dev server: `npm run dev` and visit <http://localhost:3000>.

## ✨ Features

### 👤 Patient

- Book, reschedule, or cancel appointments
- Search and filter doctors by specialization
- View prescriptions and medical records
- Receive email confirmations and reminders
- Manage profile and preferences

### 👨‍⚕️ Doctor

- Manage availability and working hours
- View daily and upcoming schedules
- Confirm, reschedule, or cancel appointments
- Access and update patient records
- Create and manage prescriptions
- View appointment analytics

### 👨‍💼 Administrator

- System-wide dashboard and analytics
- Manage users, doctors, roles, and availability
- Oversee all appointments and missed visits
- Configure notifications and system settings
- View audit and activity logs

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** (App Router) with **React 19**
- **TypeScript** for type safety
- **TailwindCSS 4**, **Radix UI**, **shadcn/ui**
- **TanStack React Query**, **React Hook Form**, **Zod**
- **Motion** animations, **Recharts** for charts

### Backend

- **Next.js API Routes**
- **Better Auth** for authentication/session management
- **Prisma** ORM with **PostgreSQL**
- **Resend** for transactional email

### Development Tools

- **ESLint**, **TypeScript**
- **Turbopack** for fast dev builds

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- PostgreSQL instance (local or hosted)
- Git

## 🚀 Getting Started (Detailed)

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

3. **Configure environment**

   Create a `.env` file in the project root with values like:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/healthcare_db?schema=public"

   # Better Auth / App URLs
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"

   # Email (Resend)
   RESEND_API_KEY="your_resend_api_key"
   EMAIL_FROM="Healthcare System <noreply@yourdomain.com>"

   # Cron (optional, for automated reminder calls)
   CRON_SECRET="your_cron_shared_secret"
   ```

   | Variable              | Required    | Purpose                                                        |
   | --------------------- | ----------- | -------------------------------------------------------------- |
   | `DATABASE_URL`        | Yes         | PostgreSQL connection string with schema                       |
   | `BETTER_AUTH_URL`     | Yes         | Base URL used by Better Auth on the server                     |
   | `NEXT_PUBLIC_API_URL` | Yes         | Base URL exposed to the client (often same as BETTER_AUTH_URL) |
   | `NEXT_PUBLIC_APP_URL` | Yes         | Public app URL for links and redirects                         |
   | `RESEND_API_KEY`      | Recommended | Needed to send real emails via Resend                          |
   | `EMAIL_FROM`          | Recommended | Friendly from address for outgoing email                       |
   | `CRON_SECRET`         | Optional    | Shared secret for scheduled reminder calls                     |

4. **Apply database schema**

   ```bash
   npx prisma migrate dev --name init
   # If the schema changes later, rerun with a new descriptive name
   ```

   > `npm install` runs `prisma generate --no-engine` via `postinstall` to keep Prisma Client up to date.

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open <http://localhost:3000> in your browser.

## 📁 Project Structure

```text
health-care/
├── app/                        # App Router pages and API routes
│   ├── api/                    # admin, appointments, auth, doctors, medical-history, notifications, reminders, user
│   ├── dashboard/              # Dashboards for admin, doctor, patient
│   ├── forgot-password/        # Password reset flow
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   └── page.tsx                # Landing page
├── components/                 # UI and feature components (auth, dashboard, appointments, doctors, emails, landing, medical-history, provider, ui)
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities (auth, email, prisma, reminders, notifications, validations)
├── prisma/                     # Prisma schema and migrations
├── public/                     # Static assets
├── middleware.ts               # Next.js middleware
├── prisma.config.ts            # Prisma config
└── package.json                # Dependencies and scripts
```

## 🔐 Authentication

- Email/password plus email OTP via Better Auth
- Email verification for activation
- 7-day sessions with role-based routing (PATIENT, DOCTOR, ADMIN)

## 📊 Database Schema (summary)

- **User**, **Doctor**, **DoctorAvailability**
- **Appointment** with status tracking
- **Notification**
- **Session**, **Account**

## 🎨 UI Components

- Forms, inputs, buttons, and cards
- Data tables with sorting/filtering
- Charts and analytics components
- Modals, dialogs, dropdowns
- Sidebar navigation and theme switcher

## 📧 Email Notifications

- Appointment confirmations, reminders, cancellations, reschedules
- OTP verification for sign-up, sign-in, and password reset
- Powered by Resend (`RESEND_API_KEY`, `EMAIL_FROM`)

## ⏰ Automated Reminders

- Endpoint: `POST /api/reminders/send` triggers reminder emails for upcoming appointments.
- Cron access: set `CRON_SECRET` and call with header `x-cron-api-key: <CRON_SECRET>` (e.g., from Vercel Cron).
- Manual access: without the header, only authenticated admins can trigger reminders.

## 🧪 Available Scripts

```bash
# Development
npm run dev

# Production
npm run build
npm run start

# Quality
npm run lint

# Database
npx prisma migrate dev --name change
npx prisma studio
```

## 🎯 Demo Instructions

1. Start the application: `npm run dev`.
2. Open <http://localhost:3000> to view the landing page.
3. Sign up and verify email via OTP (check email or console logs if Resend is not configured).
4. Explore role flows:
   - **Patient**: book/reschedule/cancel, view history and prescriptions.
   - **Doctor**: set availability, manage appointments and records.
   - **Admin**: manage users, doctors, appointments, reports, and settings.

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running.
- Verify `DATABASE_URL` in `.env`.
- Run `npx prisma generate` after schema changes.

### Email Not Sending

- Verify `RESEND_API_KEY` in `.env`.
- Check Resend dashboard for logs.
- The system logs warnings if email is not configured.

### Authentication Issues

- Clear browser cookies and localStorage.
- Ensure `BETTER_AUTH_URL`/`NEXT_PUBLIC_API_URL` match the app URL.
- Check middleware configuration.

### Build Errors

- Run `npm install` to ensure dependencies are present.
- Delete `.next` and rebuild: `rm -rf .next && npm run build`.
- Check TypeScript: `npx tsc --noEmit`.

## 📝 License

This project is private and proprietary.

## 👥 Contributors

- Development Team

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

#  Result Hub — School Result Portal

This project is a school result management system built for managing student academic records in a simple, secure, and role-based web application. It allows administrators, teachers, and students to work within separate portals based on their responsibilities.

The app is designed to help schools track classes, students, subjects, teachers, and published academic results without relying on a heavy enterprise system. It is built as a lightweight React + Supabase application that can be run locally or deployed to a hosting platform such as Netlify.

## What the project is about

The platform supports the full basic workflow of a school results system:

- Administrators manage school data such as students, classes, subjects, and teachers.
- Teachers are assigned to classes and can enter or update student scores.
- Students can log in using their examination number and PIN to view their results.
- Results are organized by academic session and term, making it easy to view performance over time.
- Access is restricted using user roles and Supabase database security rules so each user sees only the data they are allowed to access.

In short, this project is a result portal that digitizes school result processing and makes it easier for school staff and learners to access academic information in a secure way.

## Main features

- Role-based access for admin, teacher, and student users
- Admin dashboard with overview statistics
- Student management and class assignment
- Subject and teacher administration
- Result entry and result viewing for teachers
- Student result dashboard with filtering by session and term
- Secure login flow for students using examination number and PIN
- Supabase-powered database, authentication, and row-level security
- Responsive UI suitable for desktop and mobile use

## Tech stack

- React 18
- Vite
- React Router
- Supabase
- PostgreSQL
- JavaScript

## Project structure

```bash
src/
  components/        # Shared UI components
  context/           # Auth context
  pages/             # Login, dashboards, management pages
  services/          # API/service logic for Supabase
  lib/               # Supabase client configuration
supabase/
  schema.sql         # Database tables and RLS rules
  student_auth_rpc.sql
  student_data_rpc.sql
  link_staff_roles.sql
  seed_dummy_staff.sql
  seed_dummy_student.sql
```

## User roles

### Admin

The admin can manage:

- students
- classes
- subjects
- teachers
- result records
- school-wide summaries

### Teacher

Teachers can:

- view assigned classes
- view class students
- enter or update scores for results
- review results for assigned classes

### Student

Students can:

- log in with their exam number and PIN
- view their personal academic record
- filter results by session and term

## Database and security

This app uses Supabase for both the database and authentication layer. The database schema includes tables for students, classes, teachers, subject records, and result entries. The system also uses Row Level Security (RLS) to ensure users only access the records they are authorized to view.

Student authentication is handled through database functions and secure checks rather than exposing a simple unrestricted public login flow. This keeps the application focused on a school-records workflow while maintaining data protection.

## Local setup

1. Clone the repository

```bash
git clone <repository-url>
cd school-result-portal
```

2. Install dependencies

```bash
npm install
```

3. Create an environment file

Create a `.env` file in the project root and add your Supabase values:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Set up the Supabase database

Run the SQL files in the `/supabase` folder in the following order:

- `schema.sql`
- `link_staff_roles.sql`
- `student_auth_rpc.sql`
- `student_data_rpc.sql`
- optional seed files for sample data

5. Start the app

```bash
npm run dev
```

The app usually runs at:

```bash
http://localhost:5173
```

## Build for production

```bash
npm run build
```

This generates a production build in the `dist` folder.

## Notes

This project is a practical school management MVP intended for academic or portfolio use. It focuses on the core workflow of a secondary school result system and demonstrates how a React app can be connected to a secure backend for managing student academic data.

## License

This project is for educational use and is not currently configured with a formal commercial license.

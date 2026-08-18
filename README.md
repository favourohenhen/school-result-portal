# School Result Management Portal

A secure, mobile-first web application designed to help schools efficiently manage and distribute student results. Built as a Minimum Viable Product (MVP), this portal focuses on speed, security, and a seamless user experience.

## 🚀 Features

- **Role-Based Access Control:** Dedicated portals for Admins, Teachers, and Students.
- **Admin Dashboard:** Centralized management for classes, subjects, teachers, and students.
- **Teacher Dashboard:** Secure portal for teachers to input and manage results for their assigned classes.
- **Student Portal:** A simplified, read-only interface where students can check their results using a unique Examination Number and PIN.
- **Database-Level Security:** Powered by Supabase Row Level Security (RLS) to ensure users can only access data they are authorized to see.
- **No-Framework CSS:** Built with clean, maintainable Vanilla CSS utilizing modern variables and a custom design system.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6
- **Styling:** Custom Vanilla CSS (Poppins font, CSS Variables)
- **Backend & Database:** Supabase (PostgreSQL, Auth, RPC Functions)

## 📋 Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd school-result-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   - Copy the `.env.example` file and rename it to `.env`.
   - Fill in your Supabase project URL and Anon Key. *(Note: The `.env` file is safely ignored by git and will not be pushed).*

4. **Database Setup**
   Run the SQL scripts located in the `/supabase` folder inside your Supabase SQL Editor in this order:
   - `schema.sql`: Creates all tables, constraints, and RLS policies.
   - `student_auth_rpc.sql`: Creates the secure database function for student login.

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

## 🔒 Security Note
This project enforces strict security at the database level. Students log in via a custom Database RPC function rather than traditional JWTs to keep the MVP lightweight while remaining completely secure for production use. Admin and Teacher accounts use native Supabase Authentication.

# Success Sprout — Deployment Guide

This repository contains a simple Express backend and a single-page frontend (`Index.html`). Below are steps to prepare and deploy to Vercel (frontend) and use Supabase as the cloud database for production.

Important: Never commit real secrets into repo. Use environment variables (Vercel Dashboard or GitHub Secrets).

Requirements
- Node 18+ local for testing
- A Vercel account (https://vercel.com)
- A Supabase project (https://supabase.com)

Recommended architecture
- Host the static frontend on Vercel (or the same project) and host the Node backend separately (e.g., Railway, Render, Heroku, or Vercel Serverless Functions).
- Use Supabase for the database in this project; it's the recommended option for quick testing and production deployment.

Quick local run
1. Copy `.env.example` -> `.env` and fill values (or set env vars in terminal)
2. Install deps
   ```bash
   npm install
   ```
3. Start locally
   ```bash
   npm start
   ```
4. Open http://localhost:3000/ (the server serves `Index.html`)

Deploying to production (recommended)
1. Create a Supabase project at https://app.supabase.com and copy the Project URL and Service Role Key.
2. Create a `users` table in Supabase with columns: `id` (text, primary key), `email` (text, unique), `name` (text), `password` (text), `paymentStatus` (text), `paymentDetails` (jsonb), `created_at` (timestamp with time zone, default now()).
3. Host backend: choose a host (Railway / Render recommended). Set environment variables in that host: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`.
4. If you host the backend separately, keep the frontend on Vercel and set the API_BASE_URL in your frontend code (or update fetch endpoints to the external host).

Vercel notes
- If you want to use Vercel serverless functions for the backend, you must convert `server.js` routes into API lambdas (not done here). For simplicity, it's easier to host the Node server on a full host (Railway/Render) and host frontend on Vercel.
- Alternatively, create a `vercel.json` rewrite so requests to `/api/*` are proxied to the external backend host.

Security
- Use HTTPS in production.
- Rotate PayPal secrets and store in env vars.
- Use real JWT secret and strong admin password.

If you want, I can:
- Convert this backend to serverless functions for Vercel.
- Create a ready `vercel.json` and frontend configuration to call a hosted backend.
- Walk you through creating MongoDB Atlas and wiring credentials.

Supabase (optional)
--------------------
If you'd rather use Supabase instead of MongoDB, the project includes a small server-side integration. To enable Supabase:

1. Create a Supabase project at https://app.supabase.com and note the Project URL and the Service Role Key (keep it secret).
2. Create a `users` table in Supabase with columns: id (text, primary key), email (text), name (text), created_at (timestamp with time zone, default now()).
3. Add these env vars to your host or local `.env`:

   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

4. The server exposes minimal routes at `/api/supabase/*` for simple examples (create-user, user lookup). These are not full-featured and are intended as a starting point.

Note: Supabase can replace MongoDB for user storage, but if you plan to use both, keep a clear migration plan and unique IDs.
# Success Sprout

AI-Powered Education & Career Platform

## Features
- PayPal payment gateway integration (sandbox/live ready)
- User registration and login
- Recruiter dashboard and job posting
- Admin panel for managing listings
- Responsive, modern UI

## Getting Started

### Prerequisites
- Node.js (for backend)
- A Supabase project (for backend storage)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/success-sprout.git
   ```
2. Install backend dependencies:
   ```
   npm install
   ```
1. Create a `.env` file in the root directory with your Supabase credentials and JWT secret (see `.env.example`):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```
4. Start the backend server:
   ```
   npm start
   ```
5. Open `Index.html` in your browser for the frontend.

### PayPal Integration
- To use the sandbox, set `PAYPAL_MODE=sandbox` and fill `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` in your `.env` (or hosting env). The frontend's PayPal SDK script tag must use the sandbox client-id for client-side flows.
- For live payments, replace the Client ID and set `PAYPAL_MODE=live`.

### Folder Structure
- `public/` - Static files (resumes, images)
- `pages/` - User-facing pages (courses, jobs, etc.)
- `admin/` - Admin panel
- `recruiter/` - Recruiter dashboard
- `styles/` - CSS files
- `scripts/` - JS files
- `server.js` - Node.js backend

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

# Success Sprout — Deployment Guide

This repository contains a simple Express backend and a single-page frontend (`Index.html`). Below are steps to prepare and deploy to Vercel (frontend) and use MongoDB Atlas as a cloud database for production.

Important: Never commit real secrets into repo. Use environment variables (Vercel Dashboard or GitHub Secrets).

Requirements
- Node 18+ local for testing
- A Vercel account (https://vercel.com)
- A MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)

Recommended architecture
- Host the static frontend on Vercel (or the same project) and host the Node backend separately (e.g., Railway, Render, Heroku, or Vercel Serverless Functions).
- Use MongoDB Atlas for the database and set `MONGODB_URI` in your deployment environment.

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
1. Create MongoDB Atlas cluster, create a database user and whitelist your app IPs or allow access from anywhere (0.0.0.0/0 for dev).
2. Copy connection string into the production `MONGODB_URI` env var.
3. Host backend: choose a host (Railway / Render / Heroku recommended). Set environment variables in that host: `MONGODB_URI`, `JWT_SECRET`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`.
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
- MongoDB (for backend)

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/success-sprout.git
   ```
2. Install backend dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```
4. Start the backend server:
   ```
   npm start
   ```
5. Open `Index.html` in your browser for the frontend.

### PayPal Integration
- To use the sandbox, keep the sandbox Client ID in the PayPal SDK script tag in `Index.html`.
- For live payments, replace the Client ID with your live PayPal Client ID from your PayPal business account.

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

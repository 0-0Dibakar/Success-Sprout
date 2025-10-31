# Quick Start Guide - Success Sprout

Get up and running in 5 minutes!

## Step 1: Install Dependencies (1 minute)
```bash
npm install
```

## Step 2: Create Your .env File (2 minutes)

Create a file named `.env` in the root directory with this content:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=dev-secret-123
PORT=3000
```

## Step 3: Get Supabase Credentials (2 minutes)

1. Go to https://app.supabase.com and sign in
2. Click "New Project"
3. Fill in details and wait for it to create
4. Go to **Settings** → **API**
5. Copy your **Project URL** and **service_role key**
6. Paste them into your `.env` file

## Step 4: Create the Database Table

In Supabase, go to **SQL Editor** and run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "userType" TEXT DEFAULT 'user',
  "paymentStatus" TEXT DEFAULT 'pending',
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Step 5: Start the Server

```bash
npm start
```

## Step 6: Open the App

Go to: **http://localhost:3000**

## ✅ Done!

You should now see the Success Sprout homepage.

---

### Having Trouble?

Read the detailed guide: **[SETUP.md](SETUP.md)**

### Common Issues

**"Supabase not configured"**
→ Check that your `.env` file has SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY filled in

**"Port 3000 already in use"**
→ Change PORT=3000 to PORT=3001 in your `.env` file

**"Cannot connect to database"**
→ Make sure you created the users table in Supabase

---

### Next Steps

- Read [README.md](README.md) for more information
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Set up PayPal payments (optional)


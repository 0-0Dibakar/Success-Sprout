# Setup Guide for Success Sprout

This guide will help you get the Success Sprout project running on your local machine.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **A Supabase account** (free tier is sufficient) - [Sign up](https://supabase.com)

## Step-by-Step Setup

### 1. Clone/Download the Project

If you haven't already, get the project files in a folder on your computer.

### 2. Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Set Up Supabase Database

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details (name, database password)
4. Wait for the project to be created (takes a few minutes)

#### Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **service_role key** (the secret one under Service Role keys, NOT the anon key)

#### Create the Users Table

1. In your Supabase project, go to **SQL Editor** → **New Query**
2. Paste and run this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "userType" TEXT DEFAULT 'user',
  "paymentStatus" TEXT DEFAULT 'pending',
  "paymentDetails" JSONB,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (for server-side operations)
CREATE POLICY IF NOT EXISTS "Service role can do everything" ON users
  FOR ALL USING (true);
```

3. Click "Run" to execute the SQL

### 4. Create Environment File

Create a file named `.env` in the root folder of the project with this content:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret for authentication (change this to a random string)
JWT_SECRET=your-jwt-secret-key-change-in-production

# PayPal Configuration (optional - only needed for payments)
# Leave empty for now if you don't have PayPal set up
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_MODE=sandbox

# Server Configuration
PORT=3000
BIND_HOST=0.0.0.0

# Environment
NODE_ENV=development
```

**Important:** Replace `your_project_url_here` and `your_service_role_key_here` with the values you copied from Supabase.

### 5. Start the Server

Run this command in your terminal:

```bash
npm start
```

You should see output like:
```
Server listening - address info: { address: '0.0.0.0', family: 'IPv4', port: 3000 }
Server running on http://0.0.0.0:3000
```

### 6. Open the Application

Open your web browser and go to:

```
http://localhost:3000
```

You should see the Success Sprout homepage!

## Testing the Application

### Test Registration

1. On the homepage, fill out the registration form
2. Submit it - you should see a success message
3. Check your Supabase database to see the new user:
   - Go to Supabase → **Table Editor** → **users**
   - You should see your registered user

### Test Login

1. Go to the login page (there should be a login link on the homepage)
2. Enter the credentials you registered with
3. You should be redirected to a dashboard or see a success message

## Troubleshooting

### "Server is not running"

- Make sure you ran `npm start` in the terminal
- Check that port 3000 is not already in use by another application

### "Supabase not configured"

- Verify your `.env` file exists and has the correct values
- Make sure there are no extra spaces or quotes in your `.env` file
- Restart the server after changing `.env`

### "User already exists"

- This means someone (or you) already registered with that email
- Try a different email address

### Database errors in Supabase

- Make sure you ran the SQL script to create the users table
- Check that you're using the **service_role** key, not the anon key
- Verify your Project URL is correct

### Port already in use

If you get an error that port 3000 is in use:

1. Find what's using it (on Windows: `netstat -ano | findstr :3000`)
2. Kill that process, OR
3. Change the `PORT` value in your `.env` file to a different number (e.g., 3001)

## Next Steps

- **PayPal Integration**: Get credentials from [PayPal Developer](https://developer.paypal.com) for payment features
- **Customization**: Edit `Index.html` to customize the appearance
- **Add Features**: Look at `server.js` to see available API endpoints

## Development vs Production

This setup is for local development. For production deployment:

1. Use a stronger JWT_SECRET (generate with: `openssl rand -base64 32`)
2. Set up proper Supabase policies and security
3. Use environment variables on your hosting platform
4. Enable HTTPS
5. Consider using a process manager like PM2

## Getting Help

- Check the [README.md](README.md) for more information
- Review the code comments in `server.js` and `supabaseClient.js`
- Check Supabase logs in the Supabase dashboard if database errors occur

## Notes

- This project uses **Supabase** for the database (not MongoDB, despite some old references in the code)
- The `.env` file should **never** be committed to version control
- Service role key is secret - keep it safe and never share it publicly


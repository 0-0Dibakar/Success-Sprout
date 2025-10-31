# Success Sprout

AI-Powered Education & Career Platform

## Features
- PayPal payment gateway integration (sandbox/live ready)
- User registration and login
- Recruiter dashboard and job posting
- Admin panel for managing listings
- Responsive, modern UI

## Quick Start

**👋 NEW TO THIS PROJECT?** Read the detailed setup guide first: **[SETUP.md](SETUP.md)**

### Prerequisites
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **A Supabase account** (free tier) - [Sign up](https://supabase.com)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/success-sprout.git
   cd success-sprout
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the root directory. See `ENV_SETUP.txt` for the template.
   
   **You MUST:**
   - Create a free Supabase account at [https://app.supabase.com](https://app.supabase.com)
   - Create a new Supabase project
   - Get your Project URL and Service Role Key
   - Create the `users` table (see SETUP.md for SQL)
   
   See **[SETUP.md](SETUP.md)** for detailed step-by-step instructions.

4. **Start the backend server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Project Structure

```
success-sprout/
├── Index.html          # Main homepage
├── server.js           # Node.js backend server
├── supabaseClient.js   # Supabase database client
├── routes/             # API route handlers
├── public/             # Static files (images, CSS, JS)
│   ├── login.html
│   ├── dashboard.html
│   └── js/
├── pages/              # Content pages
│   ├── courses.html
│   ├── scholarships.html
│   ├── recruiter.html
│   └── freelancing.html
├── admin/              # Admin panel
├── recruiter/          # Recruiter dashboard
├── styles/             # CSS files
├── scripts/            # JavaScript files
└── client/             # React client (optional)
```

## Configuration

### Environment Variables

See **ENV_SETUP.txt** for the complete `.env` template.

Required:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Secret key for JWT tokens

Optional:
- `PAYPAL_CLIENT_ID` - For payment functionality
- `PAYPAL_CLIENT_SECRET` - For payment functionality
- `PAYPAL_MODE` - Set to `sandbox` or `live`

### PayPal Integration

1. Create a PayPal Business account at [PayPal Developer](https://developer.paypal.com)
2. Get your Client ID and Secret
3. Add them to your `.env` file
4. Update the PayPal SDK script in `Index.html` with your client ID

## API Endpoints

### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/supabase/health` - Supabase connection check
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Protected Endpoints
- `GET /api/courses` - Get courses
- `POST /api/courses/:id/enroll` - Enroll in a course
- `GET /api/scholarships` - Get scholarships
- `POST /api/scholarships/:id/apply` - Apply for scholarship

### Admin Endpoints
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/:section` - Get section data

### Recruiter Endpoints
- `POST /api/recruiter/register` - Recruiter registration
- `POST /api/recruiter/login` - Recruiter login
- `GET /api/recruiter/jobs` - Get jobs
- `POST /api/recruiter/jobs` - Post a job

## Troubleshooting

### "Supabase not configured"
- Make sure your `.env` file exists in the root directory
- Verify your Supabase credentials are correct
- Restart the server after changing `.env`

### "Server is not running"
- Check that port 3000 is available
- Look for errors in the terminal
- Make sure you ran `npm install`

### Database errors
- Verify you created the `users` table in Supabase
- Check that you're using the **service_role** key, not the anon key
- See SETUP.md for the correct SQL schema

## Development

### Using npm scripts:
```bash
npm start    # Start the server
npm run dev  # Start with nodemon (auto-restart)
```

### Testing Locally
1. Make sure the server is running (`npm start`)
2. Open [http://localhost:3000](http://localhost:3000)
3. Try registering a new user
4. Check your Supabase dashboard to see the user was created

## Deployment

For production deployment, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Recommended Hosting:
- **Backend:** Railway, Render, or Heroku
- **Frontend:** Vercel or Netlify
- **Database:** Supabase (already configured)

### Security Checklist:
- ✅ Use HTTPS in production
- ✅ Set a strong `JWT_SECRET`
- ✅ Never commit `.env` to version control
- ✅ Use production PayPal credentials
- ✅ Configure Supabase Row Level Security

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

## Support

- **Setup Issues:** See [SETUP.md](SETUP.md)
- **Deployment:** See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Environment:** See [ENV_SETUP.txt](ENV_SETUP.txt)

## Recent Changes

- ✅ Fixed hardcoded API URLs throughout the application
- ✅ Added comprehensive setup documentation
- ✅ Added missing API endpoint stubs
- ✅ Improved error handling
- ✅ Created ENV_SETUP.txt for easy configuration

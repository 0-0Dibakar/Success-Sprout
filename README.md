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

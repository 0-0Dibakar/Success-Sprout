require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();

// Middleware
// Allow CORS during local development (adjust in production)
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like curl, Postman, or file://)
        if (!origin) return callback(null, true);
        // Allow localhost origins
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }
        // Reject other origins in dev - change as needed
        return callback(null, false);
    },
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
// If a React client build exists in /client/dist, serve it for unknown routes (production build)
const clientDist = require('path').join(__dirname, 'client', 'dist');
try {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
        // Let API routes fall through
        if (req.path.startsWith('/api')) return next();
        res.sendFile(require('path').join(clientDist, 'index.html'));
    });
    console.log('Configured to serve client/dist for production');
} catch (err) {
    // ignore if client isn't built yet
}

// Require Supabase client
const supabase = require('./supabaseClient');

// Mount example Supabase routes if available
try {
    const supabaseRoutes = require('./routes/supabaseRoutes');
    app.use('/api/supabase', supabaseRoutes);
    console.log('Supabase routes mounted at /api/supabase');
} catch (err) {
    console.log('Supabase routes not mounted (missing file or error):', err.message);
}

// Simple Supabase health endpoint (consistent response even if client not configured)
app.get('/api/supabase/health', (req, res) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(503).json({ ok: false, message: 'Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
    }
    // If supabase client failed to initialize, report that
    if (!supabase) return res.status(500).json({ ok: false, message: 'Supabase client failed to initialize' });
    res.json({ ok: true, url: process.env.SUPABASE_URL });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Helper: get PayPal access token
async function getPayPalAccessToken() {
    const mode = process.env.PAYPAL_MODE === 'sandbox' ? 'sandbox' : 'live';
    const base = mode === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured');

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const resp = await axios.post(`${base}/v1/oauth2/token`, 'grant_type=client_credentials', {
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });

    return { access_token: resp.data.access_token, base };
}

// Create PayPal order (server-side) and return approve URL
app.post('/api/create-paypal-order', async (req, res) => {
    try {
        const { userId, amount = '1.00', currency = 'INR' } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId required' });

        const { access_token, base } = await getPayPalAccessToken();

        const orderResp = await axios.post(`${base}/v2/checkout/orders`, {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: amount
                    },
                    custom_id: userId,
                    description: 'Success Sprout Membership'
                }
            ],
            application_context: {
                return_url: `${req.protocol}://${req.get('host')}/api/capture-paypal-order`,
                cancel_url: `${req.protocol}://${req.get('host')}/payment-cancelled`
            }
        }, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const approveLink = orderResp.data.links.find(l => l.rel === 'approve');
        res.json({ approveUrl: approveLink ? approveLink.href : null, orderID: orderResp.data.id });
    } catch (error) {
        console.error('Create PayPal order error:', error.response?.data || error.message || error);
        res.status(500).json({ message: 'Failed to create PayPal order' });
    }
});

// Capture PayPal order after user approves (PayPal redirects here)
app.get('/api/capture-paypal-order', async (req, res) => {
    try {
        const { token: orderID } = req.query; // PayPal uses 'token' param for orders
        if (!orderID) return res.status(400).send('Missing order token');

        const { access_token, base } = await getPayPalAccessToken();

        // Capture the order
        const captureResp = await axios.post(`${base}/v2/checkout/orders/${orderID}/capture`, {}, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            }
        });

        // Find the custom_id which is our userId
        const customId = captureResp.data.purchase_units?.[0]?.custom_id;

        if (customId) {
            // Update the user's payment status in Supabase
            const { error } = await supabase
                .from('users')
                .update({
                    paymentStatus: 'completed',
                    // Store payment details as JSON in a column (assumes column 'paymentDetails' exists)
                    paymentDetails: {
                        orderID,
                        amount: captureResp.data.purchase_units[0].payments.captures[0].amount.value,
                        currency: captureResp.data.purchase_units[0].payments.captures[0].amount.currency_code,
                        paymentId: captureResp.data.purchase_units[0].payments.captures[0].id,
                        paymentDate: new Date()
                    },
                    active: true
                })
                .eq('id', customId);
            if (error) {
                console.error('Supabase update error:', error.message || error);
            }
        }

        res.redirect('/payment-success.html');
    } catch (error) {
        console.error('Capture PayPal order error:', error.response?.data || error.message || error);
        res.status(500).send('Payment capture failed');
    }
});

// Registration endpoint using Supabase
app.post('/api/register', async (req, res) => {
    try {
        // Ensure Supabase client is initialized
        if (!supabase || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Registration attempted but Supabase is not configured');
            return res.status(503).json({ message: 'Supabase not configured on server. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' });
        }
        const { name, email, password, userType } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists in Supabase
        let { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .limit(1);
        if (checkError) throw checkError;
        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let { data, error } = await supabase
            .from('users')
            .insert([{ 
                name, 
                email, 
                password: hashedPassword, 
                userType: userType || 'user', 
                paymentStatus: 'pending'
            }]);
        if (error) throw error;
        const newUser = data[0];

        const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });

        res.status(201).json({ message: 'User registered successfully', userId: newUser.id, token });
    } catch (error) {
        console.error('Registration error:', error);
        // If Supabase returned an error object, try to surface it
        const message = error?.message || (error?.error && error.error) || 'Registration failed';
        res.status(500).json({ message });
    }
});

// Login endpoint using Supabase
app.post('/api/login', async (req, res) => {
    try {
        if (!supabase || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Login attempted but Supabase is not configured');
            return res.status(503).json({ message: 'Supabase not configured on server.' });
        }
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        let { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .limit(1);
        if (error) throw error;
        if (!users || users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const user = users[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token, userId: user.id, name: user.name });
    } catch (error) {
        console.error('Login error:', error);
        const message = error?.message || 'Server error during login';
        res.status(500).json({ message });
    }
});

// Payment webhook endpoint using Supabase for updating user payment status
app.post('/api/payment-webhook', async (req, res) => {
    try {
        const { userId, paymentId, orderID } = req.body;
        if (!userId) return res.status(400).json({ message: 'userId required' });

        const { error } = await supabase
            .from('users')
            .update({ paymentStatus: 'completed' })
            .eq('id', userId);
        if (error) throw error;
        res.status(200).json({ message: 'Payment status updated' });
    } catch (error) {
        console.error('Payment webhook error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Serve static files (e.g., Index.html, payment pages)
const path = require('path');
app.use(express.static('public'));
app.get(['/Index.html', '/index.html', '/'], (req, res) => {
    res.sendFile(path.join(__dirname, 'Index.html'));
});

// Global error handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

const PORT = process.env.PORT || 3000;
const BIND_HOST = process.env.BIND_HOST || '0.0.0.0';
const mainServer = app.listen(PORT, BIND_HOST, () => {
    const addr = mainServer.address();
    console.log(`Server listening - address info:`, addr);
    console.log(`Server running on http://${addr.address}:${addr.port}`);
});

// End of file
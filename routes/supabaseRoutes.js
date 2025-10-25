const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Simple health check for supabase
router.get('/health', async (req, res) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(503).json({ ok: false, message: 'Supabase not configured' });
    }
    try {
        // attempt a trivial query (list tables via RPC not available; do an auth ping)
        res.json({ ok: true, url: process.env.SUPABASE_URL });
    } catch (err) {
        console.error('Supabase health error', err);
        res.status(500).json({ ok: false });
    }
});

// Create a user row in 'users' table (example). Expects { id, email, name }
router.post('/create-user', async (req, res) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ message: 'Supabase not configured' });
    const { id, email, name } = req.body;
    if (!id || !email) return res.status(400).json({ message: 'id and email required' });
    try {
        const { data, error } = await supabase.from('users').insert([{ id, email, name }]);
        if (error) throw error;
        res.json({ inserted: data });
    } catch (err) {
        console.error('Supabase insert error', err);
        res.status(500).json({ message: err.message || 'Insert failed' });
    }
});

// Basic fetch user by email
router.get('/user', async (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'email required' });
    try {
        const { data, error } = await supabase.from('users').select('*').eq('email', email).limit(1);
        if (error) throw error;
        res.json({ user: data && data.length ? data[0] : null });
    } catch (err) {
        console.error('Supabase fetch error', err);
        res.status(500).json({ message: err.message || 'Fetch failed' });
    }
});

module.exports = router;

const { createClient } = require('@supabase/supabase-js');

// Service role key expected for server-side operations (keep secret)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Supabase not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env to enable Supabase features.');
    // Export null so server code can check and behave accordingly without crashing
    module.exports = null;
} else {
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        });
        module.exports = supabase;
    } catch (err) {
        console.warn('Failed to initialize Supabase client:', err && err.message ? err.message : err);
        module.exports = null;
    }
}

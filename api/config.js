module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://autkqbfgniopxldszdur.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseAnonKey) return res.status(503).json({ error: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.' });
  res.status(200).json({ supabaseUrl, supabaseAnonKey });
};

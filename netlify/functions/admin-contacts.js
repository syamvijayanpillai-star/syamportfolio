const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) return { statusCode: 401, headers, body: JSON.stringify({ error: 'AUTH_REQUIRED' }) };

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    if (event.httpMethod === 'GET') {
      const { data: contacts, error, count } = await supabase.from('contacts').select('*', { count: 'exact' }).eq('archived', false).order('created_at', { ascending: false }).limit(50);
      return { statusCode: 200, headers, body: JSON.stringify({ contacts, total: count }) };
    }

    if (event.httpMethod === 'PUT') {
      const { id, read } = JSON.parse(event.body);
      await supabase.from('contacts').update({ read }).eq('id', id);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'UPDATED' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }) };
  } catch (e) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'AUTH_FAILED' }) };
  }
};
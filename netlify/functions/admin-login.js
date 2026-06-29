const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  try {
    const { username, password } = JSON.parse(event.body);
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    
    const { data: admin } = await supabase.from('admins').select('*').eq('username', username).single();
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'INVALID_CREDENTIALS' }) };
    }

    const token = jwt.sign({ id: admin.id, username: admin.username, role: admin.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'AUTHENTICATED', token }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'AUTH_FAILED' }) };
  }
};
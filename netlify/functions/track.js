exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };

  try {
    const b = JSON.parse(event.body);
    const ip = event.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    await supabase.from('visitors').insert({
      ip: ip.replace(/\.\d+$/, '.xxx'), path: b.path || '/',
      referrer: b.referrer || null, user_agent: event.headers['user-agent']
    });
    return { statusCode: 204, headers, body: '' };
  } catch (e) {
    return { statusCode: 204, headers, body: '' };
  }
};
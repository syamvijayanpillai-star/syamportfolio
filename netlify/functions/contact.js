exports.handler = async (event) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }) };

  try {
    const b = JSON.parse(event.body);
    if (b.website) return { statusCode: 200, headers, body: JSON.stringify({ status: 'SUCCESS' }) };

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    const { data } = await supabase.from('contacts').insert({
      name: b.name, email: b.email, company: b.company || null,
      subject: b.subject, message: b.message
    }).select().single();

    return { statusCode: 201, headers, body: JSON.stringify({ status: 'SUCCESS', ticketId: data.id }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'INTERNAL_ERROR' }) };
  }
};
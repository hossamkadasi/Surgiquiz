const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };

const reply = (statusCode, body) => ({ statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) });

export async function handler(event) {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') return reply(405, { error: 'Method not allowed' });

  const url = process.env.SURGIQUIZ_SUPABASE_URL;
  const key = process.env.SURGIQUIZ_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return reply(503, { error: 'Question service is not configured' });

  try {
    const input = event.httpMethod === 'POST' ? JSON.parse(event.body || '{}') : (event.queryStringParameters || {});
    const action = String(input.action || 'list');
    const headers = { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` };

    if (action === 'answer') {
      const questionId = String(input.questionId || '').trim();
      if (!questionId) return reply(400, { error: 'questionId is required' });
      const response = await fetch(`${url}/rest/v1/rpc/get_published_question_answer`, {
        method: 'POST', headers, body: JSON.stringify({ p_question_id: questionId }),
      });
      if (!response.ok) return reply(502, { error: 'Question service unavailable' });
      const rows = await response.json();
      return reply(200, { answer: Array.isArray(rows) ? (rows[0] || null) : null });
    }

    const limit = Math.min(Math.max(Number(input.limit) || 20, 1), 50);
    const category = typeof input.category === 'string' && input.category.trim() ? input.category.trim() : null;
    const seed = typeof input.seed === 'string' && input.seed.trim() ? input.seed.trim().slice(0, 80) : 'surgiquiz';
    const response = await fetch(`${url}/rest/v1/rpc/get_published_questions`, {
      method: 'POST', headers, body: JSON.stringify({ p_limit: limit, p_category: category, p_seed: seed }),
    });
    if (!response.ok) return reply(502, { error: 'Question service unavailable' });
    const questions = await response.json();
    return reply(200, { questions: Array.isArray(questions) ? questions : [] });
  } catch {
    return reply(400, { error: 'Invalid request' });
  }
}

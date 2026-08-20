const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export default async (req: Request) => {
  if (req.method !== 'GET' && req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const url = Netlify.env.get('SURGIQUIZ_SUPABASE_URL');
  const key = Netlify.env.get('SURGIQUIZ_SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) return json({ error: 'Question service is not configured' }, 503);

  try {
    const requestUrl = new URL(req.url);
    const input: Record<string, unknown> = req.method === 'POST' ? await req.json() : Object.fromEntries(requestUrl.searchParams);
    const action = String(input.action || 'list');
    const headers = { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` };

    if (action === 'answer') {
      const questionId = String(input.questionId || '').trim();
      if (!questionId) return json({ error: 'questionId is required' }, 400);
      const response = await fetch(`${url}/rest/v1/rpc/get_published_question_answer`, { method: 'POST', headers, body: JSON.stringify({ p_question_id: questionId }) });
      if (!response.ok) return json({ error: 'Question service unavailable' }, 502);
      const rows = await response.json();
      return json({ answer: Array.isArray(rows) ? (rows[0] || null) : null });
    }

    const limit = Math.min(Math.max(Number(input.limit) || 20, 1), 50);
    const category = typeof input.category === 'string' && input.category.trim() ? input.category.trim() : null;
    const seed = typeof input.seed === 'string' && input.seed.trim() ? input.seed.trim().slice(0, 80) : 'surgiquiz';
    const response = await fetch(`${url}/rest/v1/rpc/get_published_questions`, { method: 'POST', headers, body: JSON.stringify({ p_limit: limit, p_category: category, p_seed: seed }) });
    if (!response.ok) return json({ error: 'Question service unavailable' }, 502);
    const questions = await response.json();
    return json({ questions: Array.isArray(questions) ? questions : [] });
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
};

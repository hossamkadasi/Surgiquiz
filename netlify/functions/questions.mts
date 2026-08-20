// Production question service; redeployed after restoring Supabase environment variables.
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export default async (req: Request) => {
  if (req.method !== 'GET' && req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const url = Netlify.env.get('SURGIQUIZ_SUPABASE_URL'); const key = Netlify.env.get('SURGIQUIZ_SUPABASE_PUBLISHABLE_KEY');
  if (!url || !key) return json({ error: 'Question service is not configured' }, 503);
  try {
    const requestUrl = new URL(req.url); const input: Record<string, unknown> = req.method === 'POST' ? await req.json() : Object.fromEntries(requestUrl.searchParams); const action = String(input.action || 'list');
    const headers = { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` };
    if (action === 'beta-facets') { const r = await fetch(`${url}/rest/v1/rpc/get_beta_bank_facets`, { method:'POST', headers, body:'{}' }); if(!r.ok) return json({error:'Question service unavailable'},502); return json({ facets: await r.json() }); }
    const beta = action.startsWith('beta-');
    if (action === 'answer' || action === 'beta-answer') { const questionId=String(input.questionId||'').trim(); if(!questionId)return json({error:'questionId is required'},400); const rpc=beta?'get_beta_question_answer':'get_published_question_answer'; const r=await fetch(`${url}/rest/v1/rpc/${rpc}`,{method:'POST',headers,body:JSON.stringify({p_question_id:questionId})}); if(!r.ok)return json({error:'Question service unavailable'},502); const rows=await r.json(); return json({answer:Array.isArray(rows)?(rows[0]||null):null}); }
    const limit=Math.min(Math.max(Number(input.limit)||20,1),50); const category=typeof input.category==='string'&&input.category.trim()?input.category.trim():null; const seed=typeof input.seed==='string'&&input.seed.trim()?input.seed.trim().slice(0,80):(beta?'surgiquiz-beta':'surgiquiz'); const rpc=beta?'get_beta_questions':'get_published_questions'; const body:Record<string,unknown>={p_limit:limit,p_category:category,p_seed:seed}; if(beta)body.p_offset=Math.max(Number(input.offset)||0,0); const r=await fetch(`${url}/rest/v1/rpc/${rpc}`,{method:'POST',headers,body:JSON.stringify(body)}); if(!r.ok)return json({error:'Question service unavailable'},502); const questions=await r.json(); return json({questions:Array.isArray(questions)?questions:[],bank:beta?'beta':'verified'});
  } catch { return json({ error: 'Invalid request' }, 400); }
};
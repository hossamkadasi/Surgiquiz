const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

const prompts = {
  viva: `You are SurgiQuiz AI Viva Examiner for postgraduate general surgery education. Evaluate the learner's reasoning, ask one focused follow-up question, and give concise feedback under: Strengths, Missing points, Next question. Do not provide patient-specific medical advice. Keep the response educational and explicitly flag uncertainty.`,
  coach: `You are SurgiQuiz AI Coach. Build a short adaptive surgical learning session from the learner goal and knowledge profile. Use this sequence: diagnostic check, weaknesses, 3 targeted activities, one case/viva challenge, reassessment. Keep it educational, concise, and suitable for surgical trainees.`,
  case_to_quiz: `You are a surgical education editor. Convert ONLY the supplied de-identified case summary into an educational learning case. Do not infer patient identity or invent identifying details. Structure: Case stem, 3 decision points, ideal reasoning, pitfalls, anatomy link, and one viva follow-up. Mark any unsupported clinical detail as needing review.`
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  const token = process.env.HF_TOKEN;
  if (!token) return { statusCode: 503, body: JSON.stringify({ error: 'HF_TOKEN is not configured' }) };
  try {
    const body = JSON.parse(event.body || '{}');
    const task = body.task;
    const payload = body.payload || {};
    const lang = body.lang === 'ar' ? 'Arabic' : 'English';
    const system = prompts[task];
    if (!system) return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported AI task' }) };
    const model = process.env.HF_MODEL || 'openai/gpt-oss-120b:fastest';
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: `${system}\nRespond in ${lang}.` },
          { role: 'user', content: JSON.stringify(payload) }
        ],
        temperature: 0.25,
        max_tokens: 1200
      })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || data.error || 'Hugging Face request failed' }) };
    const content = data.choices?.[0]?.message?.content || '';
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, model }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) };
  }
};

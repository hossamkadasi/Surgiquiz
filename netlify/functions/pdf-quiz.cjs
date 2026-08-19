const pdfParse = require('pdf-parse');

const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

function parseJson(text) {
  const cleaned = String(text || '').replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(cleaned);
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  const token = process.env.HF_TOKEN;
  if (!token) return { statusCode: 503, body: JSON.stringify({ error: 'HF_TOKEN is not configured' }) };
  try {
    const body = JSON.parse(event.body || '{}');
    const fileBase64 = body.fileBase64 || '';
    if (!fileBase64) return { statusCode: 400, body: JSON.stringify({ error: 'Missing PDF file' }) };
    if (fileBase64.length > 8_000_000) return { statusCode: 413, body: JSON.stringify({ error: 'PDF is too large for this beta endpoint' }) };
    const buffer = Buffer.from(fileBase64, 'base64');
    const parsed = await pdfParse(buffer);
    const sourceText = String(parsed.text || '').replace(/\s+/g, ' ').trim().slice(0, 22000);
    if (sourceText.length < 200) return { statusCode: 422, body: JSON.stringify({ error: 'Could not extract enough text from this PDF. Scanned PDFs need OCR support.' }) };
    const language = body.lang === 'ar' ? 'Arabic' : 'English';
    const model = process.env.HF_MODEL || 'openai/gpt-oss-120b:fastest';
    const response = await fetch(HF_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: `You are a surgical education question editor. Generate exactly 5 postgraduate general-surgery MCQs grounded ONLY in the supplied source text. Do not add unsupported facts. If the source is insufficient, make fewer questions. Each explanation must explicitly say it is based on the uploaded source. Return valid JSON only with shape {"questions":[{"question":"","options":["","","",""],"correct_answer":"","explanation":""}]}. Respond in ${language}.` },
          { role: 'user', content: `SOURCE TITLE: ${body.title || 'Uploaded PDF'}\nSOURCE TEXT:\n${sourceText}` }
        ],
        temperature: 0.15,
        max_tokens: 1800
      })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || data.error || 'Hugging Face request failed' }) };
    const content = data.choices?.[0]?.message?.content || '';
    const generated = parseJson(content);
    const questions = Array.isArray(generated.questions) ? generated.questions.slice(0, 5) : [];
    return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questions, sourceTitle: body.title || 'Uploaded PDF', model }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) };
  }
};

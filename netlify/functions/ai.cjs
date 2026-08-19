const HF_URL = 'https://router.huggingface.co/v1/chat/completions';

const prompts = {
  viva: `You are SurgiQuiz AI Viva Examiner for postgraduate general surgery education. Evaluate the learner's reasoning, ask one focused follow-up question, and give concise feedback under: Strengths, Missing points, Next question. Do not provide patient-specific medical advice. Keep the response educational and explicitly flag uncertainty.`,
  coach: `You are SurgiQuiz AI Coach. Build a short adaptive surgical learning session from the learner goal and knowledge profile. Use this sequence: diagnostic check, weaknesses, 3 targeted activities, one case/viva challenge, reassessment. Keep it educational, concise, and suitable for surgical trainees.`,
  case_to_quiz: `You are a surgical education editor. Convert ONLY the supplied de-identified case summary into an educational learning case. Do not infer patient identity or invent identifying details. Structure: Case stem, 3 decision points, ideal reasoning, pitfalls, anatomy link, and one viva follow-up. Mark any unsupported clinical detail as needing review.`,
  learning_bridge: `You are a surgical education editor. You will receive ONLY a structured, de-identified SurgiCore learning pack that has already passed the server privacy contract. Use only the supplied procedure, system, role, approach, urgency, and generic learning objectives. Never infer or invent age, sex, diagnosis, laboratory values, imaging, comorbidities, operative findings, complications, dates, hospital, patient identity, or any other patient-specific fact. Convert the learning context into an educational draft with: Learning focus, 3 decision/safety questions, ideal reasoning points, pitfalls, procedure-specific anatomy review, complication-rescue rehearsal, and one viva follow-up. If a needed clinical detail was not supplied, keep the exercise generic rather than inventing it. The result is educational and requires clinical review.`
};

const REQUIRED_EXCLUDES = ['patient_name', 'mrn', 'dob', 'exact_case_date', 'facility', 'free_text_notes'];
const TOP_KEYS = new Set(['schemaVersion', 'sourceApp', 'sourceCaseIdHash', 'procedure', 'system', 'role', 'approach', 'urgency', 'learningObjectives', 'privacy']);
const PRIVACY_KEYS = new Set(['deidentified', 'reviewedByUser', 'excludes']);
const ROLES = new Set(['Observer', 'Assistant', 'Primary Surgeon']);
const APPROACHES = new Set(['Open', 'Laparoscopic', 'Robotic', 'Endoscopic']);
const URGENCIES = new Set(['Elective', 'Emergency']);

const identifierPattern = /\b(?:patient\s*name|name\s*:|mrn|medical\s*record|patient\s*id|hospital\s*number|date\s*of\s*birth|dob|national\s*id|identity\s*(?:number|no\.?))\b|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|(?:[0-9٠-٩۰-۹][\s()+\-.]*){7,}/i;

function cleanString(value, label, max) {
  if (typeof value !== 'string') throw new Error(`${label} must be a string`);
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized || normalized.length > max) throw new Error(`${label} is missing or too long`);
  if (identifierPattern.test(normalized)) throw new Error(`${label} contains a possible identifier`);
  return normalized;
}

function validateLearningCasePack(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('learningCase must be an object');
  for (const key of Object.keys(input)) {
    if (!TOP_KEYS.has(key)) throw new Error(`Unsupported learningCase field: ${key}`);
  }
  if (input.schemaVersion !== '1') throw new Error('learningCase.schemaVersion must be 1');
  if (input.sourceApp !== 'SurgiCore') throw new Error('learningCase.sourceApp must be SurgiCore');
  if (input.sourceCaseIdHash !== undefined && !/^[a-f0-9]{32,64}$/i.test(String(input.sourceCaseIdHash))) {
    throw new Error('sourceCaseIdHash must be an opaque hexadecimal hash');
  }

  const procedure = cleanString(input.procedure, 'procedure', 120);
  const system = cleanString(input.system, 'system', 80);
  if (input.role !== undefined && !ROLES.has(input.role)) throw new Error('Unsupported role');
  if (input.approach !== undefined && !APPROACHES.has(input.approach)) throw new Error('Unsupported approach');
  if (input.urgency !== undefined && !URGENCIES.has(input.urgency)) throw new Error('Unsupported urgency');

  const privacy = input.privacy;
  if (!privacy || typeof privacy !== 'object' || Array.isArray(privacy)) throw new Error('privacy block is required');
  for (const key of Object.keys(privacy)) {
    if (!PRIVACY_KEYS.has(key)) throw new Error(`Unsupported privacy field: ${key}`);
  }
  if (privacy.deidentified !== true || privacy.reviewedByUser !== true) {
    throw new Error('learningCase must be de-identified and reviewed by the user');
  }
  if (!Array.isArray(privacy.excludes)) throw new Error('privacy.excludes must be an array');
  for (const field of REQUIRED_EXCLUDES) {
    if (!privacy.excludes.includes(field)) throw new Error(`privacy.excludes is missing ${field}`);
  }

  const rawObjectives = input.learningObjectives === undefined ? [] : input.learningObjectives;
  if (!Array.isArray(rawObjectives) || rawObjectives.length > 6) throw new Error('learningObjectives must contain at most 6 items');
  const learningObjectives = rawObjectives.map((item, index) => cleanString(item, `learningObjectives[${index}]`, 160));

  return {
    schemaVersion: '1',
    sourceApp: 'SurgiCore',
    ...(input.sourceCaseIdHash ? { sourceCaseIdHash: String(input.sourceCaseIdHash) } : {}),
    procedure,
    system,
    ...(input.role ? { role: input.role } : {}),
    ...(input.approach ? { approach: input.approach } : {}),
    ...(input.urgency ? { urgency: input.urgency } : {}),
    learningObjectives,
    privacy: {
      deidentified: true,
      reviewedByUser: true,
      excludes: REQUIRED_EXCLUDES
    }
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  try {
    const body = JSON.parse(event.body || '{}');
    const task = body.task;
    const lang = body.lang === 'ar' ? 'Arabic' : 'English';
    const system = prompts[task];
    if (!system) return { statusCode: 400, body: JSON.stringify({ error: 'Unsupported AI task' }) };

    let payload = body.payload || {};
    if (task === 'learning_bridge') {
      try {
        payload = { learningCase: validateLearningCasePack(payload.learningCase) };
      } catch (error) {
        return {
          statusCode: 422,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          body: JSON.stringify({ error: error instanceof Error ? error.message : String(error), code: 'LEARNING_CASE_REJECTED' })
        };
      }
    }

    const token = process.env.HF_TOKEN;
    if (!token) return { statusCode: 503, headers: { 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'HF_TOKEN is not configured' }) };
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
        temperature: task === 'learning_bridge' ? 0.2 : 0.25,
        max_tokens: 1200
      })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, headers: { 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: data.error?.message || data.error || 'Hugging Face request failed' }) };
    const content = data.choices?.[0]?.message?.content || '';
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ content, model }) };
  } catch (error) {
    return { statusCode: 500, headers: { 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) };
  }
};

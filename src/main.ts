import './styles.css';
import { anatomyModules, branchingCases, questions, type Lang, type Question } from './content';

type View = 'plan' | 'qbank' | 'cases' | 'viva' | 'anatomy' | 'coach' | 'import' | 'performance' | 'quiz' | 'result';
type Stats = { done: number; correct: number; wrong: number };
type TopicProfile = { attempts: number; correct: number; mastery: number; lastPracticed: string };
type KnowledgeProfile = Record<string, TopicProfile>;
type ChatTurn = { role: 'ai' | 'user'; text: string };

type GeneratedQuestion = { question?: string; options?: string[]; correct_answer?: string; explanation?: string };

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root missing');

let lang: Lang = localStorage.getItem('sq_lang') === 'en' ? 'en' : 'ar';
let view: View = 'plan';
let index = 0;
let sessionScore = 0;
let selected: number | null = null;
let activeCaseIndex = 0;
let activeCaseNode = 0;
let caseSelected: number | null = null;
let caseScore = 0;
let activeAnatomy = 0;
let anatomyRotation = 0;
let vivaTurns: ChatTurn[] = [];
let coachReply = '';
let generatedQuestions: GeneratedQuestion[] = [];
let importStatus = '';
let uploadedFile: File | null = null;
let busy = false;

const text = (ar: string, en: string) => (lang === 'ar' ? ar : en);
const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));

function loadStats(): Stats {
  try {
    const parsed = JSON.parse(localStorage.getItem('sq_stats') || '{}') as Partial<Stats>;
    return { done: Number(parsed.done) || 0, correct: Number(parsed.correct) || 0, wrong: Number(parsed.wrong) || 0 };
  } catch {
    return { done: 0, correct: 0, wrong: 0 };
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem('sq_stats', JSON.stringify(stats));
}

function loadKnowledge(): KnowledgeProfile {
  try { return JSON.parse(localStorage.getItem('sq_knowledge') || '{}') as KnowledgeProfile; } catch { return {}; }
}

function saveKnowledge(profile: KnowledgeProfile) {
  localStorage.setItem('sq_knowledge', JSON.stringify(profile));
}

function updateKnowledge(question: Question, correct: boolean) {
  const profile = loadKnowledge();
  const current = profile[question.topic] || { attempts: 0, correct: 0, mastery: 50, lastPracticed: '' };
  current.attempts += 1;
  if (correct) current.correct += 1;
  current.mastery = Math.round((current.correct / current.attempts) * 100);
  current.lastPracticed = new Date().toISOString();
  profile[question.topic] = current;
  saveKnowledge(profile);
}

function weakTopics() {
  const profile = loadKnowledge();
  const seeded = ['Biliary anatomy', 'Thyroid anatomy', 'Inguinal anatomy'].map((topic) => ({ topic, mastery: profile[topic]?.mastery ?? 50 }));
  return seeded.sort((a, b) => a.mastery - b.mastery);
}

function navigation() {
  if (view === 'quiz' || view === 'result') return '';
  const items: Array<[View, string, string]> = [
    ['plan', 'خطة اليوم', "Today's Plan"], ['qbank', 'الأسئلة', 'QBank'], ['cases', 'الحالات', 'Cases'],
    ['viva', 'Viva AI', 'AI Viva'], ['anatomy', 'التشريح', 'Anatomy'], ['coach', 'المدرب', 'AI Coach'],
    ['import', 'PDF / Case', 'PDF / Case'], ['performance', 'الأداء', 'Performance'],
  ];
  return `<nav class="card nav" aria-label="${text('التنقل الرئيسي', 'Main navigation')}">${items.map(([target, ar, en]) => `<button class="tab ${view === target ? 'active' : ''}" data-view="${target}" ${view === target ? 'aria-current="page"' : ''}>${text(ar, en)}</button>`).join('')}</nav>`;
}

function shell(content: string) {
  const stats = loadStats();
  const accuracy = stats.done ? `${Math.round((stats.correct / stats.done) * 100)}%` : '—';
  const hero = view === 'quiz' || view === 'result' ? '' : `
    <section class="hero">
      <div class="card hero-main">
        <div class="eyebrow"><span class="badge">SurgiQuiz Intelligence</span><span class="ai-badge">HF-ready</span></div>
        <h2>${text('تعلّم جراحي يتكيّف مع نقاط ضعفك وخبرتك.', 'Surgical learning that adapts to your weaknesses and experience.')}</h2>
        <p>${text('MCQ + حالات متفرعة + Viva صوتي + Surgical Anatomy + AI Coach في مسار تعلم واحد.', 'MCQs, branching cases, voice viva, surgical anatomy, and an AI coach in one learning loop.')}</p>
        <div class="hero-actions"><button class="btn primary" data-action="start">${text('ابدأ اختبارًا', 'Start quiz')}</button><button class="btn" data-view="viva">AI Viva</button><button class="btn" data-view="anatomy">${text('التشريح الجراحي', 'Surgical Anatomy')}</button></div>
        <div class="notice">${text('للاستخدام التعليمي فقط. مخرجات الذكاء الاصطناعي تحتاج مراجعة، ولا تُستخدم لاتخاذ قرار علاجي لمريض.', 'Educational use only. AI output requires review and must not be used for patient-care decisions.')}</div>
      </div>
      <div class="card stats">
        <div class="stat"><b>${stats.done}</b><span>${text('محاولة', 'Attempts')}</span></div>
        <div class="stat"><b>${accuracy}</b><span>${text('الدقة', 'Accuracy')}</span></div>
        <div class="stat"><b>${branchingCases.length}</b><span>${text('حالات متفرعة', 'Branching cases')}</span></div>
        <div class="stat"><b>${anatomyModules.length}</b><span>${text('وحدات تشريح', 'Anatomy modules')}</span></div>
      </div>
    </section>`;
  return `<div class="wrap"><header class="top"><div class="brand"><div class="logo" aria-hidden="true">✚</div><div><h1>SurgiQuiz</h1><p>${text('Adaptive Surgical Learning', 'Adaptive Surgical Learning')}</p></div></div><div class="actions"><button class="btn" data-action="lang">${lang === 'ar' ? 'EN' : 'AR'}</button><button class="btn ghost" data-action="reset">${text('إعادة التقدم', 'Reset progress')}</button></div></header>${hero}${navigation()}${content}<footer class="footer">SurgiQuiz · Educational use only · AI-assisted content requires review</footer></div>`;
}

function renderPlan() {
  const weak = weakTopics();
  return `<main><div class="grid"><section class="card panel"><div class="section-head"><div><span class="kicker">Adaptive Engine</span><h3>${text('خطة اليوم الذكية', 'Adaptive daily plan')}</h3></div><span class="badge">${text('شخصية', 'Personalized')}</span></div><p class="small">${text('الأولوية تُبنى على أدائك الحالي وتُحدّث بعد كل إجابة.', 'Priority is based on your current performance and updates after every answer.')}</p><div class="plan">
    ${weak.map((item, i) => `<div class="plan-row"><div><b>${item.topic}</b><div><span>${i === 0 ? text('أعلى أولوية', 'Highest priority') : text('مراجعة موجهة', 'Targeted review')}</span></div></div><strong>${item.mastery}%</strong></div>`).join('')}
    <div class="plan-row"><div><b>${text('AI Viva', 'AI Viva')}</b><div><span>${text('Clinical reasoning + operative planning', 'Clinical reasoning + operative planning')}</span></div></div><button class="mini" data-view="viva">${text('ابدأ', 'Start')}</button></div>
    <div class="plan-row"><div><b>${text('حالة متفرعة', 'Branching case')}</b><div><span>${text('اتخاذ قرار خطوة بخطوة', 'Step-by-step decisions')}</span></div></div><button class="mini" data-view="cases">${text('ابدأ', 'Start')}</button></div>
  </div></section>
  <section class="card panel"><span class="kicker">Learning Loop</span><h3>${text('من SurgiCore إلى التعلم', 'From SurgiCore to learning')}</h3><p class="small">${text('يمكن تحويل حالة منزوعة الهوية من SurgiCore إلى سيناريو تعليمي، ثم إضافتها إلى Viva أو Case-based Quiz.', 'A de-identified SurgiCore case can become a learning scenario for Viva or case-based practice.')}</p><div class="flow"><span>SurgiCore Case</span><b>→</b><span>De-identify</span><b>→</b><span>SurgiQuiz</span><b>→</b><span>Adaptive Review</span></div><button class="btn" data-view="import">${text('إنشاء Learning Case', 'Create learning case')}</button></section></div></main>`;
}

function renderQbank() {
  return `<main><section class="card panel"><div class="section-head"><div><span class="kicker">QBank</span><h3>${text('بنك الأسئلة التكيفي', 'Adaptive question bank')}</h3></div><button class="btn primary" data-action="start">${text('ابدأ', 'Start')}</button></div><p class="small">${text('تُسجل المحاولات حسب الموضوع لبناء Knowledge Weakness Map بدل الاعتماد على نسبة إجمالية فقط.', 'Attempts are tracked by topic to build a knowledge weakness map rather than a single overall score.')}</p><div class="question-list">${questions.map((q) => `<article><div><span class="badge">${q.category}</span><h4>${lang === 'ar' ? q.ar : q.en}</h4><p>${q.topic} · ${q.difficulty}</p></div></article>`).join('')}</div></section></main>`;
}

function renderCases() {
  const current = branchingCases[activeCaseIndex];
  const node = current.nodes[activeCaseNode];
  if (!node) return `<main><section class="card result"><div class="score">${caseScore}/${current.nodes.length}</div><h2>${text('اكتملت الحالة', 'Case completed')}</h2><p class="small">${text('ستُستخدم النتيجة لاحقًا ضمن Knowledge Profile وAI Coach.', 'The result can feed the knowledge profile and AI coach.')}</p><button class="btn primary" data-action="case-restart">${text('إعادة الحالة', 'Restart case')}</button></section></main>`;
  const options = lang === 'ar' ? node.optionsAr : node.optionsEn;
  return `<main><div class="case-layout"><aside class="card panel case-picker"><span class="kicker">Case-based</span><h3>${text('الحالات المتفرعة', 'Branching cases')}</h3>${branchingCases.map((item, i) => `<button class="case-select ${i === activeCaseIndex ? 'active' : ''}" data-case="${i}">${lang === 'ar' ? item.titleAr : item.titleEn}<small>${item.category}</small></button>`).join('')}</aside><section class="card quiz"><div class="qmeta"><span>${lang === 'ar' ? current.titleAr : current.titleEn}</span><span>${activeCaseNode + 1}/${current.nodes.length}</span></div><div class="case-stem">${lang === 'ar' ? current.stemAr : current.stemEn}</div><div class="qtext">${lang === 'ar' ? node.promptAr : node.promptEn}</div><div class="options">${options.map((option, i) => `<button class="opt ${caseSelected !== null && i === node.correct ? 'correct' : ''} ${caseSelected === i && i !== node.correct ? 'wrong' : ''}" data-case-answer="${i}" ${caseSelected !== null ? 'disabled' : ''}>${String.fromCharCode(65 + i)}. ${option}</button>`).join('')}</div>${caseSelected !== null ? `<div class="explain"><b>${text('التفسير', 'Reasoning')}</b><br>${lang === 'ar' ? node.explanationAr : node.explanationEn}</div><div class="quiz-actions"><span></span><button class="btn primary" data-action="case-next">${text('الخطوة التالية', 'Next decision')}</button></div>` : ''}</section></div></main>`;
}

function renderViva() {
  const defaultQuestion = text('مريض عمره 55 سنة لديه يرقان انسدادي. اشرح تقييمك الأولي وما الذي يحدد الحاجة إلى تدخل عاجل.', 'A 55-year-old patient presents with obstructive jaundice. Explain your initial assessment and what determines the need for urgent intervention.');
  const transcript = vivaTurns.length ? vivaTurns.map((turn) => `<div class="chat ${turn.role}"><b>${turn.role === 'ai' ? 'AI Examiner' : text('أنت', 'You')}</b><p>${escapeHtml(turn.text)}</p></div>`).join('') : `<div class="chat ai"><b>AI Examiner</b><p>${defaultQuestion}</p></div>`;
  return `<main><div class="grid"><section class="card panel"><div class="section-head"><div><span class="kicker">AI Viva</span><h3>${text('امتحان شفهي تفاعلي', 'Interactive oral examination')}</h3></div><span class="badge">Voice + Text</span></div><div class="chat-window">${transcript}</div><label class="field"><span>${text('إجابتك', 'Your answer')}</span><textarea id="viva-answer" rows="5" placeholder="${text('اكتب أو استخدم الميكروفون...', 'Type or use the microphone...')}"></textarea></label><div class="hero-actions"><button class="btn" data-action="voice-viva">🎙 ${text('إجابة صوتية', 'Voice answer')}</button><button class="btn primary" data-action="submit-viva" ${busy ? 'disabled' : ''}>${busy ? text('جاري التحليل...', 'Analyzing...') : text('إرسال للممتحن', 'Submit to examiner')}</button><button class="btn ghost" data-action="reset-viva">${text('جلسة جديدة', 'New session')}</button></div></section><section class="card panel"><span class="kicker">Scoring framework</span><h3>${text('ما الذي يقيمه الـViva؟', 'What the Viva evaluates')}</h3><div class="metric-list"><span>Clinical reasoning</span><span>Differential diagnosis</span><span>Investigations</span><span>Operative planning</span><span>Complications</span><span>Surgical anatomy</span></div><div class="notice">${text('التقييم الآلي تعليمي وغير بديل عن تقييم ممتحن أو جهة تدريبية.', 'Automated scoring is educational and does not replace formal examiner assessment.')}</div></section></div></main>`;
}

function renderAnatomy() {
  const module = anatomyModules[activeAnatomy];
  const danger = lang === 'ar' ? module.dangerAr : module.dangerEn;
  return `<main><div class="anatomy-grid"><aside class="card panel anatomy-menu"><span class="kicker">Surgical Anatomy</span><h3>${text('اختر المنطقة', 'Choose a module')}</h3>${anatomyModules.map((item, i) => `<button class="case-select ${i === activeAnatomy ? 'active' : ''}" data-anatomy="${i}">${lang === 'ar' ? item.titleAr : item.titleEn}<small>${lang === 'ar' ? item.procedureAr : item.procedureEn}</small></button>`).join('')}</aside><section class="card panel anatomy-view"><div class="section-head"><div><span class="badge">${module.category}</span><h3>${lang === 'ar' ? module.titleAr : module.titleEn}</h3><p class="small">${lang === 'ar' ? module.procedureAr : module.procedureEn}</p></div></div><div class="anatomy-stage" style="--rot:${anatomyRotation}deg"><div class="anatomy-card back"></div><div class="anatomy-card mid"></div><img src="${module.image}" alt="${escapeHtml(lang === 'ar' ? module.titleAr : module.titleEn)}" /></div><label class="rotate"><span>${text('منظور الطبقات', 'Layer perspective')}</span><input id="anatomy-rotation" type="range" min="-16" max="16" value="${anatomyRotation}" /></label><div class="anatomy-info"><div><h4>${text('البنى الأساسية', 'Key structures')}</h4><div class="chips">${module.structures.map((s) => `<span>${lang === 'ar' ? s.ar : s.en}</span>`).join('')}</div></div><div><h4>${text('مناطق الخطر', 'Danger zones')}</h4><ul>${danger.map((d) => `<li>${d}</li>`).join('')}</ul></div></div><div class="notice">${text('المشهد الحالي schematic متعدد الطبقات. قبل تحويله إلى 3D تشريحي نهائي سنستخدم أصولًا موثقة ومراجعة جراحية.', 'This is a layered interactive schematic. A final 3D atlas should use validated assets and surgical review.')}</div></section></div></main>`;
}

function renderCoach() {
  return `<main><div class="grid"><section class="card panel"><div class="section-head"><div><span class="kicker">AI Coach</span><h3>${text('مدرب جلسة، وليس Chatbot عام', 'A session coach, not a generic chatbot')}</h3></div></div><p class="small">${text('حدد ما تريد التدريب عليه، وسيُبنى الرد حول تقييم قصير → نقاط ضعف → تدريب → إعادة تقييم.', 'Choose what to train; the response is structured around assessment, weakness detection, practice, and reassessment.')}</p><label class="field"><span>${text('هدف الجلسة', 'Session goal')}</span><textarea id="coach-prompt" rows="4" placeholder="${text('مثال: حضّرني لالتهاب البنكرياس الحاد كـ resident...', 'Example: Prepare me for acute pancreatitis as a resident...')}"></textarea></label><button class="btn primary" data-action="coach-ask" ${busy ? 'disabled' : ''}>${busy ? text('جاري البناء...', 'Building session...') : text('ابدأ جلسة التدريب', 'Start coaching session')}</button></section><section class="card panel"><span class="kicker">Coach output</span><h3>${text('خطة التدريب', 'Training plan')}</h3>${coachReply ? `<div class="ai-output">${escapeHtml(coachReply).replace(/\n/g, '<br>')}</div>` : `<div class="empty">${text('سيظهر هنا تقييم قصير وخطة أسئلة موجهة.', 'A short assessment and targeted question plan will appear here.')}</div>`}</section></div></main>`;
}

function renderImport() {
  const generated = generatedQuestions.length ? `<div class="generated-list">${generatedQuestions.map((q, i) => `<article><span class="badge">Q${i + 1}</span><h4>${escapeHtml(q.question || '')}</h4>${q.options?.length ? `<ol>${q.options.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ol>` : ''}<p><b>${text('الإجابة', 'Answer')}:</b> ${escapeHtml(q.correct_answer || '')}</p><p class="small">${escapeHtml(q.explanation || '')}</p></article>`).join('')}</div>` : '';
  return `<main><div class="grid"><section class="card panel"><span class="kicker">PDF → Quiz</span><h3>${text('حوّل مصدرًا إلى أسئلة', 'Turn a source into questions')}</h3><p class="small">${text('ارفع PDF تعليميًا غير محمي ببيانات مرضى. يتم استخراج النص server-side ثم توليد draft يحتاج مراجعة.', 'Upload an educational PDF without patient-identifiable data. Text is parsed server-side and generated items remain draft until reviewed.')}</p><label class="upload"><input id="pdf-file" type="file" accept="application/pdf"/><span>📄 ${uploadedFile ? escapeHtml(uploadedFile.name) : text('اختر PDF', 'Choose PDF')}</span></label><button class="btn primary" data-action="generate-pdf" ${busy ? 'disabled' : ''}>${busy ? text('جاري المعالجة...', 'Processing...') : text('إنشاء Quiz من PDF', 'Generate quiz from PDF')}</button>${importStatus ? `<div class="notice">${escapeHtml(importStatus)}</div>` : ''}${generated}</section><section class="card panel"><span class="kicker">SurgiCore → SurgiQuiz</span><h3>${text('حوّل حالة حقيقية إلى Learning Case', 'Convert a real case into a learning case')}</h3><p class="small">${text('ألصق فقط ملخصًا منزوع الهوية: لا اسم، لا MRN، لا هاتف، لا تاريخ ميلاد، ولا معرفات مباشرة.', 'Paste only a de-identified summary: no name, MRN, phone, date of birth, or direct identifiers.')}</p><label class="field"><span>${text('ملخص منزوع الهوية', 'De-identified summary')}</span><textarea id="case-source" rows="7" placeholder="${text('مثال: بالغ خضع لاستئصال مرارة بالمنظار مع difficult hepatocystic triangle...', 'Example: Adult underwent laparoscopic cholecystectomy with a difficult hepatocystic triangle...')}"></textarea></label><button class="btn" data-action="case-to-quiz">${text('إنشاء Learning Case', 'Create learning case')}</button></section></div></main>`;
}

function renderPerformance() {
  const stats = loadStats();
  const accuracy = stats.done ? Math.round((stats.correct / stats.done) * 100) : 0;
  const profile = loadKnowledge();
  const topics = Object.entries(profile).sort((a, b) => a[1].mastery - b[1].mastery);
  return `<main><div class="grid"><section class="card panel"><span class="kicker">Knowledge Map</span><h3>${text('خريطة نقاط القوة والضعف', 'Knowledge weakness map')}</h3>${topics.length ? `<div class="mastery-list">${topics.map(([topic, data]) => `<div><div class="mastery-head"><b>${topic}</b><span>${data.mastery}%</span></div><div class="progress"><i style="width:${data.mastery}%"></i></div></div>`).join('')}</div>` : `<div class="empty">${text('أجب عن بعض الأسئلة لبناء الخريطة.', 'Answer some questions to build your map.')}</div>`}</section><section class="card panel"><span class="kicker">Performance</span><h3>${text('ملخص الأداء', 'Performance summary')}</h3><div class="status-grid"><div class="status-item"><b>${stats.done}</b><span>${text('محاولة', 'Attempts')}</span></div><div class="status-item"><b>${accuracy || '—'}${accuracy ? '%' : ''}</b><span>${text('الدقة', 'Accuracy')}</span></div><div class="status-item"><b>${stats.wrong}</b><span>${text('نقاط مراجعة', 'Review signals')}</span></div></div><div class="notice success">${text('الهدف ليس أعلى نسبة فقط؛ بل تقليل نقاط الضعف المتكررة وربطها بالتشريح والحالات والـViva.', 'The goal is not only a higher score; it is to reduce recurring weaknesses across anatomy, cases, and viva.')}</div></section></div></main>`;
}

function renderQuiz() {
  const question = questions[index];
  if (!question) { view = 'result'; return renderResult(); }
  const options = lang === 'ar' ? question.arOptions : question.enOptions;
  return `<main><section class="card quiz"><div class="qmeta"><span>${text('سؤال', 'Question')} ${index + 1} / ${questions.length}</span><span>${question.category} · ${question.topic} · ${question.difficulty}</span></div><div class="qtext">${lang === 'ar' ? question.ar : question.en}</div><div class="options">${options.map((option, optionIndex) => `<button class="opt ${selected !== null && optionIndex === question.correct ? 'correct' : ''} ${selected === optionIndex && optionIndex !== question.correct ? 'wrong' : ''}" data-answer="${optionIndex}" ${selected !== null ? 'disabled' : ''}>${String.fromCharCode(65 + optionIndex)}. ${option}</button>`).join('')}</div>${selected !== null ? `<div class="explain"><b>${text('الشرح', 'Explanation')}</b><br>${lang === 'ar' ? question.arExplanation : question.enExplanation}</div>` : ''}<div class="quiz-actions"><button class="btn" data-action="exit">${text('خروج', 'Exit')}</button><div class="hero-actions"><button class="btn" data-action="voice-answer" ${selected !== null ? 'disabled' : ''}>🎙 ${text('أجب صوتيًا', 'Voice answer')}</button><button class="btn primary" data-action="next" ${selected === null ? 'disabled' : ''}>${text('التالي', 'Next')}</button></div></div></section></main>`;
}

function renderResult() {
  const percent = questions.length ? Math.round((sessionScore / questions.length) * 100) : 0;
  return `<main><section class="card result"><div class="score">${percent}%</div><h2>${text('اكتملت الجلسة', 'Session completed')}</h2><p class="small">${text(`إجابات صحيحة: ${sessionScore} من ${questions.length}. تم تحديث Knowledge Map.`, `Correct answers: ${sessionScore} of ${questions.length}. Your Knowledge Map has been updated.`)}</p><div class="hero-actions center"><button class="btn primary" data-action="start">${text('جلسة جديدة', 'New session')}</button><button class="btn" data-view="performance">${text('خريطة المعرفة', 'Knowledge map')}</button><button class="btn" data-view="coach">AI Coach</button></div></section></main>`;
}

function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const views: Record<Exclude<View, 'quiz' | 'result'>, () => string> = { plan: renderPlan, qbank: renderQbank, cases: renderCases, viva: renderViva, anatomy: renderAnatomy, coach: renderCoach, import: renderImport, performance: renderPerformance };
  const content = view === 'quiz' ? renderQuiz() : view === 'result' ? renderResult() : views[view]();
  root.innerHTML = shell(content);
}

function scoreQuestion(answer: number) {
  if (selected !== null) return;
  selected = answer;
  const question = questions[index];
  const correct = answer === question.correct;
  const stats = loadStats();
  stats.done += 1;
  if (correct) { stats.correct += 1; sessionScore += 1; } else stats.wrong += 1;
  saveStats(stats);
  updateKnowledge(question, correct);
}

async function callAI(task: string, payload: Record<string, unknown>) {
  const response = await fetch('/.netlify/functions/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task, payload, lang }) });
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'AI service unavailable');
  const data = await response.json() as { content?: string };
  return data.content || '';
}

function localVivaFeedback(answer: string) {
  const words = answer.trim().split(/\s+/).length;
  return text(`تقييم محلي مؤقت: إجابتك تحتوي ${words} كلمة. رتّبها إلى: assessment → differential → investigations → urgency → definitive plan → complications. فعّل HF_TOKEN للحصول على تقييم AI أعمق.`, `Local fallback assessment: your answer contains ${words} words. Structure it as assessment → differential → investigations → urgency → definitive plan → complications. Configure HF_TOKEN for deeper AI evaluation.`);
}

function localCoach(goal: string) {
  const weakest = weakTopics()[0];
  return text(`خطة تدريب أولية لـ “${goal}”: 1) سؤال تشخيصي قصير. 2) راجع ${weakest.topic} لأنها حاليًا أضعف إشارة (${weakest.mastery}%). 3) حل حالة متفرعة. 4) Viva من 3 أسئلة. 5) أعد سؤالًا مشابهًا بعد الجلسة.`, `Starter coaching plan for “${goal}”: 1) short diagnostic question. 2) Review ${weakest.topic}, currently your weakest signal (${weakest.mastery}%). 3) Complete a branching case. 4) Do a 3-question viva. 5) Re-test with a similar item after the session.`);
}

function startSpeech(onResult: (transcript: string) => void) {
  const SpeechRecognition = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
  if (!SpeechRecognition) { alert(text('التعرف الصوتي غير مدعوم في هذا المتصفح. استخدم الكتابة الآن.', 'Speech recognition is not supported in this browser. Use text input for now.')); return; }
  const recognition = new SpeechRecognition();
  recognition.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event: any) => onResult(event.results[0][0].transcript as string);
  recognition.onerror = () => alert(text('تعذر التقاط الصوت. تحقق من إذن الميكروفون.', 'Voice capture failed. Check microphone permission.'));
  recognition.start();
}

function matchVoiceAnswer(transcript: string, options: string[]) {
  const normalized = transcript.toLowerCase().trim();
  const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, 'أ': 0, 'ب': 1, 'ج': 2, 'د': 3 };
  if (letterMap[normalized] !== undefined) return letterMap[normalized];
  const indexByText = options.findIndex((option) => normalized.includes(option.toLowerCase()) || option.toLowerCase().includes(normalized));
  return indexByText;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = reject; reader.readAsDataURL(file); });
}

root.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id === 'pdf-file') { uploadedFile = input.files?.[0] || null; importStatus = uploadedFile ? text('الملف جاهز للمعالجة.', 'File ready for processing.') : ''; render(); }
});

root.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id === 'anatomy-rotation') {
    anatomyRotation = Number(input.value);
    document.querySelector<HTMLElement>('.anatomy-stage')?.style.setProperty('--rot', `${anatomyRotation}deg`);
  }
});

root.addEventListener('click', async (event) => {
  const element = (event.target as HTMLElement).closest<HTMLElement>('[data-action],[data-view],[data-answer],[data-case],[data-case-answer],[data-anatomy]');
  if (!element) return;
  const action = element.dataset.action;
  if (element.dataset.view) { view = element.dataset.view as View; render(); return; }
  if (element.dataset.case !== undefined) { activeCaseIndex = Number(element.dataset.case); activeCaseNode = 0; caseSelected = null; caseScore = 0; render(); return; }
  if (element.dataset.anatomy !== undefined) { activeAnatomy = Number(element.dataset.anatomy); anatomyRotation = 0; render(); return; }
  if (element.dataset.answer !== undefined) { scoreQuestion(Number(element.dataset.answer)); render(); return; }
  if (element.dataset.caseAnswer !== undefined && caseSelected === null) { caseSelected = Number(element.dataset.caseAnswer); if (caseSelected === branchingCases[activeCaseIndex].nodes[activeCaseNode].correct) caseScore += 1; render(); return; }
  if (action === 'lang') { lang = lang === 'ar' ? 'en' : 'ar'; localStorage.setItem('sq_lang', lang); render(); return; }
  if (action === 'reset') { localStorage.removeItem('sq_stats'); localStorage.removeItem('sq_knowledge'); render(); return; }
  if (action === 'start') { view = 'quiz'; index = 0; sessionScore = 0; selected = null; render(); return; }
  if (action === 'exit') { view = 'plan'; selected = null; render(); return; }
  if (action === 'next') { index += 1; selected = null; render(); return; }
  if (action === 'case-next') { activeCaseNode += 1; caseSelected = null; render(); return; }
  if (action === 'case-restart') { activeCaseNode = 0; caseSelected = null; caseScore = 0; render(); return; }
  if (action === 'reset-viva') { vivaTurns = []; render(); return; }
  if (action === 'voice-viva') { startSpeech((transcript) => { const area = document.querySelector<HTMLTextAreaElement>('#viva-answer'); if (area) area.value = transcript; }); return; }
  if (action === 'voice-answer') { const q = questions[index]; const options = lang === 'ar' ? q.arOptions : q.enOptions; startSpeech((transcript) => { const matched = matchVoiceAnswer(transcript, options); if (matched >= 0) { scoreQuestion(matched); render(); } else alert(text(`لم أتمكن من مطابقة: ${transcript}`, `Could not match: ${transcript}`)); }); return; }
  if (action === 'submit-viva') {
    const answer = document.querySelector<HTMLTextAreaElement>('#viva-answer')?.value.trim() || '';
    if (!answer) return;
    vivaTurns.push({ role: 'user', text: answer }); busy = true; render();
    try { const content = await callAI('viva', { answer, history: vivaTurns }); vivaTurns.push({ role: 'ai', text: content || localVivaFeedback(answer) }); }
    catch { vivaTurns.push({ role: 'ai', text: localVivaFeedback(answer) }); }
    busy = false; render(); return;
  }
  if (action === 'coach-ask') {
    const goal = document.querySelector<HTMLTextAreaElement>('#coach-prompt')?.value.trim() || '';
    if (!goal) return;
    busy = true; render();
    try { coachReply = await callAI('coach', { goal, knowledge: loadKnowledge() }) || localCoach(goal); } catch { coachReply = localCoach(goal); }
    busy = false; render(); return;
  }
  if (action === 'generate-pdf') {
    if (!uploadedFile) { importStatus = text('اختر ملف PDF أولًا.', 'Choose a PDF first.'); render(); return; }
    busy = true; importStatus = text('جاري استخراج النص وتكوين draft...', 'Extracting text and generating a draft...'); render();
    try {
      const fileBase64 = await fileToBase64(uploadedFile);
      const response = await fetch('/.netlify/functions/pdf-quiz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileBase64, title: uploadedFile.name, lang }) });
      const data = await response.json() as { questions?: GeneratedQuestion[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'PDF generation failed');
      generatedQuestions = data.questions || [];
      importStatus = text('تم إنشاء مسودة أسئلة. راجعها طبيًا قبل النشر.', 'Draft questions generated. Medical review is required before publishing.');
    } catch (error) { importStatus = `${text('تعذر التوليد الآن:', 'Generation unavailable:')} ${error instanceof Error ? error.message : String(error)}`; }
    busy = false; render(); return;
  }
  if (action === 'case-to-quiz') {
    const source = document.querySelector<HTMLTextAreaElement>('#case-source')?.value.trim() || '';
    if (!source) return;
    busy = true; importStatus = ''; render();
    try {
      const content = await callAI('case_to_quiz', { source });
      generatedQuestions = [{ question: text('Learning Case draft', 'Learning Case draft'), explanation: content }];
      importStatus = text('تم إنشاء draft من الحالة المنزوعة الهوية.', 'A de-identified learning-case draft was generated.');
    } catch {
      generatedQuestions = [{ question: text('Learning Case draft', 'Learning Case draft'), explanation: text(`حوّل هذه الحالة إلى: presentation → investigations → decision → operation → complication. المصدر: ${source}`, `Convert this case into: presentation → investigations → decision → operation → complication. Source: ${source}`) }];
      importStatus = text('تم إنشاء fallback محلي. فعّل HF_TOKEN للتوليد الذكي.', 'Local fallback created. Configure HF_TOKEN for AI generation.');
    }
    busy = false; render(); return;
  }
});

render();

import './styles.css';

type Lang = 'ar' | 'en';
type View = 'plan' | 'qbank' | 'curriculum' | 'performance' | 'quiz' | 'result';
type Stats = { done: number; correct: number; wrong: number };
type Question = {
  ar: string;
  en: string;
  arOptions: string[];
  enOptions: string[];
  correct: number;
  arExplanation: string;
  enExplanation: string;
};

const questions: Question[] = [
  {
    ar: 'أين يقع الفتق الإربي غير المباشر بالنسبة للأوعية الشرسوفية السفلية؟',
    en: 'Where does an indirect inguinal hernia lie in relation to the inferior epigastric vessels?',
    arOptions: ['أنسيًا', 'وحشيًا', 'خلفيًا', 'أمامها'],
    enOptions: ['Medial', 'Lateral', 'Posterior', 'Anterior'],
    correct: 1,
    arExplanation: 'يمر الفتق غير المباشر عبر الحلقة الإربية العميقة الواقعة وحشيًا للأوعية الشرسوفية السفلية.',
    enExplanation: 'An indirect hernia enters through the deep ring, lateral to the inferior epigastric vessels.',
  },
  {
    ar: 'ما هي حدود مثلث Hesselbach؟',
    en: "What are the boundaries of Hesselbach's triangle?",
    arOptions: ['الرباط الإربي، الوريد الفخذي، المستقيم', 'الرباط الإربي، الأوعية الشرسوفية السفلية، الحافة الوحشية للمستقيم', 'Cooper، lacunar، الوريد الفخذي', 'الحلقتان الإربيتان والرباط الإربي'],
    enOptions: ['Inguinal ligament, femoral vein, rectus', 'Inguinal ligament, inferior epigastric vessels, lateral rectus border', 'Cooper, lacunar, femoral vein', 'Deep ring, superficial ring, inguinal ligament'],
    correct: 1,
    arExplanation: 'يحده إنسيًا الحافة الوحشية للمستقيم، ووحشيًا الأوعية الشرسوفية السفلية، وأسفلًا الرباط الإربي.',
    enExplanation: 'It is bounded medially by the lateral rectus border, laterally by the inferior epigastric vessels, and inferiorly by the inguinal ligament.',
  },
  {
    ar: 'امرأة عمرها 65 عامًا لديها كتلة مؤلمة أسفل الرباط الإربي. ما التشخيص الأكثر احتمالًا؟',
    en: 'A 65-year-old woman has a tender mass below the inguinal ligament. What is the most likely diagnosis?',
    arOptions: ['فتق إربي غير مباشر', 'فتق فخذي', 'قيلة شريانية كاذبة', 'عقدة لمفية'],
    enOptions: ['Indirect inguinal hernia', 'Femoral hernia', 'Pseudoaneurysm', 'Lymph node'],
    correct: 1,
    arExplanation: 'الفتق الفخذي يظهر أسفل الرباط الإربي ويشيع نسبيًا في النساء الأكبر سنًا.',
    enExplanation: 'A femoral hernia presents below the inguinal ligament and is relatively more common in older women.',
  },
  {
    ar: 'أي تركيب يشكل الجدار الخلفي الأساسي للقناة الإربية؟',
    en: 'Which structure forms the main posterior wall of the inguinal canal?',
    arOptions: ['صفاق العضلة المائلة الخارجية', 'اللفافة المستعرضة', 'الرباط الإربي', 'غمد العضلة المستقيمة'],
    enOptions: ['External oblique aponeurosis', 'Transversalis fascia', 'Inguinal ligament', 'Rectus sheath'],
    correct: 1,
    arExplanation: 'اللفافة المستعرضة هي المكون الأساسي للجدار الخلفي للقناة الإربية.',
    enExplanation: 'The transversalis fascia forms the principal posterior wall of the inguinal canal.',
  },
  {
    ar: 'ما أكثر نوع فتق إربي شيوعًا في الرجال البالغين؟',
    en: 'What is the most common type of inguinal hernia in adult males?',
    arOptions: ['فخذي', 'إربي غير مباشر', 'إربي مباشر', 'سري'],
    enOptions: ['Femoral', 'Indirect inguinal', 'Direct inguinal', 'Umbilical'],
    correct: 1,
    arExplanation: 'الفتق الإربي غير المباشر هو الأكثر شيوعًا ضمن الفتوق الإربية.',
    enExplanation: 'Indirect inguinal hernia is the most common inguinal hernia type.',
  },
  {
    ar: 'أي علامة سريرية ترجح التهاب المرارة الحاد؟',
    en: 'Which clinical sign most strongly supports acute cholecystitis?',
    arOptions: ["Rovsing's sign", "Murphy's sign", 'Psoas sign', 'Grey Turner sign'],
    enOptions: ["Rovsing's sign", "Murphy's sign", 'Psoas sign', 'Grey Turner sign'],
    correct: 1,
    arExplanation: 'إيجابية Murphy sign تدعم تشخيص التهاب المرارة الحاد في السياق السريري المناسب.',
    enExplanation: 'A positive Murphy sign supports acute cholecystitis in the appropriate clinical context.',
  },
];

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root missing');

let lang: Lang = localStorage.getItem('sq_lang') === 'en' ? 'en' : 'ar';
let view: View = 'plan';
let index = 0;
let sessionScore = 0;
let selected: number | null = null;

const text = (ar: string, en: string) => (lang === 'ar' ? ar : en);

function loadStats(): Stats {
  try {
    const value = localStorage.getItem('sq_stats');
    if (!value) return { done: 0, correct: 0, wrong: 0 };
    const parsed = JSON.parse(value) as Partial<Stats>;
    return {
      done: Number(parsed.done) || 0,
      correct: Number(parsed.correct) || 0,
      wrong: Number(parsed.wrong) || 0,
    };
  } catch {
    return { done: 0, correct: 0, wrong: 0 };
  }
}

function saveStats(stats: Stats) {
  localStorage.setItem('sq_stats', JSON.stringify(stats));
}

function navigation() {
  if (view === 'quiz' || view === 'result') return '';
  const items: Array<[View, string, string]> = [
    ['plan', 'خطة اليوم', "Today's Plan"],
    ['qbank', 'بنك الأسئلة', 'QBank'],
    ['curriculum', 'المنهج', 'Curriculum'],
    ['performance', 'الأداء', 'Performance'],
  ];
  return `<nav class="card nav" aria-label="${text('التنقل الرئيسي', 'Main navigation')}">${items.map(([target, ar, en]) => `<button class="tab ${view === target ? 'active' : ''}" data-view="${target}" ${view === target ? 'aria-current="page"' : ''}>${text(ar, en)}</button>`).join('')}</nav>`;
}

function shell(content: string) {
  const stats = loadStats();
  const accuracy = stats.done ? `${Math.round((stats.correct / stats.done) * 100)}%` : '—';
  const hero = view === 'quiz' || view === 'result' ? '' : `
    <section class="hero">
      <div class="card hero-main">
        <span class="badge">${text('نسخة Beta للمشاركة', 'Shareable Beta')}</span>
        <h2>${text('تعلّم الجراحة بطريقة موجهة للامتحان، وليس بحفظ الأسئلة.', 'Learn surgery for the exam — not by memorizing question banks.')}</h2>
        <p>${text('نعيد بناء SurgiQuiz حول المحتوى المراجع، المناهج الموثقة، والتفكير السريري.', 'We are rebuilding SurgiQuiz around reviewed content, documented curricula, and clinical reasoning.')}</p>
        <div class="hero-actions"><button class="btn primary" data-action="start">${text('ابدأ اختبارًا تجريبيًا', 'Start demo quiz')}</button></div>
        <div class="notice">${text('هذه نسخة مشاركة مبكرة وليست بنك الأسئلة النهائي المعتمد.', 'This is an early shareable preview, not the final verified question bank.')}</div>
      </div>
      <div class="card stats">
        <div class="stat"><b>1,895</b><span>${text('مرشح Core للمراجعة', 'Core review candidates')}</span></div>
        <div class="stat"><b>3</b><span>${text('مسارات تدريب', 'Training tracks')}</span></div>
        <div class="stat"><b>${stats.done}</b><span>${text('أسئلة أجبتها في الـBeta', 'Beta questions answered')}</span></div>
        <div class="stat"><b>${accuracy}</b><span>${text('دقة الـDemo', 'Demo accuracy')}</span></div>
      </div>
    </section>`;

  return `<div class="wrap">
    <header class="top">
      <div class="brand"><div class="logo" aria-hidden="true">✚</div><div><h1>SurgiQuiz</h1><p>${text('منصة التحضير للامتحانات الجراحية', 'Surgical board preparation platform')}</p></div></div>
      <div class="actions"><button class="btn" data-action="lang" aria-label="${text('التبديل إلى الإنجليزية', 'Switch to Arabic')}">${lang === 'ar' ? 'EN' : 'AR'}</button><button class="btn" data-action="reset">${text('إعادة التقدم', 'Reset progress')}</button></div>
    </header>
    ${hero}
    ${navigation()}
    ${content}
    <footer class="footer">SurgiQuiz Beta · Educational use only · Public preview</footer>
  </div>`;
}

function renderPlan() {
  const stats = loadStats();
  return `<main><div class="grid">
    <section class="card panel"><h3>${text('خطة اليوم', "Today's Plan")}</h3><p class="small">${text('خطة قصيرة قابلة للتنفيذ بدل الاختيار العشوائي للأسئلة.', 'A focused plan instead of random question selection.')}</p><div class="plan">
      <div class="plan-row"><div><b>${text('أسئلة جديدة', 'New questions')}</b><div><span>General Surgery · Core</span></div></div><strong>10</strong></div>
      <div class="plan-row"><div><b>${text('مراجعة الأخطاء', 'Review mistakes')}</b><div><span>Spaced review</span></div></div><strong>${stats.wrong}</strong></div>
      <div class="plan-row"><div><b>${text('حالة سريرية', 'Clinical case')}</b><div><span>Clinical reasoning</span></div></div><strong>1</strong></div>
    </div><button class="btn primary" style="width:100%;margin-top:16px" data-action="start">${text('ابدأ خطة اليوم', "Start today's plan")}</button></section>
    <section class="card panel"><h3>${text('مسار الامتحان', 'Exam Track')}</h3><div class="plan">
      <div class="plan-row"><div><b>Arab Board</b><div><span>Preliminary / Final Knowledge</span></div></div><span class="badge">Core</span></div>
      <div class="plan-row"><div><b>Yemeni Board</b><div><span>${text('Blueprint قيد التوثيق', 'Blueprint verification in progress')}</span></div></div><span>Draft</span></div>
      <div class="plan-row"><div><b>Professional Master</b><div><span>${text('Blueprint قيد التوثيق', 'Blueprint verification in progress')}</span></div></div><span>Draft</span></div>
    </div></section>
  </div></main>`;
}

function renderQbank() {
  return `<main><section class="card panel"><h3>${text('بنك الأسئلة', 'Question Bank')}</h3><p class="small">${text('في النسخة النهائية لن يظهر للطلاب إلا المحتوى الذي اجتاز Editorial Review وMedical Review وPublication Gate.', 'The final product will expose only content that passes editorial review, medical review, and the publication gate.')}</p><div class="status-grid"><div class="status-item"><b>1,583</b><span>${text('اجتازت الفرز الآلي المبدئي', 'Automated triage pass')}</span></div><div class="status-item"><b>312</b><span>${text('تحتاج مراجعة إضافية', 'Need additional review')}</span></div><div class="status-item"><b>0</b><span>${text('لا تعتبر معتمدة طبيًا تلقائيًا', 'Automatically medically approved')}</span></div></div><div class="notice">${text('الفرز الآلي لا يساوي الاعتماد الطبي. كل سؤال نهائي يحتاج مراجعة بشرية.', 'Automated triage is not medical approval. Final content requires human review.')}</div><button class="btn primary" style="margin-top:16px" data-action="start">${text('جرّب أسئلة الـDemo', 'Try demo questions')}</button></section></main>`;
}

function renderCurriculum() {
  return `<main><div class="grid">
    <section class="card panel"><h3>Arab Board · 2026</h3><p class="small">${text('نفصل الحقائق المنشورة رسميًا عن تصنيفات SurgiQuiz الداخلية.', 'We separate officially published facts from SurgiQuiz internal taxonomy.')}</p><div class="plan">
      <div class="plan-row"><div><b>Preliminary</b><div><span>${text('بالإنجليزية · إلكتروني', 'English · electronic')}</span></div></div><strong>2 × 100 MCQ</strong></div>
      <div class="plan-row"><div><b>Final Knowledge</b><div><span>${text('بالإنجليزية · إلكتروني', 'English · electronic')}</span></div></div><strong>2 × 100 MCQ</strong></div>
      <div class="plan-row"><div><b>${text('زمن كل ورقة', 'Time per paper')}</b><div><span>${text('بحسب الصيغة المنشورة لعام 2026', 'Published 2026 format')}</span></div></div><strong>150 min</strong></div>
    </div><div class="notice">${text('لا نختلق أوزانًا للمواضيع غير المنشورة رسميًا.', 'We do not invent unpublished topic weights.')}</div></section>
    <section class="card panel"><h3>${text('حالة الربط', 'Mapping status')}</h3><div class="plan">
      <div class="plan-row"><div><b>1,895</b><div><span>Core candidates</span></div></div><span class="badge">Mapped</span></div>
      <div class="plan-row"><div><b>627</b><div><span>${text('اقتراحات Preliminary صريحة', 'Explicit Preliminary suggestions')}</span></div></div><span>${text('غير معتمدة', 'Unverified')}</span></div>
      <div class="plan-row"><div><b>Yemeni Board</b><div><span>${text('بانتظار Blueprint رسمي تفصيلي', 'Awaiting detailed official blueprint')}</span></div></div><span>Draft</span></div>
      <div class="plan-row"><div><b>Professional Master</b><div><span>${text('بانتظار Blueprint رسمي تفصيلي', 'Awaiting detailed official blueprint')}</span></div></div><span>Draft</span></div>
    </div></section>
  </div></main>`;
}

function renderPerformance() {
  const stats = loadStats();
  const accuracy = stats.done ? `${Math.round((stats.correct / stats.done) * 100)}%` : '—';
  return `<main><section class="card panel"><h3>${text('الأداء', 'Performance')}</h3><p class="small">${text('هذه الإحصاءات خاصة بالـDemo ومحفوظة محليًا في جهازك، ولا تمثل Readiness Score.', 'These are local demo statistics and are not a readiness score.')}</p><div class="grid" style="margin-top:16px"><div class="stat"><b>${stats.done}</b><span>${text('إجمالي الإجابات', 'Total answers')}</span></div><div class="stat"><b>${accuracy}</b><span>${text('الدقة', 'Accuracy')}</span></div></div><div style="margin-top:16px"><div class="small">${text('تقدم Demo Core', 'Demo Core progress')}</div><div class="progress"><i style="width:${Math.min(100, Math.round((stats.done / 20) * 100))}%"></i></div></div></section></main>`;
}

function renderQuiz() {
  const question = questions[index];
  if (!question) {
    view = 'result';
    render();
    return;
  }
  const options = lang === 'ar' ? question.arOptions : question.enOptions;
  root.innerHTML = shell(`<main><section class="card quiz">
    <div class="qmeta"><span>${text('سؤال', 'Question')} ${index + 1} / ${questions.length}</span><span>General Surgery · Core Preview</span></div>
    <div class="qtext">${lang === 'ar' ? question.ar : question.en}</div>
    <div class="options">${options.map((option, optionIndex) => `<button class="opt ${selected !== null && optionIndex === question.correct ? 'correct' : ''} ${selected === optionIndex && optionIndex !== question.correct ? 'wrong' : ''}" data-answer="${optionIndex}" ${selected !== null ? 'disabled' : ''}>${String.fromCharCode(65 + optionIndex)}. ${option}</button>`).join('')}</div>
    ${selected !== null ? `<div class="explain"><b>${text('الشرح', 'Explanation')}</b><br>${lang === 'ar' ? question.arExplanation : question.enExplanation}</div>` : ''}
    <div class="quiz-actions"><button class="btn" data-action="exit">${text('خروج', 'Exit')}</button><button class="btn primary" data-action="next" ${selected === null ? 'disabled' : ''}>${text('التالي', 'Next')}</button></div>
  </section></main>`);
}

function renderResult() {
  root.innerHTML = shell(`<main><section class="card result"><div class="score">${Math.round((sessionScore / questions.length) * 100)}%</div><h2>${text('اكتمل الاختبار التجريبي', 'Demo completed')}</h2><p class="small">${text(`إجابات صحيحة: ${sessionScore} من ${questions.length}`, `Correct answers: ${sessionScore} of ${questions.length}`)}</p><div class="hero-actions" style="justify-content:center"><button class="btn primary" data-action="start">${text('أعد الاختبار', 'Retry')}</button><button class="btn" data-view="performance">${text('عرض الأداء', 'View performance')}</button></div></section></main>`);
}

function render() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (view === 'quiz') return renderQuiz();
  if (view === 'result') return renderResult();
  const content = view === 'qbank' ? renderQbank() : view === 'curriculum' ? renderCurriculum() : view === 'performance' ? renderPerformance() : renderPlan();
  root.innerHTML = shell(content);
}

root.addEventListener('click', (event) => {
  const element = (event.target as HTMLElement).closest<HTMLElement>('[data-action],[data-view],[data-answer]');
  if (!element) return;
  const action = element.dataset.action;
  if (action === 'lang') {
    lang = lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('sq_lang', lang);
    render();
    return;
  }
  if (action === 'reset') {
    localStorage.removeItem('sq_stats');
    render();
    return;
  }
  if (action === 'start') {
    view = 'quiz';
    index = 0;
    sessionScore = 0;
    selected = null;
    render();
    return;
  }
  if (action === 'exit') {
    view = 'plan';
    selected = null;
    render();
    return;
  }
  if (action === 'next') {
    index += 1;
    selected = null;
    render();
    return;
  }
  if (element.dataset.view) {
    view = element.dataset.view as View;
    render();
    return;
  }
  if (element.dataset.answer !== undefined && selected === null) {
    selected = Number(element.dataset.answer);
    const question = questions[index];
    const stats = loadStats();
    stats.done += 1;
    if (selected === question.correct) {
      sessionScore += 1;
      stats.correct += 1;
    } else {
      stats.wrong += 1;
    }
    saveStats(stats);
    render();
  }
});

render();

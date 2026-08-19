export type Locale = 'en' | 'ar' | 'fr' | 'es';
export type ExamTrack = 'global-core' | 'mrcs' | 'absite' | 'arab-board' | 'custom';

export type GlobalProfile = {
  locale: Locale;
  region: string;
  examTrack: ExamTrack;
};

export const locales: Array<{ id: Locale; label: string; native: string; dir: 'ltr' | 'rtl'; status: 'full' | 'interface' }> = [
  { id: 'en', label: 'English', native: 'English', dir: 'ltr', status: 'full' },
  { id: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl', status: 'full' },
  { id: 'fr', label: 'French', native: 'Français', dir: 'ltr', status: 'interface' },
  { id: 'es', label: 'Spanish', native: 'Español', dir: 'ltr', status: 'interface' },
];

export const examTracks: Array<{ id: ExamTrack; title: string; subtitle: string }> = [
  { id: 'global-core', title: 'Global General Surgery Core', subtitle: 'Broad surgical knowledge and clinical reasoning' },
  { id: 'mrcs', title: 'MRCS-oriented', subtitle: 'UK-style surgical sciences and clinical reasoning profile' },
  { id: 'absite', title: 'ABSITE-oriented', subtitle: 'US residency in-training examination profile' },
  { id: 'arab-board', title: 'Arab Board-oriented', subtitle: 'General surgery board preparation profile' },
  { id: 'custom', title: 'Custom / Institution', subtitle: 'Build a personalized curriculum profile' },
];

const ui: Record<Locale, Record<string, string>> = {
  en: {
    global: 'Global', language: 'Language', region: 'Region', examTrack: 'Exam track', save: 'Save profile',
    globalSettings: 'Global learning profile', globalSettingsBody: 'Personalize language, region and exam orientation. Medical content falls back to reviewed English when a translation is unavailable.',
    interfacePreview: 'Interface preview', fullContent: 'Full interface + content', settingsSaved: 'Global profile saved.',
    todaysPlan: "Today's Plan", qbank: 'QBank', cases: 'Cases', viva: 'AI Viva', anatomy: 'Anatomy', coach: 'AI Coach', import: 'PDF / Case', performance: 'Performance',
    startQuiz: 'Start quiz', surgicalAnatomy: 'Surgical Anatomy', adaptiveLearning: 'Adaptive Surgical Learning',
    hero: 'Surgical learning that adapts to your weaknesses, exam goals, and clinical exposure.',
    heroBody: 'MCQs, branching cases, voice viva, surgical anatomy, and an AI coach in one global learning loop.',
    educational: 'Educational use only. AI output requires review and must not be used for patient-care decisions.',
    resetProgress: 'Reset progress', attempts: 'Attempts', accuracy: 'Accuracy', branchingCases: 'Branching cases', anatomyModules: 'Anatomy modules',
  },
  ar: {
    global: 'عالمي', language: 'اللغة', region: 'المنطقة', examTrack: 'مسار الامتحان', save: 'حفظ الملف',
    globalSettings: 'الملف التعليمي العالمي', globalSettingsBody: 'خصص اللغة والمنطقة ومسار الامتحان. عند غياب ترجمة موثوقة للمحتوى الطبي سيظهر المحتوى الإنجليزي المراجع.',
    interfacePreview: 'معاينة واجهة', fullContent: 'واجهة ومحتوى كاملان', settingsSaved: 'تم حفظ الملف العالمي.',
    todaysPlan: 'خطة اليوم', qbank: 'الأسئلة', cases: 'الحالات', viva: 'Viva AI', anatomy: 'التشريح', coach: 'المدرب', import: 'PDF / Case', performance: 'الأداء',
    startQuiz: 'ابدأ اختبارًا', surgicalAnatomy: 'التشريح الجراحي', adaptiveLearning: 'Adaptive Surgical Learning',
    hero: 'تعلّم جراحي يتكيّف مع نقاط ضعفك وهدفك الامتحاني وخبرتك السريرية.',
    heroBody: 'MCQ + حالات متفرعة + Viva صوتي + Surgical Anatomy + AI Coach في مسار عالمي واحد.',
    educational: 'للاستخدام التعليمي فقط. مخرجات الذكاء الاصطناعي تحتاج مراجعة ولا تستخدم لاتخاذ قرار علاجي لمريض.',
    resetProgress: 'إعادة التقدم', attempts: 'محاولة', accuracy: 'الدقة', branchingCases: 'حالات متفرعة', anatomyModules: 'وحدات تشريح',
  },
  fr: {
    global: 'Global', language: 'Langue', region: 'Région', examTrack: "Parcours d'examen", save: 'Enregistrer',
    globalSettings: "Profil d'apprentissage global", globalSettingsBody: "Personnalisez la langue, la région et l'orientation de l'examen. Le contenu médical revient à l'anglais validé lorsqu'une traduction n'est pas disponible.",
    interfacePreview: "Aperçu de l'interface", fullContent: 'Interface + contenu complets', settingsSaved: 'Profil global enregistré.',
    todaysPlan: 'Plan du jour', qbank: 'QBank', cases: 'Cas', viva: 'Viva IA', anatomy: 'Anatomie', coach: 'Coach IA', import: 'PDF / Cas', performance: 'Performance',
    startQuiz: 'Commencer', surgicalAnatomy: 'Anatomie chirurgicale', adaptiveLearning: 'Apprentissage chirurgical adaptatif',
    hero: "Un apprentissage chirurgical adapté à vos faiblesses, objectifs d'examen et exposition clinique.",
    heroBody: 'QCM, cas à embranchements, viva vocal, anatomie chirurgicale et coach IA dans une seule boucle.',
    educational: "Usage éducatif uniquement. Les sorties IA nécessitent une vérification et ne doivent pas guider les soins d'un patient.",
    resetProgress: 'Réinitialiser', attempts: 'Tentatives', accuracy: 'Précision', branchingCases: 'Cas à embranchements', anatomyModules: "Modules d'anatomie",
  },
  es: {
    global: 'Global', language: 'Idioma', region: 'Región', examTrack: 'Ruta de examen', save: 'Guardar perfil',
    globalSettings: 'Perfil global de aprendizaje', globalSettingsBody: 'Personaliza idioma, región y orientación del examen. El contenido médico usa inglés revisado cuando no hay una traducción disponible.',
    interfacePreview: 'Vista previa de interfaz', fullContent: 'Interfaz + contenido completos', settingsSaved: 'Perfil global guardado.',
    todaysPlan: 'Plan de hoy', qbank: 'QBank', cases: 'Casos', viva: 'Viva IA', anatomy: 'Anatomía', coach: 'Coach IA', import: 'PDF / Caso', performance: 'Rendimiento',
    startQuiz: 'Iniciar prueba', surgicalAnatomy: 'Anatomía quirúrgica', adaptiveLearning: 'Aprendizaje quirúrgico adaptativo',
    hero: 'Aprendizaje quirúrgico que se adapta a tus debilidades, objetivos de examen y exposición clínica.',
    heroBody: 'MCQ, casos ramificados, viva por voz, anatomía quirúrgica y coach IA en un solo ciclo global.',
    educational: 'Solo para uso educativo. La salida de IA requiere revisión y no debe utilizarse para decisiones de atención al paciente.',
    resetProgress: 'Restablecer progreso', attempts: 'Intentos', accuracy: 'Precisión', branchingCases: 'Casos ramificados', anatomyModules: 'Módulos de anatomía',
  },
};

export function t(locale: Locale, key: string): string {
  return ui[locale]?.[key] ?? ui.en[key] ?? key;
}

export function detectLocale(): Locale {
  const saved = localStorage.getItem('sq_locale') as Locale | null;
  if (saved && locales.some((item) => item.id === saved)) return saved;
  const browser = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
  if (browser.startsWith('ar')) return 'ar';
  if (browser.startsWith('fr')) return 'fr';
  if (browser.startsWith('es')) return 'es';
  return 'en';
}

export function loadGlobalProfile(): GlobalProfile {
  const locale = detectLocale();
  try {
    const parsed = JSON.parse(localStorage.getItem('sq_global_profile') || '{}') as Partial<GlobalProfile>;
    return {
      locale: parsed.locale && locales.some((x) => x.id === parsed.locale) ? parsed.locale : locale,
      region: parsed.region || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Global',
      examTrack: parsed.examTrack && examTracks.some((x) => x.id === parsed.examTrack) ? parsed.examTrack : 'global-core',
    };
  } catch {
    return { locale, region: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Global', examTrack: 'global-core' };
  }
}

export function saveGlobalProfile(profile: GlobalProfile) {
  localStorage.setItem('sq_locale', profile.locale);
  localStorage.setItem('sq_global_profile', JSON.stringify(profile));
}

export type Lang = 'ar' | 'en';

export type Question = {
  id: string;
  category: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ar: string;
  en: string;
  arOptions: string[];
  enOptions: string[];
  correct: number;
  arExplanation: string;
  enExplanation: string;
};

export const questions: Question[] = [
  {
    id: 'hernia-001', category: 'Hernia', topic: 'Inguinal anatomy', difficulty: 'easy',
    ar: 'أين يقع الفتق الإربي غير المباشر بالنسبة للأوعية الشرسوفية السفلية؟',
    en: 'Where does an indirect inguinal hernia lie in relation to the inferior epigastric vessels?',
    arOptions: ['أنسيًا', 'وحشيًا', 'خلفيًا', 'أمامها'],
    enOptions: ['Medial', 'Lateral', 'Posterior', 'Anterior'], correct: 1,
    arExplanation: 'يمر الفتق غير المباشر عبر الحلقة الإربية العميقة الواقعة وحشيًا للأوعية الشرسوفية السفلية.',
    enExplanation: 'An indirect hernia enters through the deep ring, lateral to the inferior epigastric vessels.',
  },
  {
    id: 'hernia-002', category: 'Hernia', topic: 'Inguinal anatomy', difficulty: 'medium',
    ar: 'ما هي حدود مثلث Hesselbach؟', en: "What are the boundaries of Hesselbach's triangle?",
    arOptions: ['الرباط الإربي، الوريد الفخذي، المستقيم', 'الرباط الإربي، الأوعية الشرسوفية السفلية، الحافة الوحشية للمستقيم', 'Cooper، lacunar، الوريد الفخذي', 'الحلقتان الإربيتان والرباط الإربي'],
    enOptions: ['Inguinal ligament, femoral vein, rectus', 'Inguinal ligament, inferior epigastric vessels, lateral rectus border', 'Cooper, lacunar, femoral vein', 'Deep ring, superficial ring, inguinal ligament'], correct: 1,
    arExplanation: 'يحده إنسيًا الحافة الوحشية للمستقيم، ووحشيًا الأوعية الشرسوفية السفلية، وأسفلًا الرباط الإربي.',
    enExplanation: 'It is bounded medially by the lateral rectus border, laterally by the inferior epigastric vessels, and inferiorly by the inguinal ligament.',
  },
  {
    id: 'hernia-003', category: 'Hernia', topic: 'Femoral hernia', difficulty: 'easy',
    ar: 'امرأة عمرها 65 عامًا لديها كتلة مؤلمة أسفل الرباط الإربي. ما التشخيص الأكثر احتمالًا؟',
    en: 'A 65-year-old woman has a tender mass below the inguinal ligament. What is the most likely diagnosis?',
    arOptions: ['فتق إربي غير مباشر', 'فتق فخذي', 'قيلة شريانية كاذبة', 'عقدة لمفية'],
    enOptions: ['Indirect inguinal hernia', 'Femoral hernia', 'Pseudoaneurysm', 'Lymph node'], correct: 1,
    arExplanation: 'الفتق الفخذي يظهر أسفل الرباط الإربي ويشيع نسبيًا في النساء الأكبر سنًا.',
    enExplanation: 'A femoral hernia presents below the inguinal ligament and is relatively more common in older women.',
  },
  {
    id: 'biliary-001', category: 'Hepatobiliary', topic: 'Acute cholecystitis', difficulty: 'easy',
    ar: 'أي علامة سريرية ترجح التهاب المرارة الحاد؟', en: 'Which clinical sign most strongly supports acute cholecystitis?',
    arOptions: ["Rovsing's sign", "Murphy's sign", 'Psoas sign', 'Grey Turner sign'],
    enOptions: ["Rovsing's sign", "Murphy's sign", 'Psoas sign', 'Grey Turner sign'], correct: 1,
    arExplanation: 'إيجابية Murphy sign تدعم تشخيص التهاب المرارة الحاد في السياق السريري المناسب.',
    enExplanation: 'A positive Murphy sign supports acute cholecystitis in the appropriate clinical context.',
  },
  {
    id: 'biliary-002', category: 'Hepatobiliary', topic: 'Biliary anatomy', difficulty: 'medium',
    ar: 'أثناء استئصال المرارة بالمنظار، ما الهدف الأساسي من Critical View of Safety؟',
    en: 'During laparoscopic cholecystectomy, what is the primary purpose of the Critical View of Safety?',
    arOptions: ['تحديد القناة والشريان المراريين قبل القطع', 'تحديد الوريد البابي', 'إظهار القناة البنكرياسية', 'تحديد الشريان المعدي الأيمن'],
    enOptions: ['Identify the cystic duct and cystic artery before division', 'Identify the portal vein', 'Expose the pancreatic duct', 'Identify the right gastric artery'], correct: 0,
    arExplanation: 'الغرض هو تقليل أخطاء التعرف على البنى قبل clip/division عبر إثبات البنى التي تدخل المرارة.',
    enExplanation: 'The goal is to reduce misidentification injury by confirming the structures entering the gallbladder before clipping or division.',
  },
  {
    id: 'thyroid-001', category: 'Thyroid & Endocrine', topic: 'Thyroid anatomy', difficulty: 'medium',
    ar: 'أي عصب يجب التعرف عليه وحمايته أثناء استئصال الغدة الدرقية لتقليل خطر شلل الحبل الصوتي؟',
    en: 'Which nerve should be identified and protected during thyroidectomy to reduce the risk of vocal cord paralysis?',
    arOptions: ['العصب الحجابي', 'العصب الحنجري الراجع', 'العصب تحت اللسان', 'العصب الإضافي'],
    enOptions: ['Phrenic nerve', 'Recurrent laryngeal nerve', 'Hypoglossal nerve', 'Accessory nerve'], correct: 1,
    arExplanation: 'العصب الحنجري الراجع بنية حرجة أثناء جراحة الدرق، مع ضرورة مراعاة اختلاف مساره التشريحي.',
    enExplanation: 'The recurrent laryngeal nerve is a critical structure in thyroid surgery, with clinically important anatomic variation.',
  },
];

export type CaseNode = { id: string; promptAr: string; promptEn: string; optionsAr: string[]; optionsEn: string[]; correct: number; next?: string; explanationAr: string; explanationEn: string };
export type BranchingCase = { id: string; category: string; titleAr: string; titleEn: string; stemAr: string; stemEn: string; nodes: CaseNode[] };

export const branchingCases: BranchingCase[] = [
  {
    id: 'acute-cholecystitis', category: 'Hepatobiliary', titleAr: 'التهاب مرارة حاد', titleEn: 'Acute cholecystitis',
    stemAr: 'مريضة 48 سنة لديها ألم بالربع العلوي الأيمن مع حرارة وارتفاع كريات الدم البيضاء.',
    stemEn: 'A 48-year-old woman presents with right upper quadrant pain, fever, and leukocytosis.',
    nodes: [
      { id: 'n1', promptAr: 'ما الفحص التصويري الأول في هذا السياق؟', promptEn: 'What is the first-line imaging test in this context?', optionsAr: ['CT مباشرة', 'Ultrasound', 'MRCP لكل المرضى', 'لا حاجة للتصوير'], optionsEn: ['Immediate CT', 'Ultrasound', 'MRCP for every patient', 'No imaging needed'], correct: 1, next: 'n2', explanationAr: 'Ultrasound هو الفحص الأول المعتاد لتقييم حصوات المرارة وعلامات الالتهاب.', explanationEn: 'Ultrasound is the usual first-line test to assess gallstones and inflammatory features.' },
      { id: 'n2', promptAr: 'إذا ثبت التشخيص وكانت المريضة مناسبة للجراحة، ما الاستراتيجية المعتادة؟', promptEn: 'If the diagnosis is confirmed and the patient is fit for surgery, what is the usual strategy?', optionsAr: ['تأجيل الجراحة دائمًا 6 أسابيع', 'Early laparoscopic cholecystectomy خلال الدخول الحالي عند الملاءمة', 'مضادات حيوية فقط دائمًا', 'فتح جراحي روتيني'], optionsEn: ['Always delay surgery for 6 weeks', 'Early laparoscopic cholecystectomy during the index admission when appropriate', 'Antibiotics alone in all cases', 'Routine open surgery'], correct: 1, explanationAr: 'النهج المبكر خلال الدخول الحالي شائع عند المرضى المناسبين، مع مراعاة شدة المرض والموارد والخبرة.', explanationEn: 'Early surgery during the index admission is commonly used in suitable patients, with severity, resources, and expertise considered.' },
    ],
  },
  {
    id: 'post-thyroidectomy', category: 'Thyroid & Endocrine', titleAr: 'تدهور بعد استئصال الدرق', titleEn: 'Post-thyroidectomy deterioration',
    stemAr: 'بعد استئصال الدرق بساعتين، تطور لدى المريض تورم سريع بالعنق وضيق نفس متزايد.',
    stemEn: 'Two hours after thyroidectomy, a patient develops rapidly increasing neck swelling and respiratory distress.',
    nodes: [
      { id: 'n1', promptAr: 'ما المشكلة التي يجب التعامل معها كحالة طارئة؟', promptEn: 'Which problem must be treated as an immediate emergency?', optionsAr: ['Seroma بسيط', 'Neck hematoma with airway compromise', 'التهاب جرح', 'نقص كالسيوم خفيف'], optionsEn: ['Simple seroma', 'Neck hematoma with airway compromise', 'Wound infection', 'Mild hypocalcemia'], correct: 1, next: 'n2', explanationAr: 'الورم الدموي الضاغط بعد جراحة الدرق قد يهدد مجرى الهواء ويتطلب استجابة فورية.', explanationEn: 'A compressive neck hematoma after thyroid surgery can threaten the airway and requires immediate response.' },
      { id: 'n2', promptAr: 'ما المبدأ الأول في التدبير؟', promptEn: 'What is the first management principle?', optionsAr: ['تأجيل التقييم حتى التصوير', 'Airway-first emergency management and urgent decompression/escalation', 'إعطاء مسكن وخروج', 'مراقبة منزلية'], optionsEn: ['Delay assessment until imaging', 'Airway-first emergency management with urgent decompression/escalation', 'Analgesia and discharge', 'Home observation'], correct: 1, explanationAr: 'الأولوية لمجرى الهواء والاستجابة الجراحية العاجلة وفق بروتوكول المؤسسة.', explanationEn: 'Airway protection and urgent surgical response are the priority, following institutional emergency protocol.' },
    ],
  },
];

export type AnatomyModule = {
  id: string;
  category: string;
  titleAr: string;
  titleEn: string;
  image: string;
  procedureAr: string;
  procedureEn: string;
  structures: { ar: string; en: string }[];
  dangerAr: string[];
  dangerEn: string[];
};

export const anatomyModules: AnatomyModule[] = [
  {
    id: 'biliary', category: 'Hepatobiliary', titleAr: 'التشريح الجراحي للطرق الصفراوية', titleEn: 'Biliary surgical anatomy', image: '/anatomy/biliary.svg',
    procedureAr: 'استئصال المرارة بالمنظار', procedureEn: 'Laparoscopic cholecystectomy',
    structures: [{ ar: 'القناة المرارية', en: 'Cystic duct' }, { ar: 'الشريان المراري', en: 'Cystic artery' }, { ar: 'القناة الكبدية المشتركة', en: 'Common hepatic duct' }, { ar: 'القناة الصفراوية المشتركة', en: 'Common bile duct' }, { ar: 'الشريان الكبدي الأيمن', en: 'Right hepatic artery' }],
    dangerAr: ['خطأ التعرف على القناة الصفراوية المشتركة كقناة مرارية', 'تباينات الشريان الكبدي الأيمن', 'النزف الذي يطمس المعالم التشريحية'],
    dangerEn: ['Mistaking the common bile duct for the cystic duct', 'Right hepatic artery variants', 'Bleeding that obscures anatomic landmarks'],
  },
  {
    id: 'inguinal', category: 'Hernia', titleAr: 'تشريح القناة الإربية', titleEn: 'Inguinal canal anatomy', image: '/anatomy/inguinal.svg',
    procedureAr: 'إصلاح الفتق الإربي', procedureEn: 'Inguinal hernia repair',
    structures: [{ ar: 'الأوعية الشرسوفية السفلية', en: 'Inferior epigastric vessels' }, { ar: 'الحلقة الإربية العميقة', en: 'Deep inguinal ring' }, { ar: 'الرباط الإربي', en: 'Inguinal ligament' }, { ar: 'اللفافة المستعرضة', en: 'Transversalis fascia' }],
    dangerAr: ['الأعصاب الإربية أثناء الإصلاح المفتوح', 'الأوعية الشرسوفية السفلية أثناء الوصول', 'مكونات الحبل المنوي'],
    dangerEn: ['Inguinal nerves during open repair', 'Inferior epigastric vessels during access', 'Spermatic cord structures'],
  },
  {
    id: 'thyroid', category: 'Thyroid & Endocrine', titleAr: 'تشريح جراحة الغدة الدرقية', titleEn: 'Thyroid surgical anatomy', image: '/anatomy/thyroid.svg',
    procedureAr: 'استئصال الغدة الدرقية', procedureEn: 'Thyroidectomy',
    structures: [{ ar: 'العصب الحنجري الراجع', en: 'Recurrent laryngeal nerve' }, { ar: 'الغدد جارات الدرق', en: 'Parathyroid glands' }, { ar: 'الشريان الدرقي السفلي', en: 'Inferior thyroid artery' }, { ar: 'العصب الحنجري العلوي الخارجي', en: 'External branch of superior laryngeal nerve' }],
    dangerAr: ['إصابة العصب الحنجري الراجع', 'تروية جارات الدرق', 'الفرع الخارجي للعصب الحنجري العلوي عند القطب العلوي'],
    dangerEn: ['Recurrent laryngeal nerve injury', 'Parathyroid devascularization', 'External superior laryngeal nerve near the superior pole'],
  },
];

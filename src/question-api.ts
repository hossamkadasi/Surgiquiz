import type { Question } from './content';

type ApiOption = { index: number; en: string; ar: string | null };
type ApiQuestion = { id: string; category: string | null; topic: string | null; difficulty: string | null; en_stem: string; ar_stem: string | null; options: ApiOption[] };
type ApiAnswer = { id: string; correct_index: number; en_explanation: string | null; ar_explanation: string | null };

export type RemoteQuestion = Question & { remote: true; answerLoaded: boolean };

export async function loadPublishedQuestions(limit = 20): Promise<RemoteQuestion[]> {
  const response = await fetch('/.netlify/functions/questions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', limit, seed: `${Date.now()}-${Math.random()}` }),
  });
  if (!response.ok) throw new Error('Question service unavailable');
  const data = await response.json() as { questions?: ApiQuestion[] };
  return (data.questions || []).map((q) => ({
    id: q.id,
    category: q.category || 'General Surgery',
    topic: q.topic || 'General Surgery',
    difficulty: q.difficulty === 'easy' || q.difficulty === 'hard' ? q.difficulty : 'medium',
    ar: q.ar_stem || q.en_stem,
    en: q.en_stem,
    arOptions: (q.options || []).map((o) => o.ar || o.en),
    enOptions: (q.options || []).map((o) => o.en),
    correct: -1,
    arExplanation: '', enExplanation: '', remote: true, answerLoaded: false,
  }));
}

export async function loadPublishedAnswer(questionId: string): Promise<ApiAnswer | null> {
  const response = await fetch('/.netlify/functions/questions', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'answer', questionId }),
  });
  if (!response.ok) throw new Error('Answer service unavailable');
  const data = await response.json() as { answer?: ApiAnswer | null };
  return data.answer || null;
}

import { questions, type Question } from './content';
import { loadPublishedAnswer, loadPublishedQuestions, type RemoteQuestion } from './question-api';

const isRemote = (question: Question): question is RemoteQuestion => Boolean((question as Partial<RemoteQuestion>).remote);

try {
  const published = await loadPublishedQuestions(20);
  if (published.length) questions.splice(0, questions.length, ...published);
} catch {
  // Keep the built-in reviewed demo set when the remote service is unavailable or no items are published.
}

document.addEventListener('click', async (event) => {
  const target = event.target as HTMLElement | null;
  const answerButton = target?.closest<HTMLElement>('[data-answer]');
  if (!answerButton) return;

  const stem = document.querySelector<HTMLElement>('.qtext')?.textContent?.trim();
  if (!stem) return;
  const question = questions.find((item) => item.en.trim() === stem || item.ar.trim() === stem);
  if (!question || !isRemote(question) || question.answerLoaded) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((button) => { button.disabled = true; });

  try {
    const answer = await loadPublishedAnswer(question.id);
    if (!answer) throw new Error('Published answer unavailable');
    question.correct = answer.correct_index;
    question.enExplanation = answer.en_explanation || '';
    question.arExplanation = answer.ar_explanation || answer.en_explanation || '';
    question.answerLoaded = true;
    answerButton.disabled = false;
    answerButton.click();
  } catch {
    document.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach((button) => { button.disabled = false; });
    alert(document.documentElement.lang === 'ar' ? 'تعذر تحميل الإجابة الآن. حاول مرة أخرى.' : 'Unable to load the answer right now. Please try again.');
  }
}, true);

await import('./main');

import fs from 'node:fs';

const bridge = fs.readFileSync('public/learning-bridge.html', 'utf8');
const ai = fs.readFileSync('netlify/functions/ai.cjs', 'utf8');
const main = fs.readFileSync('src/main.ts', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(`Learning Bridge validation failed: ${message}`);
}

const checks = [
  [bridge.includes('STRUCTURED · REVIEW-FIRST · ZERO LOCAL STORAGE'), 'bridge visibly states structured zero-storage boundary'],
  [bridge.includes("schemaVersion: '1'") && bridge.includes("sourceApp: 'SurgiCore'"), 'bridge requires canonical source schema'],
  [bridge.includes("deidentified: true") && bridge.includes("reviewedByUser: true"), 'bridge requires de-identification and user review'],
  [bridge.includes("'patient_name','mrn','dob','exact_case_date','facility','free_text_notes'"), 'bridge requires explicit privacy exclusions'],
  [bridge.includes('Unsupported field:') && bridge.includes('Raw case fields are not accepted'), 'client rejects unknown/raw case fields'],
  [!bridge.includes('localStorage') || bridge.includes('does not save this pack to localStorage'), 'bridge does not persist imported packs'],
  [bridge.includes("task:'learning_bridge'") && bridge.includes('payload:{learningCase:generationPack}'), 'bridge uses the dedicated structured AI task'],
  [!bridge.includes("task:'case_to_quiz'"), 'bridge does not overload the legacy case-to-quiz request shape'],
  [main.includes("callAI('case_to_quiz', { source })"), 'existing free-text case-to-quiz caller remains intact'],
  [ai.includes('case_to_quiz:') && ai.includes('learning_bridge:'), 'AI function exposes separate legacy and structured tasks'],
  [ai.includes("if (task === 'learning_bridge')"), 'server applies structured validation only to the bridge task'],
  [ai.includes('validateLearningCasePack'), 'server validates learningCase independently'],
  [ai.includes("code: 'LEARNING_CASE_REJECTED'"), 'server rejects unsafe bridge payloads explicitly'],
  [ai.includes("if (!TOP_KEYS.has(key))"), 'server uses an allowlist for top-level learningCase fields'],
  [ai.includes("privacy.deidentified !== true || privacy.reviewedByUser !== true"), 'server requires privacy review flags'],
  [ai.includes("privacy.excludes is missing"), 'server enforces all required exclusions'],
  [ai.includes('Never infer or invent age, sex, diagnosis, laboratory values, imaging'), 'bridge AI prompt forbids invented patient facts'],
  [ai.includes("'Cache-Control': 'no-store'"), 'AI bridge responses are marked no-store'],
  [bridge.includes("el('pack').addEventListener('input'") && bridge.includes('resetDraft()'), 'editing or validating a new pack clears stale draft state'],
  [bridge.includes('const generationPack = validatedPack') && bridge.includes('validatedPack !== generationPack'), 'in-flight generation cannot repopulate a draft after pack changes'],
  [index.includes('/learning-bridge.html'), 'main SurgiQuiz entry exposes the Learning Bridge'],
];

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('SurgiQuiz Learning Bridge contract validated.');
console.log('Structured SurgiCore pack -> local validation -> server validation -> educational draft.');
console.log('Legacy case-to-quiz remains compatible; bridge drafts are invalidated on every pack change.');

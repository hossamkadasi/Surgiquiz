import fs from 'node:fs';

const bridge = fs.readFileSync('public/learning-bridge.html', 'utf8');
const ai = fs.readFileSync('netlify/functions/ai.cjs', 'utf8');
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
  [bridge.includes("task:'case_to_quiz'") && bridge.includes('payload:{learningCase:validatedPack}'), 'bridge submits only validated structured learningCase payload'],
  [ai.includes('validateLearningCasePack'), 'server validates learningCase independently'],
  [ai.includes("code: 'LEARNING_CASE_REJECTED'"), 'server rejects unsafe bridge payloads explicitly'],
  [ai.includes("if (!TOP_KEYS.has(key))"), 'server uses an allowlist for top-level learningCase fields'],
  [ai.includes("privacy.deidentified !== true || privacy.reviewedByUser !== true"), 'server requires privacy review flags'],
  [ai.includes("privacy.excludes is missing"), 'server enforces all required exclusions'],
  [ai.includes('Never infer or invent age, sex, diagnosis, laboratory values, imaging'), 'AI prompt forbids invented patient facts'],
  [ai.includes("'Cache-Control': 'no-store'"), 'AI bridge responses are marked no-store'],
  [index.includes('/learning-bridge.html'), 'main SurgiQuiz entry exposes the Learning Bridge'],
];

const failures = checks.filter(([ok]) => !ok).map(([, label]) => label);
if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log('SurgiQuiz Learning Bridge contract validated.');
console.log('Structured SurgiCore pack -> local validation -> server validation -> educational draft.');
console.log('No patient narrative, exact date, facility, or free-text notes are accepted by the bridge schema.');

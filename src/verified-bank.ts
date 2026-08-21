import { loadPublishedQuestions } from './question-api';
import { getPublishedLearning, getVerifiedStats, reportQuestion, type PublishedLearning } from './trust';

const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const refText=(r:any)=>{if(typeof r==='string')return r;const p=[r?.title,r?.book,r?.guideline,r?.edition&&`Edition ${r.edition}`,r?.chapter&&`Chapter ${r.chapter}`,r?.year].filter(Boolean);return p.length?p.join(' · '):JSON.stringify(r)};

async function init(){
 try{const stats=await getVerifiedStats();$('published').textContent=String(stats.published||0);$('verified').textContent=String(stats.verified||0);$('reviewed').textContent=String(stats.medically_reviewed||0);$('total').textContent=Number(stats.total||3840).toLocaleString();}catch{/* non-blocking */}
 const box=$('questions');
 try{
  const qs=await loadPublishedQuestions(20);
  if(!qs.length){box.innerHTML='<section class="card empty"><h2>No public Verified questions yet</h2><p class="muted">The transformed bank remains available in Full Book Beta while human medical review proceeds. SurgiQuiz does not label unreviewed items as verified.</p><div class="actions" style="justify-content:center"><a href="/beta-bank.html">Open Full Book Beta</a></div></section>';return;}
  box.innerHTML=qs.map(q=>`<article class="card" data-id="${esc(q.id)}"><div class="qhead"><div><span class="badge verified">✓ Human-reviewed</span> <span class="badge">${esc(q.category)} · ${esc(q.topic)} · ${esc(q.difficulty)}</span></div><span class="badge">Verified QBank</span></div><h3>${esc(q.en)}</h3>${q.ar&&q.ar!==q.en?`<p dir="rtl">${esc(q.ar)}</p>`:''}<div class="opts">${q.enOptions.map((o,i)=>`<button class="opt" data-index="${i}">${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join('')}</div><div class="learning" hidden></div><div class="actions"><button class="report">Report question</button></div></article>`).join(''); bind();
 }catch{box.innerHTML='<section class="card"><strong>Verified QBank service is temporarily unavailable.</strong><p class="muted">Please retry later.</p></section>';}
}

function bind(){
 document.querySelectorAll<HTMLElement>('[data-id]').forEach(card=>{
  const id=card.dataset.id!;let loading=false;
  card.querySelectorAll<HTMLButtonElement>('.opt').forEach(btn=>btn.onclick=async()=>{
   if(loading||!btn.dataset.index)return;loading=true;card.querySelectorAll<HTMLButtonElement>('.opt').forEach(x=>x.disabled=true);const out=card.querySelector<HTMLElement>('.learning')!;
   try{const l=await getPublishedLearning(id);if(!l)throw new Error('Verified learning details unavailable');renderLearning(card,l,Number(btn.dataset.index));}
   catch(e:any){out.hidden=false;out.textContent=e.message||'Unable to load learning details.';card.querySelectorAll<HTMLButtonElement>('.opt').forEach(x=>x.disabled=false);loading=false;}
  });
  card.querySelector<HTMLButtonElement>('.report')!.onclick=async()=>{const type=prompt('Report type: medical_accuracy, answer_issue, outdated_evidence, unclear_question, translation, reference, technical, or other','medical_accuracy');if(!type)return;const notes=prompt('Describe the concern:')||'';try{await reportQuestion(id,type.trim(),notes);alert('Report submitted to the SurgiQuiz medical review workflow.');}catch(e:any){alert(e.message||'Unable to submit report.');}};
 });
}

function renderLearning(card:HTMLElement,l:PublishedLearning,chosen:number){
 const correct=Number(l.correct_index);card.querySelectorAll<HTMLButtonElement>('.opt').forEach((b,i)=>{b.classList.toggle('correct',i===correct);b.classList.toggle('wrong',i===chosen&&i!==correct);});
 const out=card.querySelector<HTMLElement>('.learning')!;const rationales=(l.options||[]).map(o=>`<div class="rationale"><b>${String.fromCharCode(65+Number(o.index))}</b> ${esc(o.en_rationale||'Rationale unavailable')}</div>`).join('');const refs=(l.references||[]).map((r,i)=>`<div class="ref"><b>${i+1}.</b> ${esc(refText(r))}</div>`).join('');const reviewed=l.medical_reviewed_at?new Date(l.medical_reviewed_at).toLocaleDateString():'—';
 out.hidden=false;out.innerHTML=`<div class="qhead"><h3>${chosen===correct?'Correct':'Incorrect'}</h3><span class="badge verified">Verified · v${l.content_version}</span></div><p><b>Correct answer: ${String.fromCharCode(65+correct)}</b></p><p>${esc(l.en_explanation||'')}</p>${l.en_learning_point?`<div class="card" style="box-shadow:none"><b>Learning point</b><p>${esc(l.en_learning_point)}</p></div>`:''}<h4>Why each option?</h4>${rationales}<h4>References</h4>${refs}<div class="trustgrid" style="margin-top:14px"><div class="trustitem">Human medical review: ${l.trust.human_medically_reviewed?'✓':'—'}</div><div class="trustitem">Medical review date: ${reviewed}</div><div class="trustitem">References attached: ${l.trust.has_reference?'✓':'—'}</div><div class="trustitem">Option rationales: ${l.trust.has_four_rationales?'✓':'—'}</div><div class="trustitem">Learning point: ${l.trust.has_learning_point?'✓':'—'}</div><div class="trustitem">Evidence status: ${esc(l.evidence_status)}</div></div>`;
}

init();

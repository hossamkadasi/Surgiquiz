import { currentUser, getRevisionQueue, saveCloudProgress, type RevisionQuestion } from './student-cloud';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let queue:RevisionQuestion[]=[];let index=0;let answered=0;let correct=0;
async function answerFor(id:string){const r=await fetch('/.netlify/functions/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'beta-answer',questionId:id})});if(!r.ok)throw new Error('answer_service');const d=await r.json();return d.answer;}
function reasonLabel(r:string){if(r==='incorrect')return 'Previously incorrect';if(r==='bookmarked')return 'Bookmarked for review';if(r==='weak-topic-unseen')return 'New question from a weak domain';return 'Targeted review';}
function updateHeader(){const total=queue.length||20;$('#counter').textContent=`${Math.min(index+1,total)} / ${total}`;($('#bar') as HTMLElement).style.width=`${total?Math.min(100,100*index/total):0}%`;}
function render(){
 $('#done').classList.add('hidden');const box=$('question');
 if(index>=queue.length){finish();return;}
 const q=queue[index];updateHeader();$('#why').textContent=`${reasonLabel(q.reason)} · ${q.category}${q.topic?` · ${q.topic}`:''}`;
 box.innerHTML=`<article class="card" data-q="${esc(q.id)}"><div class="qhead"><span class="badge">#${q.queue_index} · ${esc(q.category)} · Level ${esc(q.difficulty||'—')}</span><span class="badge">${esc(reasonLabel(q.reason))}</span></div><h3>${esc(q.en_stem)}</h3>${q.ar_stem?`<p dir="rtl">${esc(q.ar_stem)}</p>`:''}<div class="opts">${q.options.map(o=>`<button class="opt" data-a="${o.index}">${String.fromCharCode(65+o.index)}. ${esc(o.en)}</button>`).join('')}</div><div id="feedback" class="answer hidden"></div><div class="actions"><button id="next" class="secondary hidden">Next question</button></div></article>`;
 document.querySelectorAll<HTMLButtonElement>('.opt').forEach(b=>b.onclick=async()=>{
   document.querySelectorAll<HTMLButtonElement>('.opt').forEach(x=>x.disabled=true);const out=$('feedback');
   try{const a=await answerFor(q.id);if(!a||a.answer_available===false||a.correct_index===null){out.classList.remove('hidden');out.textContent='Answer withheld for medical review.';$('#next').classList.remove('hidden');return;}
     const chosen=Number(b.dataset.a),ok=chosen===Number(a.correct_index);answered++;if(ok)correct++;await saveCloudProgress(q.id,chosen,ok,null);out.classList.remove('hidden');out.innerHTML=`<strong>${ok?'Correct':'Incorrect'}</strong><p>Correct option: ${String.fromCharCode(65+Number(a.correct_index))}</p>${a.en_explanation?`<p>${esc(a.en_explanation)}</p>`:''}`;$('#next').classList.remove('hidden');
   }catch{out.classList.remove('hidden');out.textContent='Unable to load the answer. You can retry by reopening this question.';$('#next').classList.remove('hidden');}
 });
 $('#next').onclick=()=>{index++;render();};
}
function finish(){
 $('#question').innerHTML='';$('#done').classList.remove('hidden');$('#counter').textContent=`${queue.length} / ${queue.length}`;($('#bar') as HTMLElement).style.width='100%';$('#answered').textContent=String(answered);$('#correct').textContent=String(correct);$('#accuracy').textContent=`${answered?Math.round(100*correct/answered):0}%`;$('#why').textContent='Session complete. Your cloud weakness map has been updated.';
}
async function start(){
 const user=await currentUser();if(!user){$('#gate').classList.remove('hidden');$('#question').innerHTML='';return;}
 $('#gate').classList.add('hidden');$('#question').innerHTML='<section class="card">Building your Smart Revision set…</section>';index=0;answered=0;correct=0;
 try{queue=await getRevisionQueue(20);if(!queue.length){$('#question').innerHTML='<section class="card"><h2>Not enough performance data yet</h2><p class="muted">Complete several questions in the Full Book Bank first. SurgiQuiz will then generate a targeted revision set from your mistakes and weak domains.</p><a class="btn" href="/beta-bank.html">Open Question Bank</a></section>';$('#counter').textContent='0 / 20';return;}render();}catch(e:any){$('#question').innerHTML=`<section class="card"><strong>Unable to build Smart Revision.</strong><p class="muted">${esc(e?.message||'Please retry.')}</p></section>`;}
}
$('#restart').onclick=start;
start();

import { currentUser, finishExam, getExam, getExamFacets, getStudentProfile, saveExamAnswer, startExam, type ExamQuestion, type ExamReport, type ExamSession } from './student-cloud';

const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const authRequired=$<HTMLElement>('authRequired'), setup=$<HTMLElement>('setup'), exam=$<HTMLElement>('exam'), report=$<HTMLElement>('report');
let session:ExamSession|null=null; let current=0; let answers:Record<string,number>={}; let ticker:number|undefined;
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

function trackName(v:string){return ({arab_board:'Arab Board',yemeni_board:'Yemeni Board',professional_masters:"Professional Master’s",general_surgery:'General Surgery'} as Record<string,string>)[v]||v;}

async function init(){
 const user=await currentUser();
 if(!user){authRequired.classList.remove('hidden');return;}
 setup.classList.remove('hidden');
 try{const f=await getExamFacets();const sel=$<HTMLSelectElement>('category');for(const c of f.categories||[]){const o=document.createElement('option');o.value=c.name;o.textContent=`${c.name} (${c.count})`;sel.appendChild(o);}}catch(e:any){$('setupmsg').textContent=e.message||'Unable to load exam categories.';}
 const resume=localStorage.getItem('surgiquiz-active-exam');
 if(resume){try{const s=await getExam(resume);if(s.status==='in_progress'){session=s;answers=s.answers||{};showExam();return;}localStorage.removeItem('surgiquiz-active-exam');}catch{localStorage.removeItem('surgiquiz-active-exam');}}
}

$('mode').onchange=()=>{const timed=($<HTMLSelectElement>('mode')).value==='timed';($<HTMLInputElement>('minutes')).disabled=!timed;};
($<HTMLInputElement>('minutes')).disabled=true;

$('start').onclick=async()=>{
 const count=Number(($<HTMLSelectElement>('count')).value) as 10|20|50|100;
 const category=($<HTMLSelectElement>('category')).value||null;
 const timed=($<HTMLSelectElement>('mode')).value==='timed';
 const minutes=timed?Math.max(1,Math.min(300,Number(($<HTMLInputElement>('minutes')).value)||count)):null;
 $('setupmsg').textContent='Creating secure exam…';
 try{const profile=await getStudentProfile();session=await startExam(count,category,timed,minutes,profile?.exam_track??null);answers={};current=0;localStorage.setItem('surgiquiz-active-exam',session.session_id);showExam();$('setupmsg').textContent='';}catch(e:any){$('setupmsg').textContent=e.message||'Unable to create exam.';}
};

function showExam(){if(!session)return;setup.classList.add('hidden');report.classList.add('hidden');exam.classList.remove('hidden');$('trackLabel').textContent=trackName(session.exam_track);$('catLabel').textContent=session.category||'All surgical domains';renderNav();renderQuestion();startTimer();}

function renderNav(){if(!session)return;const nav=$('nav');nav.innerHTML=session.questions.map((q,i)=>`<button data-i="${i}" class="${answers[q.id]!==undefined?'answered':''} ${i===current?'current':''}">${i+1}</button>`).join('');nav.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.onclick=()=>{current=Number(b.dataset.i);renderNav();renderQuestion();});$('progressLabel').textContent=`${Object.keys(answers).length}/${session.questions.length} answered`;}

function renderQuestion(){if(!session)return;const q=session.questions[current];$('qmeta').textContent=`Question ${current+1} of ${session.questions.length} · ${q.category} · Level ${q.difficulty||'—'}`;$('stem').textContent=q.en_stem;$('arstem').textContent=q.ar_stem||'';$('arstem').style.display=q.ar_stem?'block':'none';$('opts').innerHTML=q.options.map(o=>`<button class="opt ${answers[q.id]===o.index?'selected':''}" data-v="${o.index}">${String.fromCharCode(65+o.index)}. ${esc(o.en)}</button>`).join('');$('opts').querySelectorAll<HTMLButtonElement>('.opt').forEach(b=>b.onclick=()=>selectAnswer(q,Number(b.dataset.v)));($<HTMLButtonElement>('prev')).disabled=current===0;($<HTMLButtonElement>('next')).disabled=current===session!.questions.length-1;}

async function selectAnswer(q:ExamQuestion,index:number){if(!session)return;const old=answers[q.id];answers[q.id]=index;renderNav();renderQuestion();$('savemsg').textContent='Saving…';try{await saveExamAnswer(session.session_id,q.id,index);$('savemsg').textContent='Saved to Student Cloud.';}catch(e:any){if(old===undefined)delete answers[q.id];else answers[q.id]=old;$('savemsg').textContent=e.message||'Unable to save answer.';renderNav();renderQuestion();}}

$('prev').onclick=()=>{if(current>0){current--;renderNav();renderQuestion();}};
$('next').onclick=()=>{if(session&&current<session.questions.length-1){current++;renderNav();renderQuestion();}};
$('finish').onclick=async()=>{if(!session)return;const remaining=session.questions.length-Object.keys(answers).length;const ok=confirm(remaining?`Finish exam with ${remaining} unanswered question${remaining===1?'':'s'}?`:'Finish exam and calculate your score?');if(!ok)return;await finish();};

function startTimer(){if(ticker)window.clearInterval(ticker);if(!session?.timed||!session.time_limit_seconds){$('timer').textContent='Untimed';return;}const started=new Date(session.started_at).getTime();const end=started+session.time_limit_seconds*1000;const tick=()=>{const left=Math.max(0,Math.ceil((end-Date.now())/1000));const m=Math.floor(left/60),s=left%60;$('timer').textContent=`${m}:${String(s).padStart(2,'0')}`;$('timer').classList.toggle('danger',left<=60);if(left<=0){if(ticker)window.clearInterval(ticker);finish(true);}};tick();ticker=window.setInterval(tick,1000);}

async function finish(auto=false){if(!session)return;if(ticker)window.clearInterval(ticker);$('savemsg').textContent=auto?'Time expired. Calculating result…':'Calculating result…';try{const r=await finishExam(session.session_id);localStorage.removeItem('surgiquiz-active-exam');showReport(r);}catch(e:any){$('savemsg').textContent=e.message||'Unable to finish exam.';}}

function showReport(r:ExamReport){if(!session)return;exam.classList.add('hidden');setup.classList.add('hidden');report.classList.remove('hidden');$('score').textContent=`${r.score_correct}/${r.score_total}`;$('pct').textContent=`${Number(r.percentage||0).toFixed(1)}%`;$('answered').textContent=String(r.answered);$('unanswered').textContent=String(r.unanswered);$('reportStatus').textContent=`${trackName(session.exam_track)} · ${r.status==='expired'?'Time expired':'Completed'} · Results added to your Weakness Map`;$('categories').innerHTML=(r.category_analytics||[]).map(x=>`<div class="catrow"><span>${esc(x.category)}</span><strong>${x.correct}/${x.total} · ${Number(x.accuracy||0).toFixed(1)}%</strong></div>`).join('')||'<p class="muted">No category analytics available.</p>';
 const qmap=new Map(session.questions.map(q=>[q.id,q]));$('review').innerHTML=(r.review||[]).map((x,i)=>{const q=qmap.get(x.question_id);const selected=x.selected_index===null||x.selected_index===undefined?'Unanswered':String.fromCharCode(65+Number(x.selected_index));const correct=String.fromCharCode(65+Number(x.correct_index));return `<div class="reviewitem"><div class="muted">${i+1}. ${esc(x.category)}</div><strong>${q?esc(q.en_stem):esc(x.question_id)}</strong><p class="${x.correct?'ok':'bad'}">${x.correct?'Correct':'Incorrect'} · Your answer: ${selected} · Correct: ${correct}</p>${x.en_explanation?`<p>${esc(x.en_explanation)}</p>`:''}</div>`}).join('');session=null;answers={};}

$('newExam').onclick=()=>{report.classList.add('hidden');setup.classList.remove('hidden');};

init();

import { currentUser, ensureProfile, getCloudDashboard, getExamHistory, getStudentProfile, getWeaknessMap, migrateLocalProgress, onAuthChange, sendMagicLink, setExamTrack, signOut, type ExamTrack, type WeaknessRow } from './student-cloud';
import { getPerformanceTrend, getReadiness, type PerformanceTrend, type ReadinessData } from './readiness';

const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const signin=$<HTMLElement>('signin'),account=$<HTMLElement>('account'),sync=$<HTMLElement>('sync'),authmsg=$<HTMLElement>('authmsg'),profilemsg=$<HTMLElement>('profilemsg');
const TOTAL=3840;
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));

async function render(){
 const user=await currentUser();
 signin.classList.toggle('hidden',!!user); account.classList.toggle('hidden',!user); sync.textContent=user?'Cloud sync active':'Local mode';
 $('smartRevision').classList.toggle('hidden',!user); $('examSimulator').classList.toggle('hidden',!user); $('examHistoryCard').classList.toggle('hidden',!user); $('readinessCard').classList.toggle('hidden',!user); $('trendCard').classList.toggle('hidden',!user); $('dailyPlanCard').classList.toggle('hidden',!user);
 if(!user){setMetrics(null);renderWeakness([]);renderExamHistory([]);renderReadiness(null);renderTrend(null);renderDailyPlan(null);return;}
 $('emailshow').textContent=user.email||''; $('who').textContent=(user.user_metadata?.display_name||user.email?.split('@')[0]||'Student');
 const profile=(await getStudentProfile())||await ensureProfile(); if(profile)($<HTMLSelectElement>('track')).value=profile.exam_track;
 await refresh();
}

function setMetrics(d:any){
 const attempted=Number(d?.attempted||0),pct=Math.min(100,100*attempted/TOTAL);
 $('attempted').textContent=String(attempted); $('correct').textContent=String(d?.correct||0); $('incorrect').textContent=String(d?.incorrect||0); $('bookmarked').textContent=String(d?.bookmarked||0); $('accuracy').textContent=`${Number(d?.accuracy||0).toFixed(1)}%`; $('completion').textContent=`${attempted.toLocaleString()} / ${TOTAL.toLocaleString()} questions attempted · ${pct.toFixed(1)}% of Full Book Bank`; ($<HTMLElement>('bar')).style.width=`${pct}%`;
 const recent=$('recent'); const rows=d?.recent||[];
 recent.innerHTML=rows.length?rows.slice(0,12).map((r:any)=>`<div><b>${esc(r.question_id)}</b> · ${r.last_correct===true?'Correct':r.last_correct===false?'Incorrect':'Saved'}${r.bookmarked?' · ★ Bookmarked':''}<br><span class="muted">${new Date(r.updated_at).toLocaleString()}</span></div>`).join(''):'No cloud activity yet.';
}

function renderReadiness(d:ReadinessData|null){
 const score=Number(d?.score||0); $('readinessScore').textContent=score.toFixed(1); $('readinessBand').textContent=d?.band||'Not calculated'; ($<HTMLElement>('readinessRing')).style.setProperty('--score',String(Math.min(100,Math.max(0,score))));
 const c=d?.components; const components=$('readinessComponents');
 if(!c){components.innerHTML='<div class="muted">Sign in and answer questions to calculate your preparation indicator.</div>';return;}
 const items=[['Question accuracy',c.question_accuracy,35],['Domain mastery',c.domain_mastery,30],['Mock exam performance',c.mock_exam_performance,20],['Bank coverage',c.coverage,15]] as const;
 components.innerHTML=items.map(([label,value,weight])=>`<div class="component"><div class="componenttop"><span>${label}</span><strong>${Number(value||0).toFixed(1)}%</strong></div><div class="mini"><i style="width:${Math.max(0,Math.min(100,Number(value||0)))}%"></i></div><div class="muted">Weight ${weight}%</div></div>`).join('');
 $('readinessNote').textContent=`Internal preparation indicator · ${d.attempted} questions attempted · ${c.mock_exam_count} completed mock exam${c.mock_exam_count===1?'':'s'}. This is not an official board pass prediction.`;
}

function renderDailyPlan(d:ReadinessData|null){
 const box=$('dailyPlan'); const plan=d?.daily_plan||[];
 if(!d||d.attempted<10){box.innerHTML='<div class="emptyplan"><b>Build your baseline first</b><p class="muted">Complete at least 10 questions. SurgiQuiz will then generate a daily revision mix from your weakest domains.</p><a class="cta" href="/beta-bank.html">Start baseline questions</a></div>';return;}
 if(!plan.length){box.innerHTML='<div class="muted">More performance data is needed to generate today’s plan.</div>';return;}
 const total=plan.reduce((n,x)=>n+Number(x.questions||0),0);
 box.innerHTML=`<div class="planhead"><div><b>Today: ${total} targeted questions</b><div class="muted">Generated from your current weakness profile</div></div><a class="cta" href="/revision.html">Start Smart Revision</a></div>${plan.map((p,i)=>`<div class="planrow"><div class="plannum">${i+1}</div><div><b>${esc(p.category)}</b><div class="muted">Current accuracy ${Number(p.accuracy||0).toFixed(1)}%</div></div><strong>${p.questions} Qs</strong></div>`).join('')}`;
}

function renderTrend(d:PerformanceTrend|null){
 const examBox=$('examTrend'),activityBox=$('activityTrend'); const exams=d?.exams||[], activity=d?.recent_question_activity||[];
 if(!exams.length){examBox.innerHTML='<div class="muted">Complete an Exam Simulator session to start your mock-score trend.</div>';}else{examBox.innerHTML=`<div class="trendlabel">Mock exam trend</div><div class="bars">${exams.map(x=>{const v=Math.max(0,Math.min(100,Number(x.percentage||0)));return `<div class="barcol" title="${v.toFixed(1)}%"><div class="barvalue">${v.toFixed(0)}%</div><div class="bartrack"><i style="height:${v}%"></i></div><span>${new Date(x.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span></div>`}).join('')}</div>`;}
 if(!activity.length){activityBox.innerHTML='<div class="muted">Your 14-day question activity will appear here.</div>';}else{const max=Math.max(...activity.map(x=>Number(x.questions||0)),1);activityBox.innerHTML=`<div class="trendlabel">14-day activity</div><div class="activitybars">${activity.map(x=>{const q=Number(x.questions||0),h=Math.max(8,Math.round(100*q/max));return `<div class="activitycol" title="${q} questions · ${Number(x.accuracy||0).toFixed(1)}% accuracy"><div class="activitybar" style="height:${h}%"></div><span>${new Date(x.date+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'})}</span></div>`}).join('')}</div>`;}
}

function renderWeakness(rows:WeaknessRow[]){
 const box=$('weakness');
 if(!rows.length){box.innerHTML='<div class="muted">Answer at least a few questions to build your weakness map.</div>';return;}
 box.innerHTML=rows.map((r,i)=>{const acc=Number(r.accuracy||0);const level=acc<50?'High priority':acc<70?'Needs work':'Developing';return `<div class="weakrow"><div><b>${i+1}. ${esc(r.category)}</b><div class="muted">${r.attempted} attempted · ${r.incorrect} incorrect</div></div><div class="weakscore"><b>${acc.toFixed(1)}%</b><span>${level}</span></div></div>`}).join('');
}

function renderExamHistory(rows:any[]){
 const box=$('examHistory');if(!rows.length){box.innerHTML='<div class="muted">No completed exam sessions yet.</div>';return;}
 box.innerHTML=rows.map(r=>`<div class="weakrow"><div><b>${esc(r.category||'All surgical domains')}</b><div class="muted">${esc(String(r.exam_track).replaceAll('_',' '))} · ${r.question_count} questions · ${r.timed?'Timed':'Untimed'}<br>${new Date(r.started_at).toLocaleString()}</div></div><div class="weakscore"><b>${r.percentage==null?'—':Number(r.percentage).toFixed(1)+'%'}</b><span>${esc(r.status)}</span></div></div>`).join('');
}

async function refresh(){
 try{
  const [dashboard,weakness,history,readiness,trend]=await Promise.all([getCloudDashboard(),getWeaknessMap(),getExamHistory(8),getReadiness(),getPerformanceTrend(10)]);
  setMetrics(dashboard);renderWeakness(weakness);renderExamHistory(history as any[]);renderReadiness(readiness);renderDailyPlan(readiness);renderTrend(trend);
 }catch(e:any){profilemsg.textContent=e.message||'Unable to load cloud progress.';}
}

$('send').onclick=async()=>{const email=($<HTMLInputElement>('email')).value.trim();if(!email)return;authmsg.textContent='Sending…';try{await sendMagicLink(email);authmsg.textContent='Check your email and open the SurgiQuiz sign-in link.';}catch(e:any){authmsg.textContent=e.message||'Unable to send sign-in link.';}};
$('logout').onclick=async()=>{await signOut();location.reload();};
$('savetrack').onclick=async()=>{try{await setExamTrack(($<HTMLSelectElement>('track')).value as ExamTrack);profilemsg.textContent='Exam track saved to your account.';}catch(e:any){profilemsg.textContent=e.message||'Unable to save track.';}};
$('migrate').onclick=async()=>{profilemsg.textContent='Syncing this device…';try{const local=JSON.parse(localStorage.getItem('sq-beta-progress')||'{}');const r=await migrateLocalProgress(local,[]);localStorage.setItem('surgiquiz-cloud-migrated','1');profilemsg.textContent=`Synced ${r.migrated} saved question records.`;await refresh();}catch(e:any){profilemsg.textContent=e.message||'Unable to sync local progress.';}};
$('refresh').onclick=refresh;
onAuthChange(()=>render());
render();

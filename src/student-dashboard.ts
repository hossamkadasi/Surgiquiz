import { currentUser, ensureProfile, getCloudDashboard, getExamHistory, getStudentProfile, getWeaknessMap, migrateLocalProgress, onAuthChange, sendMagicLink, setExamTrack, signOut, type ExamTrack, type WeaknessRow } from './student-cloud';
const $=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const signin=$<HTMLElement>('signin'),account=$<HTMLElement>('account'),sync=$<HTMLElement>('sync'),authmsg=$<HTMLElement>('authmsg'),profilemsg=$<HTMLElement>('profilemsg');
const TOTAL=3840;
async function render(){
 const user=await currentUser(); signin.classList.toggle('hidden',!!user); account.classList.toggle('hidden',!user); sync.textContent=user?'Cloud sync active':'Local mode';
 $('smartRevision').classList.toggle('hidden',!user); $('examSimulator').classList.toggle('hidden',!user); $('examHistoryCard').classList.toggle('hidden',!user);
 if(!user){setMetrics(null);renderWeakness([]);renderExamHistory([]);return;}
 $('emailshow').textContent=user.email||''; $('who').textContent=(user.user_metadata?.display_name||user.email?.split('@')[0]||'Student');
 const profile=(await getStudentProfile())||await ensureProfile(); if(profile)($<HTMLSelectElement>('track')).value=profile.exam_track;
 await refresh();
}
function setMetrics(d:any){
 const attempted=Number(d?.attempted||0),pct=Math.min(100,100*attempted/TOTAL); $('attempted').textContent=String(attempted); $('correct').textContent=String(d?.correct||0); $('incorrect').textContent=String(d?.incorrect||0); $('bookmarked').textContent=String(d?.bookmarked||0); $('accuracy').textContent=`${Number(d?.accuracy||0).toFixed(1)}%`; $('completion').textContent=`${attempted.toLocaleString()} / ${TOTAL.toLocaleString()} questions attempted · ${pct.toFixed(1)}% of Full Book Bank`; ($<HTMLElement>('bar')).style.width=`${pct}%`;
 const recent=$('recent'); const rows=d?.recent||[]; recent.innerHTML=rows.length?rows.slice(0,12).map((r:any)=>`<div><b>${r.question_id}</b> · ${r.last_correct===true?'Correct':r.last_correct===false?'Incorrect':'Saved'}${r.bookmarked?' · ★ Bookmarked':''}<br><span class="muted">${new Date(r.updated_at).toLocaleString()}</span></div>`).join(''):'No cloud activity yet.';
}
function renderWeakness(rows:WeaknessRow[]){
 const box=$('weakness');
 if(!rows.length){box.innerHTML='<div class="muted">Answer at least a few questions to build your weakness map.</div>';return;}
 box.innerHTML=rows.map((r,i)=>{const acc=Number(r.accuracy||0);const level=acc<50?'High priority':acc<70?'Needs work':'Developing';return `<div class="weakrow"><div><b>${i+1}. ${r.category}</b><div class="muted">${r.attempted} attempted · ${r.incorrect} incorrect</div></div><div class="weakscore"><b>${acc.toFixed(1)}%</b><span>${level}</span></div></div>`}).join('');
}
function renderExamHistory(rows:any[]){const box=$('examHistory');if(!rows.length){box.innerHTML='<div class="muted">No completed exam sessions yet.</div>';return;}box.innerHTML=rows.map(r=>`<div class="weakrow"><div><b>${r.category||'All surgical domains'}</b><div class="muted">${r.exam_track.replaceAll('_',' ')} · ${r.question_count} questions · ${r.timed?'Timed':'Untimed'}<br>${new Date(r.started_at).toLocaleString()}</div></div><div class="weakscore"><b>${r.percentage==null?'—':Number(r.percentage).toFixed(1)+'%'}</b><span>${r.status}</span></div></div>`).join('');}
async function refresh(){try{const [dashboard,weakness,history]=await Promise.all([getCloudDashboard(),getWeaknessMap(),getExamHistory(8)]);setMetrics(dashboard);renderWeakness(weakness);renderExamHistory(history as any[]);}catch(e:any){profilemsg.textContent=e.message||'Unable to load cloud progress.';}}
$('send').onclick=async()=>{const email=($<HTMLInputElement>('email')).value.trim();if(!email)return;authmsg.textContent='Sending…';try{await sendMagicLink(email);authmsg.textContent='Check your email and open the SurgiQuiz sign-in link.';}catch(e:any){authmsg.textContent=e.message||'Unable to send sign-in link.';}};
$('logout').onclick=async()=>{await signOut();location.reload();};
$('savetrack').onclick=async()=>{try{await setExamTrack(($<HTMLSelectElement>('track')).value as ExamTrack);profilemsg.textContent='Exam track saved to your account.';}catch(e:any){profilemsg.textContent=e.message||'Unable to save track.';}};
$('migrate').onclick=async()=>{profilemsg.textContent='Syncing this device…';try{const local=JSON.parse(localStorage.getItem('sq-beta-progress')||'{}');const r=await migrateLocalProgress(local,[]);localStorage.setItem('surgiquiz-cloud-migrated','1');profilemsg.textContent=`Synced ${r.migrated} saved question records.`;await refresh();}catch(e:any){profilemsg.textContent=e.message||'Unable to sync local progress.';}};
$('refresh').onclick=refresh;
onAuthChange(()=>render());
render();

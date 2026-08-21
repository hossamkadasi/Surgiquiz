import { createClient, type User } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://lltdfvyommeacveqqfec.supabase.co',
  'sb_publishable_sRjoyXVHljdZ4-ACiiA8TA_oywvpopW'
);

export type ExamTrack = 'arab_board'|'yemeni_board'|'professional_masters'|'general_surgery';
export type StudentProfile = {user_id:string;display_name:string|null;exam_track:ExamTrack;locale:string;created_at:string;updated_at:string};
export type StudentDashboard = {attempted:number;correct:number;incorrect:number;bookmarked:number;accuracy:number;recent:Array<{question_id:string;last_correct:boolean|null;bookmarked:boolean;updated_at:string}>};
export type WeaknessRow = {category:string;attempted:number;correct:number;incorrect:number;accuracy:number;weakness_score:number};
export type RevisionQuestion = {id:string;queue_index:number;category:string;topic:string|null;difficulty:string|null;en_stem:string;ar_stem:string|null;options:Array<{index:number;en:string;ar:string|null}>;reason:string;priority:number};
export type ExamQuestion = {id:string;queue_index:number;category:string;topic:string|null;difficulty:string|null;en_stem:string;ar_stem:string|null;options:Array<{index:number;en:string;ar:string|null}>};
export type ExamSession = {session_id:string;exam_track:ExamTrack|string;category:string|null;status?:string;requested_count?:number;actual_count?:number;question_count?:number;timed:boolean;time_limit_seconds:number|null;started_at:string;questions:ExamQuestion[];answers?:Record<string,number>};
export type ExamReport = {session_id:string;status:string;score_correct:number;score_total:number;answered:number;unanswered:number;percentage:number;category_analytics:Array<{category:string;total:number;correct:number;accuracy:number}>;review:Array<{question_id:string;category:string;selected_index:number|null;correct_index:number;correct:boolean;en_explanation:string|null;ar_explanation:string|null}>};

export async function currentUser(): Promise<User|null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthChange(cb:(user:User|null)=>void) {
  return supabase.auth.onAuthStateChange((_event,session)=>cb(session?.user ?? null));
}

export async function sendMagicLink(email:string) {
  const redirect = `${window.location.origin}/student.html`;
  const { error } = await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirect}});
  if (error) throw error;
}

export async function signOut() { const {error}=await supabase.auth.signOut(); if(error)throw error; }

export async function getStudentProfile():Promise<StudentProfile|null>{
  const user=await currentUser(); if(!user)return null;
  const {data,error}=await supabase.from('student_profiles').select('*').eq('user_id',user.id).maybeSingle();
  if(error)throw error; return data as StudentProfile|null;
}

export async function ensureProfile(track:ExamTrack='general_surgery') {
  const user=await currentUser(); if(!user) return null;
  const existing=await getStudentProfile(); if(existing)return existing;
  const {data,error}=await supabase.from('student_profiles').insert({user_id:user.id,exam_track:track}).select().single();
  if(error) throw error; return data as StudentProfile;
}

export async function setExamTrack(track:ExamTrack) {
  const user=await currentUser(); if(!user) throw new Error('authentication_required');
  const existing=await getStudentProfile();
  const query=existing
    ? supabase.from('student_profiles').update({exam_track:track}).eq('user_id',user.id)
    : supabase.from('student_profiles').insert({user_id:user.id,exam_track:track});
  const {error}=await query; if(error)throw error;
}

export async function saveCloudProgress(questionId:string, answerIndex:number|null, correct:boolean|null, bookmarked:boolean|null) {
  const {error}=await supabase.rpc('upsert_student_question_progress',{p_question_id:questionId,p_answer_index:answerIndex,p_correct:correct,p_bookmarked:bookmarked});
  if(error) throw error;
}

export async function getCloudDashboard():Promise<StudentDashboard|null> {
  const user=await currentUser(); if(!user)return null;
  const {data,error}=await supabase.rpc('get_student_dashboard'); if(error)throw error; return data as StudentDashboard;
}

export async function getWeaknessMap():Promise<WeaknessRow[]> {
  const user=await currentUser(); if(!user)return [];
  const {data,error}=await supabase.rpc('get_student_weakness_map'); if(error)throw error; return (data??[]) as WeaknessRow[];
}

export async function getRevisionQueue(limit=20):Promise<RevisionQuestion[]> {
  const user=await currentUser(); if(!user)return [];
  const {data,error}=await supabase.rpc('get_student_revision_queue',{p_limit:limit}); if(error)throw error; return (data??[]) as RevisionQuestion[];
}

export async function getExamFacets(){
  const {data,error}=await supabase.rpc('get_beta_bank_facets'); if(error)throw error; return data as {total:number;categories:Array<{name:string;count:number}>};
}

export async function startExam(count:10|20|50|100,category:string|null,timed:boolean,minutes:number|null,track?:ExamTrack|null):Promise<ExamSession>{
  const {data,error}=await supabase.rpc('start_student_exam',{p_count:count,p_category:category,p_timed:timed,p_minutes:minutes,p_track:track??null});
  if(error)throw error; return data as ExamSession;
}

export async function saveExamAnswer(sessionId:string,questionId:string,selectedIndex:number){
  const {data,error}=await supabase.rpc('save_student_exam_answer',{p_session_id:sessionId,p_question_id:questionId,p_selected_index:selectedIndex});
  if(error)throw error; return data as {saved:boolean;answered:number};
}

export async function getExam(sessionId:string):Promise<ExamSession>{
  const {data,error}=await supabase.rpc('get_student_exam',{p_session_id:sessionId}); if(error)throw error; return data as ExamSession;
}

export async function finishExam(sessionId:string):Promise<ExamReport>{
  const {data,error}=await supabase.rpc('finish_student_exam',{p_session_id:sessionId}); if(error)throw error; return data as ExamReport;
}

export async function getExamHistory(limit=10){
  const {data,error}=await supabase.rpc('list_student_exam_history',{p_limit:limit}); if(error)throw error; return data??[];
}

export async function getCloudProgress() {
  const user=await currentUser(); if(!user)return [];
  const {data,error}=await supabase.from('student_question_progress').select('question_id,attempts,correct_attempts,last_answer_index,last_correct,bookmarked,updated_at').order('updated_at',{ascending:false});
  if(error)throw error; return data ?? [];
}

export async function migrateLocalProgress(progress:Record<string,{selected?:number;chosen?:number;correct?:boolean;bookmarked?:boolean}>,bookmarks:string[]) {
  const user=await currentUser(); if(!user)return {migrated:0};
  const ids=new Set([...Object.keys(progress),...bookmarks]); let migrated=0;
  for(const id of ids){const p=progress[id]; await saveCloudProgress(id,p?.selected ?? p?.chosen ?? null,p?.correct ?? null,p?.bookmarked ?? bookmarks.includes(id)); migrated++;}
  return {migrated};
}

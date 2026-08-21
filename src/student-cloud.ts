import { createClient, type User } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lltdfvyommeacveqqfec.supabase.co',
  'sb_publishable_sRjoyXVHljdZ4-ACiiA8TA_oywvpopW'
);

export type ExamTrack = 'arab_board'|'yemeni_board'|'professional_masters'|'general_surgery';
export type StudentDashboard = {attempted:number;correct:number;incorrect:number;bookmarked:number;accuracy:number;recent:unknown[]};

export async function currentUser(): Promise<User|null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthChange(cb:(user:User|null)=>void) {
  return supabase.auth.onAuthStateChange((_event,session)=>cb(session?.user ?? null));
}

export async function sendMagicLink(email:string) {
  const redirect = `${window.location.origin}/beta-bank.html`;
  const { error } = await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:redirect}});
  if (error) throw error;
}

export async function signOut() { const {error}=await supabase.auth.signOut(); if(error)throw error; }

export async function ensureProfile(track:ExamTrack='general_surgery') {
  const user=await currentUser(); if(!user) return null;
  const {data,error}=await supabase.from('student_profiles').upsert({user_id:user.id,exam_track:track},{onConflict:'user_id'}).select().single();
  if(error) throw error; return data;
}

export async function setExamTrack(track:ExamTrack) {
  const user=await currentUser(); if(!user) throw new Error('authentication_required');
  const {error}=await supabase.from('student_profiles').upsert({user_id:user.id,exam_track:track},{onConflict:'user_id'}); if(error)throw error;
}

export async function saveCloudProgress(questionId:string, answerIndex:number|null, correct:boolean|null, bookmarked:boolean|null) {
  const {error}=await supabase.rpc('upsert_student_question_progress',{p_question_id:questionId,p_answer_index:answerIndex,p_correct:correct,p_bookmarked:bookmarked});
  if(error) throw error;
}

export async function getCloudDashboard():Promise<StudentDashboard|null> {
  const user=await currentUser(); if(!user)return null;
  const {data,error}=await supabase.rpc('get_student_dashboard'); if(error)throw error; return data as StudentDashboard;
}

export async function getCloudProgress() {
  const user=await currentUser(); if(!user)return [];
  const {data,error}=await supabase.from('student_question_progress').select('question_id,attempts,correct_attempts,last_answer_index,last_correct,bookmarked,updated_at').order('updated_at',{ascending:false});
  if(error)throw error; return data ?? [];
}

export async function migrateLocalProgress(progress:Record<string,{selected?:number;correct?:boolean}>,bookmarks:string[]) {
  const user=await currentUser(); if(!user)return {migrated:0};
  const ids=new Set([...Object.keys(progress),...bookmarks]); let migrated=0;
  for(const id of ids){const p=progress[id]; await saveCloudProgress(id,p?.selected ?? null,p?.correct ?? null,bookmarks.includes(id)); migrated++;}
  return {migrated};
}

import { currentUser, supabase } from './student-cloud';

export type VerifiedStats={total:number;in_review:number;verified:number;published:number;medically_reviewed:number;with_explanations:number;with_learning_points:number};
export type PublishedLearning={id:string;correct_index:number;en_explanation:string|null;ar_explanation:string|null;en_learning_point:string|null;ar_learning_point:string|null;evidence_status:string;medical_reviewed_at:string|null;evidence_reviewed_at:string|null;content_version:number;options:Array<{index:number;en_rationale:string|null;ar_rationale:string|null}>;references:unknown[];trust:{human_medically_reviewed:boolean;published_verified:boolean;has_explanation:boolean;has_learning_point:boolean;has_four_rationales:boolean;has_reference:boolean}};
export type ReviewerStatus={authorized:boolean;role:string|null;active:boolean};
export type ReviewerQueueItem={id:string;queue_index:number;category:string|null;topic:string|null;difficulty:string|null;evidence_status:string;review_tier:string;status:string;version:number;medical_reviewed_at:string|null;open_reports:number};
export type ReviewerQuestion={question:any;options:any[];references:any[];reviews:any[];reports:any[];versions:any[]};

async function service(body:Record<string,unknown>){
  const r=await fetch('/.netlify/functions/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error('Question trust service unavailable');
  return r.json();
}

export async function getVerifiedStats():Promise<VerifiedStats>{const d=await service({action:'verified-stats'});return d.stats as VerifiedStats;}
export async function getPublishedLearning(questionId:string):Promise<PublishedLearning|null>{const d=await service({action:'learning',questionId});return d.learning as PublishedLearning|null;}

export async function reportQuestion(questionId:string,reportType:string,notes:string){
  const user=await currentUser(); if(!user)throw new Error('Sign in to report a question.');
  const {data,error}=await supabase.rpc('report_content_question',{p_question_id:questionId,p_report_type:reportType,p_notes:notes||null});
  if(error)throw error; return data as string;
}

export async function reviewerStatus():Promise<ReviewerStatus>{
  const {data,error}=await supabase.rpc('get_content_reviewer_status'); if(error)throw error; return data as ReviewerStatus;
}
export async function reviewerQueue(limit=30,status:string|null=null,tier:string|null=null):Promise<ReviewerQueueItem[]>{
  const {data,error}=await supabase.rpc('get_reviewer_queue',{p_limit:limit,p_status:status,p_tier:tier}); if(error)throw error; return (data??[]) as ReviewerQueueItem[];
}
export async function reviewerQuestion(questionId:string):Promise<ReviewerQuestion>{
  const {data,error}=await supabase.rpc('get_reviewer_question',{p_question_id:questionId}); if(error)throw error; return data as ReviewerQuestion;
}
export async function reviewQuestion(questionId:string,decision:'approve'|'needs_changes'|'reject',notes:string,evidenceSnapshot:unknown|null){
  const {data,error}=await supabase.rpc('review_content_question',{p_question_id:questionId,p_decision:decision,p_notes:notes||null,p_evidence_snapshot:evidenceSnapshot}); if(error)throw error; return data;
}
export async function publishQuestion(questionId:string,notes:string){
  const {data,error}=await supabase.rpc('publish_verified_question',{p_question_id:questionId,p_notes:notes||null}); if(error)throw error; return data;
}
export async function resolveReport(reportId:string,status:'triaged'|'resolved'|'dismissed',notes:string){
  const {data,error}=await supabase.rpc('resolve_content_question_report',{p_report_id:reportId,p_status:status,p_notes:notes||null}); if(error)throw error; return data;
}

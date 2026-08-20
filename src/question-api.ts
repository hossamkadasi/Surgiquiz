import type { Question } from './content';
type ApiOption={index:number;en:string;ar:string|null};
type ApiQuestion={id:string;queue_index?:number;category:string|null;topic:string|null;difficulty:string|null;evidence_status?:string;review_tier?:string;en_stem:string;ar_stem:string|null;options:ApiOption[]};
export type ApiAnswer={id:string;correct_index:number|null;en_explanation:string|null;ar_explanation:string|null;evidence_status?:string;review_tier?:string;answer_available?:boolean};
export type RemoteQuestion=Question&{remote:true;answerLoaded:boolean;queueIndex?:number;evidenceStatus?:string;reviewTier?:string;beta?:boolean};
const mapQ=(q:ApiQuestion,beta=false):RemoteQuestion=>({id:q.id,category:q.category||'General Surgery',topic:q.topic||'General Surgery',difficulty:q.difficulty==='easy'||q.difficulty==='hard'?q.difficulty:'medium',ar:q.ar_stem||q.en_stem,en:q.en_stem,arOptions:(q.options||[]).map(o=>o.ar||o.en),enOptions:(q.options||[]).map(o=>o.en),correct:-1,arExplanation:'',enExplanation:'',remote:true,answerLoaded:false,queueIndex:q.queue_index,evidenceStatus:q.evidence_status,reviewTier:q.review_tier,beta});
async function call(body:Record<string,unknown>){const r=await fetch('/.netlify/functions/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Question service unavailable');return r.json();}
export async function loadPublishedQuestions(limit=20){const d=await call({action:'list',limit,seed:`${Date.now()}-${Math.random()}`});return (d.questions||[]).map((q:ApiQuestion)=>mapQ(q));}
export async function loadPublishedAnswer(questionId:string):Promise<ApiAnswer|null>{const d=await call({action:'answer',questionId});return d.answer||null;}
export async function loadBetaQuestions(limit=20,offset=0,category:string|null=null,seed='full-book'){const d=await call({action:'beta-list',limit,offset,category,seed});return (d.questions||[]).map((q:ApiQuestion)=>mapQ(q,true));}
export async function loadBetaAnswer(questionId:string):Promise<ApiAnswer|null>{const d=await call({action:'beta-answer',questionId});return d.answer||null;}
export async function loadBetaFacets(){const d=await call({action:'beta-facets'});return d.facets as {total:number;categories:{name:string;count:number}[];evidence:{name:string;count:number}[]};}

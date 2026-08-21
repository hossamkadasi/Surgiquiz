import { supabase } from './student-cloud';

export type ReadinessData = {
  score:number;
  band:string;
  attempted:number;
  components:{
    question_accuracy:number;
    domain_mastery:number;
    mock_exam_performance:number;
    mock_exam_count:number;
    coverage:number;
  };
  daily_plan:Array<{category:string;questions:number;accuracy:number}>;
  methodology:{
    question_accuracy_weight:number;
    domain_mastery_weight:number;
    mock_exam_weight:number;
    coverage_weight:number;
    is_official_board_prediction:boolean;
  };
};

export type PerformanceTrend = {
  exams:Array<{id:string;date:string;percentage:number|null;question_count:number;category:string|null;timed:boolean}>;
  recent_question_activity:Array<{date:string;questions:number;accuracy:number|null}>;
};

export async function getReadiness():Promise<ReadinessData>{
  const {data,error}=await supabase.rpc('get_student_readiness');
  if(error)throw error;
  return data as ReadinessData;
}

export async function getPerformanceTrend(limit=10):Promise<PerformanceTrend>{
  const {data,error}=await supabase.rpc('get_student_performance_trend',{p_limit:limit});
  if(error)throw error;
  return data as PerformanceTrend;
}

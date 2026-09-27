import { supabase } from './client';
import type { Question, QuestionOption, BranchingRule, SurveyResponse, AnswerValue } from '@/types/models';

// ========== Fetch Survey Data ==========

export const fetchActiveQuestions = async (surveyId: string, sectorId: string): Promise<Question[]> => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('survey_id', surveyId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  // Filter by section sector_ids (null = show to all)
  const { data: sections } = await supabase
    .from('survey_sections')
    .select('*')
    .eq('survey_id', surveyId);

  if (!sections) return data ?? [];

  const sectorSections = sections.filter(s =>
    s.sector_ids === null || s.sector_ids.includes(sectorId)
  ).map(s => s.id);

  return (data ?? []).filter(q => sectorSections.includes(q.section_id));
};

export const fetchQuestionOptions = async (questionIds: string[]): Promise<Record<string, QuestionOption[]>> => {
  if (questionIds.length === 0) return {};
  const { data, error } = await supabase
    .from('question_options')
    .select('*')
    .in('question_id', questionIds)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const result: Record<string, QuestionOption[]> = {};
  for (const opt of data ?? []) {
    if (!result[opt.question_id]) result[opt.question_id] = [];
    result[opt.question_id]!.push(opt);
  }
  return result;
};

export const fetchBranchingRules = async (surveyId: string): Promise<BranchingRule[]> => {
  const { data, error } = await supabase
    .from('branching_rules')
    .select('*')
    .eq('survey_id', surveyId)
    .eq('is_active', true);

  if (error) throw error;
  return (data ?? []).map(r => ({
    ...r,
    combinator: r.combinator as 'AND' | 'OR',
  })) satisfies BranchingRule[];
};

export const fetchPublishedSurvey = async () => {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};

// ========== Session Management ==========
// نموذج الأمان: anon لا يملك SELECT على survey_responses (الردود مغلقة
// القراءة تمامًا)، فلا يمكن قراءة الصف بعد الإنشاء (RETURNING مرفوض).
// لذلك يولّد العميل معرّف الاستجابة بنفسه — الـuuid هو رمز الوصول،
// والكتابة لاحقًا عبر دوال SECURITY DEFINER تتحقق أن الرد ما زال مفتوحًا.

export const createSurveyResponse = async (
  surveyId: string,
  sectorId: string,
  firstQuestionId: string
): Promise<SurveyResponse> => {
  const id = crypto.randomUUID();
  const startedAt = new Date().toISOString();

  const { error } = await supabase.from('survey_responses').insert({
    id,
    survey_id: surveyId,
    sector_id: sectorId,
    current_question_id: firstQuestionId,
    visited_question_ids: [firstQuestionId],
    is_completed: false,
    started_at: startedAt,
  });
  if (error) throw error;

  return {
    id,
    survey_id: surveyId,
    organization_id: null,
    respondent_id: null,
    sector_id: sectorId,
    current_question_id: firstQuestionId,
    visited_question_ids: [firstQuestionId],
    is_completed: false,
    started_at: startedAt,
    completed_at: null,
  };
};

export const upsertAnswer = async (
  responseId: string,
  questionId: string,
  value: AnswerValue
): Promise<void> => {
  const { error } = await supabase.rpc('upsert_answer', {
    p_response_id: responseId,
    p_question_id: questionId,
    p_value: value,
  });
  if (error) throw error;
};

export const updateSurveyProgress = async (
  responseId: string,
  currentQuestionId: string,
  visitedIds: string[]
): Promise<void> => {
  const { error } = await supabase.rpc('save_survey_progress', {
    p_response_id: responseId,
    p_question_id: currentQuestionId,
    p_visited: visitedIds,
  });
  if (error) throw error;
};

export const completeSurveyResponse = async (responseId: string): Promise<void> => {
  const { error } = await supabase.rpc('complete_response', {
    p_response_id: responseId,
  });
  if (error) throw error;
};

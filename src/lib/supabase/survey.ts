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

export const createSurveyResponse = async (
  surveyId: string,
  sectorId: string,
  firstQuestionId: string
): Promise<SurveyResponse> => {
  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      survey_id: surveyId,
      sector_id: sectorId,
      current_question_id: firstQuestionId,
      visited_question_ids: [firstQuestionId],
      is_completed: false,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const upsertAnswer = async (
  responseId: string,
  questionId: string,
  value: AnswerValue
): Promise<void> => {
  const { error } = await supabase
    .from('answers')
    .upsert(
      { response_id: responseId, question_id: questionId, value: value as string | string[] | number },
      { onConflict: 'response_id,question_id' }
    );
  if (error) throw error;
};

export const updateSurveyProgress = async (
  responseId: string,
  currentQuestionId: string,
  visitedIds: string[]
): Promise<void> => {
  const { error } = await supabase
    .from('survey_responses')
    .update({
      current_question_id: currentQuestionId,
      visited_question_ids: visitedIds,
    })
    .eq('id', responseId);
  if (error) throw error;
};

export const completeSurveyResponse = async (responseId: string): Promise<void> => {
  const { error } = await supabase
    .from('survey_responses')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', responseId);
  if (error) throw error;
};

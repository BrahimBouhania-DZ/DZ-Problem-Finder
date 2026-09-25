export type UserRole = 'admin' | 'researcher'
export type SurveyStatus = 'draft' | 'published' | 'closed'
export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'open_text'
  | 'number'
  | 'scale'
export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'greater_than'
  | 'greater_or_equal'
  | 'less_than'
  | 'less_or_equal'
  | 'in'
  | 'not_in'
export type RuleAction = 'show' | 'hide' | 'jump_to_section' | 'skip'
export type ProblemStatus =
  | 'DISCOVERED'
  | 'REPEATED'
  | 'EVIDENCED'
  | 'VALIDATED'
  | 'DEMAND_CONFIRMED'
  | 'PAYMENT_VALIDATED'
export type EvidenceType =
  | 'survey'
  | 'interview'
  | 'observation'
  | 'existing_solution'
  | 'customer_request'
  | 'prototype_test'
  | 'quote_request'
  | 'payment'

export interface Sector {
  id: string
  label: string
  icon: string
  color: string
  sort_order: number
}

export interface Wilaya {
  id: number
  code: number
  name_ar: string
  name_fr: string
}

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Survey {
  id: string
  title: string
  status: SurveyStatus
  version: number
  created_at: string
  updated_at: string
}

export interface SurveySection {
  id: string
  survey_id: string
  title: string
  sort_order: number
  sector_ids: string[] | null
}

export interface Question {
  id: string
  survey_id: string
  section_id: string
  key: string
  title: string
  description: string | null
  type: QuestionType
  required: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuestionOption {
  id: string
  question_id: string
  value: string
  label: string
  sort_order: number
}

export interface BranchingRule {
  id: string
  survey_id: string
  question_id: string
  target_question_id: string | null
  target_section_id: string | null
  operator: RuleOperator
  compare_value: string[]
  combinator: 'AND' | 'OR'
  action: RuleAction
  priority: number
  is_active: boolean
}

export interface Organization {
  id: string
  sector_id: string
  size_range: string
  age_range: string | null
  wilaya_id: number | null
  current_tools: string[]
  created_at: string
}

export interface Respondent {
  id: string
  organization_id: string | null
  role: string
  contact_email: string | null
}

export interface SurveyResponse {
  id: string
  survey_id: string
  organization_id: string | null
  respondent_id: string | null
  sector_id: string
  current_question_id: string | null
  visited_question_ids: string[]
  is_completed: boolean
  started_at: string
  completed_at: string | null
}

export type AnswerValue = string | string[] | number | null

export interface Answer {
  id: string
  response_id: string
  question_id: string
  value: AnswerValue
  created_at: string
}

export interface Problem {
  id: string
  title: string
  description: string | null
  sector_id: string | null
  category_id: string | null
  status: ProblemStatus
  frequency_level: number | null
  severity_level: number | null
  time_impact_hours: number | null
  financial_impact_dzd: number | null
  affected_people: number | null
  current_solution: string | null
  solution_gap: string | null
  feasibility: number | null
  discovered_at: string
  validated_at: string | null
  created_at: string
  updated_at: string
}

export interface ProblemSource {
  id: string
  problem_id: string
  source_type: string
  answer_id: string | null
  response_id: string | null
  interview_id: string | null
  notes: string | null
  created_at: string
}

export interface Evidence {
  id: string
  problem_id: string
  evidence_type: EvidenceType
  source: string | null
  description: string | null
  organization_id: string | null
  respondent_id: string | null
  interview_id: string | null
  evidence_strength: number
  created_at: string
}

export interface ValidationInterview {
  id: string
  problem_id: string
  organization_id: string | null
  respondent_id: string | null
  happened_on: string
  duration_min: number | null
  summary: string | null
  pain_level: number | null
  current_solution: string | null
  past_spending_dzd: number | null
  willing_to_test: boolean | null
  willing_to_pay_dzd: number | null
  validation_result: string | null
  notes: string | null
  created_at: string
}

export interface ValidationScores {
  problem_id: string
  frequency: number | null
  severity: number | null
  time_loss: number | null
  financial_impact: number | null
  reach: number | null
  feasibility: number | null
  willingness_to_pay: number | null
  calculated_at: string
}

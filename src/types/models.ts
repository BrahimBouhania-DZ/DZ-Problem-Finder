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
  | 'less_than'
  | 'in'

export type RuleAction = 'show' | 'hide' | 'jump_to_section' | 'skip'

export interface Sector {
  id: string
  label: string
  color: string
}

export interface Survey {
  id: string
  title: string
  status: 'draft' | 'published' | 'closed'
  createdAt: string
}

export interface SurveySection {
  id: string
  surveyId: string
  title: string
  order: number
  sectorIds: string[] | null
}

export interface Question {
  id: string
  sectionId: string
  type: QuestionType
  text: string
  required: boolean
  order: number
}

export interface QuestionOption {
  id: string
  questionId: string
  label: string
  value: string
  order: number
}

export interface BranchingRule {
  id: string
  surveyId: string
  sourceQuestionId: string
  operator: RuleOperator
  compareValue: string | string[]
  combinator: 'AND' | 'OR'
  action: RuleAction
  targetQuestionId: string | null
  targetSectionId: string | null
  priority: number
}

export interface SurveySession {
  id: string
  surveyId: string
  sectorId: string
  currentQuestionId: string | null
  visitedQuestionIds: string[]
  answers: Record<string, AnswerValue>
  startedAt: string
  completedAt: string | null
}

export type AnswerValue = string | string[] | number | null

export interface Organization {
  id: string
  sectorId: string
  size: string
  foundedRange: string
  wilaya: string | null
}

export interface Respondent {
  id: string
  role: string
  organizationId: string | null
  contactEmail: string | null
}

export interface Problem {
  id: string
  title: string
  description: string
  categoryId: string | null
  status: ProblemStatus
  opportunityScore: number | null
  discoveredAt: string
}

export type ProblemStatus =
  | 'DISCOVERED'
  | 'REPEATED'
  | 'EVIDENCED'
  | 'VALIDATED'
  | 'DEMAND_CONFIRMED'
  | 'PAYMENT_VALIDATED'

export interface Evidence {
  id: string
  problemId: string
  type: 'survey' | 'interview' | 'observation' | 'competitor' | 'prototype'
  weight: number
  note: string
  createdAt: string
}

export interface Validation {
  id: string
  problemId: string
  frequency: number | null
  timeLossHours: number | null
  severity: number | null
  financialImpact: number | null
  errorRate: number | null
  willingnessToPay: number | null
  reviewedAt: string | null
}

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'researcher'
}

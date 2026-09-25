import type { AnswerValue, BranchingRule, Question, RuleOperator } from '@/types/models'

const evaluate = (
  answer: AnswerValue | undefined,
  operator: RuleOperator,
  compareValue: string | string[],
): boolean => {
  if (answer === undefined || answer === null) return false

  switch (operator) {
    case 'equals':
      return String(answer) === String(compareValue)
    case 'not_equals':
      return String(answer) !== String(compareValue)
    case 'contains':
      return Array.isArray(answer)
        ? answer.map(String).includes(String(compareValue))
        : String(answer).includes(String(compareValue))
    case 'greater_than':
      return Number(answer) > Number(compareValue)
    case 'less_than':
      return Number(answer) < Number(compareValue)
    case 'in':
      return Array.isArray(compareValue)
        ? compareValue.map(String).includes(String(answer))
        : false
  }
}

const matches = (rules: BranchingRule[], answers: Record<string, AnswerValue>) => {
  if (rules.length === 0) return false
  const results = rules.map((rule) =>
    evaluate(answers[rule.sourceQuestionId], rule.operator, rule.compareValue),
  )
  return rules[0]?.combinator === 'OR' ? results.some(Boolean) : results.every(Boolean)
}

export const resolveNextQuestion = (
  questions: Question[],
  rules: BranchingRule[],
  currentQuestionId: string,
  answers: Record<string, AnswerValue>,
): Question | null => {
  const applicable = rules
    .filter((rule) => rule.sourceQuestionId === currentQuestionId)
    .sort((a, b) => b.priority - a.priority)

  for (const rule of applicable) {
    if (!evaluate(answers[currentQuestionId], rule.operator, rule.compareValue)) continue

    if (rule.action === 'skip') continue

    if (rule.action === 'jump_to_section') {
      const jump = questions.find((q) => q.sectionId === rule.targetSectionId)
      if (jump) return jump
    }

    if (rule.action === 'show' || rule.action === 'hide') {
      const target = questions.find((q) => q.id === rule.targetQuestionId)
      if (!target) continue
      const siblings = applicable.filter((r) => r.targetQuestionId === target.id)
      const visible = matches(siblings, answers)
      if (rule.action === 'show' ? visible : !visible) return target
    }
  }

  const current = questions.find((q) => q.id === currentQuestionId)
  if (!current) return questions[0] ?? null
  const nextIndex = questions.findIndex((q) => q.id === currentQuestionId) + 1
  return questions[nextIndex] ?? null
}

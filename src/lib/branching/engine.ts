import type {
  AnswerValue,
  BranchingRule,
  Question,
  RuleOperator,
} from '@/types/models'

const asList = (value: string[] | string): string[] =>
  Array.isArray(value) ? value : [value]

const evaluate = (
  answer: AnswerValue | undefined,
  operator: RuleOperator,
  compareValue: string[],
): boolean => {
  if (answer === undefined || answer === null) return false

  const targets = asList(compareValue)

  switch (operator) {
    case 'equals':
      return targets.includes(String(answer))
    case 'not_equals':
      return !targets.includes(String(answer))
    case 'in':
      return targets.includes(String(answer))
    case 'not_in':
      return !targets.includes(String(answer))
    case 'contains':
      return Array.isArray(answer)
        ? answer.map(String).some((v) => targets.includes(v))
        : targets.some((v) => String(answer).includes(v))
    case 'greater_than':
      return Number(answer) > Number(targets[0])
    case 'greater_or_equal':
      return Number(answer) >= Number(targets[0])
    case 'less_than':
      return Number(answer) < Number(targets[0])
    case 'less_or_equal':
      return Number(answer) <= Number(targets[0])
  }
}

const combine = (
  rules: BranchingRule[],
  answers: Record<string, AnswerValue>,
): boolean => {
  if (rules.length === 0) return false
  const results = rules.map((rule) =>
    evaluate(answers[rule.question_id], rule.operator, rule.compare_value),
  )
  return rules[0]!.combinator === 'OR' ? results.some(Boolean) : results.every(Boolean)
}

const firstVisible = (
  questions: Question[],
  rules: BranchingRule[],
  startIndex: number,
  answers: Record<string, AnswerValue>,
): Question | null => {
  for (let i = startIndex; i < questions.length; i += 1) {
    const candidate = questions[i]!
    if (!candidate.is_active) continue
    if (isQuestionVisible(candidate.id, rules, answers)) return candidate
  }
  return null
}

export const isQuestionVisible = (
  questionId: string,
  rules: BranchingRule[],
  answers: Record<string, AnswerValue>,
): boolean => {
  const targeting = rules
    .filter((rule) => rule.target_question_id === questionId)
    .sort((a, b) => b.priority - a.priority)
  if (targeting.length === 0) return true

  for (const rule of targeting) {
    const fired = evaluate(
      answers[rule.question_id],
      rule.operator,
      rule.compare_value,
    )
    if (rule.action === 'show' && fired) return true
    if (rule.action === 'hide' && fired) return false
  }

  const showRules = targeting.filter((rule) => rule.action === 'show')
  if (showRules.length === 0) return true
  return combine(showRules, answers)
}

export const resolveNextQuestion = (
  questions: Question[],
  rules: BranchingRule[],
  currentQuestionId: string,
  answers: Record<string, AnswerValue>,
): Question | null => {
  const currentIndex = questions.findIndex((q) => q.id === currentQuestionId)
  if (currentIndex === -1) return firstVisible(questions, rules, 0, answers)

  const jumps = rules
    .filter(
      (rule) =>
        rule.question_id === currentQuestionId && rule.action === 'jump_to_section',
    )
    .sort((a, b) => b.priority - a.priority)

  for (const jump of jumps) {
    if (!evaluate(answers[currentQuestionId], jump.operator, jump.compare_value)) {
      continue
    }
    const sectionIndex = questions.findIndex(
      (q) => q.section_id === jump.target_section_id,
    )
    if (sectionIndex > -1) {
      return firstVisible(questions, rules, sectionIndex, answers)
    }
  }

  return firstVisible(questions, rules, currentIndex + 1, answers)
}

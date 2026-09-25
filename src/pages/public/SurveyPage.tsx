import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { ProgressBar } from '@/components/ui/ProgressBar/ProgressBar';
import { AnswerCard } from '@/components/forms/AnswerCard/AnswerCard';
import { setSectorTheme } from '@/lib/utils/theme';
import { resolveNextQuestion, isQuestionVisible } from '@/lib/branching/engine';
import {
  fetchPublishedSurvey,
  fetchActiveQuestions,
  fetchQuestionOptions,
  fetchBranchingRules,
  createSurveyResponse,
  upsertAnswer,
  updateSurveyProgress,
  completeSurveyResponse,
} from '@/lib/supabase/survey';
import type { Question, QuestionOption, BranchingRule, AnswerValue } from '@/types/models';
import './SurveyPage.css';

type SurveyPhase = 'loading' | 'error' | 'active' | 'done';

interface SurveyState {
  surveyId: string;
  responseId: string;
  questions: Question[];
  options: Record<string, QuestionOption[]>;
  rules: BranchingRule[];
  currentQuestion: Question;
  answers: Record<string, AnswerValue>;
  visitedIds: string[];
}

export default function SurveyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sectorId = searchParams.get('sector') ?? localStorage.getItem('dz_sector') ?? 'commerce';

  const [phase, setPhase] = useState<SurveyPhase>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [state, setState] = useState<SurveyState | null>(null);
  const [pendingAnswer, setPendingAnswer] = useState<AnswerValue>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Apply sector theme
  useEffect(() => {
    setSectorTheme(sectorId);
  }, [sectorId]);

  // Load survey on mount
  useEffect(() => {
    const load = async () => {
      try {
        const survey = await fetchPublishedSurvey();
        const questions = await fetchActiveQuestions(survey.id, sectorId);
        if (questions.length === 0) throw new Error('لا توجد أسئلة لهذا القطاع');

        const options = await fetchQuestionOptions(questions.map(q => q.id));
        const rules = await fetchBranchingRules(survey.id);
        const firstQ = questions[0]!;

        const response = await createSurveyResponse(survey.id, sectorId, firstQ.id);

        setState({
          surveyId: survey.id,
          responseId: response.id,
          questions,
          options,
          rules,
          currentQuestion: firstQ,
          answers: {},
          visitedIds: [firstQ.id],
        });
        setPhase('active');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'خطأ غير متوقع');
        setPhase('error');
      }
    };
    load();
  }, [sectorId]);


  const visibleQuestions = state
    ? state.questions.filter(q =>
        isQuestionVisible(q.id, state.rules, state.answers)
      )
    : [];

  const currentVisibleIndex = visibleQuestions.findIndex(
    q => q.id === state?.currentQuestion.id
  );

  const handleAnswer = useCallback((value: AnswerValue) => {
    setPendingAnswer(value);
  }, []);

  const handleNext = useCallback(async () => {
    if (!state || isSubmitting) return;
    if (pendingAnswer === null && state.currentQuestion.required) return;

    setIsSubmitting(true);
    try {
      const answer = pendingAnswer;
      const newAnswers = { ...state.answers };
      if (answer !== null) {
        newAnswers[state.currentQuestion.id] = answer;
        await upsertAnswer(state.responseId, state.currentQuestion.id, answer);
      }

      const next = resolveNextQuestion(
        state.questions,
        state.rules,
        state.currentQuestion.id,
        newAnswers
      );

      if (!next) {
        // Survey complete
        await completeSurveyResponse(state.responseId);
        setPhase('done');
        return;
      }

      const newVisited = state.visitedIds.includes(next.id)
        ? state.visitedIds
        : [...state.visitedIds, next.id];

      await updateSurveyProgress(state.responseId, next.id, newVisited);

      // Animate transition
      setIsAnimating(true);
      setTimeout(() => {
        setState(prev => prev ? {
          ...prev,
          answers: newAnswers,
          currentQuestion: next,
          visitedIds: newVisited,
        } : null);
        setPendingAnswer(null);
        setIsAnimating(false);
      }, 280);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }, [state, pendingAnswer, isSubmitting]);

  const handleBack = useCallback(() => {
    if (!state || state.visitedIds.length <= 1) return;
    const prevId = state.visitedIds[state.visitedIds.length - 2];
    const prevQ = state.questions.find(q => q.id === prevId);
    if (!prevQ) return;

    setIsAnimating(true);
    setTimeout(() => {
      setState(prev => prev ? {
        ...prev,
        currentQuestion: prevQ,
        visitedIds: prev.visitedIds.slice(0, -1),
      } : null);
      setPendingAnswer(state.answers[prevQ.id] ?? null);
      setIsAnimating(false);
    }, 280);
  }, [state]);

  // ======= RENDER =======

  if (phase === 'loading') {
    return (
      <div className="survey-page survey-page--loading">
        <div className="survey-spinner" />
        <p>جارٍ تحميل الاستبيان...</p>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="survey-page survey-page--error">
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2>حدث خطأ</h2>
        <p>{errorMsg}</p>
        <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="survey-page survey-page--done">
        <div className="survey-done-icon">✅</div>
        <h1>شكراً لمشاركتك!</h1>
        <p>تم تسجيل إجاباتك بنجاح. ستساهم بياناتك في اكتشاف فرص حقيقية في السوق الجزائري.</p>
        <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
      </div>
    );
  }

  if (!state) return null;

  const { currentQuestion, options, answers } = state;
  const currentOptions = options[currentQuestion.id] ?? [];
  const currentAnswer = answers[currentQuestion.id] ?? pendingAnswer;
  const isAnswered = currentAnswer !== null && currentAnswer !== undefined &&
    !(Array.isArray(currentAnswer) && currentAnswer.length === 0);
  const canProceed = !currentQuestion.required || isAnswered;

  return (
    <div className="survey-page">
      {/* Header */}
      <header className="survey-header">
        <button
          className="survey-back-btn"
          onClick={handleBack}
          disabled={state.visitedIds.length <= 1}
          aria-label="السؤال السابق"
        >
          <ArrowRight size={18} />
          <span>السابق</span>
        </button>
        <ProgressBar
          current={currentVisibleIndex + 1}
          total={visibleQuestions.length}
        />
      </header>

      {/* Question Body */}
      <main className={`survey-body ${isAnimating ? 'survey-body--exit' : 'survey-body--enter'}`}>
        <div className="survey-question">
          <p className="survey-question__key">
            {currentQuestion.key}
          </p>
          <h2 className="survey-question__title">{currentQuestion.title}</h2>
          {currentQuestion.description && (
            <p className="survey-question__desc">{currentQuestion.description}</p>
          )}
        </div>

        <div className="survey-answers">
          {/* Single / Multi choice */}
          {(currentQuestion.type === 'single_choice' || currentQuestion.type === 'multi_choice') && (
            <div className="answer-list">
              {currentOptions.map(opt => {
                const isMulti = currentQuestion.type === 'multi_choice';
                const isSelected = isMulti
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(opt.value)
                  : currentAnswer === opt.value;
                return (
                  <AnswerCard
                    key={opt.id}
                    option={opt}
                    isSelected={isSelected}
                    isMulti={isMulti}
                    currentAnswer={currentAnswer ?? null}
                    onSelect={handleAnswer}
                  />
                );
              })}
            </div>
          )}

          {/* Open text */}
          {currentQuestion.type === 'open_text' && (
            <textarea
              className="survey-textarea"
              placeholder="اكتب إجابتك هنا..."
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={e => handleAnswer(e.target.value)}
              rows={4}
              id={`q-${currentQuestion.id}-text`}
            />
          )}

          {/* Number */}
          {currentQuestion.type === 'number' && (
            <input
              type="number"
              className="survey-input"
              placeholder="أدخل رقماً..."
              value={typeof currentAnswer === 'number' ? currentAnswer : ''}
              onChange={e => handleAnswer(Number(e.target.value))}
              id={`q-${currentQuestion.id}-num`}
            />
          )}

          {/* Scale 1-10 */}
          {currentQuestion.type === 'scale' && (
            <div className="survey-scale">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  id={`scale-${currentQuestion.id}-${n}`}
                  type="button"
                  className={`scale-btn ${currentAnswer === n ? 'scale-btn--selected' : ''}`}
                  onClick={() => handleAnswer(n)}
                >
                  {n}
                </button>
              ))}
              <div className="scale-labels">
                <span>منخفض جداً</span>
                <span>مرتفع جداً</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="survey-footer">
          {!currentQuestion.required && (
            <button
              type="button"
              className="survey-skip-btn"
              onClick={handleNext}
            >
              تخطى
            </button>
          )}
          <Button
            id="btn-next-question"
            variant="primary"
            size="lg"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? 'جارٍ الحفظ...' : 'التالي'}
            <ChevronRight size={18} style={{ marginRight: '0.25rem' }} />
          </Button>
        </footer>
      </main>
    </div>
  );
}

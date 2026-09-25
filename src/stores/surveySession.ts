import { useState, useEffect } from 'react';
import type { AnswerValue } from '@/types/models';

export interface SurveySession {
  sectorId: string | null;
  currentQuestionId: string | null;
  answers: Record<string, AnswerValue>;
  visitedQuestionIds: string[];
}

const STORAGE_KEY = 'dz_survey_session';

const defaultSession: SurveySession = {
  sectorId: null,
  currentQuestionId: null,
  answers: {},
  visitedQuestionIds: [],
};

export const useSurveySession = () => {
  const [session, setSession] = useState<SurveySession>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : defaultSession;
    } catch {
      return defaultSession;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const setSector = (sectorId: string) => {
    setSession(prev => ({ ...prev, sectorId }));
  };

  const setAnswer = (questionId: string, answer: AnswerValue) => {
    setSession(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer }
    }));
  };

  const setCurrentQuestion = (questionId: string) => {
    setSession(prev => {
      const newVisited = prev.visitedQuestionIds.includes(questionId)
        ? prev.visitedQuestionIds
        : [...prev.visitedQuestionIds, questionId];
      return {
        ...prev,
        currentQuestionId: questionId,
        visitedQuestionIds: newVisited
      };
    });
  };

  const clearSession = () => {
    setSession(defaultSession);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { session, setSector, setAnswer, setCurrentQuestion, clearSession };
};

import React from 'react';
import { Check } from 'lucide-react';
import type { QuestionOption } from '@/types/models';
import type { AnswerValue } from '@/types/models';
import './AnswerCard.css';

interface AnswerCardProps {
  option: QuestionOption;
  isSelected: boolean;
  isMulti?: boolean;
  onSelect: (value: AnswerValue) => void;
  currentAnswer: AnswerValue;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  option,
  isSelected,
  isMulti,
  onSelect,
  currentAnswer,
}) => {
  const handleClick = () => {
    if (isMulti) {
      const current = Array.isArray(currentAnswer) ? currentAnswer : [];
      const next = isSelected
        ? current.filter(v => v !== option.value)
        : [...current, option.value];
      onSelect(next);
    } else {
      onSelect(option.value);
    }
  };

  return (
    <button
      id={`option-${option.id}`}
      type="button"
      className={`answer-card ${isSelected ? 'answer-card--selected' : ''}`}
      onClick={handleClick}
      aria-pressed={isSelected}
    >
      <span className="answer-card__indicator">
        {isSelected ? <Check size={14} /> : null}
      </span>
      <span className="answer-card__label">{option.label}</span>
    </button>
  );
};

import React from 'react';
import { StudyMaterialView } from './StudyMaterialView';
import { QuizConfig } from '../../types';

interface QuestionBankViewProps {
  onStartQuiz?: (quiz: QuizConfig) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ onStartQuiz }) => {
  return <StudyMaterialView initialTab="qbank" onStartQuiz={onStartQuiz} />;
};

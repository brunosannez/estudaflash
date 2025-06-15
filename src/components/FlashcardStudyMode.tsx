
import React from 'react';
import FlashcardStudyModeImproved from './FlashcardStudyModeImproved';
import './FlashcardAnimations.css';

interface FlashcardStudyModeProps {
  resumoId: string;
  onBack: () => void;
}

const FlashcardStudyMode = ({ resumoId, onBack }: FlashcardStudyModeProps) => {
  return <FlashcardStudyModeImproved resumoId={resumoId} onBack={onBack} />;
};

export default FlashcardStudyMode;

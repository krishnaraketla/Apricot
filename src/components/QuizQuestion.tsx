import React, { useState } from 'react';
import '../styles/components/QuizQuestion.css';

interface QuizQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
  onAnswerSubmit: (isCorrect: boolean) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  options,
  correctAnswer,
  onAnswerSubmit
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const handleOptionSelect = (index: number) => {
    if (!hasSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null && !hasSubmitted) {
      const isCorrect = selectedOption === correctAnswer;
      setHasSubmitted(true);
      onAnswerSubmit(isCorrect);
    }
  };

  const getOptionClass = (index: number) => {
    if (!hasSubmitted || selectedOption !== index) {
      return selectedOption === index ? 'selected' : '';
    }
    
    if (index === correctAnswer) {
      return 'correct';
    }
    
    return selectedOption === index ? 'incorrect' : '';
  };

  return (
    <div className="quiz-question">
      <h3 className="question-text">{question}</h3>
      <div className="options-container">
        {options.map((option, index) => (
          <div 
            key={index}
            className={`option ${getOptionClass(index)}`}
            onClick={() => handleOptionSelect(index)}
          >
            <span className="option-letter">
              {String.fromCharCode(65 + index)}
            </span>
            <span className="option-text">{option}</span>
          </div>
        ))}
      </div>
      <button 
        className="submit-btn"
        onClick={handleSubmit}
        disabled={selectedOption === null || hasSubmitted}
      >
        {hasSubmitted ? 'Submitted' : 'Submit Answer'}
      </button>
      
      {hasSubmitted && (
        <div className={`feedback ${selectedOption === correctAnswer ? 'correct-feedback' : 'incorrect-feedback'}`}>
          {selectedOption === correctAnswer 
            ? 'Correct!' 
            : `Incorrect. The correct answer is ${String.fromCharCode(65 + correctAnswer)}.`}
        </div>
      )}
    </div>
  );
};

export default QuizQuestion; 
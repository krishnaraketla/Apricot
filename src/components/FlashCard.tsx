import React, { useState } from 'react';
import '../styles/components/FlashCard.css';

interface FlashCardProps {
  front: string;
  back: string;
}

const FlashCard: React.FC<FlashCardProps> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`flash-card ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
    >
      <div className="flash-card-inner">
        <div className="flash-card-front">
          <p>{front}</p>
        </div>
        <div className="flash-card-back">
          <p>{back}</p>
        </div>
      </div>
    </div>
  );
};

export default FlashCard; 
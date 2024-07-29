import React from 'react';
import AnswerButton from '../AnswerBox/AnswerBtn';

const Question: React.FC<{ question: string }> = ({ question }) => {
  const answers = ['Paris', 'London', 'Berlin'];
  return (
    <div className="question-section bg-gray-100 p-4 rounded-lg shadow-md">
      <h1 className="text-xl text-black font-semibold mb-2">Answer the Question:</h1>
      <h2 className="text-lg text-black font-semibold mb-2">Question:</h2>
      <p className="text-black text-base">{question}</p>
      <div className="grid grid-cols-2 gap-4">
        {answers.map((answer, index) => (
          <AnswerButton key={index} text={answer} />
        ))}
      </div>
    </div>
  );
};

export default Question;

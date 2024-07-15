const AnswerButton: React.FC<{ text: string }> = ({ text }) => {
    return (
      <button className="answer-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        {text}
      </button>
    );
  };

export default AnswerButton;
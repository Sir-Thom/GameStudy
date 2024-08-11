import React, { useState, useEffect } from 'react';

const GameView: React.FC = () => {
  const [question, setQuestion] = useState<string>('What is 2 + 2?'); // Example question
  const [answer, setAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [playerHealth, setPlayerHealth] = useState<number>(100);
  const [enemyHealth, setEnemyHealth] = useState<number>(100);

  const correctAnswer = '4'; // Example correct answer

  useEffect(() => {
    if (!isPlayerTurn && enemyHealth > 0) {
      // Simulate enemy action when it's not the player's turn
      simulateEnemyTurn();
    }
  }, [isPlayerTurn]);

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
  };

  const handleAction = () => {
    if (isPlayerTurn) {
      if (answer === correctAnswer) {
        setFeedback('Correct! You can now attack.');
        setIsCorrect(true);
        // Perform player action here
        // Example: Perform attack
        // updateEnemyHealth();
      } else {
        setFeedback('Incorrect. Passing turn to the enemy.');
        setIsCorrect(false);
        setIsPlayerTurn(false); // Pass turn to the enemy
      }
    }
  };

  const simulateEnemyTurn = () => {
    // Simulate enemy's turn logic
    // Example: Enemy attacks the player
    const damage = 10; // Example damage
    setPlayerHealth((prevHealth) => prevHealth - damage);

    // End the enemy's turn and switch back to the player
    setIsPlayerTurn(true);
    setFeedback('Enemy attacks you!');
  };

  return (
    <div className="w-screen h-screen text-black bg-gray-100 p-8 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold mb-6">Game View</h1>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Question:</h2>
        <p className="text-lg">{question}</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={answer}
          onChange={handleAnswerChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!isPlayerTurn} // Disable input when it's not the player's turn
        />
      </div>

      <div className="mb-6">
        <button
          onClick={handleAction}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
          disabled={!isPlayerTurn} // Disable button when it's not the player's turn
        >
          Submit Answer
        </button>
      </div>

      <div className="mt-6">
        {feedback && (
          <p className={`text-lg ${isCorrect === true ? 'text-green-600' : 'text-red-600'}`}>
            {feedback}
          </p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Your Stats:</h2>
        <p>Health: {playerHealth}</p>
        {/* Display other player stats here */}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">Enemy Stats:</h2>
        <p>Health: {enemyHealth}</p>
        {/* Display other enemy stats here */}
      </div>
    </div>
  );
};

export default GameView;

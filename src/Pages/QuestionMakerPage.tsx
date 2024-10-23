import { path } from '@tauri-apps/api';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import SidebarQuiz from '../components/UI/Sidebar/SidebarQuiz';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../components/UI/Alert/Alert';
export function QuestionMakerPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [answerType, setAnswerType] = useState<'single' | 'multiple'>('single');
  const [singleAnswer, setSingleAnswer] = useState('');
  const [multipleChoices, setMultipleChoices] = useState([{ id: 1, text: '', correct: false }]);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState('');
  const handleAddQuestion = () => {
    const newQuestion = {
      question,
      answerType,
      answer: answerType === 'single' ? singleAnswer : multipleChoices,
    };

    if (editingIndex !== null) {
      const updatedQuestions = [...quizQuestions];
      updatedQuestions[editingIndex] = newQuestion;
      setQuizQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuizQuestions([...quizQuestions, newQuestion]);
    }

    resetForm();
  };

  const handleSaveQuiz = async () => {
    if (!title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    const quiz = {
      quiz_title: title,
      questions: quizQuestions.map((q) => ({
        question_text: q.question,
        answer_type: q.answerType,
        single_answer: q.answerType === 'single' ? q.answer : undefined,
        choices: q.answerType === 'multiple' ? q.answer : undefined,
      })),
    };

    const appdir = (await path.appDataDir()) + '/quiz';
    console.log('App Dir:', appdir);
    const quizData = JSON.stringify(quiz);
    console.log('Quiz Data:', quizData);

    invoke('save_quiz_cmd', { app_dir_path: appdir, quiz_data: quiz, filename: title })
      .then((response) => {
        console.log('Quiz saved:', response);
      })
      .catch((error) => {
        console.error('Error saving quiz:', error);
      });
  };

  const importQuiz = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'quiz', extensions: ['quiz'] }],
    });
    console.log(file);
  };

  const handleLoadQuiz = async (filename: string) => {
    const appdir = (await path.appDataDir()) + '/quiz';
    console.log('App Dir:', appdir);
    console.log('Filename:', filename);
    invoke('load_quiz_cmd', { app_dir_path: appdir, filename: filename })
      .then((response) => {
        const loadedQuiz = response as any;
        console.log('Quiz loaded:', loadedQuiz);
        setTitle(loadedQuiz.quiz_title);
        setQuizQuestions(
          loadedQuiz.questions.map((q: any) => ({
            question: q.question_text,
            answerType: q.answer_type,
            answer: q.answer_type === 'single' ? q.single_answer : q.choices,
          })),
        );
      })

      .catch((error) => {
        console.error('Error loading quiz:', error);
      });
  };

  const resetForm = () => {
    setQuestion('');
    setAnswerType('single');
    setSingleAnswer('');
    setMultipleChoices([{ id: 1, text: '', correct: false }]);
  };

  const handleMultipleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...multipleChoices];
    updatedChoices[index].text = value;
    setMultipleChoices(updatedChoices);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const updatedChoices = multipleChoices.map((choice, i) => ({
      ...choice,
      correct: i === index,
    }));
    setMultipleChoices(updatedChoices);
  };

  const addChoice = () => {
    setMultipleChoices([...multipleChoices, { id: multipleChoices.length + 1, text: '', correct: false }]);
  };

  const removeChoice = (index: number) => {
    setMultipleChoices(multipleChoices.filter((_, i) => i !== index));
  };

  const handleEditQuestion = (index: number) => {
    const questionToEdit = quizQuestions[index];
    setQuestion(questionToEdit.question);
    setAnswerType(questionToEdit.answerType);
    if (questionToEdit.answerType === 'single') {
      setSingleAnswer(questionToEdit.answer);
    } else {
      setMultipleChoices(questionToEdit.answer);
    }
    setEditingIndex(index);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleDeleteQuiz = async (file: string) => {
    setQuizToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteQuiz = async () => {
    try {
      const appDir = await path.appDataDir();
      const quizFilePath = `${appDir}/quiz/`;
      await invoke('remove_quiz_cmd', { app_dir_path: quizFilePath, filename: quizToDelete + '.quiz' });

      console.log(`Deleted quiz: ${quizToDelete}`);
    } catch (error) {
      console.error('Error deleting quiz file:', error);
      alert(error + ' ' + quizToDelete);
    }
    setIsDeleteModalOpen(false);
  };
  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
  };
  return (
    <div className="flex h-screen">
      <SidebarQuiz
        importQuiz={importQuiz}
        onLoadQuiz={handleLoadQuiz}
        OnSave={handleSaveQuiz}
        OnRemove={handleDeleteQuiz}
      />
      <div className="flex-grow p-8 overflow-y-auto">
        {/* Go Back Button */}
        <button onClick={handleGoBack} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4">
          Go Back
        </button>

        {/* Quiz Creation Form */}
        <h1 className="text-3xl font-bold mb-4">Create Quiz</h1>
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">Quiz Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">Question:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">Answer Type:</label>
          <select
            value={answerType}
            onChange={(e) => setAnswerType(e.target.value as 'single' | 'multiple')}
            className="w-full p-2 border rounded"
          >
            <option value="single">Single Answer</option>
            <option value="multiple">Multiple Choice</option>
          </select>
        </div>

        {answerType === 'single' ? (
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">Answer:</label>
            <input
              type="text"
              value={singleAnswer}
              onChange={(e) => setSingleAnswer(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-lg font-semibold mb-2">Choices:</label>
            {multipleChoices.map((choice, index) => (
              <div key={choice.id} className="flex items-center mb-2">
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => handleMultipleChoiceChange(index, e.target.value)}
                  className="w-full p-2 border rounded mr-2"
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={choice.correct}
                  onChange={() => handleCorrectAnswerChange(index)}
                  className="mr-2"
                />
                <button type="button" onClick={() => removeChoice(index)} className="text-red-500 hover:text-red-700">
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addChoice}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Choice
            </button>
          </div>
        )}

        <button
          onClick={handleAddQuestion}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
        >
          {editingIndex !== null ? 'Update Question' : 'Add Question'}
        </button>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quiz Preview</h2>
          <div className="space-y-4">
            {quizQuestions.map((q, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {index + 1}. {q.question}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditQuestion(index)}
                      className="text-yellow-500 hover:text-yellow-600 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {q.answerType === 'single' ? 'Single Answer' : 'Multiple Choice'}
                </p>
                {q.answerType === 'multiple' ? (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {(q.answer || []).map(
                      (
                        choice: {
                          correct: any;
                          text:
                            | string
                            | number
                            | boolean
                            | ReactElement<any, string | JSXElementConstructor<any>>
                            | Iterable<ReactNode>
                            | ReactPortal
                            | null
                            | undefined;
                        },
                        idx: Key | null | undefined, // Default to empty array if answer is undefined
                      ) => (
                        <li key={idx} className="flex items-center">
                          <span className="mr-2">{choice.correct ? '✅' : '❌'}</span>
                          {choice.text}
                        </li>
                      ),
                    )}
                  </ul>
                ) : (
                  <div className="text-gray-700">
                    Correct Answer: <span className="font-semibold">{q.answer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <AlertModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteQuiz}
        quizName={quizToDelete}
      />
    </div>
  );
}

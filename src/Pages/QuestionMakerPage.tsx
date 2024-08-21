import { path } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import { useState } from "react";
import { QuizListModal } from "../components/UI/QuizListModal/QuizListModal";

export function QuestionMakerPage() {
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [answerType, setAnswerType] = useState<'single' | 'multiple'>('single');
    const [singleAnswer, setSingleAnswer] = useState('');
    const [multipleChoices, setMultipleChoices] = useState([{ id: 1, text: '', correct: false }]);
    const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            questions: quizQuestions.map(q => ({
                question_text: q.question,
                answer_type: q.answerType,
                single_answer: q.answerType === 'single' ? q.answer : undefined,
                choices: q.answerType === 'multiple' ? q.answer : undefined
            }))
        };

        const appdir = await path.appDataDir() + "/quiz";
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
            filters: [{ name: 'quiz', extensions: ['quiz'] }]
        });
        console.log(file);
    };

    const handleLoadQuiz = async (filename: FileSystemEntry) => {

        const appdir = await path.appDataDir() + "/quiz";
        console.log('App Dir:', appdir);
        console.log('Filename:', filename);
        invoke('load_quiz_cmd', { app_dir_path: appdir, filename: filename })
            .then((response) => {
                const loadedQuiz = response as any;
                console.log('Quiz loaded:', loadedQuiz);
                setTitle(loadedQuiz.quiz_title);
                setQuizQuestions(loadedQuiz.questions.map((q: any) => ({
                    question: q.question_text,
                    answerType: q.answer_type,
                    answer: q.answer_type === 'single' ? q.single_answer : q.choices
                })));
                setIsModalOpen(false);
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

    return (
        <div className="container mx-auto p-4">
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
                            <button
                                type="button"
                                onClick={() => removeChoice(index)}
                                className="text-red-500 hover:text-red-700"
                            >
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
            <button
                onClick={handleSaveQuiz}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
                Save Quiz
            </button>

            <button
                onClick={importQuiz}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
                Import Quiz
            </button>

            <button

                onClick={() => setIsModalOpen(true)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
                Load Quiz
            </button>
            <QuizListModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onLoadQuiz={handleLoadQuiz}
            />


            <div className="mt-8">
                <h2 className="text-2xl font-bold">Quiz Preview</h2>
                <ul className="list-disc pl-5">
                    {quizQuestions.map((q, index) => (
                        <li key={index} className="mb-2">
                            <div className="flex items-center justify-between">
                                <span>
                                    {q.question} ({q.answerType === 'single' ? 'Single Answer' : 'Multiple Choice'})
                                </span>
                                <div>
                                    <button
                                        onClick={() => handleEditQuestion(index)}
                                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(index)}
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

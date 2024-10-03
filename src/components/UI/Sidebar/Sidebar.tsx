import { Separator } from '@radix-ui/react-separator';
import QuizList from '../Quizlist/Quizlist';

const Sidebar = ({ onLoadQuiz ,importQuiz}) => {
  return (
    <div className="w-64 bg-gray-400 h-screen   flex-col">
      <div className="flex flex-col p-4 bg-gray-400 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4">Quiz Maker</h2>
        <button className="mb-4 w-full text-left text-sm text-blue-600 hover:underline">+ Create New Quiz</button>
        <Separator className="data-[orientation=horizontal]:w-full my-4 bg-gray-300 h-[1px]" />
        <h3 className="text-xs font-medium text-gray-500 mb-2">My Quizzes</h3>
        <div className="flex-grow overflow-y-auto">
          <QuizList onLoadQuiz={onLoadQuiz} />
        </div>

      <div className="p-4 flex-shrink-0">
        <Separator decorative className=" h-[1px] bg-gray-300 my-4 data-[orientation=horizontal]:w-full" />
        <div className="flex justify-between items-center mb-4 space-x-2">
          <button className="text-left w-full text-sm text-blue-600 hover:underline flex items-center">
            <span className="mr-2">📝</span> Edit Quiz
          </button>
          <button className="text-left w-full text-sm text-blue-600 hover:underline flex items-center">
            <span className="mr-2">⬇️</span> Export Quiz
          </button>
        </div>
        <label className="block mb-4 text-sm text-gray-700">
            Import
          <button  onClick={importQuiz} className="hidden" />
          <div className="cursor-pointer border border-gray-300 p-2 rounded">Browse... No file selected.</div>
        </label>
        <button className="text-left text-red-600 hover:underline flex items-center">
          <span className="mr-2">🗑️</span> Delete Quiz
        </button>
      </div>
    </div>
    </div>
  );
};

export default Sidebar;

import QuizList from '../Quizlist/Quizlist';

const SidebarQuiz = ({
  onLoadQuiz,
  importQuiz,
  OnSave,
  OnRemove,
}: {
  onLoadQuiz: (filename: string) => Promise<void>;
  importQuiz: () => Promise<void>;
  OnSave: () => Promise<void>;
  OnRemove: (filename: any) => Promise<void>;
}) => {
  return (
    <aside className="w-64 h-screen bg-gray-50 border-r border-gray-300 flex flex-col overflow-y-auto">
      <div className="flex flex-col h-full">
        {/* Header Section */}
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Quiz Maker</h2>
          <button className="mt-4 w-full text-left text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center focus:outline-none focus:ring focus:ring-blue-300">
            <span className="mr-2 text-lg font-bold">+</span> Create New Quiz
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-200 mx-6 my-2" />

        {/* Quiz List Section */}
        <div className="p-6 flex-grow overflow-y-auto">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">My Quizzes</h3>
          <QuizList onLoadQuiz={onLoadQuiz} onRemove={OnRemove} />
        </div>

        {/* Bottom Actions Section */}
        <div className="mt-auto p-6 bg-gray-100 border-t border-gray-200">
          <div className="space-y-4">
            {/* Save and Export Row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={OnSave}
                className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring focus:ring-blue-300"
              >
                <span className="mr-2" title="Save">
                  💾
                </span>
                Save Quiz
              </button>
              <button className="flex items-center text-sm text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring focus:ring-blue-300">
                <span className="mr-2" title="Export">
                  ⬇️
                </span>
                Export Quiz
              </button>
            </div>

            {/* Import Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Import Quiz</label>
              <div
                onClick={importQuiz}
                className="cursor-pointer text-sm border border-gray-300 hover:border-gray-400 p-3 rounded-lg bg-white text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring focus:ring-gray-300"
              >
                Browse... No file selected.
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={OnRemove}
              className="flex items-center w-full text-sm text-red-600 hover:text-red-700 transition-colors focus:outline-none focus:ring focus:ring-red-300 mt-2"
            >
              <span className="mr-2" title="Delete">
                🗑️
              </span>
              Delete Quiz
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarQuiz;

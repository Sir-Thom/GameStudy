import { Plus, Save, Upload } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area"; // Keep this import for scroll functionality
import QuizList from "../Quizlist/Quizlist";

interface SidebarQuizProps {
  onLoadQuiz: (filename: string) => Promise<void>;
  importQuiz: () => Promise<void>;
  OnSave: () => Promise<void>;
  OnRemove: (filename: string) => Promise<void>;
}

export default function SidebarQuiz({ onLoadQuiz, importQuiz, OnSave, OnRemove }: SidebarQuizProps) {
  return (
    <div className="w-64 h-screen bg-gray-100 flex flex-col border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-black mb-2">Quiz Maker</h2>
        <button className="w-full border border-gray-300 rounded-md p-2 flex items-center justify-start" onClick={() => {}}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Quiz
        </button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <h3 className="text-sm font-medium mb-2">My Quizzes</h3>
        <QuizList onLoadQuiz={onLoadQuiz} onRemove={OnRemove} />
      </ScrollArea>
      <div className="p-4 border-t space-y-2">
        <button className="w-full border border-gray-300 rounded-md p-2 flex items-center justify-start" onClick={OnSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Quiz
        </button>
        <button className="w-full border border-gray-300 rounded-md p-2 flex items-center justify-start" onClick={() => {}}>
          <Upload className="mr-2 h-4 w-4" />
          Export Quiz
        </button>
        <button className="w-full border border-gray-300 rounded-md p-2 flex items-center justify-start" onClick={importQuiz}>
          <Upload className="mr-2 h-4 w-4" />
          Import Quiz
        </button>
      </div>
    </div>
  );
}

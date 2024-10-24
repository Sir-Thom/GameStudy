import { Plus, Save, Upload,Import } from "lucide-react";
import * as ScrollArea from "@radix-ui/react-scroll-area";

import QuizList from "../Quizlist/Quizlist";

interface SidebarQuizProps {
  onLoadQuiz: (filename: string) => Promise<void>;
  importQuiz: () => Promise<void>;
  OnSave: () => Promise<void>;
  OnRemove: (filename: string) => Promise<void>;
}

export default function SidebarQuiz({ onLoadQuiz, importQuiz, OnSave, OnRemove }: SidebarQuizProps) {
  return (
    <div className="w-64  text-black h-screen bg-gray-100 flex flex-col border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Quiz Maker</h2>
        <button className="w-full border border-gray-300 rounded-md p-2 flex items-center justify-start" onClick={() => {}}>
          <Plus className="mr-2 h-4 w-4" />
          
          Create New Quiz
        </button>
      </div>
          <h3 className=" p-2 text-sm text-black font-medium mb-2">My Quizzes</h3>
      <ScrollArea.Root className="flex-1 h-full w-full overflow-hidden">
      <ScrollArea.Viewport className="size-full rounded">
        
          <QuizList onLoadQuiz={onLoadQuiz} onRemove={OnRemove} />
      
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
			className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
			orientation="vertical"
		>
			<ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
		</ScrollArea.Scrollbar>
		<ScrollArea.Scrollbar
			className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
			orientation="horizontal"
		>
			<ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
		</ScrollArea.Scrollbar>
		<ScrollArea.Corner className="bg-blackA5" />

      </ScrollArea.Root>

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
          <Import className="mr-2 h-4 w-4" />
          Import Quiz
        </button>
      </div>
    </div>
  );
}

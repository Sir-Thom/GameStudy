import { useEffect, useState } from 'react';
import { path } from '@tauri-apps/api';
import { BaseDirectory, readDir, watch } from '@tauri-apps/plugin-fs';
import { Trash2 } from "lucide-react";

interface QuizListProps {
  onLoadQuiz: (filename: string) => Promise<void>;
  onRemove: (file: string) => void;
}

export default function QuizList({ onLoadQuiz, onRemove }: QuizListProps) {
  const [quizFiles, setQuizFiles] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuizFiles = async () => {
      try {
        const appDir = await path.appDataDir();
        const quizDir = `${appDir}/quiz`;
        const files = await readDir(quizDir);

        const quizFileNames = files.map((file) => file.name);
        setQuizFiles(quizFileNames);
        console.log('Quiz files:', quizFileNames);

        await watch(
          quizDir,
          (event) => {
            console.log('Quiz file event:', event);
            fetchQuizFiles();
          },
          {
            baseDir: BaseDirectory.AppData,
            delayMs: 500,
            recursive: true,
          }
        );
      } catch (error) {
        console.error('Failed to fetch quiz files:', error);
      }
    };
    fetchQuizFiles();
  }, []);

  return (
    <div className="overflow-y-auto h-full"> {/* Adjust height as needed */}
      <div className="p-4">
        {quizFiles.length === 0 ? (
          <p className="text-center text-gray-500">No quizzes found</p>
        ) : (
          <ul className="space-y-2">
            {quizFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-200 transition-colors">
                <button
                  className="flex-1 text-left bg-white border rounded-md shadow-sm hover:shadow-md transition-shadow py-2 px-3"
                  onClick={() => onLoadQuiz(file)}
                >
                  <span className="truncate font-medium text-gray-800">{file.split('.')[0]}</span>
                </button>
                <button
                  className="ml-2 flex items-center justify-center text-red-600 hover:bg-red-100 bg-transparent border rounded-md shadow-sm hover:shadow-md transition-shadow py-2 px-3"
                  onClick={() => onRemove(file.split('.')[0])}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete {file.split('.')[0]}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

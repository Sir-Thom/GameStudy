import { path } from '@tauri-apps/api';
import { BaseDirectory, readDir, watch } from '@tauri-apps/plugin-fs';
import { useEffect, useState } from 'react';

interface QuizListProps {
  onLoadQuiz: (filename: string) => Promise<void>;
  onRemove: (file: string) => void;
}

export default function QuizList({ onLoadQuiz, onRemove }: QuizListProps) {
  const [quizFiles, setQuizFiles] = useState<string[]>([]);

  // Fetch quiz files
  useEffect(() => {
    const fetchQuizFiles = async () => {
      try {
        const appDir = await path.appDataDir();
        const quizDir = `${appDir}/quiz`;
        const files = await readDir(quizDir);

        const quizFileNames = files.map((file) => file.name);
        setQuizFiles(quizFileNames);
        console.log('Quiz files:', quizFileNames);

        // Watch for file changes
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
          },
        );
      } catch (error) {
        console.error('Failed to fetch quiz files:', error);
      }
    };
    fetchQuizFiles();
  }, []);

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
      <ul className="mb-4">
        {quizFiles.map((file, index) => (
          <li key={index} className="flex items-center justify-between mb-2">
            <button onClick={() => onLoadQuiz(file)} className="text-blue-500 w-[80%] hover:underline text-left">
              {file.split('.')[0]}
            </button>
            <button
              onClick={() => onRemove(file.split('.')[0])}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

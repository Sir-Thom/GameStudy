import { path } from '@tauri-apps/api';
import React, { useState, useEffect } from 'react';
import { BaseDirectory, readDir, watch } from '@tauri-apps/plugin-fs';

export function QuizListModal({ isOpen, onClose, onLoadQuiz }) {
  const [quizFiles, setQuizFiles] = useState([]);

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
          },
        );
      } catch (error) {
        console.error('Failed to fetch quiz files:', error);
      }
    };

    if (isOpen) {
      fetchQuizFiles();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-1/3">
        <h2 className="text-2xl font-bold mb-4">Select a Quiz to Load</h2>
        <ul className="mb-4">
          {quizFiles.map((file, index) => (
            <li key={index} className="mb-2">
              <button onClick={() => onLoadQuiz(file)} className="text-blue-500 hover:underline">
                {file}
              </button>
            </li>
          ))}
        </ul>
        <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Close
        </button>
      </div>
    </div>
  );
}

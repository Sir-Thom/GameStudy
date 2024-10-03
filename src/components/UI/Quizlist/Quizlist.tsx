import { path } from "@tauri-apps/api";
import { BaseDirectory, readDir, watch } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

export default function QuizList({ onLoadQuiz }) {
    const [quizFiles, setQuizFiles] = useState([]);

    useEffect(() => {
        const fetchQuizFiles = async () => {
            try {
                const appDir = await path.appDataDir();
                const quizDir = `${appDir}/quiz`; 
                const files = await readDir(quizDir);

                const quizFileNames = files.map(file => file.name);
                setQuizFiles(quizFileNames);
                console.log("Quiz files:", quizFileNames);
                await watch(
                    quizDir,
                    (event) => {
                        console.log("Quiz file event:", event);
                        fetchQuizFiles();
                    },
                    {
                      baseDir: BaseDirectory.AppData,
                      delayMs: 500,
                      recursive: true,
                    }
                  );
            } catch (error) {
                console.error("Failed to fetch quiz files:", error);
            }
        };
        fetchQuizFiles();
    }, []);

    return (
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)]"> 
            <ul className="mb-4">
                {quizFiles.map((file, index) => (
                    <li key={index} className="mb-2">
                        <button
                            onClick={() => onLoadQuiz(file)}
                            className="text-blue-500 w-[90%] hover:underline"
                        >
                            {file.split(".")[0]}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

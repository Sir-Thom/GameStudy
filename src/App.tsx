import { useEffect } from 'react';
import './App.css';
import Database from '@tauri-apps/plugin-sql';
import { mkdir,exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { Router } from './main';
function App() {
  const setDb = async () => {
    Database.load('sqlite:character.db');
  };
  const init = async() =>{
    const quizFolder = await exists('quiz',{baseDir: BaseDirectory.AppData});
    if (!quizFolder) {
      await mkdir('quiz',{baseDir: BaseDirectory.AppData});
    }
  }
  useEffect(() => {
    init();
    setDb();
  }, []);

  return (
    <div>
      <Router />
    </div>
  );
}

export default App;

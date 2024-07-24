import { useEffect } from 'react';
import './App.css';
import Database from '@tauri-apps/plugin-sql';
import { Router } from './main';
function App() {
  const setDb = async () => {
    Database.load('sqlite:character.db');
  };
  useEffect(() => {
    setDb();
  }, []);

  return (
    <div>
      <Router />
    </div>
  );
}

export default App;

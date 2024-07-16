import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import GameView from "./components/Gameview";
import Question from "./components/QuestionBox/Question";
import AnswerButton from "./components/AnswerBox/AnswerBtn";
import CharacterCreationPage from "./Pages/CharacterCreation";
import Database from '@tauri-apps/plugin-sql';
function App() {
const setDb = async () => {
  const db = Database.load("sqlite:test.db");
  Database.load("sqlite:character.db");
  await (await db).execute("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)");
  await (await db).execute("INSERT INTO test (name) VALUES (?)", ["test"]);
  const result = await (await db).execute("SELECT * FROM test");
  console.log(result);
}
useEffect(() => {
  setDb();
}
, []);


  return (
    <div>
     <CharacterCreationPage />
     
    </div>
  );
}

export default App;
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CharacterCreationPage from './Pages/CharacterCreation';
import MainMenu from './Pages/MenuPage';
import BattlePage from './Pages/BattlePage';
import { QuestionMakerPage } from './Pages/QuestionMakerPage';
export const Router = () => {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/character-creation" element={<CharacterCreationPage />} />
        <Route path="/battle" element={<BattlePage />} />
        <Route path="/" element={<MainMenu />} />
        <Route path="/createquiz" element={<QuestionMakerPage />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

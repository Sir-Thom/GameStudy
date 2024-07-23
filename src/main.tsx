import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import CharacterCreationPage from "./Pages/CharacterCreation";
import MainMenu from "./Pages/MenuPage";

export const Router = () => {
  return (
    <BrowserRouter basename="/">
    <Routes>
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/" element={<MainMenu />} />
    </Routes></BrowserRouter>
  );

}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
   <App />
  </React.StrictMode>
);

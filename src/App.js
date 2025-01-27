import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Optics from "./components/Optics";
import MicrobeMission from "./components/MicrobeMission";
import "./styles/App.css";

const App = () => {
  const [currentQuiz, setCurrentQuiz] = useState("Optics-quiz-1.json");

  const handleQuizChange = (selectedQuiz) => {
    setCurrentQuiz(selectedQuiz);
  };

  const quizList = [
    { label: "Optics Quiz 1", value: "Optics-quiz-1.json" },
    { label: "Microbe Mission Quiz", value: "MicrobeMission-quiz-1.json" }
  ];

  return (
    <Router basename="/gms-2025-scioly">
      <div className="app-container">
        <h1>Science Olympiad Quizzes</h1>
        <div className="quiz-selector">
          <label htmlFor="quiz-dropdown">Select Quiz:</label>
          <select
            id="quiz-dropdown"
            value={currentQuiz}
            onChange={(e) => handleQuizChange(e.target.value)}
          >
            {quizList.map((quiz, index) => (
              <option key={index} value={quiz.value}>
                {quiz.label}
              </option>
            ))}
          </select>
        </div>
        <br/>
        <hr/>

        <Routes>
          {/* Default Route */}
          <Route
            path="/"
            element={
              currentQuiz === "Optics-quiz-1.json" ? (
                <Optics quizFile={currentQuiz} />
              ) : (
                <MicrobeMission quizFile={currentQuiz} />
              )
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

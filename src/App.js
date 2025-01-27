import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Optics from "./components/Optics";
import "./styles/App.css";

const App = () => {
  const [quizList, setQuizList] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState("Optics-quiz-1.json");

  useEffect(() => {
    const fetchQuizList = async () => {
      const availableQuizzes = [
        "Optics-quiz-1.json",
        "Optics-quiz-2.json",
        "Optics-quiz-3.json"
      ];
      setQuizList(availableQuizzes);
    };

    fetchQuizList();
  }, []);

  const handleQuizChange = (quiz) => {
    setCurrentQuiz(quiz);
  };

  return (
    <Router basename="/gms-2025-scioly">
      <div className="app-container">
        <h1>Science Olympiad Optics Quizzes</h1>
        <div className="quiz-selector">
          <label htmlFor="quiz-dropdown">Select Quiz:</label>
          <select
            id="quiz-dropdown"
            value={currentQuiz}
            onChange={(e) => handleQuizChange(e.target.value)}
          >
            {quizList.map((quiz, index) => (
              <option key={index} value={quiz}>
                Quiz {index + 1}
              </option>
            ))}
          </select>
        </div>

        <Routes>
          {/* Default Route */}
          <Route
            path="/"
            element={<Optics quizFile={`${currentQuiz}`} />}
          />

          {/* Fallback Route */}
          <Route path="*" element={<div>404: Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

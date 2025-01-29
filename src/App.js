import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Test from "./components/Test";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import "./styles/App.css";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUtDmgr_4miMXI1D_vBf0Fg8ienv_8Cf0",
  authDomain: "gms-2025-scioly-dcaa4.firebaseapp.com",
  projectId: "gms-2025-scioly-dcaa4",
  storageBucket: "gms-2025-scioly-dcaa4.firebasestorage.app",
  messagingSenderId: "246061368451",
  appId: "1:246061368451:web:24ea1472559290fbf8c7b6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [currentQuiz, setCurrentQuiz] = useState("Optics-quiz-1.json");
  const [username, setUsername] = useState("");
  const [scores, setScores] = useState([]);
  const [isUsernameEntered, setIsUsernameEntered] = useState(false);

  const handleQuizChange = (selectedQuiz) => {
    setCurrentQuiz(selectedQuiz);
  };

  const quizList = [
    { label: "Optics Quiz 1", value: "Optics-quiz-1.json" },
    { label: "Optics Quiz 2", value: "Optics-quiz-2.json" },
    { label: "Microbe Mission Quiz-1", value: "MicrobeMission-quiz-1.json" },
    { label: "Microbe Mission Quiz-2", value: "MicrobeMission-quiz-2.json" },
  ];

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsUsernameEntered(true);
    } else {
      alert("Please enter a valid username.");
    }
  };

  return (
    <Router basename="/gms-2025-scioly">
      <div className="app-container">
        {!isUsernameEntered ? (
            <div className="form-container">
              <h1>GMS Scioly Team</h1>
              <h2>Enter Your Username</h2>
              <div className="form-group">
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <button className="submit-button" onClick={handleUsernameSubmit}>
                Submit
              </button>
            </div>
        ) : (
          <>
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
            <br />
            <hr />

            <Routes>
              {/* Default Route */}
              <Route
                path="/"
                element={<Test quizFile={currentQuiz} username={username} db={db} />}
              />

              {/* Fallback Route */}
              <Route path="*" element={<div>404: Page Not Found</div>} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;

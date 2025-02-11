import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Test from "./components/Test";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import "./styles/App.css";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUtDmgr_4miXNI1D_vBf0Fg8ienv_8Cf0",
  authDomain: "gms-2025-scioly-dcaa4.firebaseapp.com",
  projectId: "gms-2025-scioly-dcaa4",
  storageBucket: "gms-2025-scioly-dcaa4.appspot.com",
  messagingSenderId: "246061368451",
  appId: "1:246061368451:web:24ea1472559290fbf8c7b6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const App = () => {
  const [currentQuiz, setCurrentQuiz] = useState("Optics-quiz-1.json");
  const [username, setUsername] = useState("");
  const [isUsernameEntered, setIsUsernameEntered] = useState(false);
  const [randomGreeting, setRandomGreeting] = useState("");

  // Cool Greetings Array
  const coolGreetings = [
    "🚀 Mission Control Activated",
    "🎮 Player Loaded",
    "⚡ Charging Up",
    "🧠 Brainpower Engaged",
    "🔬 Experiment Ready",
    "👨‍🚀 Systems Online",
    "💡 Genius Mode: ON",
    "🏆 Leaderboard Updated",
    "💻 Access Granted",
    "🔍 Scanning Environment",
    "🌟 Stardust Synced",
    "🎭 Welcome to the Simulation",
  ];

  // Quiz List
  const quizList = [
    { label: "Optics Quiz 1", value: "Optics-quiz-1.json" },
    { label: "Optics Quiz 2", value: "Optics-quiz-2.json" },
    { label: "Optics Quiz 3", value: "Optics-quiz-3.json" },
    { label: "Optics Quiz 4", value: "Optics-quiz-4.json" },
    { label: "Microbe Mission Quiz-1", value: "MicrobeMission-quiz-1.json" },
    { label: "Microbe Mission Quiz-2", value: "MicrobeMission-quiz-2.json" },
    { label: "Microbe Mission Quiz-3", value: "MicrobeMission-quiz-3.json" },
    { label: "Microbe Mission Quiz-4", value: "MicrobeMission-quiz-4.json" },
    { label: "Microbe Mission Quiz-5", value: "MicrobeMission-quiz-5.json" },
  ];

  // Save user visit to Firestore
  const saveUsernameToFirestore = async (user) => {
    try {
      const userRef = doc(db, "users", user);
      await setDoc(
        userRef,
        {
          username: user,
          lastVisited: serverTimestamp(), // 🔥 Updates timestamp every visit
        },
        { merge: true } // 🔄 Keeps existing data & only updates timestamp
      );
      console.log("User visit logged:", user);
    } catch (error) {
      console.error("Error logging user visit:", error);
    }
  };

  // Load username from cache & log visit on site load
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsUsernameEntered(true);
      setRandomGreeting(
        coolGreetings[Math.floor(Math.random() * coolGreetings.length)]
      );
      saveUsernameToFirestore(storedUsername); // 🔥 Logs returning user visit
    }
  }, []);

  // Handle Quiz Selection
  const handleQuizChange = (selectedQuiz) => {
    setCurrentQuiz(selectedQuiz);
  };

  // Handle Username Submission
  const handleUsernameSubmit = async () => {
    if (username.trim()) {
      localStorage.setItem("username", username);
      setIsUsernameEntered(true);
      setRandomGreeting(
        coolGreetings[Math.floor(Math.random() * coolGreetings.length)]
      );
      await saveUsernameToFirestore(username); // 🔥 Logs first-time user visit
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <button className="submit-button" onClick={handleUsernameSubmit}>
              Submit
            </button>
          </div>
        ) : (
          <>
            <h1>{randomGreeting}, {username}!</h1>
            <h2>Science Olympiad Quizzes</h2>

            {/* Quiz Selector Dropdown */}
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
              <Route
                path="/"
                element={<Test quizFile={currentQuiz} username={username} db={db} />}
              />
              <Route path="*" element={<div>404: Page Not Found</div>} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;

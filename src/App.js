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
  const [username, setUsername] = useState("");
  const [isUsernameEntered, setIsUsernameEntered] = useState(false);
  const [randomGreeting, setRandomGreeting] = useState("");
  const [activeTab, setActiveTab] = useState("optics"); // Default to Optics tab

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

  const opticsQuizzes = [
    { label: "Select a test", value: "------" },
    { label: "Optics-1", value: "Final-optics-1.json" },
    { label: "Optics-2", value: "Final-optics-2.json" },
    { label: "Optics-3", value: "Final-optics-3.json" },
  ];

  const microbeMissionQuizzes = [
    { label: "Select a test", value: "------" },
    { label: "Microbe-Mission-1", value: "Final-micro-mission-1.json" },
  ];
  const [currentQuiz, setCurrentQuiz] = useState(opticsQuizzes[0].value);

  // Save user visit to Firestore
  const saveUsernameToFirestore = async (user) => {
    try {
      const userRef = doc(db, "users", user);
      await setDoc(
        userRef,
        { username: user, lastVisited: serverTimestamp() },
        { merge: true }
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
      setRandomGreeting(coolGreetings[Math.floor(Math.random() * coolGreetings.length)]);
      saveUsernameToFirestore(storedUsername);
    }
  }, []);

  const handleQuizChange = (selectedQuiz) => {
    setCurrentQuiz(selectedQuiz);
  };

  const handleUsernameSubmit = async () => {
    if (username.trim()) {
      localStorage.setItem("username", username);
      setIsUsernameEntered(true);
      setRandomGreeting(coolGreetings[Math.floor(Math.random() * coolGreetings.length)]);
      await saveUsernameToFirestore(username);
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

            {/* Tab Navigation */}
            <div className="tabs">
              <button className={activeTab === "optics" ? "active" : ""} onClick={() => setActiveTab("optics")}>Optics</button>
              <button className={activeTab === "microbe" ? "active" : ""} onClick={() => setActiveTab("microbe")}>Microbe Mission</button>
              <button className={activeTab === "leaderboard" ? "active" : ""} onClick={() => setActiveTab("leaderboard")}>Leaderboard</button>
              <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "optics" && (
                <>
                  <h3>🔬 Optics Quizzes</h3>
                  <select value={currentQuiz} onChange={(e) => handleQuizChange(e.target.value)}>
                    {opticsQuizzes.map((quiz, index) => (
                      <option key={index} value={quiz.value}>{quiz.label}</option>
                    ))}
                  </select>
                  <Routes>
                    <Route path="/" element={<Test quizFile={currentQuiz} username={username} db={db} />} />
                  </Routes>
                </>
              )}

              {activeTab === "microbe" && (
                <>
                  <h3>🦠 Microbe Mission Quizzes</h3>
                  <select value={currentQuiz} onChange={(e) => handleQuizChange(e.target.value)}>
                    {microbeMissionQuizzes.map((quiz, index) => (
                      <option key={index} value={quiz.value}>{quiz.label}</option>
                    ))}
                  </select>
                  <Routes>
                    <Route path="/" element={<Test quizFile={currentQuiz} username={username} db={db} />} />
                  </Routes>
                </>
              )}

              {activeTab === "leaderboard" && (
                <div>
                  <h3>🏆 Leaderboard Coming Soon!</h3>
                  <p>Track your progress against others.</p>
                </div>
              )}

              {activeTab === "profile" && (
                <div>
                  <h3>👤 Profile</h3>
                  <p>Username: <strong>{username}</strong></p>
                  <button onClick={() => {
                    localStorage.removeItem("username");
                    setUsername("");
                    setIsUsernameEntered(false);
                  }}>Log Out</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;

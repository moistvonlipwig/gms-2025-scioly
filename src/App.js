import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Optics from "./quizzes/Optics";
import MicrobeMission from "./quizzes/MicrobeMission";

const App = () => {
  return (
    <Router>
      <div>
        <h1>Welcome to Science Olympiad Quizzes</h1>
        <ul>
          <li><Link to="/optics">Optics Quiz</Link></li>
          <li><Link to="/microbe-mission">Microbe Mission Quiz</Link></li>
        </ul>

        <Routes>
          <Route path="/optics" element={<Optics />} />
          <Route path="/microbe-mission" element={<MicrobeMission />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

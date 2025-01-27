import React, { useState, useEffect } from "react";
import quizData1 from "../data/Optics-quiz-1.json";
import quizData2 from "../data/Optics-quiz-2.json";
import "../styles/Optics.css";

const Optics = ({ quizFile }) => {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    // Load quiz data based on quizFile prop
    const loadQuizData = () => {
      if (quizFile === "Optics-quiz-1.json") {
        setQuizData(quizData1.questions);
      } else if (quizFile === "Optics-quiz-2.json") {
        setQuizData(quizData2.questions);
      } else {
        setQuizData([]);
      }
    };

    loadQuizData();
  }, [quizFile]);

  const handleAnswerOptionClick = (option) => {
    setSelectedAnswer(option);
    if (option === quizData[currentQuestion].answer) {
      setScore(score + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < quizData.length) {
        setCurrentQuestion(nextQuestion);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  if (!quizData) {
    return <div>Loading quiz...</div>;
  }

  return (
    <div className="quiz-container">
      {showScore ? (
        <div className="score-section box">
          <h2>Quiz Complete!</h2>
          <p>You scored {score} out of {quizData.length}</p>
          <h3>Answers:</h3>
          <ul>
            {quizData.map((question, index) => (
              <li key={index}>
                <strong>Q{index + 1}:</strong> {question.question} <br />
                <strong>Correct Answer:</strong> {question.answer} <br />
                <a href={question.reference} target="_blank" rel="noopener noreferrer">
                  Learn more
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="question-section box">
          <div className="question-count">
            <span>Question {currentQuestion + 1}</span>/{quizData.length}
          </div>
          <div className="question-text">
            {quizData[currentQuestion].question}
          </div>
          <div className="answer-section">
            {quizData[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`answer-option ${
                  selectedAnswer === option
                    ? option === quizData[currentQuestion].answer
                      ? "correct"
                      : "incorrect"
                    : ""
                }`}
                onClick={() => handleAnswerOptionClick(option)}
                disabled={selectedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="reference-section">
            <a
              href={quizData[currentQuestion].reference}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about this question
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Optics;

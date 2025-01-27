import React, { useState, useEffect } from "react";
import "../styles/Test.css";

const Test = ({ quizFile }) => {
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [showNext, setShowNext] = useState(false);

  // Dynamically load JSON data based on the selected test
  useEffect(() => {
    const loadTestData = async () => {
      try {
        const data = await import(`../data/${quizFile}`);
        setTestData(data.questions);
      } catch (error) {
        console.error(`Failed to load ${quizFile} data:`, error);
        setTestData([]); // Set to an empty array if loading fails
      }
    };

    loadTestData();
  }, [quizFile]);

  const handleAnswerOptionClick = (option) => {
    setSelectedAnswer(option);
    setShowImage(true);
    setShowNext(true);
    if (option === testData[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleTextSubmit = () => {
    setShowImage(true);
    setShowNext(true);
    const correctAnswer = testData[currentQuestion]?.answer;
    if (
      (typeof correctAnswer === "string" && textAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) ||
      (typeof correctAnswer === "object" && JSON.stringify(correctAnswer).toLowerCase() === JSON.stringify(textAnswer).toLowerCase())
    ) {
      setScore(score + 1);
    }
    setTextAnswer("");
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setTextAnswer("");
    setShowImage(false);
    setShowNext(false);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < testData.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
    }
  };

  if (!testData) {
    return <div>Loading test...</div>; // Show a loading message until testData is available
  }

  if (testData.length === 0) {
    return <div>No questions available for this test.</div>; // Handle case where test data fails to load
  }

  const isTextEntry = !testData[currentQuestion]?.options;

  return (
    <div className="test-container">
      {showScore ? (
        <div className="score-section box">
          <h2>Test Complete!</h2>
          <p>You scored {score} out of {testData.length}</p>
          <h3>Answers:</h3>
          <ul>
            {testData.map((question, index) => (
              <li key={index}>
                <strong>Q{index + 1}:</strong> {question.question} <br />
                {question.image && (
                  <img
                    src={question.image}
                    alt={`Illustration for ${question.question}`}
                    className="question-image"
                  />
                )}
                <strong>Correct Answer:</strong> {JSON.stringify(question.answer)} <br />
                {question.reference && (
                  <a href={question.reference} target="_blank" rel="noopener noreferrer">
                    Learn more
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="question-section box">
          <div className="question-count">
            <span>Question {currentQuestion + 1}</span>/{testData.length}
          </div>
          <div className="question-text">
            {testData[currentQuestion]?.question || "Question not available"}
          </div>
          {showImage && testData[currentQuestion]?.image && (
            <img
              src={testData[currentQuestion].image}
              alt={`Illustration for ${testData[currentQuestion]?.question || "N/A"}`}
              className="question-image"
            />
          )}
          {isTextEntry ? (
            <div className="text-entry-section">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer here..."
              />
              <button onClick={handleTextSubmit} disabled={!textAnswer.trim()}>
                Submit
              </button>
            </div>
          ) : (
            <div className="answer-section">
              {testData[currentQuestion]?.options?.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${
                    selectedAnswer === option
                      ? option === testData[currentQuestion].answer
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
          )}
          {showNext && (
            <button className="next-button" onClick={handleNextQuestion}>
              Next
            </button>
          )}
          <div className="reference-section">
            {testData[currentQuestion]?.reference && (
              <a
                href={testData[currentQuestion].reference}
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about this question
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Test;

import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore methods
import "../styles/Test.css";

const Test = ({ quizFile, username, db }) => {
  const [testData, setTestData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [showImage, setShowImage] = useState(false);

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
    if (option === testData[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const handleTextSubmit = () => {
    setShowImage(true);
    const correctAnswer = testData[currentQuestion]?.answer;
    if (
      (typeof correctAnswer === "string" &&
        textAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) ||
      (typeof correctAnswer === "object" &&
        JSON.stringify(correctAnswer).toLowerCase() ===
          JSON.stringify(textAnswer).toLowerCase())
    ) {
      setScore(score + 1);
    }
    setTextAnswer("");
  };

  const handleMatchingChange = (structure, selectedFunction) => {
    setMatchingAnswers((prev) => ({ ...prev, [structure]: selectedFunction }));
  };

  const handleMatchingSubmit = () => {
    const correctAnswers = testData[currentQuestion]?.answer;
    const isCorrect = Object.keys(correctAnswers).every(
      (key) => correctAnswers[key] === matchingAnswers[key]
    );
    if (isCorrect) {
      setScore(score + 1);
    }
    setMatchingAnswers({});
    setShowImage(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setTextAnswer("");
    setMatchingAnswers({});
    setShowImage(false);
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < testData.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowScore(true);
      submitScore(); // Submit score when test is complete
    }
  };

  // Submit score to Firestore
  const submitScore = async () => {
    try {
      await addDoc(collection(db, "Users"), {
        username,
        score,
        quiz: quizFile,
        timestamp: new Date(),
      });
      alert(`Test complete! Your score of ${score} has been submitted.`);
    } catch (error) {
      console.error("Error submitting score:", error);
      alert("Error submitting score. Please try again.");
    }
  };

  if (!testData) {
    return <div>Loading test...</div>; // Show a loading message until testData is available
  }

  if (testData.length === 0) {
    return <div>No questions available for this test.</div>; // Handle case where test data fails to load
  }

  const isTextEntry =
    !testData[currentQuestion]?.options &&
    typeof testData[currentQuestion]?.answer === "string";
  const isMatching =
    Array.isArray(testData[currentQuestion]?.options) &&
    testData[currentQuestion]?.options[0]?.structure &&
    typeof testData[currentQuestion?.answer] === "object";

  return (
    <div className="test-container">
      {showScore ? (
        <div className="score-section box">
          <h2>Test Complete!</h2>
          <p>
            You scored {score} out of {testData.length}
          </p>
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
                <strong>Correct Answer:</strong>{" "}
                {JSON.stringify(question.answer)} <br />
                {question.reference && (
                  <a
                    href={question.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
              alt={`Illustration for ${
                testData[currentQuestion]?.question || "N/A"
              }`}
              className="question-image"
            />
          )}
          {isTextEntry && (
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
          )}
          {isMatching && (
            <div className="matching-section">
              {testData[currentQuestion].options.map(({ structure }, index) => (
                <div key={index} className="matching-pair">
                  <span>{structure}</span>
                  <select
                    onChange={(e) => handleMatchingChange(structure, e.target.value)}
                    value={matchingAnswers[structure] || ""}
                  >
                    <option value="">Select function</option>
                    {testData[currentQuestion].options.map(
                      ({ function: optionFunc }, i) => (
                        <option key={i} value={optionFunc}>
                          {optionFunc}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ))}
              <button onClick={handleMatchingSubmit}>Submit</button>
            </div>
          )}
          {!isTextEntry && !isMatching && (
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
          <button className="next-button" onClick={handleNextQuestion}>
            Next
          </button>
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

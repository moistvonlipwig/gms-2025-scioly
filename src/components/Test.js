import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Test.css";

const Test = ({ quizFile, username, db }) => {
  const [testData, setTestData] = useState(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [showAnswer, setShowAnswer] = useState(false); // Controls answer visibility

  useEffect(() => {
    const loadTestData = async () => {
      try {
        // Assumes the quiz file exports an object with a "sections" property:
        // { sections: [ { sectionTitle: "...", questions: [ ... ] }, ... ] }
        const data = await import(`../data/${quizFile}`);
        setTestData(data.sections);
      } catch (error) {
        console.error(`Failed to load ${quizFile} data:`, error);
        setTestData([]);
      }
    };

    loadTestData();
  }, [quizFile]);

  if (!testData) return <div>Loading test...</div>;
  if (testData.length === 0) return <div>No sections available for this test.</div>;

  const currentSection = testData[currentSectionIndex];
  const questions = currentSection.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const isMatching = Array.isArray(currentQuestion?.options) && currentQuestion?.options[0]?.item;
  const isTextAnswer = currentQuestion?.type === "shortAnswer";
  const isTrueFalse = currentQuestion?.type === "trueFalse";

  const handleAnswerClick = (option) => {
    const isCorrect = option === currentQuestion?.answer;
    if (isCorrect) setScore(score + 1);
    setSelectedAnswer(option);
  };

  const handleTextSubmit = () => {
    const correctAnswer = currentQuestion?.answer;
    if (textAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      setScore(score + 1);
    }
    setTextAnswer("");
  };

  const handleMatchingSubmit = () => {
    const correctAnswers = currentQuestion?.answer || {};
    const isCorrect = Object.keys(correctAnswers).every(
      (key) => correctAnswers[key] === matchingAnswers[key]
    );
    if (isCorrect) {
      setScore(score + 1);
    }
    setMatchingAnswers({});
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setTextAnswer("");
    setMatchingAnswers({});
    setShowAnswer(false); // Reset answer display when moving to the next question

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      // End of current section; move to the next section if available
      const nextSectionIndex = currentSectionIndex + 1;
      if (nextSectionIndex < testData.length) {
        setCurrentSectionIndex(nextSectionIndex);
        setCurrentQuestionIndex(0);
      } else {
        // Entire test complete
        setShowScore(true);
        submitScore();
      }
    }
  };

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

  return (
    <div className="test-container">
      {showScore ? (
        <div className="score-section box">
          <h2>Test Complete!</h2>
          <p>
            You scored{" "}
            {score} out of{" "}
            {testData.reduce((acc, section) => acc + section.questions.length, 0)}
          </p>
          <ul>
            {testData.map((section, secIndex) => (
              <li key={secIndex}>
                <strong>
                  Section {secIndex + 1} - {section.sectionTitle}:
                </strong>
                <ul>
                  {section.questions.map((question, qIndex) => (
                    <li key={qIndex}>
                      <strong>Q{qIndex + 1}:</strong> {question.question} <br />
                      <strong>Correct Answer:</strong> {JSON.stringify(question.answer)}{" "}
                      <br />
                      {question.referenceLink && (
                        <a
                          href={question.referenceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Learn more
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="question-section box">
          <div className="section-title">
            <h2>{currentSection.sectionTitle}</h2>
          </div>
          <div className="question-count">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length} in Section{" "}
              {currentSectionIndex + 1} of {testData.length}
            </span>
          </div>
          <div className="question-text">{currentQuestion?.question}</div>

          {!isMatching && !isTextAnswer && !isTrueFalse && (
            <div className="answer-section">
              {currentQuestion?.options?.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${
                    selectedAnswer === option
                      ? option === currentQuestion?.answer
                        ? "correct"
                        : "incorrect"
                      : ""
                  }`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {isTrueFalse && (
            <div className="true-false-section">
              <label>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value="true"
                  onChange={() => handleAnswerClick("true")}
                />{" "}
                True
              </label>
              <label>
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value="false"
                  onChange={() => handleAnswerClick("false")}
                />{" "}
                False
              </label>
            </div>
          )}

          {isTextAnswer && (
            <div className="text-answer-section">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your answer..."
              />
              <button onClick={handleTextSubmit} disabled={!textAnswer.trim()}>
                Submit
              </button>
            </div>
          )}

          <button
            className="toggle-answer-button"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? "Hide Answer" : "Show Answer"}
          </button>

          {showAnswer && (
            <div className="answer-section">
              <strong>Correct Answer: </strong> {JSON.stringify(currentQuestion?.answer)}
              {currentQuestion?.imageLink && (
                <img
                  src={currentQuestion.imageLink}
                  alt="Answer Image"
                  className="answer-image"
                />
              )}
              {currentQuestion?.referenceLink && (
                <a
                  href={currentQuestion.referenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              )}
            </div>
          )}

          <button className="next-button" onClick={handleNextQuestion}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Test;

import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
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

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const data = await import(`../data/${quizFile}`);
        setTestData(data.questions);
      } catch (error) {
        console.error(`Failed to load ${quizFile} data:`, error);
        setTestData([]);
      }
    };

    loadTestData();
  }, [quizFile]);

  const handleAnswerClick = (option) => {
    const isCorrect = option === testData[currentQuestion]?.answer;
    if (isCorrect) setScore(score + 1);
    setSelectedAnswer(option);
    setShowImage(true);
  };

  const handleTextSubmit = () => {
    const correctAnswer = testData[currentQuestion]?.answer;
    if (textAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      setScore(score + 1);
    }
    setTextAnswer("");
    setShowImage(true);
  };

  const handleMatchingChange = (item, selectedMatch) => {
    setMatchingAnswers((prev) => ({
      ...prev,
      [item]: selectedMatch,
    }));
  };

  const handleMatchingSubmit = () => {
    const correctAnswers = testData[currentQuestion]?.answer || {};
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
      submitScore();
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

  if (!testData) return <div>Loading test...</div>;

  if (testData.length === 0) return <div>No questions available for this test.</div>;

  const current = testData[currentQuestion];
  const isMatching = Array.isArray(current?.options) && current?.options[0]?.item;
  const isTextAnswer = !isMatching && !current?.options;

  return (
    <div className="test-container">
      {showScore ? (
        <div className="score-section box">
          <h2>Test Complete!</h2>
          <p>
            You scored {score} out of {testData.length}
          </p>
          <ul>
            {testData.map((question, index) => (
              <li key={index}>
                <strong>Q{index + 1}:</strong> {question.question} <br />
                {question.imageLink && (
                  <img
                    src={question.imageLink}
                    alt={`Q${index + 1}`}
                    className="question-image"
                  />
                )}
                <strong>Correct Answer:</strong> {JSON.stringify(question.answer)} <br />
                {question.referenceLink && (
                  <a href={question.referenceLink} target="_blank" rel="noopener noreferrer">
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
          <div className="question-text">{current?.question}</div>
          {current?.imageLink && (
            <img
              src={current.imageLink}
              alt="Question Illustration"
              className="question-image"
            />
          )}
          {!isMatching && !isTextAnswer && (
            <div className="answer-section">
              {current?.options?.map((option, index) => (
                <button
                  key={index}
                  className={`answer-option ${
                    selectedAnswer === option
                      ? option === current?.answer
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
          {isMatching && (
            <div className="matching-section">
              {current.options.map(({ item }, idx) => (
                <div key={idx} className="matching-pair">
                  <span>{item}</span>
                  <select
                    value={matchingAnswers[item] || ""}
                    onChange={(e) => handleMatchingChange(item, e.target.value)}
                  >
                    <option value="">Select a match</option>
                    {current.options.map(({ match }, i) => (
                      <option key={i} value={match}>
                        {match}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button onClick={handleMatchingSubmit}>Submit</button>
            </div>
          )}
          {current.referenceLink && (
            <div className="reference-section">
              <a href={current.referenceLink} target="_blank" rel="noopener noreferrer">
                Learn more about this question
              </a>
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

import React, { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import "../styles/Test.css";

const Test = ({ quizFile, username, db }) => {
  const [testData, setTestData] = useState(null);
  const [responses, setResponses] = useState({});
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false); // State to toggle answer visibility

  useEffect(() => {
    const loadTestData = async () => {
      try {
        const data = await import(`../data/${quizFile}`);
        setTestData(data.test);
      } catch (error) {
        console.error(`Failed to load ${quizFile} data:`, error);
        setTestData([]);
      }
    };

    loadTestData();
  }, [quizFile]);

  if (!testData) return <div>Loading test...</div>;
  if (testData.length === 0) return <div>No sections available for this test.</div>;

  const handleChange = (sectionIndex, questionIndex, value) => {
    setResponses({
      ...responses,
      [`${sectionIndex}-${questionIndex}`]: value
    });
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;

    testData.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const responseKey = `${sectionIndex}-${questionIndex}`;
        const userAnswer = responses[responseKey];

        if (section.section === "Multiple Choice" && userAnswer !== undefined) {
          if (question.options[userAnswer] === question.options[question.answer]) {
            calculatedScore += section.points;
          }
        }

        if (section.section === "Numerical Problems" && userAnswer !== undefined) {
          if (parseFloat(userAnswer) === parseFloat(question.answer.match(/[\d.]+/)[0])) {
            calculatedScore += section.points;
          }
        }

        if (section.section === "Short Answer" && userAnswer !== undefined) {
          if (userAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()) {
            calculatedScore += section.points;
          }
        }
      });
    });

    setScore(calculatedScore);
    setShowScore(true);

    try {
      await addDoc(collection(db, "Users"), {
        username,
        score: calculatedScore,
        quiz: quizFile,
        responses,
        timestamp: new Date(),
      });
      alert(`Test complete! Your score of ${calculatedScore} has been submitted.`);
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
            You scored {score} out of{" "}
            {testData.reduce((acc, section) => acc + section.questions.length * section.points, 0)}
          </p>
          <button className="show-answers-button" onClick={() => setShowAnswers(!showAnswers)}>
            {showAnswers ? "Hide Answers" : "Show Answers"}
          </button>

          {showAnswers && (
            <div className="answer-review">
              {testData.map((section, sectionIndex) => (
                <div key={sectionIndex} className="test-section box">
                  <h2>{section.section}</h2>

                  {section.questions.map((question, questionIndex) => {
                    const responseKey = `${sectionIndex}-${questionIndex}`;
                    const userAnswer = responses[responseKey];
                    return (
                      <div key={questionIndex} className="question-block">
                        <p><strong>Question:</strong> {question.question}</p>
                        <p><strong>Your Answer:</strong> {userAnswer || "No Answer"}</p>
                        <p><strong>Correct Answer:</strong> {section.section === "Multiple Choice"
                          ? question.options[question.answer]
                          : question.answer}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="test-content">
          {testData.map((section, sectionIndex) => (
            <div key={sectionIndex} className="test-section box">
              <h2>{section.section}</h2>

              {section.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="question-block">
                  <p>{question.question}</p>

                  {section.section === "Multiple Choice" && (
                    <div className="answer-section">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          className={`answer-option ${
                            responses[`${sectionIndex}-${questionIndex}`] === index
                              ? index === question.answer
                                ? "correct"
                                : "incorrect"
                              : ""
                          }`}
                          onClick={() => handleChange(sectionIndex, questionIndex, index)}
                          disabled={responses[`${sectionIndex}-${questionIndex}`] !== undefined}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {section.section === "Short Answer" && (
                    <input
                      type="text"
                      className="short-answer-input"
                      placeholder="Type your answer..."
                      value={responses[`${sectionIndex}-${questionIndex}`] || ""}
                      onChange={(e) => handleChange(sectionIndex, questionIndex, e.target.value)}
                    />
                  )}

                  {section.section === "Numerical Problems" && (
                    <input
                      type="number"
                      className="numerical-answer-input"
                      placeholder="Enter numeric answer..."
                      value={responses[`${sectionIndex}-${questionIndex}`] || ""}
                      onChange={(e) => handleChange(sectionIndex, questionIndex, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}

          <button className="submit-button" onClick={handleSubmit}>
            Submit Test
          </button>
        </div>
      )}
    </div>
  );
};

export default Test;

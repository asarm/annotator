import React, { useState, useRef } from 'react';
import { useEffect } from 'react';

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState([]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        setJsonData(JSON.parse(event.target.result)["data"]);
      };

      reader.readAsText(file);
    }
  };

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (currentIndex < jsonData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleAnswerChange = (questionId, newAnswer) => {
  const updatedQuestionAnswers = questionAnswers.map(qa => {
    if (qa.id === questionId) {
      return { ...qa, answer: newAnswer };
    } else {
      return qa;
    }
  });
  setQuestionAnswers(updatedQuestionAnswers);
};

    
  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {jsonData && (
        <div style={{margin: 100}}>
          <span>{jsonData[currentIndex].title}</span>
          <p>{jsonData[currentIndex].context}</p>
          <ul>
            {
            jsonData[currentIndex].qas.map(question => (
              <li>
                <p>Question: {question.question}</p>
                <p>Answer: {question.answer}</p>
              </li>
            ))
            }
          </ul>
          <button onClick={handlePrevClick}>Previous</button>          
          <button onClick={handleNextClick}>Next</button>
        </div>
      )}
    </div>
  );
}


export default App;
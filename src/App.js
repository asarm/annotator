import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { saveAs} from 'save-as';
import Highlighter from "react-highlight-words";



function App() {
  const [jsonData, setJsonData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // create a variable that allows user to upload a JSON file and targets the object "data"
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

   // download the updated data in JSON format
   const handleDownloadData = () => {
    const file = new Blob([JSON.stringify({data: jsonData}, null, 2)], {type: 'text/plain'});
    saveAs(file, 'data.json');
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


  // allows user to edit the question
  const changeQuestion = (id) => {
    const q_input = prompt('Please write your question');
    const newJsonData = [...jsonData];
    const text = newJsonData[currentIndex].qas.find(q => q.id === id);
    text.question = q_input; // update the question
    setJsonData(newJsonData);
  };

  // allows user to edit the answer
  const handleAnswerEdit = (id) => {
    const a_input = prompt('Enter the answer');
    const newJsonData = [...jsonData];
    const text = newJsonData[currentIndex].qas.find(text => text.id === id); // find the corresponding text by id
    text.answer = a_input; // update the answer
    setJsonData(newJsonData);
  };

  
  // different colors for different answers
  const colors = ["#ffc107", "#17a2b8", "#28a745", "#dc3545", "#6c757d", "#60329F", "#71FF1E", "#EAFF1E"];
  
  // highlight the answers in the context
  const colorizeAnswers = (jsonData) => {
    const answers = jsonData[currentIndex].qas.map((q) => q.answer);
  
    // map the answers to the corresponding highlighted answers
    const highlightedAnswers = answers.map((answer, index) => {
      // start and end index of the answer
      const startIndex = jsonData[currentIndex].context.indexOf(answer);
      const endIndex = startIndex + answer.length;
      

      // Update start and end indices
      jsonData[currentIndex].qas[index].answer_start = startIndex;
      jsonData[currentIndex].qas[index].answer_end = endIndex;
      return (
        <Highlighter
          highlightClassName="highlight"
          searchWords={[answer]}
          autoEscape={true}
          textToHighlight={jsonData[currentIndex].context}
          highlightStyle={{ backgroundColor: colors[index % colors.length] }}
        />
      );
        
    });

 
    return highlightedAnswers; // TODO: do not return additional contexts
  };
  
  
  
  return (
    <div>
      
      <h1>QA Annotation Tool</h1>
      <p>Upload the data in JSON format</p>
      <input type="file" onChange={handleFileSelect} />
      <button onClick={handleDownloadData}>Download Data</button>

      {jsonData &&  (
        <div style={{margin: 100}}>
          
          <span>{jsonData[currentIndex].title}</span>
          <p>{jsonData[currentIndex].context}</p>
          <p>{colorizeAnswers(jsonData)}</p>
          <ul>
            {
            jsonData[currentIndex].qas.map((text, index) => (
              <li>
                <p>
                  Question: {text.question} 
                  <button onClick={() => changeQuestion(text.id)}
                
                  style={{ marginLeft: "15px" }}
                  >Edit</button> 
                </p>
                
                <p>
                  Answer: <span style={{ backgroundColor: colors[index] }}>{text.answer}</span>
                  <button onClick={() => handleAnswerEdit(text.id)}
                  style={{ marginLeft: "15px" }}
                  >Edit</button>
                </p> 
              
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


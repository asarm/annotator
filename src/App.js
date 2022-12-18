import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { saveAs} from 'save-as';
import Highlighter from "react-highlight-words";



function App() {
  const [jsonData, setJsonData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');



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
  // id: text id to be edited, signal: edit type ( 1=> from prompt, 0 => by using mouse)
  const handleAnswerEdit = (id, signal) => {
    setCurrentQ(id);
    let a_input;
    
    if (signal == 1) {
      a_input = prompt('Enter the answer')
    }else {
      a_input = window.getSelection().toString()
    }

    const newJsonData = [...jsonData];
    const text = newJsonData[currentIndex].qas.find(text => text.id === id); // find the corresponding text by id
 
    text.answer = a_input; // update the answer
    
    setJsonData(newJsonData);
  };

  
  // different colors for different answers
  const colors = ["#ffc107", "#17a2b8", "#28a745", "#dc3545", "#6c757d", "#60329F", "#71FF1E", "#EAFF1E"];
  
  // update the indices of the answers
  const setIndices = (jsonData) => {
    const answers = jsonData[currentIndex].qas.map((q) => q.answer);
  
    
    const searchWords = answers.map((answer, index) => {
      // start and end index of the answer
      const startIndex = jsonData[currentIndex].context.indexOf(answer);
      const endIndex = startIndex + answer.length;
  
      // Update start and end indices
      jsonData[currentIndex].qas[index].answer_start = startIndex;
      jsonData[currentIndex].qas[index].answer_end = endIndex;
    });

  };
  // highlight the answers in the context using the indices
  const highlightAnswers = (jsonData) => {
    setIndices(jsonData);  
    const context = jsonData[currentIndex].context; 
    const spans = context.split('').map((char, index) => {
      let style = {};
  
      // Check if the character is part of an answer
      const qa = jsonData[currentIndex].qas.find(qa => qa.answer_start <= index && index <= qa.answer_end);
      if (qa) {
        // Set the highlight color based on the answer's id
        style.backgroundColor = colors[qa.id % colors.length];
      }
  
      return (
        <span key={index} style={style}>
          {char}
        </span>
      );
    });
  
    return <p>{spans}</p>;
  };
  
  // Delete a QA
  const handleDelete = (index) => {
    const newJsonData = [...jsonData];
    newJsonData[currentIndex].qas.splice(index, 1);
    for (let i = 0; i < newJsonData[currentIndex].qas.length; i++) {
      if (newJsonData[currentIndex].qas[i].id !== i) {
        newJsonData[currentIndex].qas.forEach((qa, index) => {
          qa.id = index;
        });
        setJsonData(newJsonData);
        break;
      }
    }
    setJsonData(newJsonData);
  };
  // Add a new QA
  const handleAddQuestion = (e) => {
    e.preventDefault(); // prevent the form from reloading the page
  
    const newJsonData = [...jsonData]; 
    const newId = newJsonData[currentIndex].qas.length; // next available id
    
    const newQA = {
      id: newId,
      question: newQuestion,
      answer_start: 0,
      answer_end: newAnswer.length,
      answer: newAnswer
    };
  
    // add the new QA to the current context
    newJsonData[currentIndex].qas.push(newQA);
  
    setJsonData(newJsonData); // update the jsonData 
    setNewQuestion(''); // reset form
    setNewAnswer(''); // reset form
  };


  return (
    <div>
    
      <h1>QA Annotation Tool</h1>
      <p>Upload the data in JSON format</p>
      <input type="file" onChange={handleFileSelect} />
      <button onClick={handleDownloadData}>Download Data</button>
      <div style={{margin: 20}}></div>
      <form onSubmit={handleAddQuestion}>
      <label>
        Question:
        <input type="text" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} />
      </label>
      <label>
        Answer:
        <input type="text" value={newAnswer} onChange={e => setNewAnswer(e.target.value)} />
      </label>
      <input type="submit" value="Add question" />
    </form>
      {jsonData &&  (
        <div style={{margin: 75}}>
          
          <span>{jsonData[currentIndex].title}</span>
          
          
          <p>{highlightAnswers(jsonData)}</p>
          <ul>
            {
            jsonData[currentIndex].qas.map((text, index) => (
              <li>
                <p>
                  { console.log(index)}
                  Question: {text.question} 
                  <button onClick={() => changeQuestion(text.id, 1)}
                  style={{ marginLeft: "15px" }}
                  >Edit</button> 
                  <button onClick={() => handleDelete(index)}>Delete</button>
                </p>
                
                <p>
                  Answer: <span style={{ backgroundColor: colors[index] }}>{text.answer}</span>
                  <button onClick={() => handleAnswerEdit(text.id, 1)}
                  style={{ marginLeft: "15px" }}
                  >Edit {text.id}</button>
                  <button onClick = {() => handleAnswerEdit(text.id, 0)}>Edit by select</button>

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
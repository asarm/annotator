import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { saveAs} from 'save-as';
import Highlighter from "react-highlight-words";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';

function App() {
  const [jsonData, setJsonData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
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
    <div style={{marginTop: 20, marginLeft:30, marginRight:30}}>
      <h1>QA Annotation Tool</h1>
      <p>Upload the data in JSON format</p>

      <Button variant="contained" component="label" size="small" style={{marginRight:10}}>
        Upload File
        <input hidden accept="" multiple type="file" onChange={handleFileSelect} />
      </Button>      
      <Button onClick={handleDownloadData} size="small" variant="outlined">Download Data</Button>
      <div style={{margin: 10}}></div>
      
      {jsonData &&  (                
        <div>                                    
          <Grid container spacing={2}>                             
              <Grid item xs={6}>                
                <h3>{jsonData[currentIndex].title}</h3>
                <Box sx={{ boxShadow: 3, minHeight:200, padding:2}}>                
                  <p>{highlightAnswers(jsonData)}</p>
                </Box>
              </Grid>            
            <Grid item xs={6}>
              <Box sx={{ boxShadow: 3, minHeight:400, padding:2, marginTop:7}}>                
              <ul>
              {
              jsonData[currentIndex].qas.map((text, index) => (          
                <div>                             
                <li>
                  <p>
                  <Grid container spacing={0} sx={{marginTop:0}}>                    
                    <Grid item xs={8}>
                      Question: {text.question} 
                    </Grid>
                    <Grid item xs={2}>
                      <Button size="small" variant="outlined" onClick={() => changeQuestion(text.id, 1)}
                      style={{ marginLeft: "15px" }}
                      >Edit</Button>                       
                    </Grid>                         

                    <Grid item xs={2}>
                      <IconButton aria-label="delete" color="error"  onClick={() => handleDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                  </p>                                    
                  <p>
                  <Grid container spacing={0} sx={{marginTop:0}}>
                    <Grid item xs={8}>
                      Answer: <span c>{text.answer}</span>
                    </Grid>
                    <Grid item xs={2}>
                      <Button size="small" variant="outlined" onClick={() => handleAnswerEdit(text.id, 1)}
                      style={{ marginLeft: "15px" }}
                      >Edit</Button>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton 
                      onClick = {() => handleAnswerEdit(text.id, 0)}
                      aria-label="delete" color="error">
                        <DeleteIcon />
                      </IconButton>   
                    </Grid>                        
                    </Grid>            
                  </p>               
                </li>                                               
                </div>                      
              ))
              }                
                <form onSubmit={handleAddQuestion}>
                  <label>
                    <TextField id="standard-basic" label="Question" variant="standard"  value={newQuestion} onChange={e => setNewQuestion(e.target.value)} />
                  </label>
                  <label style={{ marginLeft: 20 }}>
                    <TextField id="standard-basic" label="Answer" variant="standard"  value={newAnswer} onChange={e => setNewAnswer(e.target.value)} />                    
                  </label>
                  <Button type="submit" value="Add question" variant="outlined" sx={{marginTop:1, marginLeft:1}}>Add Question</Button>
                </form>
              </ul>              
              </Box>              
            </Grid>                        
          </Grid>                    
            
          {currentIndex}
          {questionCount}
          <LinearProgress variant="determinate" value={(currentIndex/questionCount)*100} sx={{ boxShadow: 1, marginTop:3}}/>    

          <Grid container spacing={0} sx={{marginTop:5}}>
          <Grid item xs={4}></Grid>
          <Grid item xs={2}>
            <Button size="small" variant='outlined' onClick={handlePrevClick}>Previous</Button>
          </Grid>
          <Grid item xs={2}>
          <Button size="small" variant='outlined' onClick={handleNextClick}>Next</Button>
          </Grid>
          <Grid item xs={4}></Grid>
          </Grid>
        </div>
      )}
    </div>
  );
}


export default App;
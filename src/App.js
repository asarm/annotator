import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { saveAs} from 'save-as';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import MouseIcon from '@mui/icons-material/Mouse';
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import SaveAsIcon from '@mui/icons-material/SaveAs';


function App() {
  const [jsonData, setJsonData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContext, setNewContext] = useState('');
  const [isOpen, setIsOpen] = React.useState(false)
  
  // toggle on-off the drawer panel
  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState)
}

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

  // sets the current index when the user clicks on previous button
  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  // sets the current index when the user clicks on next button
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
    
    if (signal === 1) {
      a_input = prompt('Enter the answer')
    }else {
      a_input = window.getSelection().toString()
    }

    const newJsonData = [...jsonData];
    const qas = newJsonData[currentIndex].qas.find(qas => qas.id === id); // find the corresponding qas by id
 
    qas.answer = a_input; // update the answer
    
    setJsonData(newJsonData);
  };

  
  // different colors for different answers
  var colors = [ "#ffb399", "#ffcc99", "#ffe699", "#ffff99",
   "#e6ff99", "#28a745", "#EAFF1E","#ff9999", "#cc99ff", "#cff99e6", "#99ffff",
   "#99b3ff"];
  
   
  
  // update the indices of the answers in the context
  const setIndices = (jsonData) => {
    const answers = jsonData[currentIndex].qas.map((q) => q.answer);
  
    const searchWords = answers.map((answer, index) => {
      // Find all instances of the answer in the context
      const escapedAnswer = answer.split(' ').map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join(' ');
       const regex = new RegExp(`(\b|(|-)${escapedAnswer}(\b|)|-)`, 'g');
      const matches = [...jsonData[currentIndex].context.matchAll(regex)];
      //console.log(matches)
      // If no matches are found, set the start and end indices to -1
      if (matches.length === 0) {
        jsonData[currentIndex].qas[index].answer_start = -1;
        jsonData[currentIndex].qas[index].answer_end = -1;
        return {};
      }
  
      // To get rid of matching with the substring of words
      const match = matches.find((match) => {
        var prevChar = null;
        var nextChar = null;
        if (match.index === 0) {
          prevChar = null
          nextChar = jsonData[currentIndex].context.charCodeAt(match.index + match[0].length);   
        }
        else {
          prevChar = jsonData[currentIndex].context.charCodeAt(match.index - 1);
          nextChar = jsonData[currentIndex].context.charCodeAt(match.index + match[0].length);
        }
        
        return match.index === jsonData[currentIndex].context.substring(0, match.index).lastIndexOf(' ') + 1 && (prevChar < 65 || (prevChar > 90 && prevChar < 97) || prevChar > 122) && (nextChar < 65 || (nextChar > 90 && nextChar < 97) || nextChar > 122);
      });
      if (match) {
        // Update the start and end indices of the answer
        jsonData[currentIndex].qas[index].answer_start = match.index;
        jsonData[currentIndex].qas[index].answer_end = match.index + match[0].length - 1;
      } else {
        // Set start and end indices to -1 if no matching answer is found
        jsonData[currentIndex].qas[index].answer_start = -1;
        jsonData[currentIndex].qas[index].answer_end = -1;
      }
    });
  };
  
  
  // highlight the answers in the context using the indices
  const highlightAnswers = (jsonData) => {
    setIndices(jsonData);  
    const context = jsonData[currentIndex].context; 
    const spans = context.split('').map((char, index) => {
      let style = {};
  
      // Check if the character is part of an answer
      const qa = jsonData[currentIndex].qas.find(qa => qa.answer_start <= index 
        && index <= qa.answer_end
        );
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
  
    // add a new QA to the current context
    newJsonData[currentIndex].qas.push(newQA);
  
    setJsonData(newJsonData); // update the jsonData 
    setNewQuestion(''); // reset form
    setNewAnswer(''); // reset form
  };
  // allows user to add new data to the array
  const addData = (jsonData, newTitle, newContext) => {
    // create a new object to be added to the array
    const newData = {
      title: newTitle,
      context: newContext,
      qas: []
    };
    
    let title;
    let context;

    title = prompt('Enter the title')
    context = prompt('Enter the context')

    newData.title = title
    newData.context = context
  
    // add new data to the array
    jsonData.push(newData);
  }
  
  const handleAddData = () => {
    addData(jsonData, newTitle, newContext);
    setJsonData([...jsonData]); // update the jsonData
  }
  // allows user to delete the data at the current index
  const handleDeleteData = (index) => {
    if (jsonData.length === 1) {
      // display error message if user tries to delete the last item
      alert('CANNOT DELETE THE LAST ITEM');
    } else {
      const newJsonData = [...jsonData]; // temp jsonData
      newJsonData.splice(index, 1); // delete the item at desired index
  
      // update the current index
      setCurrentIndex(Math.min(currentIndex, newJsonData.length - 1)); // set current index to the new last item
      setJsonData(newJsonData); // update the jsonData
    }
  }
  // counts the number of words in the context
  const countWords = () => {
    const contextWords = jsonData[currentIndex].context.split(' ');
    return contextWords.length;
  };
  

  const drawerItems = []; // stores the name of titles

  return (
    <div style={{marginTop: 20, marginLeft:30, marginRight:30}}>
      <h1 align="middle">QA Annotation Tool</h1>
      <p>Upload the data in JSON format</p>
      <Button variant="contained" component="label" size="small" style={{marginRight:10}}>
        Upload File
        <input hidden accept="" multiple type="file" onChange={handleFileSelect} />
      </Button>      
      <Button onClick={handleDownloadData} size="small" variant="outlined">Download Data</Button>
      {jsonData ? (
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => handleAddData()}
          style={{ marginLeft: "30%" }}
        >Add Data</Button>
      ) : null}
      {jsonData ? (
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => handleDeleteData(currentIndex)}
          style={{ marginLeft: "1%" }}
        >Delete Data</Button>
      ) : null}
  
      <div style={{margin: 10}}></div>
      
      {jsonData &&  (                
        <div>  

<>
            
            <Drawer open={isOpen} onClose={toggleDrawer} direction="bottom">
              {
                jsonData.forEach((data) => {
                  drawerItems.push(<Button variant="outlined" sx={{marginRight: "9px", marginLeft: "9px", marginTop: "9px"} } onClick = {() => setCurrentIndex(jsonData.indexOf(data))} >
                    {data.title}
                    </Button>)
                }
                )
                }
                
                <div>{drawerItems}</div>
            </Drawer>
        </>
                                          
          <Grid container spacing={2}>                             
              <Grid item xs={6}>                
                <h2 align="middle">{jsonData[currentIndex].title}</h2>
                <h5><Box>
                    Word count: {countWords()}
                    </Box>
                </h5>
                
                <Box sx={{ boxShadow: 3, minHeight:200, padding:2}}>                
                  <p>{highlightAnswers(jsonData)}</p>
                </Box>
              </Grid>            
            <Grid item xs={6}>
              <Box sx={{ boxShadow: 3, minHeight:400, padding:2, marginTop:7}}>                
                <h3 align="middle"> Questions</h3>  
              <ul>
              {
              jsonData[currentIndex].qas.map((text, index) => (          
                <div>                             
                <li>
                  <p>
                  <Grid container spacing={0} sx={{marginTop:0}}>                    
                    <Grid  item xs={8}>
                       <b>{text.question}</b>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton size="small" variant="outlined" onClick={() => changeQuestion(text.id, 1)}
                      style={{ marginLeft: "15px" }}
                      ><QuestionAnswerIcon></QuestionAnswerIcon></IconButton>                       
                    </Grid>                         

                    <Grid item xs={2}>
                      <IconButton size="small" aria-label="delete" color="error"  onClick={() => handleDelete(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                  </p>                                    
                  <p>
                  <Grid container spacing={0} sx={{marginTop:0}}>
                    <Grid item xs={8}>
                      Answer: <span c style={{ backgroundColor: colors[index] }}>{text.answer}</span>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton color="secondary" size="small" variant="outlined" onClick={() => handleAnswerEdit(text.id, 1)}
                      style={{ marginLeft: "15px" }}
                      ><SaveAsIcon></SaveAsIcon></IconButton>
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton
                      size="small" 
                      onClick = {() => handleAnswerEdit(text.id, 0)}
                      aria-label="delete" color="info">
                        <MouseIcon />
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
            
          {currentIndex + 1 + "/" + jsonData.length}
          <LinearProgress variant="determinate" value={((currentIndex + 1)/jsonData.length) * 100} sx={{ boxShadow: 1, marginTop:3}}/>  

          <Grid container spacing={0} sx={{marginTop:5}}>
          <Grid item xs={3.5}></Grid>
          <Grid item xs={2}>
            <Button size="small" variant='outlined' onClick={handlePrevClick}>Previous</Button>
          </Grid>
          <Grid item xs={2}><Button color='error' variant='contained'  onClick={toggleDrawer}>Jump To</Button></Grid>
          
          <Grid item xs={3}>
          <Button size="small" variant='outlined' onClick={handleNextClick}>Next</Button>
          </Grid>
          </Grid>
        </div>
      )}
    </div>
  );
}


export default App;

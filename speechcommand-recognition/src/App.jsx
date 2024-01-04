// App.jsx
import React, { useState, useEffect } from 'react';
import * as speech from '@tensorflow-models/speech-commands';
import * as tf from '@tensorflow/tfjs';
import './App.css';

function App() {
  const [model, setModel] = useState(null);
  const [label, setLabel] = useState([]);
  const [action, setAction] = useState(null);

  const loadModel = async () => {
    const recognizer = await speech.create('BROWSER_FFT');
    console.log('Model Loaded');
    await recognizer.ensureModelLoaded();
    console.log(recognizer.wordLabels());
    setModel(recognizer);
    setLabel(recognizer.wordLabels());
  };

  const argmax = (array) => {
    return array.reduce((maxIndex, currentValue, currentIndex, arr) => {
      return currentValue > arr[maxIndex] ? currentIndex : maxIndex;
    }, 0);
  };

  const recognizeCommand = async () => {
    console.log('Listening for commands');
    model.listen(
      (result) => {
        console.log(result.scores);
        const actionIndex = argmax(Object.values(result.scores));
        setAction(label[actionIndex]);
      },
      { includeSpectrogram: true, probabilityThreshold: 0.9 }
    );

    setTimeout(() => {
      if (model != null && model.isListening()) {
        model.stopListening();
      }
    }, 10e3);
  };

  useEffect(() => {
    loadModel();
    return () => {
      if (model) {
        model.stopListening();
      }
    };
  }, [model]);

  return (
    <div className='App'>
      <h1>Voice Command Recognition</h1>
      <div className='menu'>
        <h2>Commands</h2>
        <ul>
          {label.map((command, index) => (
            <li key={index}>{command}</li>
          ))}
        </ul>
      </div>
      <button className='commandButton' onClick={recognizeCommand}>
        Start Listening
      </button>
      <div className='result'>{action ? action : 'No action detected'}</div>
    </div>
  );
}

export default App;

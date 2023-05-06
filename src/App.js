import React from 'react';
import './App.css';
import VoiceRecorder from './components/VoiceRecorder';
import Settings from './components/Settings';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <VoiceRecorder />
      </header>
      <div className="settings-container">
        <Settings />
      </div>
    </div>
  );
}

export default App;
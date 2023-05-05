import React from 'react';
import './App.css';
import VoiceRecorder from './components/VoiceRecorder';
import WaveBackground from './components/WaveBackground';
import Settings from './components/Settings';

function App() {
  return (
    <div className="App">
      <WaveBackground />
      <header className="App-header">
        <h1>Voice Assistant</h1>
        <VoiceRecorder />
      </header>
      <div className="settings-container">
        <Settings />
      </div>
    </div>
  );
}

export default App;
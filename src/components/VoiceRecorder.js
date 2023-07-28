import React, { useState, useEffect, useRef } from 'react';
import { Button } from "react-bootstrap";
import { Mic, MicMute } from "react-bootstrap-icons";
import axios from 'axios';
import Cookies from 'js-cookie';
import whisperai from "../services/whisperai";
import WaveSurfer from 'wavesurfer.js';

const VoiceRecorder = ({ setAudioData }) => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("");
    const [responseText, setResponseText] = useState("");
    const [responseVisible, setResponseVisible] = useState(false);

    // Waveform
    const waveformRef = useRef(null);
    const [wavesurfer, setWavesurfer] = useState(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

    // Initialize WaveSurfer when the component mounts
    if (waveformRef.current) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorWidth: 0,
        height: 80,
        barWidth: 2,
        barHeight: 1,
        normalize: true
      });
      setWavesurfer(ws);
    }

    return () => {
      // Destroy the WaveSurfer instance when the component unmounts
      if (wavesurfer) {
        wavesurfer.destroy();
        }
      };
    }, []);      
 
    const showProcessingMessage = (message) => {
      setProcessingMessage(message);
    };
  
    const toggleRecording = async () => {
      // Check if API keys are set
      const openAIKey = Cookies.get('openai-key');
      const elevenLabsKey = Cookies.get('elevenlabs-key');
      if (!openAIKey || !elevenLabsKey) {
        alert('Please set your API keys in the settings before recording.');
        return;
      }
    
      if (!recording) {
        await startRecording();
      } else {
        stopRecording();
      }
    };
    
  
    const startRecording = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
  
      recorder.start();
      setRecording(true);
  
      recorder.ondataavailable = (e) => {
        processAudio(e.data);
      };
  
      recorder.onstop = () => {
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };
    };
  
    const stopRecording = () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setMediaRecorder(null);
      }
    };

  const processAudio = async (audioBlob) => {
    try {
      // Enable processing
      setProcessing(true);
      showProcessingMessage("Transcribing...");
  
    // Get the selected role from the cookie
    const selectedRole = Cookies.get('selected-role');

      // Determine the role of the AI based on the selected role
      let aiRole;
      switch (selectedRole) {
        case 'spanish-to-english':
          aiRole = 'You are a Spanish to English translator';
          break;
        case 'english-to-spanish':
          aiRole = 'You are a English to Spanish translator';
          break;
        case 'english-to-japanese':
          aiRole = 'You are a English to Japanese translator';
          break;
        case 'default':
          aiRole = 'You are a helpful assistant';
        default:
          aiRole = 'You are a helpful assistant';
    }

      // Send audio to WhisperAI for transcription and receive OpenAI completion directly
      const openAIResponse = await whisperai.speechToText(audioBlob, aiRole);
  
      // Display the transcript
      if (openAIResponse.transcript) {
                
        setResponseText(["You: " + openAIResponse.transcript, "ChatGPT: " + openAIResponse.message]);
        setResponseVisible(true);
      } else {
        setResponseText(["No transcript (nothing heard)"]);
        setResponseVisible(true);
      }
      showProcessingMessage("Generating response...");
      
      // Send OpenAI response to your backend, which will forward it to ElevenLabs text-to-speech
      const audioResponse = await axios.post(
        "http://localhost:8000/elevenlabs",
        { text: openAIResponse.message },
        {
          headers: {
            "Content-Type": "application/json",
            "ElevenLabs-Key": Cookies.get("elevenlabs-key"),
          },
        }
      );
  
      showProcessingMessage("Playing response...");
  
      // Play the audio response
      playAudio(audioResponse.data.audioDataURI);
    } catch (error) {
      console.error("Error processing audio:", error);
      if (error.response && error.response.data && error.response.data.error) {
        const apiError = error.response.data.error;
        if (apiError.code === "audio_too_short") {
          alert("The audio is too short. Please try again with a longer audio clip.");
        } else {
          alert("An error occurred while processing the audio. Please try again.");
        }
      }
    } finally {
      setProcessing(false);
      showProcessingMessage("");
    }
  };
  
  const playAudio = (dataURI) => {
    const audio = new Audio(dataURI);
    audio.play();
  
    // Add an event listener to clear the audioDataURI when the audio ends
    audio.addEventListener("ended", () => {
      setResponseText([""]);
    });

    // Load the audio into the WaveSurfer instance
    if (wavesurfer) {
      wavesurfer.load(dataURI);
    }
  };
    
  return (
    <div className="voice-recorder">
      {/* Add a container for the waveform */}
      <div ref={waveformRef} style={{ width: '100%', height: '80px' }} />
      <div className="mic-container">
        <Button
          variant="outline-primary"
          onClick={toggleRecording}
          disabled={processing}
        >
          {recording ? <MicMute size={48} /> : <Mic size={48} />}
        </Button>
      </div>
      <div className="processing-message-container">
        {processing && (
          <div className="processing-message">{processingMessage}</div>
        )}
      </div>
      <div className={`response-text ${responseVisible ? "visible" : ""}`}>
        {Array.isArray(responseText) ? responseText.join("\n\n") : responseText}
      </div>
    </div>
  );  
};

export default VoiceRecorder;

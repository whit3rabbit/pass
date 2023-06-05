import React, { useState, useEffect } from 'react';
import { Button } from "react-bootstrap";
import { Mic, MicMute } from "react-bootstrap-icons";
import axios from 'axios';
import Cookies from 'js-cookie';
import whisperai from "../services/whisperai";
import { BufferMemory } from 'langchain/memory';
import Dexie from 'dexie';

// Initialize Dexie
const db = new Dexie("ConversationHistoryDB");
db.version(1).stores({
  conversations: '++id'
});


const VoiceRecorder = ({ setAudioData }) => {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("");
    const [responseText, setResponseText] = useState("");
    const [responseVisible, setResponseVisible] = useState(false);
  
    // Initialize memory with the buffered memory from IndexedDB, or a new BufferMemory instance if it doesn't exist
    const [memory, setMemory] = useState([]);

    useEffect(() => {
      // Load conversation history from IndexedDB when component mounts
      db.conversations.toArray().then(conversationHistory => {
        if (conversationHistory.length > 0) {
          // Create a new BufferMemory instance with the conversation history
          const bufferMemory = new BufferMemory({ returnMessages: true });
          bufferMemory.set(conversationHistory);
          setMemory(bufferMemory);
        } else {
          // Create a new BufferMemory instance if there's no conversation history
          setMemory(new BufferMemory({ returnMessages: true }));
        }
      });
    }, []);
 
    const showProcessingMessage = (message) => {
      setProcessingMessage(message);
    };
  
    const toggleRecording = async () => {
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
  
      // Send audio to WhisperAI for transcription and receive OpenAI completion directly
      const openAIResponse = await whisperai.speechToText(audioBlob);
  
      // Display the transcript
      if (openAIResponse.transcript) {
        // Add user's message to memory
        memory.add({role: 'user', content: openAIResponse.transcript});
        
        // Add assistant's response to memory
        memory.add({role: 'assistant', content: openAIResponse.message});
        
        // Save conversation history to IndexedDB
        db.conversations.put(memory.get());
        
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
  };
    
  return (
    <div className="voice-recorder">
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

import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Mic, MicMute } from "react-bootstrap-icons";
import axios from 'axios';
import Cookies from 'js-cookie';
import whisperai from "../services/whisperai";

function displayTranscript(text) {
  let transcriptElement = document.getElementById("transcript");

  if (!transcriptElement) {
    transcriptElement = document.createElement("div");
    transcriptElement.id = "transcript";
    transcriptElement.className = "transcript";
    document.body.appendChild(transcriptElement);
  }

  transcriptElement.textContent = text;
  transcriptElement.classList.add("visible");

  setTimeout(() => {
    transcriptElement.classList.remove("visible");
  }, 3000); // Duration in milliseconds to display the transcript before fading out
}

const VoiceRecorder = ({ setAudioData }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [processing, setProcessing] = useState(false);

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
  
      // Send audio to WhisperAI for transcription and receive OpenAI completion directly
      const openAIResponse = await whisperai.speechToText(audioBlob);
  
      // Display the transcript
      if (openAIResponse.transcript) {
        displayTranscript(openAIResponse.transcript);
      } else {
        displayTranscript("No transcript");
      }
  
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
    }
  };
  
  const playAudio = (audioDataURI) => {
    const audio = new Audio(audioDataURI);
    audio.play();
  };
    
  return (
    <div className="voice-recorder">
      <Button
        variant="outline-primary"
        onClick={toggleRecording}
        disabled={processing}
      >
        {recording ? <MicMute size={48} /> : <Mic size={48} />}
      </Button>
    </div>
  );
};

export default VoiceRecorder;
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Mic, MicMute } from "react-bootstrap-icons";
import whisperai from "../services/whisperai";
import openai from "../services/openai";
import elevenlabs from "../services/elevenlabs";

const VoiceRecorder = ({ setAudioData }) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

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
      // Send audio to WhisperAI for transcription
      const transcript = await whisperai.speechToText(audioBlob);

      // Send transcript to OpenAI API
      const openAIResponse = await openai.chat(transcript);

      // Send OpenAI response to ElevenLabs text-to-speech
      const audioResponse = await elevenlabs.textToSpeech(openAIResponse);

      // Play the audio response
      playAudio(audioResponse);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  const playAudio = (audioData) => {
    const audio = new Audio(URL.createObjectURL(audioData));
    audio.play();
  };

  return (
    <div className="voice-recorder">
      <Button
        variant="outline-primary"
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
      >
        {recording ? <MicMute size={48} /> : <Mic size={48} />}
      </Button>
    </div>
  );
};

export default VoiceRecorder;

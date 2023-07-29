import axios from 'axios';
import Cookies from 'js-cookie';

const whisperai = {
  speechToText: async (audioBlob, role) => {
    const OPENAI_API_KEY = Cookies.get('openai-key');

    try {
      // Convert the audioBlob to a data URL
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      const audioDataURL = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
      });

      // Send audio to your backend for WhisperAI transcription and OpenAI completion
      const response = await axios.post(
        'http://localhost:8000/whisper',
        { audio: audioDataURL, role: role },  // Include role in the request body
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      return response.data;
      } 
      catch (error) {
        console.error('Error in WhisperAI:', error.message);
        if (error.response) {
          console.error('Response status:', error.response.status);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error:', error.message);
        }
        throw error;
      }
  },
};

export default whisperai;

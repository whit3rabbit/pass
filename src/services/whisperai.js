import axios from 'axios';
import Cookies from 'js-cookie';

const whisperai = {
  speechToText: async (audioBlob) => {
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
        { audio: audioDataURL },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in WhisperAI:', error);
      throw error;
    }
  },
};

export default whisperai;

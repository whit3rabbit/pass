import axios from 'axios';
import Cookies from 'js-cookie';

const whisperai = {
  speechToText: async (audioBlob) => {
    const OPENAI_API_KEY = Cookies.get('openai-key');

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    const base64Audio = await new Promise((resolve) => {
      reader.onload = () => {
        resolve(reader.result);
      };
    });

    try {
      const response = await axios.post(
        'http://localhost:8000/whisper',
        {
          audio: base64Audio,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error in WhisperAI speech-to-text:', error);
      throw error;
    }
  },
};

export default whisperai;

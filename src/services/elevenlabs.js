import axios from 'axios';
import Cookies from 'js-cookie';

const elevenlabs = {
  textToSpeech: async (text) => {
    const ELEVENLABS_API_KEY = Cookies.get('elevenlabs-key');
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/text-to-speech', // update the URL if necessary
        { text }, // update the payload structure if necessary
        { headers: { 'Authorization': `Bearer ${ELEVENLABS_API_KEY}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error in ElevenLabs text-to-speech:', error);
      throw error;
    }
  },
};

export default elevenlabs;
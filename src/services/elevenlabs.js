import axios from 'axios';
import Cookies from 'js-cookie';

const elevenlabs = {
  textToSpeech: async (text, voice = '21m00Tcm4TlvDq8ikWAM', voice_settings = { stability: 0, similarity_boost: 0 }) => {
    const ELEVENLABS_API_KEY = Cookies.get('elevenlabs-key');
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
        { text, voice_settings },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
          responseType: 'arraybuffer',
        }
      );

      const audioBuffer = Buffer.from(response.data, 'binary');
      const base64Audio = audioBuffer.toString('base64');
      const audioDataURI = `data:audio/mpeg;base64,${base64Audio}`;

      return audioDataURI;
    } catch (error) {
      console.error('Error in ElevenLabs text-to-speech:', error);
      throw error;
    }
  },
};

export default elevenlabs;
import axios from 'axios';
import Cookies from 'js-cookie';

const openai = {
  chat: async (transcript) => {
    const OPENAI_API_KEY = Cookies.get('openai-key');
    try {
      const response = await axios.post(
        'http://localhost:8000/completions',
        {
          messages: [
            {
              role: "user",
              content: transcript,
            },
          ],
        },
        { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error in OpenAI chat:', error);
      throw error;
    }
  },
};

export default openai;
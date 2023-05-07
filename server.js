const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = 8000;
const axios = require('axios');

app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.post('/whisper', async (req, res) => {
  try {
    const configuration = new Configuration({
      apiKey: req.headers.authorization.split(' ')[1],
    });
    const openai = new OpenAIApi(configuration);

    await fs.writeFileSync(
      '/tmp/tmp.webm',
      Buffer.from(
        req.body.audio.replace('data:audio/webm;codecs=opus;base64,', ''),
        'base64'
      )
    );
    const transcriptionResponse = await openai.createTranscription(
      fs.createReadStream('/tmp/tmp.webm'),
      'whisper-1'
    );
    // Log the transcript to console
    console.log('audio transcript: ', transcriptionResponse.data.text);
    
    // Send transcript to Chatgpt for response
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: transcriptionResponse.data.text}],
    });
    console.log('Chatgpt response: ', completion.data.choices[0].message.content)
    
    // Return both the transcript and message
    res.json({
      transcript: transcriptionResponse.data.text,
      message: completion.data.choices[0].message.content,
    });
  } catch (err) {
    console.log(err);
    console.log(err.response.data.error);
    res.status(500).json({ error: err.message });
  }
});

app.post("/elevenlabs", async (req, res) => {
  try {
    const text = req.body.text;

    if (!text) {
      res.status(400).send({ error: "Text is required." });
      return;
    }

    const elevenLabsApiKey = req.headers["elevenlabs-key"];

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        text: text,
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "audio/mpeg",
          "xi-api-key": elevenLabsApiKey,
        },
        responseType: "arraybuffer",
      }
    );

    const audioBuffer = Buffer.from(response.data, "binary");
    const base64Audio = audioBuffer.toString("base64");
    const audioDataURI = `data:audio/mpeg;base64,${base64Audio}`;
    res.send({ audioDataURI });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred while processing the request.");
  }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

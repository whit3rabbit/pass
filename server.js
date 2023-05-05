const express = require('express');
const fs = require('fs');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const app = express();
const port = 8000;

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
    const response = await openai.createTranscription(
      fs.createReadStream('/tmp/tmp.webm'),
      'whisper-1'
    );
    console.log('audio res', response.data.text);
    return res.json(response.data);
  } catch (err) {
    console.log(err);
    console.log(err.response.data.error);
    res.status(500).json({ error: err.message });
  }
});

app.post('/completions', async (req, res) => {
  try {
    const configuration = new Configuration({
      apiKey: req.headers.authorization.split(' ')[1],
    });
    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: req.body.prompt,
        },
      ],
    });
    console.log(response.data.choices[0].message);

    return res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

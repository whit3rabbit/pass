# Voice Assistant App

This Voice Assistant App uses WhisperAI, OpenAI, and ElevenLabs APIs to create a voice-activated AI assistant that can be used on iOS, Android, or desktop devices. The app is built using React and Node.js.

## Features

- Record audio by holding the "Hold to Talk" button
- Transcribe audio using WhisperAI API
- Generate AI response using OpenAI's ChatGPT API
- Convert AI response to speech using ElevenLabs API
- Play AI-generated speech in the browser
- Store API keys in a secure way

## Prerequisites

Before running the app, make sure you have [Node.js](https://nodejs.org/) and npm (which comes with Node.js) installed on your computer.

## Installation

1. Clone the repository:

```
git clone https://github.com/whit3rabbit/pass.git
```

2. Change directory to the project folder:
```
cd voice-assistant-app
```
3. Install the required dependencies:
```
npm install -g yarn # If you don't already have yarn
yarn
```

4. To run app with Yarn:

```
# Development Mode
yarn start

# Production mode
yarn build-production
yarn serve
```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

The app should now be running in your browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



# EchoScript

A privacy-first Speech-to-Text Progressive Web App powered by OpenAI Whisper, running entirely in the browser.

## Features

- AI-powered speech transcription using Whisper Base
- Runs entirely on-device
- No backend or API keys required
- Progressive Web App (PWA)
- Responsive UI
- Copy transcript to clipboard

## Tech Stack

- React
- Vite
- Tailwind CSS
- Transformers.js
- OpenAI Whisper Base
- ONNX Runtime Web
- Web Audio API

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- Uses `whisper-base.en` for transcription.
- All processing happens locally in the browser.
- Audio is never uploaded to a server.

## Future Improvements

- Live transcription
- Automatic punctuation
- Export transcript
- Multi-language support
- Speaker diarization
- AI summaries
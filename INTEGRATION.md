# Orbit AI Integration Guide

This guide explains how to run the Orbit AI system with the Python backend connected to the Next.js frontend.

## System Architecture

The Orbit AI system consists of two main components:

1. **Python Backend**: A FastAPI service that wraps the Orbit AI agent, providing API endpoints for text and audio processing.
2. **Next.js Frontend**: A web interface that communicates with the backend API to provide a user-friendly experience.

## Prerequisites

- Python 3.8+ with pip
- Node.js 18+ with npm or yarn
- Ollama installed and running locally (or accessible via a remote URL)
- OpenAI API key (for TTS functionality)
- ffmpeg installed on your system (for audio format conversion)
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Setup Instructions

### 1. Install Python Backend Dependencies

```bash
cd orbit-ai/assistant
pip install fastapi uvicorn python-multipart
pip install openai-whisper openai ollama sounddevice soundfile sentence-transformers faiss-cpu
```

### 2. Install Frontend Dependencies

```bash
cd orbit-ai
npm install
# or
yarn install
```

### 3. Configure Environment Variables

For the Python backend:
1. Copy the example environment file:
   ```bash
   cd orbit-ai/assistant
   cp .env.example .env
   ```
2. Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   OLLAMA_HOST=http://localhost:11434  # Change if using a remote Ollama instance
   ```

For the Next.js frontend:
- The `.env.local` file is already configured to connect to the local API

### 4. Start the Backend Server

```bash
cd orbit-ai/assistant
python api.py
```

The API server will start on http://localhost:8000

### 5. Start the Frontend Development Server

```bash
cd orbit-ai
npm run dev
# or
yarn dev
```

The Next.js app will start on http://localhost:3000

## API Endpoints

The Python backend provides the following API endpoints:

- `POST /api/text`: Send a text message to the AI
  - Request body: `{ "message": "Your message here" }`
  - Returns: AI response with text, audio URL, and resources

- `POST /api/audio`: Send audio data to the AI
  - Request body: `{ "audio_data": "base64-encoded-audio" }`
  - Returns: AI response with text, audio URL, and resources

- `GET /api/audio/{filename}`: Get audio file for playback

## Troubleshooting

### Backend Issues

1. **Missing Dependencies**: Ensure all Python dependencies are installed
2. **Ollama Connection**: Verify Ollama is running and accessible
3. **OpenAI API Key**: Check that your OpenAI API key is valid and set correctly

### Frontend Issues

1. **API Connection**: Ensure the backend API is running and accessible
2. **Audio Recording**: Check browser permissions for microphone access
3. **Audio Playback**: Verify that audio files are being served correctly

## Extending the System

### Adding New AI Capabilities

To add new AI capabilities:
1. Extend the Python backend with new functionality
2. Add new API endpoints in `api.py`
3. Create corresponding client functions in `src/lib/api.ts`
4. Update the UI components to use the new functionality

### Customizing the UI

The UI is built with Next.js, React, and TailwindCSS. You can customize:
1. The layout in `src/app/page.tsx`
2. The chat interface in `src/components/middle-panel/ChatInterface.tsx`
3. The styling in `src/app/globals.css`

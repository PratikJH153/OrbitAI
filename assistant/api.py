import os
import time
import base64
import tempfile
import uuid
import logging
from typing import Optional, List, Dict, Any, Union
from pathlib import Path
import asyncio
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("orbit-api")

# Import the agent components
from main import (
    WhisperSTT,
    OllamaLLM,
    LocalRAG,
    OpenAITTS,
    OLLAMA_MODEL_NAME,
    OLLAMA_HOST,
    RAG_KNOWLEDGE_FILE,
    OUTPUT_DIR,
)

# Create FastAPI app
app = FastAPI(title="Orbit AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for audio files if they don't exist
TEMP_DIR = Path("temp_audio")
TEMP_DIR.mkdir(exist_ok=True)

# Create a custom output directory for API audio files
API_AUDIO_DIR = Path("api_audio")
API_AUDIO_DIR.mkdir(exist_ok=True)

# Mount the audio directory as a static files directory
app.mount("/audio", StaticFiles(directory=str(API_AUDIO_DIR)), name="audio")

# Initialize components
stt_engine = WhisperSTT()
llm_engine = OllamaLLM(model_name=OLLAMA_MODEL_NAME, host=OLLAMA_HOST)
rag_system = LocalRAG(knowledge_file=RAG_KNOWLEDGE_FILE)


# Create a custom TTS engine that saves to our API audio directory
class APIOpenAITTS(OpenAITTS):
    def __init__(self):
        super().__init__(output_dir=str(API_AUDIO_DIR))

    def synthesize_speech(self, text_to_speak):
        if not self.client:
            print(f"🔊 Agent (mock TTS): {text_to_speak}")
            return None

        if not text_to_speak or not text_to_speak.strip():
            print(f"[TTS Engine] No valid text to speak.")
            return None

        try:
            # Generate a unique filename for this speech
            unique_filename = f"speech_{uuid.uuid4().hex}.mp3"
            self.speech_file_path = Path(API_AUDIO_DIR) / unique_filename

            # Generate the speech file
            with self.client.audio.speech.with_streaming_response.create(
                model=self.model,
                voice=self.voice,
                input=text_to_speak,
                response_format="mp3",
            ) as response:
                response.stream_to_file(self.speech_file_path)

            if os.path.exists(self.speech_file_path):
                return self.speech_file_path
            else:
                print(
                    f"[TTS Engine] Speech file not found after synthesis: {self.speech_file_path}"
                )
                return None

        except Exception as e:
            print(f"[TTS Engine] Error during OpenAI TTS synthesis: {e}")
            import traceback

            traceback.print_exc()
            return None


# Initialize our custom TTS engine
tts_engine = APIOpenAITTS()


# Models for request/response
class TextRequest(BaseModel):
    message: str


class AudioRequest(BaseModel):
    audio_data: str  # Base64 encoded audio data


class AIResponse(BaseModel):
    text: str
    audio_url: Optional[str] = None
    resources: Optional[List[Dict[str, Any]]] = None


# API endpoints
@app.get("/")
async def root():
    return {"message": "Orbit AI API is running"}


@app.post("/api/text", response_model=AIResponse)
async def process_text(request: TextRequest):
    """Process text input and return AI response"""
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Get context from RAG system
    retrieved_context = rag_system.retrieve_context(request.message)

    # Generate prompt
    prompt = f"""You are Orbit, a helpful, playful, and cheerful AI assistant.
User Query: "{request.message}"
Relevant Information from Knowledge Base:
\"\"\"
{retrieved_context}
\"\"\"
Based on the user query and relevant information, provide a concise, positive, and encouraging answer. If the information is insufficient, say so cheerfully and offer general help. Do not make up facts.
Orbit (in a playful and cheering voice):"""

    # Generate response
    llm_response = llm_engine.generate_response(prompt)

    # Generate speech and get the file path
    speech_file_path = tts_engine.synthesize_speech(llm_response)

    # Get the URL to the audio file
    audio_url = None
    if speech_file_path:
        # Use the /audio mount point we created
        audio_url = f"/audio/{Path(speech_file_path).name}"

    # Return response
    return AIResponse(
        text=llm_response,
        audio_url=audio_url,
        resources=[
            {"id": "1", "title": "Related Information", "content": retrieved_context}
        ],
    )


@app.post("/api/audio", response_model=AIResponse)
async def process_audio(request: AudioRequest):
    """Process audio input and return AI response"""
    if not request.audio_data:
        raise HTTPException(status_code=400, detail="Audio data cannot be empty")

    try:
        # Decode base64 audio data
        audio_bytes = base64.b64decode(
            request.audio_data.split(",")[1]
            if "," in request.audio_data
            else request.audio_data
        )

        # Try to determine the audio format from the base64 data
        audio_format = "webm"  # Default format

        # Check for format indicators in the base64 data
        if "data:audio/webm" in request.audio_data:
            audio_format = "webm"
        elif "data:audio/mp4" in request.audio_data:
            audio_format = "mp4"
        elif "data:audio/ogg" in request.audio_data:
            audio_format = "ogg"
        elif "data:audio/wav" in request.audio_data:
            audio_format = "wav"

        logger.info(f"Detected audio format: {audio_format}")

        # Save to temporary file with appropriate extension
        temp_file = TEMP_DIR / f"input_{int(time.time())}.{audio_format}"
        with open(temp_file, "wb") as f:
            f.write(audio_bytes)

        # Log the audio file details
        logger.info(
            f"Processing audio file: {temp_file} (size: {os.path.getsize(temp_file)} bytes)"
        )

        # Try multiple approaches to process the audio
        transcribed_text = None

        # Approach 1: Try direct transcription with Whisper
        try:
            # Use whisper directly on the file
            import whisper

            logger.info("Attempting direct transcription with Whisper")
            model = whisper.load_model("base")
            result = model.transcribe(str(temp_file))
            transcribed_text = result["text"].strip()
            logger.info(
                f"Direct Whisper transcription successful: '{transcribed_text}'"
            )
        except Exception as e:
            logger.error(f"Error with direct Whisper transcription: {e}")

            # Approach 2: Try converting with ffmpeg and then using soundfile
            try:
                import subprocess
                import soundfile as sf

                logger.info("Converting audio with ffmpeg")
                # Convert webm to wav using ffmpeg
                wav_file = TEMP_DIR / f"converted_{int(time.time())}.wav"
                subprocess.run(
                    [
                        "ffmpeg",
                        "-i",
                        str(temp_file),
                        "-ar",
                        "16000",
                        "-ac",
                        "1",
                        "-f",
                        "wav",
                        str(wav_file),
                    ],
                    check=True,
                    capture_output=True,
                )

                logger.info(
                    f"Conversion successful, reading with soundfile: {wav_file}"
                )

                # Try reading the converted file
                audio_data, _ = sf.read(wav_file, dtype="float32")

                # Transcribe audio data
                transcribed_text = stt_engine.transcribe(audio_data)
                logger.info(
                    f"Transcription after conversion successful: '{transcribed_text}'"
                )

                # Clean up the converted file
                os.remove(wav_file)
            except Exception as conv_error:
                logger.error(f"Error converting or processing audio: {conv_error}")

                # Approach 3: Try a simpler conversion approach
                try:
                    logger.info("Trying simpler conversion approach")
                    # Try a simpler ffmpeg command
                    simple_wav_file = (
                        TEMP_DIR / f"simple_converted_{int(time.time())}.wav"
                    )
                    subprocess.run(
                        ["ffmpeg", "-y", "-i", str(temp_file), str(simple_wav_file)],
                        check=True,
                        capture_output=True,
                    )

                    # Try direct transcription on the converted file
                    result = model.transcribe(str(simple_wav_file))
                    transcribed_text = result["text"].strip()
                    logger.info(
                        f"Simple conversion transcription successful: '{transcribed_text}'"
                    )

                    # Clean up
                    os.remove(simple_wav_file)
                except Exception as simple_error:
                    logger.error(
                        f"Error with simple conversion approach: {simple_error}"
                    )
                    return AIResponse(
                        text="I had trouble processing your audio. Could you please try again with a clearer voice?",
                        resources=[],
                    )

        if not transcribed_text:
            return AIResponse(
                text="I couldn't understand the audio. Could you please try again?",
                resources=[],
            )

        # Process the transcribed text
        retrieved_context = rag_system.retrieve_context(transcribed_text)

        prompt = f"""You are Orbit, a helpful, playful, and cheerful AI assistant.
User Query: "{transcribed_text}"
Relevant Information from Knowledge Base:
\"\"\"
{retrieved_context}
\"\"\"
Based on the user query and relevant information, provide a concise, positive, and encouraging answer. If the information is insufficient, say so cheerfully and offer general help. Do not make up facts.
Orbit (in a playful and cheering voice):"""

        llm_response = llm_engine.generate_response(prompt)

        # Generate speech and get the file path
        speech_file_path = tts_engine.synthesize_speech(llm_response)

        # Get the URL to the audio file
        audio_url = None
        if speech_file_path:
            # Use the /audio mount point we created
            audio_url = f"/audio/{Path(speech_file_path).name}"

        return AIResponse(
            text=llm_response,
            audio_url=audio_url,
            resources=[
                {"id": "1", "title": "I heard you say", "content": transcribed_text},
                {
                    "id": "2",
                    "title": "Related Information",
                    "content": retrieved_context,
                },
            ],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")


# We don't need this endpoint anymore since we're using StaticFiles
# to serve audio files from the /audio mount point


# Run the server
if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

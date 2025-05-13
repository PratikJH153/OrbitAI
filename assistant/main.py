import time
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
env_path = Path(".") / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Set TOKENIZERS_PARALLELISM to false to suppress the warning
# This should be done before importing libraries that use tokenizers, like sentence_transformers
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import numpy as np
import torch  # Retained for Whisper STT and FAISS if GPU is used
import argparse
import collections

# Attempt to import necessary libraries
try:
    import whisper
except ImportError:
    print("Whisper library not found. Please install it: pip install openai-whisper")
    whisper = None

try:
    from openai import OpenAI
except ImportError:
    print("OpenAI library not found. Please install it: pip install openai")
    OpenAI = None  # Explicitly set to None if not found

try:
    import ollama as ollama_client
except ImportError:
    print("Ollama library not found. Please install it: pip install ollama")
    ollama_client = None

try:
    import sounddevice as sd
except ImportError:
    print("Sounddevice library not found. Please install it: pip install sounddevice")
    sd = None

try:
    import soundfile as sf
except ImportError:
    print("Soundfile library not found. Please install it: pip install soundfile")
    sf = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    print(
        "Sentence-transformers library not found. Please install it: pip install sentence-transformers"
    )
    SentenceTransformer = None

try:
    import faiss
except ImportError:
    print(
        "FAISS library not found. Please install it: pip install faiss-cpu (or faiss-gpu if you have CUDA)"
    )
    faiss = None

# --- Configuration ---
WHISPER_MODEL_NAME = "base"  # Options: "tiny", "base", "small", "medium", "large"
OLLAMA_MODEL_NAME = (
    "llama3.2"  # Ensure this model is pulled in Ollama (e.g., `ollama pull llama3`)
)
# Get Ollama host from environment variable or use default
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "https://76bb-34-83-205-116.ngrok-free.app")

# --- OpenAI TTS Configuration ---
OPENAI_TTS_MODEL = "tts-1"  # Standard model: "tts-1" or "tts-1-hd" for higher quality
OPENAI_TTS_VOICE = "shimmer"  # Changed from "nova" to "shimmer". Other options: 'alloy', 'echo', 'fable', 'onyx'.
OPENAI_TTS_OUTPUT_FILENAME = "speech.mp3"  # Output file for OpenAI TTS

# --- RAG Configuration ---
RAG_EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
RAG_KNOWLEDGE_FILE = "knowledge_base.txt"

# --- Audio Recording Configuration ---
AUDIO_SAMPLE_RATE = 16000  # For recording, Whisper prefers 16kHz
AUDIO_CHANNELS = 1
# VAD (Voice Activity Detection) parameters
AUDIO_CHUNK_DURATION_MS = (
    300  # Duration of each audio chunk for VAD analysis in milliseconds
)
SILENCE_THRESHOLD = 0.008  # RMS energy below this is considered silence (adjust based on mic/environment)
END_OF_SPEECH_SILENCE_DURATION = 1.5  # Seconds of silence to consider speech ended
MAX_RECORD_DURATION = 20  # Maximum seconds to record if silence is not detected

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ANSI escape codes
PINK = "\033[95m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
NEON_GREEN = "\033[92m"
RESET_COLOR = "\033[0m"


class Microphone:
    def __init__(self, sample_rate=AUDIO_SAMPLE_RATE, channels=AUDIO_CHANNELS):
        if not sd:
            print(
                f"{YELLOW}Sounddevice not available. Microphone functionality will be limited to text input.{RESET_COLOR}"
            )
            self.sd_available = False
        else:
            self.sd_available = True
        self.sample_rate = sample_rate
        self.channels = channels
        self.chunk_size = int(self.sample_rate * AUDIO_CHUNK_DURATION_MS / 1000)
        print(
            f"{CYAN}[Microphone] Initialized. Chunk size for VAD: {self.chunk_size} frames.{RESET_COLOR}"
        )

    def _calculate_rms(self, audio_chunk):
        """Calculates the Root Mean Square of an audio chunk."""
        return np.sqrt(np.mean(audio_chunk**2))

    def listen(self):
        print(
            f"\n{PINK}🎤 Listening... (Press ENTER to start, speak, then pause. Or type your input){RESET_COLOR}"
        )

        choice = input(
            f"{YELLOW}   Press ENTER to start voice recording, or type your message and press ENTER: {RESET_COLOR}"
        ).strip()
        if choice:  # User typed something
            print(f"{CYAN}   Using typed input.{RESET_COLOR}")
            return choice

        if not self.sd_available:
            print(
                f"{YELLOW}   Sounddevice not available for recording. Falling back to text input.{RESET_COLOR}"
            )
            return self._get_text_input_fallback()

        print(
            f"{CYAN}   Recording... Speak now. Recording will stop after {END_OF_SPEECH_SILENCE_DURATION}s of silence or max {MAX_RECORD_DURATION}s.{RESET_COLOR}"
        )

        recorded_frames = []
        silent_chunks_count = 0
        total_chunks_recorded = 0

        chunks_for_silence_duration = int(
            END_OF_SPEECH_SILENCE_DURATION * 1000 / AUDIO_CHUNK_DURATION_MS
        )
        max_chunks_to_record = int(MAX_RECORD_DURATION * 1000 / AUDIO_CHUNK_DURATION_MS)

        try:
            with sd.InputStream(
                samplerate=self.sample_rate,
                channels=self.channels,
                dtype="float32",
                blocksize=self.chunk_size,
            ) as stream:
                # start_time = time.time() # Not strictly needed with chunk counting
                while True:
                    audio_chunk, overflowed = stream.read(self.chunk_size)
                    if overflowed:
                        print(
                            f"{YELLOW}   Warning: Audio input overflowed!{RESET_COLOR}"
                        )

                    recorded_frames.append(audio_chunk)
                    total_chunks_recorded += 1

                    rms = self._calculate_rms(audio_chunk)
                    # print(f"RMS: {rms:.4f}") # For debugging VAD threshold

                    if rms < SILENCE_THRESHOLD:
                        silent_chunks_count += 1
                    else:
                        # If speech is detected, ensure we record a bit more even if it was silent before
                        # This helps capture leading soft sounds if SILENCE_THRESHOLD is aggressive
                        if silent_chunks_count > 0:
                            print(
                                f"{CYAN}   Speech detected after brief silence.{RESET_COLOR}"
                            )
                        silent_chunks_count = 0

                    if silent_chunks_count >= chunks_for_silence_duration:
                        print(
                            f"{CYAN}   End of speech detected after {END_OF_SPEECH_SILENCE_DURATION}s of silence.{RESET_COLOR}"
                        )
                        break

                    if total_chunks_recorded >= max_chunks_to_record:
                        print(
                            f"{CYAN}   Maximum recording duration of {MAX_RECORD_DURATION}s reached.{RESET_COLOR}"
                        )
                        break

            if not recorded_frames:
                print(f"{YELLOW}   No audio recorded.{RESET_COLOR}")
                return None

            audio_data = np.concatenate(recorded_frames, axis=0)
            print(
                f"{CYAN}   Recording finished. Total duration: {len(audio_data)/self.sample_rate:.2f}s{RESET_COLOR}"
            )
            return audio_data.flatten() if audio_data.ndim > 1 else audio_data

        except Exception as e:
            print(
                f"{YELLOW}   [Microphone] Error during VAD audio recording: {e}{RESET_COLOR}"
            )
            import traceback

            traceback.print_exc()
            return self._get_text_input_fallback()

    def _get_text_input_fallback(self):
        try:
            user_spoken_text = input(
                f"{YELLOW}   Your voice input (type here as fallback): {RESET_COLOR}"
            )
            if not user_spoken_text.strip():
                print(f"{YELLOW}   No input received.{RESET_COLOR}")
                return None
            return user_spoken_text
        except EOFError:
            print(f"{YELLOW}   No input available.{RESET_COLOR}")
            return None


class WhisperSTT:
    def __init__(self, model_name=WHISPER_MODEL_NAME):
        if not whisper:
            print(
                f"{YELLOW}Whisper library not available. STT will not function.{RESET_COLOR}"
            )
            self.model = None
            return
        try:
            print(
                f"{CYAN}[STT Engine] Loading Whisper model: {model_name}...{RESET_COLOR}"
            )
            self.model = whisper.load_model(model_name)
            print(
                f"{CYAN}[STT Engine] Whisper model '{model_name}' loaded.{RESET_COLOR}"
            )
        except Exception as e:
            print(f"{YELLOW}[STT Engine] Error loading Whisper model: {e}{RESET_COLOR}")
            self.model = None

    def transcribe(self, audio_data_or_text):
        if self.model is None:
            print(
                f"{YELLOW}[STT Engine] Model not loaded. Cannot transcribe.{RESET_COLOR}"
            )
            if isinstance(audio_data_or_text, str):
                return audio_data_or_text
            return None
        if isinstance(audio_data_or_text, str):
            print(
                f"{CYAN}[STT Engine] Input is already text: '{audio_data_or_text}'{RESET_COLOR}"
            )
            return audio_data_or_text
        if audio_data_or_text is None or (
            hasattr(audio_data_or_text, "size") and audio_data_or_text.size == 0
        ):
            print(f"{YELLOW}[STT Engine] No audio data to transcribe.{RESET_COLOR}")
            return None
        try:
            if audio_data_or_text.dtype != np.float32:
                audio_data_or_text = audio_data_or_text.astype(np.float32)

            print(
                f"{CYAN}[STT Engine] Transcribing audio (length: {len(audio_data_or_text)/AUDIO_SAMPLE_RATE:.2f}s)...{RESET_COLOR}"
            )
            result = self.model.transcribe(
                audio_data_or_text, fp16=torch.cuda.is_available(), language=None
            )
            transcribed_text = result["text"].strip()

            if not transcribed_text:
                print(
                    f"{YELLOW}[STT Engine] Transcription resulted in empty text.{RESET_COLOR}"
                )
                return None

            print(
                f"{NEON_GREEN}[STT Engine] Transcription: '{transcribed_text}'{RESET_COLOR}"
            )
            return transcribed_text
        except Exception as e:
            print(f"{YELLOW}[STT Engine] Error during transcription: {e}{RESET_COLOR}")
            return None


class LocalRAG:
    def __init__(
        self,
        knowledge_file=RAG_KNOWLEDGE_FILE,
        embedding_model_name=RAG_EMBEDDING_MODEL_NAME,
    ):
        if not SentenceTransformer or not faiss:
            print(
                f"{YELLOW}SentenceTransformer or FAISS not available. RAG will be basic.{RESET_COLOR}"
            )
            self.embedding_model, self.index, self.documents = None, None, []
            self._load_basic_knowledge(knowledge_file)
            return
        print(f"{CYAN}[RAG System] Initializing Local RAG...{RESET_COLOR}")
        try:
            print(
                f"{CYAN}  Loading embedding model: {embedding_model_name}...{RESET_COLOR}"
            )
            self.embedding_model = SentenceTransformer(embedding_model_name)
            print(f"{CYAN}  Embedding model loaded.{RESET_COLOR}")
            self.documents, self.index = [], None
            self._build_index_from_file(knowledge_file)
        except Exception as e:
            print(f"{YELLOW}  Error initializing RAG system: {e}{RESET_COLOR}")
            self.embedding_model, self.index, self.documents = None, None, []
            self._load_basic_knowledge(knowledge_file)

    def _load_basic_knowledge(self, knowledge_file):
        self.knowledge_base_fallback = {}
        try:
            if os.path.exists(knowledge_file):
                with open(knowledge_file, "r", encoding="utf-8") as f:
                    for i, line in enumerate(f):
                        self.knowledge_base_fallback[f"doc_{i}"] = line.strip()
                # print(f"{CYAN}[RAG System] Basic knowledge loaded from {knowledge_file} (fallback mode).{RESET_COLOR}") # Less verbose
            else:
                print(
                    f"{YELLOW}[RAG System] Knowledge file {knowledge_file} not found (fallback mode).{RESET_COLOR}"
                )
        except Exception as e:
            print(f"{YELLOW}Error loading basic RAG knowledge: {e}{RESET_COLOR}")

    def _build_index_from_file(self, knowledge_file):
        if not self.embedding_model:
            return
        try:
            if not os.path.exists(knowledge_file):
                print(
                    f"{YELLOW}  Knowledge file '{knowledge_file}' not found. Creating sample.{RESET_COLOR}"
                )
                with open(knowledge_file, "w", encoding="utf-8") as f:
                    f.write("Default knowledge: Ollama runs LLMs locally.\n")
                print(f"{CYAN}  Created a sample '{knowledge_file}'.{RESET_COLOR}")

            with open(knowledge_file, "r", encoding="utf-8") as f:
                self.documents = [ln.strip() for ln in f if ln.strip()]
            if not self.documents:
                # print(f"{YELLOW}  No documents found in knowledge file. RAG may not be effective.{RESET_COLOR}") # Less verbose
                return

            # print(f"{CYAN}  Embedding {len(self.documents)} documents for RAG...{RESET_COLOR}") # Less verbose
            doc_embeddings = self.embedding_model.encode(
                self.documents, convert_to_tensor=False
            )
            self.index = faiss.IndexFlatL2(doc_embeddings.shape[1])
            self.index.add(doc_embeddings)
            # print(f"{CYAN}  FAISS index built with {self.index.ntotal} vectors.{RESET_COLOR}") # Less verbose
        except Exception as e:
            print(f"{YELLOW}  Error building FAISS index: {e}{RESET_COLOR}")
            self.index, self.documents = None, []

    def retrieve_context(self, query_text, top_k=2):
        if not query_text:
            return ""
        if self.index and self.embedding_model and self.documents:
            try:
                query_embedding = self.embedding_model.encode([query_text])
                _, indices = self.index.search(query_embedding, top_k)
                retrieved_docs = [
                    self.documents[i] for i in indices[0] if i < len(self.documents)
                ]
                if retrieved_docs:
                    return "\n".join(retrieved_docs)
            except Exception as e:
                print(
                    f"{YELLOW}  Error during FAISS retrieval: {e}. Falling back.{RESET_COLOR}"
                )

        relevant_docs = []
        query_words = set(query_text.lower().split())
        docs_to_search = (
            self.documents
            if self.documents
            else list(self.knowledge_base_fallback.values())
        )
        for doc in docs_to_search:
            if query_words.intersection(set(doc.lower().split())):
                relevant_docs.append(doc)
        if not relevant_docs:
            return "No specific context found in local knowledge."
        return "\n".join(list(set(relevant_docs))[:top_k])


class OllamaLLM:
    def __init__(self, model_name=OLLAMA_MODEL_NAME, host=OLLAMA_HOST):
        if not ollama_client:
            print(
                f"{YELLOW}Ollama library not available. LLM will not function.{RESET_COLOR}"
            )
            self.client, self.model_name = None, None
            return
        self.model_name = model_name
        try:
            # print(f"{CYAN}[LLM Engine] Initializing Ollama client for model: {model_name} at {host}...{RESET_COLOR}") # Less verbose
            self.client = ollama_client.Client(host=host)
            available_models = self.client.list().get("models", [])
            if not any(
                m.get("name", "").startswith(model_name) for m in available_models
            ):
                print(
                    f"{YELLOW}  Warning: Ollama model '{model_name}' not found locally. Available models: {[m.get('name') for m in available_models]}{RESET_COLOR}"
                )
                print(
                    f"{YELLOW}  Please pull the model first (e.g., `ollama pull {model_name}`).{RESET_COLOR}"
                )
            # else:
            # print(f"{CYAN}  Ollama client initialized. Model '{model_name}' appears available.{RESET_COLOR}") # Less verbose
        except Exception as e:
            self.client = None
            print(
                f"{YELLOW}[LLM Engine] Error initializing Ollama client: {e}{RESET_COLOR}"
            )
            print(
                f"{YELLOW}  Ensure Ollama server is running at {host} and the model is pulled.{RESET_COLOR}"
            )

    def generate_response(self, prompt_text):
        if not self.client or not self.model_name:
            return "LLM not available. Please check Ollama setup."
        try:
            response = self.client.generate(
                model=self.model_name,
                prompt=prompt_text,
                stream=False,
                options={"temperature": 0.75},
            )
            generated_text = response["response"]
            return generated_text
        except Exception as e:
            print(
                f"{YELLOW}[LLM Engine] Error during Ollama generation: {e}{RESET_COLOR}"
            )
            return f"Sorry, I encountered an error with the LLM: {e}"


class OpenAITTS:
    def __init__(
        self,
        model=OPENAI_TTS_MODEL,
        voice=OPENAI_TTS_VOICE,
        output_dir=OUTPUT_DIR,
        output_filename=OPENAI_TTS_OUTPUT_FILENAME,
    ):
        if not OpenAI:
            print(
                f"{YELLOW}OpenAI library not available. TTS will not function.{RESET_COLOR}"
            )
            self.client = None
            return
        try:
            self.client = OpenAI()
            # print(f"{CYAN}[TTS Engine] OpenAI TTS client initialized.{RESET_COLOR}") # Less verbose
        except Exception as e:
            print(
                f"{YELLOW}[TTS Engine] Error initializing OpenAI client: {e}. Ensure OPENAI_API_KEY is set.{RESET_COLOR}"
            )
            self.client = None

        self.model = model
        self.voice = voice
        self.speech_file_path = Path(output_dir) / output_filename

    def synthesize_speech(self, text_to_speak):
        if not self.client:
            print(f"{PINK}🔊 Agent (mock TTS): {text_to_speak}{RESET_COLOR}")
            return
        if not sd or not sf:
            print(f"{PINK}🔊 Agent (mock TTS): {text_to_speak}{RESET_COLOR}")
            return
        if not text_to_speak or not text_to_speak.strip():
            print(f"{YELLOW}[TTS Engine] No valid text to speak.{RESET_COLOR}")
            return
        try:
            with self.client.audio.speech.with_streaming_response.create(
                model=self.model,
                voice=self.voice,
                input=text_to_speak,
                response_format="mp3",
            ) as response:
                response.stream_to_file(self.speech_file_path)

            if os.path.exists(self.speech_file_path):
                data, samplerate = sf.read(self.speech_file_path, dtype="float32")
                sd.play(data, samplerate)
                sd.wait()
            else:
                print(
                    f"{YELLOW}[TTS Engine] Speech file not found after synthesis: {self.speech_file_path}{RESET_COLOR}"
                )

        except Exception as e:
            print(
                f"{YELLOW}[TTS Engine] Error during OpenAI TTS synthesis or playback: {e}{RESET_COLOR}"
            )
            import traceback

            traceback.print_exc()
            print(f"{PINK}🔊 Agent (mock TTS on error): {text_to_speak}{RESET_COLOR}")


class PythonHubAgent:
    def __init__(self):
        print(f"{PINK}🚀 Initializing Python Hub Agent...{RESET_COLOR}")
        self.microphone = Microphone()
        self.stt_engine = WhisperSTT()
        self.rag_system = LocalRAG()
        self.llm_engine = OllamaLLM()
        self.tts_engine = OpenAITTS()

        print(f"{PINK}✅ Python Hub Agent initialized.{RESET_COLOR}")
        print("---")
        print(
            f"{YELLOW}IMPORTANT: Ensure Ollama server is running (`ollama serve`) and model '{OLLAMA_MODEL_NAME}' is pulled.{RESET_COLOR}"
        )
        print(
            f"{YELLOW}IMPORTANT: Ensure OPENAI_API_KEY environment variable is set for OpenAI TTS.{RESET_COLOR}"
        )
        print(
            f"{YELLOW}Knowledge for RAG is expected in '{RAG_KNOWLEDGE_FILE}'.{RESET_COLOR}"
        )
        print(
            f"{YELLOW}OpenAI TTS using model '{OPENAI_TTS_MODEL}' and voice '{OPENAI_TTS_VOICE}'.{RESET_COLOR}"
        )
        print("---")

    def process_single_turn(self):
        raw_input_data = self.microphone.listen()
        if raw_input_data is None:
            self.tts_engine.synthesize_speech(
                "I didn't catch that. Could you please say it again?"
            )
            return True

        user_query_text = self.stt_engine.transcribe(raw_input_data)
        if user_query_text is None or not user_query_text.strip():
            self.tts_engine.synthesize_speech(
                "Sorry, I had trouble understanding what you said. Please try again."
            )
            return True

        print(f"{NEON_GREEN}[User Query]: '{user_query_text}'{RESET_COLOR}")

        if user_query_text.lower().strip() in [
            "quit",
            "exit",
            "goodbye",
            "stop",
            "thank you goodbye",
        ]:
            self.tts_engine.synthesize_speech("Goodbye! Have a great day.")
            return False

        retrieved_context = self.rag_system.retrieve_context(user_query_text)

        prompt = f"""You are Orbit, a helpful, playful, and cheerful local AI assistant.
User Query: "{user_query_text}"
Relevant Information from Knowledge Base:
\"\"\"
{retrieved_context}
\"\"\"
Based on the user query and relevant information, provide a concise, positive, and encouraging answer. If the information is insufficient, say so cheerfully and offer general help. Do not make up facts.
Orbit (in a playful and cheering voice):"""

        llm_response_text = self.llm_engine.generate_response(prompt)

        if (
            not llm_response_text
            or llm_response_text.startswith("LLM not available")
            or llm_response_text.startswith("Sorry, I encountered an error")
        ):
            print(
                f"{YELLOW}[Python Hub] LLM response issue: {llm_response_text}{RESET_COLOR}"
            )
            self.tts_engine.synthesize_speech(
                "I'm having a little trouble thinking right now. Please try again in a moment."
            )
        else:
            print(f"{NEON_GREEN}[Orbit]: {llm_response_text.strip()}{RESET_COLOR}")
            self.tts_engine.synthesize_speech(llm_response_text)
        return True

    def start_conversation(self):
        self.tts_engine.synthesize_speech(
            f"Hello there! I'm Orbit, your super friendly local assistant! How can I make your day awesome?"
        )
        conversation_active = True
        while conversation_active:
            try:
                conversation_active = self.process_single_turn()
            except KeyboardInterrupt:
                print(
                    f"\n{YELLOW}Conversation interrupted by user (Ctrl+C).{RESET_COLOR}"
                )
                if self.tts_engine:
                    self.tts_engine.synthesize_speech(
                        "Okay, exiting now! Have a fantastic day!"
                    )
                conversation_active = False
            except Exception as e:
                print(
                    f"{YELLOW}[Python Hub] An unexpected error occurred in conversation loop: {e}{RESET_COLOR}"
                )
                import traceback

                traceback.print_exc()
                if self.tts_engine:
                    self.tts_engine.synthesize_speech(
                        "Whoops! I hit a little snag. Let's try that again, or you can say quit to exit."
                    )
                conversation_active = True

        print(f"{PINK}Conversation ended.{RESET_COLOR}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Local Speech-to-Speech AI Agent with OpenAI TTS"
    )
    args = parser.parse_args()

    if not all([whisper, OpenAI, ollama_client, sd, sf, SentenceTransformer, faiss]):
        print(
            f"\n{YELLOW}One or more critical libraries are missing. Please install them (see messages above) and try again.{RESET_COLOR}"
        )
        print(
            f"{YELLOW}Required: openai-whisper, openai, ollama, sounddevice, soundfile, sentence-transformers, faiss-cpu/gpu.{RESET_COLOR}"
        )
    else:
        if not os.path.exists(RAG_KNOWLEDGE_FILE):
            print(
                f"{CYAN}Creating a sample knowledge file: {RAG_KNOWLEDGE_FILE}{RESET_COLOR}"
            )
            with open(RAG_KNOWLEDGE_FILE, "w", encoding="utf-8") as f:
                f.write("The agent's name is Orbit, and he is very cheerful.\n")
                f.write("Ollama is a tool for running large language models locally.\n")
                f.write(
                    "OpenAI Whisper can convert speech to text with high accuracy.\n"
                )
                f.write("OpenAI TTS provides natural-sounding text-to-speech voices.\n")
                f.write("The best way to learn is by doing and having fun!\n")

        agent = PythonHubAgent()
        agent.start_conversation()

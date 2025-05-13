/**
 * OpenAI API client for direct integration with the frontend
 */

// Types for OpenAI API requests and responses
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  response_format?: { type: "json_object" };
}

export interface OpenAICompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAITTSRequest {
  model: string;
  input: string;
  voice: string;
  response_format?: string;
}

export interface OpenAIWhisperRequest {
  model: string;
  file: Blob;
  response_format?: string;
  language?: string;
  temperature?: number;
}

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1';
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_CHAT_MODEL = 'gpt-4o'; // Using a more capable model that better supports JSON mode
const OPENAI_TTS_MODEL = 'tts-1';
const OPENAI_TTS_VOICE = 'nova'; // Options: 'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
const OPENAI_TTS_SPEED = 1.0;
const OPENAI_WHISPER_MODEL = 'whisper-1';

/**
 * Generate a text response from OpenAI
 * @param messages Array of messages in the conversation
 * @param temperature Temperature for response generation (0-1)
 * @returns Promise with the OpenAI response
 */
export async function generateOpenAIResponse(
  messages: OpenAIMessage[],
  temperature: number = 0.2
): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set');
    throw new Error('OpenAI API key is not set. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_CHAT_MODEL,
        messages,
        temperature,
        response_format: { type: "json_object" } // Force JSON output
      } as OpenAICompletionRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate response from OpenAI');
    }

    const data = await response.json() as OpenAICompletionResponse;
    console.log('Raw OpenAI response content:', data.choices[0].message.content);
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    throw error;
  }
}

/**
 * Generate speech from text using OpenAI TTS
 * @param text Text to convert to speech
 * @param voice Voice to use for TTS
 * @returns Promise with the audio data as a Blob
 */
export async function generateSpeech(
  text: string,
  voice: string = OPENAI_TTS_VOICE
): Promise<Blob> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set');
    throw new Error('OpenAI API key is not set. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
  }

  try {
    const response = await fetch(`${OPENAI_API_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_TTS_MODEL,
        input: text,
        voice,
        response_format: 'mp3',
        speed: OPENAI_TTS_SPEED
      } as OpenAITTSRequest),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate speech from OpenAI');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Create a URL for a blob
 * @param blob Audio blob
 * @returns URL for the blob
 */
export function createAudioUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Play audio from a blob
 * @param blob Audio blob
 * @returns Promise that resolves when audio playback is complete
 */
export function playAudioFromBlob(blob: Blob): Promise<void> {
  const url = createAudioUrl(blob);
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };

    audio.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to play audio: ${error}`));
    };

    audio.play().catch(error => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to play audio: ${error.message}`));
    });
  });
}

/**
 * Transcribe audio using OpenAI Whisper API
 * @param audioBlob Audio blob to transcribe
 * @param language Optional language code (e.g., 'en')
 * @returns Promise with the transcribed text
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language?: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is not set');
    throw new Error('OpenAI API key is not set. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
  }

  try {
    // Create a FormData object to send the audio file
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', OPENAI_WHISPER_MODEL);

    // Force English language
    formData.append('language', 'en');

    // Set response format to json
    formData.append('response_format', 'json');

    console.log('Sending audio to OpenAI Whisper API...');

    const response = await fetch(`${OPENAI_API_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        // Don't set Content-Type here, it will be set automatically with the boundary
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to transcribe audio';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // If we can't parse the error as JSON, use the status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Transcription result:', data);
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
}

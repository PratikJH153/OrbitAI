/**
 * API client for communicating with the Python backend
 */

// API base URL - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Flag to determine if we should use client-side transcription
export const USE_CLIENT_SIDE_TRANSCRIPTION = true;

// Types
export interface AIResponseData {
  text: string;
  audio_url?: string;
  resources?: Array<{
    id: string;
    title: string;
    content: string;
    url?: string;
  }>;
}

/**
 * Send a text message to the AI
 * @param message The text message to send
 * @returns Promise with the AI response
 */
export async function sendTextMessage(message: string): Promise<AIResponseData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get response from AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
}

/**
 * Send audio data to the AI
 * @param audioData Base64 encoded audio data
 * @returns Promise with the AI response
 */
export async function sendAudioMessage(audioData: string): Promise<AIResponseData> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio_data: audioData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get response from AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending audio message:', error);
    throw error;
  }
}

/**
 * Get the full URL for an audio file
 * @param audioUrl The relative audio URL from the API response
 * @returns The full URL to the audio file
 */
export function getAudioUrl(audioUrl?: string): string | null {
  if (!audioUrl) return null;

  // If it's already a full URL, return it
  if (audioUrl.startsWith('http')) {
    return audioUrl;
  }

  // Otherwise, prepend the API base URL
  return `${API_BASE_URL}${audioUrl}`;
}

/**
 * Record audio from the user's microphone
 * @param maxDuration Maximum recording duration in seconds
 * @returns Promise with the base64 encoded audio data
 */
export async function recordAudio(maxDuration: number = 10): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if browser supports audio recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      reject(new Error('Your browser does not support audio recording'));
      return;
    }

    let audioChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder | null = null;
    let stopTimeout: NodeJS.Timeout | null = null;

    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus' // More compatible format
      });

      mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        if (audioChunks.length === 0) {
          stream.getTracks().forEach(track => track.stop());
          reject(new Error('No audio data was recorded'));
          return;
        }

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);

          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        reader.onerror = () => {
          reject(new Error('Failed to convert audio to base64'));

          // Stop all tracks to release the microphone
          stream.getTracks().forEach(track => track.stop());
        };

        reader.readAsDataURL(audioBlob);
      });

      // Request data every 1 second to ensure we get chunks
      mediaRecorder.start(1000);

      // Set timeout to stop recording after maxDuration
      stopTimeout = setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      }, maxDuration * 1000);
    })
    .catch(error => {
      reject(new Error(`Failed to access microphone: ${error.message}`));
    });
  });
}

/**
 * Play audio from a URL
 * @param audioUrl The URL of the audio to play
 * @returns Promise that resolves when audio playback is complete
 */
export function playAudio(audioUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      resolve();
    };

    audio.onerror = (error) => {
      reject(new Error(`Failed to play audio: ${error}`));
    };

    audio.play().catch(error => {
      reject(new Error(`Failed to play audio: ${error.message}`));
    });
  });
}

/**
 * Send transcribed text to the AI (from client-side transcription)
 * This function is similar to sendTextMessage but includes metadata about the transcription
 * @param transcribedText The text transcribed from audio
 * @param originalAudioData Optional base64 encoded audio data (for fallback)
 * @returns Promise with the AI response
 */
export async function sendTranscribedText(
  transcribedText: string,
  originalAudioData?: string
): Promise<AIResponseData> {
  try {
    console.log('Sending transcribed text to backend:', transcribedText);

    // If client-side transcription failed and we have original audio data, fall back to server-side
    if (!transcribedText && originalAudioData) {
      console.log('Transcription failed, falling back to server-side processing');
      return sendAudioMessage(originalAudioData);
    }

    // Send the transcribed text to the backend
    const response = await fetch(`${API_BASE_URL}/api/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: transcribedText,
        source: 'client_transcription'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get response from AI');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending transcribed text:', error);
    throw error;
  }
}

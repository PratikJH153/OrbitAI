import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaPaperPlane, FaSignOutAlt, FaStop } from 'react-icons/fa';
import Button from '../ui/Button';
import useStore from '@/store/useStore';
import { generateSpeech, playAudioFromBlob, OpenAIMessage, transcribeAudio } from '@/lib/openai';
import { generateResponseWithActions, AIResponseWithActions } from '@/lib/openai-actions';
import ProblemImageSequence from '../ui/ProblemImageSequence';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  onShowActionPlan?: () => void;
  onGroupProjectQuestion?: () => void;
  onAddTask?: (title: string, priority: 'low' | 'medium' | 'high') => void;
  onCompleteTask?: () => void;
  onShowProblem?: () => void;
  onShowResources?: () => void;
  onCloseSession?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onShowActionPlan,
  onGroupProjectQuestion,
  onAddTask,
  onCompleteTask,
  onShowProblem,
  onShowResources,
  onCloseSession
}) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Audio recording references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    setAIListening,
    addAIResponse,
    showSessionEndPrompt,
    aiResponses,
    setRightPanelVisible,
    conversationHistory,
    addToConversationHistory,
    isPlayingAudio,
    setIsPlayingAudio
  } = useStore();

  // Show right panel initially when component mounts for testing
  useEffect(() => {
    setRightPanelVisible(true);

    // Add a test message to the right panel
    addAIResponse(
      "Welcome to Orbit AI! I'm here to help you with your questions and tasks.",
      undefined,
      "Initial greeting",
      false,
      false,
      undefined,
      undefined,
      0,
      false,
      {
        text: "Welcome to Orbit AI! I'm here to help you with your questions and tasks.",
        actions: {
          showActionPanel: false
        }
      }
    );
  }, []); // Empty dependency array ensures it runs only once on mount

  // Initialize audio recording capabilities
  useEffect(() => {
    // Check if the browser supports the MediaRecorder API
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      console.warn('MediaRecorder API is not supported in this browser');
      addAIResponse(
        "I'm sorry, but your browser doesn't support audio recording. Please try using a modern browser like Chrome or Firefox.",
        undefined,
        "Browser compatibility issue"
      );
      return;
    }

    // Clean up function
    return () => {
      // Stop any ongoing recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Clear any active timers
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }

      // Reset UI state
      setIsListening(false);
      setAIListening(false);
    };
  }, []);

  // Add keyboard shortcut for microphone (m key)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if 'm' is pressed without modifiers and not in an input field
      if (event.key === 'm' && !event.ctrlKey && !event.altKey &&
          !event.metaKey && document.activeElement?.tagName !== 'INPUT') {
        console.log('Microphone toggled via keyboard shortcut');

        // Don't allow toggling if processing or playing audio
        if (isProcessing || isPlayingAudio) {
          console.log('Cannot toggle listening while processing or playing audio');
          return;
        }

        // If listening, stop recording
        if (isListening) {
          console.log('Stopping recording via keyboard shortcut');
          stopListening();
        } else {
          // Otherwise start recording
          console.log('Starting recording via keyboard shortcut');
          handleStartListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProcessing, isPlayingAudio, isListening]); // Add dependencies to ensure we have the latest state

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Check if the message is about centrifugal force (special case for demo)
    if (message.toLowerCase().includes('centrifugal') ||
        message.toLowerCase().includes('centripetal') ||
        message.toLowerCase().includes('circular motion') ||
        message.toLowerCase().includes('spinning force')) {
      // Show the right panel with centrifugal force information
      handleCentrifugalForceQuestion();
    }
    // Check if the message is about seeing a problem
    else if ((message.toLowerCase().includes('see') || message.toLowerCase().includes('look')) &&
             message.toLowerCase().includes('problem')) {
      // Show the problem in the right panel
      handleShowProblemRequest();
    }
    else {
      // Process the message using our common function
      await processUserMessage(message);
    }
  };

  const handleStartListening = async () => {
    // Don't start if already listening
    if (isListening) {
      console.log('Already listening, not starting again');
      return;
    }

    // Don't start if audio is playing or processing
    if (isPlayingAudio || isProcessing) {
      console.log('Audio is playing or processing, not starting listening');
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Update UI state
      setAIListening(true);
      setRightPanelVisible(true);
      setIsListening(true);
      setTranscript('');
      setMessage('');

      // Reset audio chunks
      audioChunksRef.current = [];

      // Create a new MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // This format works well with OpenAI's Whisper API
      });

      // Store the MediaRecorder instance
      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped');

        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());

        // Update UI state
        setIsListening(false);
        setAIListening(false);

        // Clear recording timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        // Process the recorded audio if we have any chunks
        if (audioChunksRef.current.length > 0) {
          // Create a blob from the audio chunks
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Set processing state
          setIsProcessing(true);

          try {
            // Show a temporary message
            setTranscript('Processing your speech...');

            // Transcribe the audio using OpenAI Whisper API
            const transcribedText = await transcribeAudio(audioBlob);

            if (transcribedText && transcribedText.trim()) {
              console.log('Transcription result:', transcribedText);

              // Update the transcript and message
              setTranscript(transcribedText);
              setMessage(transcribedText);

              // Process the transcribed text
              await processUserMessage(transcribedText);
            } else {
              console.log('No speech detected or transcription failed');
              addAIResponse(
                "I didn't catch that. Could you please try again?",
                undefined,
                "No speech detected"
              );
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            addAIResponse(
              "I had trouble understanding what you said. Please try again.",
              undefined,
              `Transcription error: ${error}`
            );
          } finally {
            // Clear processing state
            setIsProcessing(false);
            setTranscript('');
          }
        } else {
          console.log('No audio data recorded');
          addAIResponse(
            "I didn't hear anything. Please try again.",
            undefined,
            "No audio data"
          );
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data in 1-second chunks
      console.log('Recording started');

      // Set up a timer to update the recording time
      let seconds = 0;
      recordingTimerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingTime(seconds);

        // Automatically stop recording after 20 seconds
        if (seconds >= 20) {
          console.log('Maximum recording time reached (20s)');
          stopListening();
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting audio recording:', error);
      setAIListening(false);
      setIsListening(false);

      // Show error message based on the type of error
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        addAIResponse(
          "I need permission to use your microphone. Please allow microphone access in your browser.",
          undefined,
          "Microphone permission denied"
        );
      } else {
        addAIResponse(
          "I had trouble accessing your microphone. Please try again.",
          undefined,
          `Microphone access error: ${error}`
        );
      }
    }
  };

  /**
   * Generate default tasks for the action panel
   */
  const generateDefaultTasks = () => {
    return [
      {
        title: "Complete Physics Assignment",
        priority: "high" as const
      },
      {
        title: "Study for Calculus Exam",
        priority: "medium" as const
      },
      {
        title: "Research for Group Project",
        priority: "high" as const
      },
      {
        title: "Review Lecture Notes",
        priority: "low" as const
      }
    ];
  };

  /**
   * Handle actions from AI response
   */
  const handleResponseActions = (response: AIResponseWithActions) => {
    if (!response.actions) return;

    // Show action panel
    if (response.actions.showActionPanel && onShowActionPlan) {
      onShowActionPlan();

      // Add default tasks if needed
      const defaultTasks = generateDefaultTasks();
      defaultTasks.forEach(task => {
        if (onAddTask) {
          onAddTask(task.title, task.priority);
        }
      });
    }

    // Add task
    if (response.actions.addTask && onAddTask) {
      onAddTask(
        response.actions.addTask.title,
        response.actions.addTask.priority
      );
    }

    // Complete task
    if (response.actions.completeTask && onCompleteTask) {
      onCompleteTask();
    }

    // Show problem
    if (response.actions.showProblem && onShowProblem) {
      onShowProblem();
    }

    // Show resources
    if (response.actions.showResources && onShowResources) {
      onShowResources();
    }

    // Open team map
    if (response.actions.openTeamMap && onGroupProjectQuestion) {
      onGroupProjectQuestion();
    }

    // Close session and show welcome screen
    if (response.actions.closeSessionPrompt && onCloseSession) {
      onCloseSession();
    }
  };

  const handleShowProblemRequest = async () => {
    // Set initial content
    const initialContent = "Let me take a look at your problem...";

    // Make right panel visible
    setRightPanelVisible(true);

    // Add a custom response
    const customResponse = {
      id: uuidv4(),
      content: initialContent,
      reasoning: "The user asked to see their problem. Showing the problem analysis sequence.",
      isProblemResponse: true // Custom flag to identify this as a problem response
    };

    // Add the response to the store
    useStore.setState(state => ({
      aiResponses: [...state.aiResponses, customResponse]
    }));

    // Add AI response to conversation history
    addToConversationHistory({
      role: 'assistant',
      content: "I can see your problem. This is about projectile motion. Let me analyze it for you."
    });

    // Generate and play speech for the initial explanation
    try {
      setIsPlayingAudio(true);
      const speechBlob = await generateSpeech("I can see your problem. This is about projectile motion. Let me analyze it for you.");
      await playAudioFromBlob(speechBlob);
      setIsPlayingAudio(false);
    } catch (error) {
      console.error('Error generating or playing speech:', error);
      setIsPlayingAudio(false);
    }
  };

  const handleCentrifugalForceQuestion = async () => {
    // Set initial content for streaming
    const initialContent = "Let me explain centrifugal force...";

    // Images related to centrifugal force
    const centrifugalImages = [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Centrifugal_force_diagram.svg/1200px-Centrifugal_force_diagram.svg.png",
      "https://www.researchgate.net/publication/328959880/figure/fig1/AS:693644544864257@1542441392562/Centrifugal-force-acting-on-a-rotating-body.png"
    ];

    // YouTube video about centrifugal force
    const videoUrl = "https://www.youtube.com/embed/yyDRI6iQ9Fw";

    // Add streaming response with images and video
    addAIResponse(
      initialContent,
      [
        {
          id: '1',
          title: 'Centrifugal Force',
          content: 'Centrifugal force is a fictitious force that appears to act on objects moving in a circular path.',
          url: 'https://en.wikipedia.org/wiki/Centrifugal_force'
        }
      ],
      "The user asked about centrifugal force, so I'm providing a detailed explanation with visuals.",
      true, // isStreaming
      true, // hasVideo
      videoUrl,
      centrifugalImages,
      0 // Start at stage 0 (text only)
    );

    // Add AI response to conversation history
    addToConversationHistory({
      role: 'assistant',
      content: "Centrifugal force is a fictitious force that appears to act on objects moving in a circular path. It's what you feel pushing you outward when you're in a car that's making a turn. Let me show you some visuals to help explain this concept."
    });

    // Generate and play speech for the initial explanation
    try {
      setIsPlayingAudio(true);
      const speechBlob = await generateSpeech("Centrifugal force is a fictitious force that appears to act on objects moving in a circular path. It's what you feel pushing you outward when you're in a car that's making a turn.");
      await playAudioFromBlob(speechBlob);
      setIsPlayingAudio(false);
    } catch (error) {
      console.error('Error generating or playing speech:', error);
      setIsPlayingAudio(false);
    }
  };



  // Handle ending the session
  const handleEndSession = () => {
    // Collect all AI responses content to save as notes
    const sessionContent = aiResponses
      .map(response => response.content)
      .join('\n\n');

    // Show the session end prompt with the content
    showSessionEndPrompt(sessionContent);
  };

  const toggleListening = () => {
    console.log('Toggle listening, current state:', isListening);

    // Don't allow toggling if processing or playing audio
    if (isProcessing || isPlayingAudio) {
      console.log('Cannot toggle listening while processing or playing audio');
      return;
    }

    if (isListening) {
      console.log('Stopping recording via toggle button');
      stopListening();
    } else {
      console.log('Starting recording via toggle button');
      handleStartListening();
    }
    // Don't set isListening here, it's handled in the respective functions
    // to ensure proper synchronization with the actual recognition state
  };

  /**
   * Process a user message and generate an AI response
   */
  const processUserMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // Make right panel visible when user sends a message
    setRightPanelVisible(true);

    // Set processing state
    setIsProcessing(true);

    // Add user message to conversation history
    const userMessage: OpenAIMessage = {
      role: 'user',
      content: userText
    };
    addToConversationHistory(userMessage);

    try {
      // Generate response with actions
      const response = await generateResponseWithActions(userText, conversationHistory);

      // Add AI response to conversation history
      addToConversationHistory({
        role: 'assistant',
        content: response.text
      });

      // Add response to UI with the JSON response
      addAIResponse(
        response.text,
        undefined,
        "Generated using OpenAI API with actions",
        false,
        false,
        undefined,
        undefined,
        0,
        false,
        response // Store the full JSON response
      );

      // Process actions if any
      if (response.actions) {
        handleResponseActions(response);
      }

      // Generate and play speech
      try {
        setIsPlayingAudio(true);
        const speechBlob = await generateSpeech(response.text);
        await playAudioFromBlob(speechBlob);
        setIsPlayingAudio(false);
      } catch (error) {
        console.error('Error generating or playing speech:', error);
        setIsPlayingAudio(false);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      addAIResponse(
        "I'm sorry, I encountered an error while processing your request. Please try again.",
        undefined,
        `Error: ${error}`
      );
      setIsPlayingAudio(false);
    }

    // Clear the input and processing state
    setMessage('');
    setIsProcessing(false);
  };

  /**
   * Stop the current listening session
   */
  const stopListening = () => {
    // If not listening, nothing to do
    if (!isListening) {
      console.log('Not listening, nothing to stop');
      return;
    }

    console.log('Stopping audio recording manually');

    // Stop the media recorder if it's active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stopped successfully');
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);

        // Update UI state in case of error
        setIsListening(false);
        setAIListening(false);
      }
    } else {
      // If MediaRecorder isn't active, just update the UI state
      setIsListening(false);
      setAIListening(false);
    }

    // Clear the recording timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="glass p-4 rounded-xl">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isListening ? transcript || "Listening..." : isPlayingAudio ? "Orbit is speaking..." : "Ask Orbit AI..."}
            className="flex-1 bg-white/5 border border-glass-border rounded-lg px-4 py-3 text-lg text-foreground placeholder:text-foreground/50 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isListening || isPlayingAudio || isProcessing}
          />

          <Button
            variant="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || isListening || isPlayingAudio || isProcessing}
            className="text-lg p-3"
          >
            <FaPaperPlane size={20} />
          </Button>

          <Button
            variant={isListening ? "primary" : "secondary"}
            onClick={toggleListening}
            className={`text-lg p-3 ${isListening ? "animate-pulse" : ""}`}
            disabled={isPlayingAudio || isProcessing}
            title={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? <FaStop size={20} /> : <FaMicrophone size={20} />}
          </Button>

          <Button
            variant="outline"
            onClick={handleEndSession}
            title="End Session"
            className="text-lg p-3 text-red-400 hover:text-red-300"
            disabled={isListening || isPlayingAudio || isProcessing}
          >
            <FaSignOutAlt size={20} />
          </Button>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-base text-center text-foreground/80"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span>{transcript ? `"${transcript}"` : "Listening..."}</span>
              <span className="text-sm text-foreground/60">(tap microphone or press 'm' to stop)</span>
            </div>
          </motion.div>
        )}

        {isPlayingAudio && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-base text-center text-foreground/80"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="animate-pulse">Orbit is speaking...</span>
            </div>
          </motion.div>
        )}

        {isProcessing && !isPlayingAudio && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-base text-center text-foreground/80"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="animate-pulse">Thinking...</span>
            </div>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          className="text-sm text-center mt-3 text-foreground/70"
        >
          Try asking "What is centrifugal force?", "Show my action plan", or "Where is my team?"
        </motion.p>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, X, MessageSquare, RefreshCw, User } from 'lucide-react';
import './ChatWidget.css';

interface Message {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatWidgetProps {
  n8nWebhookURL: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ n8nWebhookURL }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const botName = "Taylor";

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          content: "Welcome 👋! How can I help you today?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    }
  }, [messages]);

  const toggleWidget = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => setIsMinimized(true), 300); // Wait for animation to complete
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      content: content,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      // Send to n8n webhook
      const response = await fetch(n8nWebhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          type: 'text',
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        // In a real app, you would get a response from your n8n workflow
        // For now, we'll just add a placeholder response
        setTimeout(() => {
          const botMessage: Message = {
            content: "Thank you for your message. I'm processing your request.",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, botMessage]);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        content: "Sorry, there was an error sending your message.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSendClick = () => {
    sendMessage(inputText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const startRecording = async () => {
    try {
      // Initialize Web Speech API
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        throw new Error("Speech recognition not supported in this browser");
      }
      
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      recognition.onresult = (event) => {
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update input with current transcription
        setInputText(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setIsTranscribing(false);
      };
      
      recognition.onend = () => {
        // Only end recording if we're still in recording state
        // This prevents ending when there's a temporary pause in speech
        if (isRecording) {
          setIsRecording(false);
          setIsTranscribing(false);
          
          // Send the final transcript if it's not empty
          if (finalTranscript.trim()) {
            sendMessage(finalTranscript);
          }
        }
      };
      
      recognition.start();
      speechRecognitionRef.current = recognition;
      setIsRecording(true);
      setIsTranscribing(true);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      
      // Fall back to audio recording if speech recognition is not available
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          // Add a "processing" message
          const processingMessage: Message = {
            content: "Processing your voice message...",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, processingMessage]);
          
          try {
            // Convert audio chunks to blob and then to base64
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            // In a real app, you would send this to a speech-to-text service
            // For demo, we'll send the audio to the webhook
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              
              // Since we don't have a real transcription service here,
              // we'll just use a placeholder message
              const transcription = "Voice message received (speech-to-text not available in this browser)";
              
              // Remove the processing message
              setMessages(prev => prev.filter(msg => msg !== processingMessage));
              
              // Add the transcribed message as a user message
              const userMessage: Message = {
                content: transcription,
                isUser: true,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, userMessage]);
              
              // Send to n8n webhook
              try {
                await fetch(n8nWebhookURL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    message: transcription,
                    audioData: base64Audio,
                    type: 'audio',
                    timestamp: new Date().toISOString()
                  }),
                });
                
                // Add a response from the bot
                setTimeout(() => {
                  const botMessage: Message = {
                    content: "I've received your voice message and I'm processing it.",
                    isUser: false,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, botMessage]);
                }, 500);
              } catch (error) {
                console.error('Error sending audio:', error);
                const errorMessage: Message = {
                  content: "Sorry, there was an error processing your voice message.",
                  isUser: false,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, errorMessage]);
              }
            };
          } catch (error) {
            console.error('Error processing audio:', error);
            
            // Remove the processing message
            setMessages(prev => prev.filter(msg => msg !== processingMessage));
            
            const errorMessage: Message = {
              content: "Sorry, there was an error processing your voice message.",
              isUser: false,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
          }
          
          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
      } catch (microError) {
        console.error('Error accessing microphone:', microError);
        
        const errorMessage: Message = {
          content: "Sorry, I couldn't access your microphone. Please check your browser permissions.",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const stopRecording = () => {
    if (speechRecognitionRef.current && isTranscribing) {
      speechRecognitionRef.current.stop();
      setIsTranscribing(false);
      // The onend handler will take care of sending the message
    } else if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen && isMinimized) {
    return (
      <div className="chat-widget-bubble" onClick={toggleWidget}>
        <MessageSquare className="chat-widget-bubble-icon" />
      </div>
    );
  }

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : 'closing'}`}>
      <div className="chat-widget-header">
        <div className="chat-widget-title">Google</div>
        <div className="chat-widget-controls">
          <User className="chat-widget-control-icon" />
          <RefreshCw className="chat-widget-control-icon" />
          <X className="chat-widget-control-icon" onClick={handleClose} />
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="chat-widget-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`chat-widget-message ${message.isUser ? 'user' : 'bot'}`}
              >
                {!message.isUser && (
                  <div className="chat-widget-bot-header">
                    <div className="chat-widget-bot-avatar">
                      <User size={18} />
                    </div>
                    <div className="chat-widget-bot-name">{botName}</div>
                  </div>
                )}
                <div className="chat-widget-message-content">{message.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-widget-input">
            <div className="chat-widget-input-container">
              {isRecording ? (
                <button 
                  className="chat-widget-mic-button recording" 
                  onClick={stopRecording}
                  aria-label="Stop recording"
                >
                  <MicOff size={18} />
                </button>
              ) : (
                <button 
                  className="chat-widget-mic-button"
                  onClick={startRecording}
                  aria-label="Start recording"
                >
                  <Mic size={18} />
                </button>
              )}
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRecording}
              />
              <button 
                className="chat-widget-send-button"
                onClick={handleSendClick}
                disabled={!inputText.trim() || isRecording}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
          <div className="chat-widget-footer">
            Add AI chat to your site
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;

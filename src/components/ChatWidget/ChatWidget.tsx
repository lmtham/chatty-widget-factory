
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, X, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
          content: "Hello! How can I help you today?",
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
        // Convert audio chunks to blob and then to base64
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Add a "processing" message
        const processingMessage: Message = {
          content: "Processing your voice message...",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, processingMessage]);
        
        try {
          // For this demo, we'll just convert to base64 and log it
          // In a real app, you would send this to your speech-to-text service
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            
            // In a real implementation, you would:
            // 1. Send the audio to a speech-to-text service
            // 2. Get the transcription
            // 3. Send the transcription to n8n
            
            // For demo purposes, we'll just send a placeholder message
            const transcription = "This is where your voice transcription would appear";
            
            // Remove the processing message
            setMessages(prev => prev.filter(msg => msg !== processingMessage));
            
            // Send the transcribed message
            await sendMessage(transcription);
            
            // Send the audio data to n8n webhook
            await fetch(n8nWebhookURL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                audioData: base64Audio,
                type: 'audio',
                timestamp: new Date().toISOString()
              }),
            });
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
    } catch (error) {
      console.error('Error accessing microphone:', error);
      
      const errorMessage: Message = {
        content: "Sorry, I couldn't access your microphone. Please check your browser permissions.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
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
        <div className="chat-widget-title">Chat Support</div>
        <div className="chat-widget-controls">
          {isMinimized ? (
            <ChevronUp className="chat-widget-control-icon" onClick={toggleWidget} />
          ) : (
            <ChevronDown className="chat-widget-control-icon" onClick={toggleWidget} />
          )}
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
                <div className="chat-widget-message-content">{message.content}</div>
                <div className="chat-widget-message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chat-widget-input">
            <input
              type="text"
              placeholder="Type your message here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRecording}
            />
            <div className="chat-widget-actions">
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
        </>
      )}
    </div>
  );
};

export default ChatWidget;


import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import './ChatWidget.css';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';

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
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [sessionId] = useState(() => crypto.randomUUID()); // Generate a random session ID once
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const botName = "Taylor";

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

  const { isRecording, isTranscribing, startRecording, stopRecording } = useSpeechRecognition({
    onTranscription: (text) => {
      setInputText(text);
    },
    onFinalTranscript: (text) => {
      sendMessage(text);
    }
  });

  const toggleWidget = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (isRecording) {
      stopRecording();
    }
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
    setWaitingForResponse(true);

    try {
      // Add a typing indicator
      const typingMessage: Message = {
        content: "...",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, typingMessage]);

      // Send to n8n webhook with the additional requested information
      const response = await fetch(n8nWebhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: sessionId,
          chatInput: content,
          message: content,
          type: 'text',
          timestamp: new Date().toISOString()
        }),
      });

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg !== typingMessage));

      if (response.ok) {
        try {
          // Try to parse the response as JSON
          const responseData = await response.json();
          
          // Add the bot response from n8n
          const botMessage: Message = {
            content: responseData.message || responseData.response || "I've received your message.",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
        } catch (jsonError) {
          // If the response is not JSON, use the text
          const responseText = await response.text();
          
          const botMessage: Message = {
            content: responseText || "Thank you for your message. I'm processing your request.",
            isUser: false,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        // Handle error response
        console.error('Error response from webhook:', response.status);
        
        const errorMessage: Message = {
          content: "Sorry, there was an error processing your message.",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        content: "Sorry, there was an error sending your message.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setWaitingForResponse(false);
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

  if (!isOpen && isMinimized) {
    return (
      <div className="chat-widget-bubble" onClick={toggleWidget}>
        <MessageSquare className="chat-widget-bubble-icon" />
      </div>
    );
  }

  return (
    <div className={`chat-widget-container ${isOpen ? 'open' : 'closing'}`}>
      <ChatHeader handleClose={handleClose} />
      
      {!isMinimized && (
        <>
          <MessageList messages={messages} botName={botName} />
          
          <ChatInput 
            inputText={inputText}
            setInputText={setInputText}
            isRecording={isRecording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            sendMessage={handleSendClick}
            handleKeyDown={handleKeyDown}
            disabled={waitingForResponse}
          />
          
          <div className="chat-widget-footer">
            Add AI chat to your site
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;

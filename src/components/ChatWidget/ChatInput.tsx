
import React from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  sendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  isRecording,
  startRecording,
  stopRecording,
  sendMessage,
  handleKeyDown
}) => {
  return (
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
          onClick={sendMessage}
          disabled={!inputText.trim() || isRecording}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

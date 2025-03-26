
import React from 'react';
import { X, RefreshCw, User } from 'lucide-react';

interface ChatHeaderProps {
  handleClose: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ handleClose }) => {
  return (
    <div className="chat-widget-header">
      <div className="chat-widget-title">Chat Widget</div>
      <div className="chat-widget-controls">
        <User className="chat-widget-control-icon" />
        <RefreshCw className="chat-widget-control-icon" />
        <X className="chat-widget-control-icon" onClick={handleClose} />
      </div>
    </div>
  );
};

export default ChatHeader;

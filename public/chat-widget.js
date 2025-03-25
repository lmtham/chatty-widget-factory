
(function() {
  // Configuration
  let n8nWebhookURL = 'YOUR_N8N_WEBHOOK_URL';
  let widgetInitialized = false;
  
  // Styles
  const styles = `
  /* Chat Widget Container */
  .chat-widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 320px;
    max-width: 90vw;
    height: 450px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    background-color: white;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    z-index: 9999;
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }

  /* Chat Widget Animation */
  .chat-widget-container.open {
    opacity: 1;
    transform: translateY(0);
  }

  .chat-widget-container.closing {
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
  }

  /* Chat Widget Bubble */
  .chat-widget-bubble {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background-color: #4caf50;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    transition: all 0.2s ease;
    z-index: 9999;
  }

  .chat-widget-bubble:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
  }

  .chat-widget-bubble-icon {
    color: white;
    width: 28px;
    height: 28px;
  }

  /* Chat Widget Header */
  .chat-widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background-color: #4caf50;
    color: white;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }

  .chat-widget-title {
    font-weight: 600;
    font-size: 18px;
  }

  .chat-widget-controls {
    display: flex;
    align-items: center;
  }

  .chat-widget-control-icon {
    width: 18px;
    height: 18px;
    margin-left: 12px;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }

  .chat-widget-control-icon:hover {
    opacity: 1;
  }

  /* Chat Widget Messages */
  .chat-widget-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: white;
  }

  .chat-widget-message {
    max-width: 85%;
    padding: 14px 16px;
    border-radius: 16px;
    position: relative;
    word-wrap: break-word;
    line-height: 1.4;
  }

  .chat-widget-message.user {
    align-self: flex-end;
    background-color: #f0f0f0;
    color: #333;
    border-bottom-right-radius: 4px;
  }

  .chat-widget-message.bot {
    align-self: flex-start;
    background-color: #f9f9f9;
    color: #333;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
  }

  .chat-widget-bot-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  .chat-widget-bot-avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background-color: #4caf50;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
  }

  .chat-widget-bot-name {
    font-weight: 600;
    color: #333;
  }

  .chat-widget-message-content {
    font-size: 14px;
  }

  .chat-widget-message-time {
    font-size: 10px;
    opacity: 0.6;
    margin-top: 4px;
    text-align: right;
  }

  /* Chat Widget Input Area */
  .chat-widget-input {
    padding: 12px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    background-color: white;
    position: relative;
  }

  .chat-widget-input-container {
    flex: 1;
    position: relative;
    border-radius: 24px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    padding: 4px 8px;
  }

  .chat-widget-input input {
    flex: 1;
    border: none;
    outline: none;
    padding: 10px;
    background-color: transparent;
    font-size: 14px;
  }

  .chat-widget-actions {
    display: flex;
    align-items: center;
  }

  .chat-widget-send-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background-color: #f5f5f5;
    color: #ababab;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chat-widget-send-button:hover {
    background-color: #e0e0e0;
  }

  .chat-widget-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-widget-mic-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background-color: transparent;
    color: #ababab;
    cursor: pointer;
    margin-right: 4px;
    transition: all 0.2s ease;
  }

  .chat-widget-mic-button:hover {
    background-color: #f0f0f0;
  }

  .chat-widget-mic-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chat-widget-mic-button.recording {
    background-color: rgba(255, 59, 48, 0.1);
    color: #ff3b30;
    animation: pulse 1.5s infinite;
  }

  .chat-widget-footer {
    padding: 10px 16px;
    text-align: center;
    color: #ababab;
    font-size: 12px;
    background-color: white;
    border-top: 1px solid #f0f0f0;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(255, 59, 48, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 59, 48, 0);
    }
  }
  `;

  // SVG Icons
  const icons = {
    messageSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    mic: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
    micOff: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    refreshCw: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
  };

  // Create DOM elements
  function createChatWidgetDOM() {
    if (widgetInitialized) return;
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // Create chat bubble
    const bubble = document.createElement('div');
    bubble.className = 'chat-widget-bubble';
    bubble.innerHTML = icons.messageSquare;
    bubble.setAttribute('aria-label', 'Open chat');
    document.body.appendChild(bubble);
    
    // Create widget container (hidden initially)
    const container = document.createElement('div');
    container.className = 'chat-widget-container';
    container.style.display = 'none';
    document.body.appendChild(container);
    
    let isOpen = false;
    let isMinimized = true;
    const messages = [];
    let mediaRecorder = null;
    let audioChunks = [];
    let isRecording = false;
    const botName = "Taylor";
    
    // Add the initial message from the bot
    messages.push({
      content: "Welcome 👋! How can I help you today?",
      isUser: false,
      timestamp: new Date()
    });
    
    // Toggle widget when bubble is clicked
    bubble.addEventListener('click', () => {
      isMinimized = !isMinimized;
      
      if (isMinimized) {
        closeWidget();
      } else {
        openWidget();
      }
    });
    
    function openWidget() {
      isOpen = true;
      container.style.display = 'flex';
      bubble.style.display = 'none';
      
      // Small delay to trigger the animation
      setTimeout(() => {
        container.classList.add('open');
        renderWidget();
      }, 10);
    }
    
    function closeWidget() {
      isOpen = false;
      container.classList.remove('open');
      container.classList.add('closing');
      
      setTimeout(() => {
        container.style.display = 'none';
        container.classList.remove('closing');
        bubble.style.display = 'flex';
      }, 300);
    }
    
    function renderWidget() {
      container.innerHTML = `
        <div class="chat-widget-header">
          <div class="chat-widget-title">Google</div>
          <div class="chat-widget-controls">
            <div class="chat-widget-control-icon">${icons.user}</div>
            <div class="chat-widget-control-icon">${icons.refreshCw}</div>
            <div class="chat-widget-control-icon">${icons.x}</div>
          </div>
        </div>
        
        ${!isMinimized ? `
          <div class="chat-widget-messages">
            ${messages.map(message => `
              <div class="chat-widget-message ${message.isUser ? 'user' : 'bot'}">
                ${!message.isUser ? `
                  <div class="chat-widget-bot-header">
                    <div class="chat-widget-bot-avatar">
                      ${icons.user}
                    </div>
                    <div class="chat-widget-bot-name">${botName}</div>
                  </div>
                ` : ''}
                <div class="chat-widget-message-content">${message.content}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="chat-widget-input">
            <div class="chat-widget-input-container">
              <button 
                class="chat-widget-mic-button ${isRecording ? 'recording' : ''}" 
                aria-label="${isRecording ? 'Stop recording' : 'Start recording'}"
              >
                ${isRecording ? icons.micOff : icons.mic}
              </button>
              <input 
                type="text" 
                placeholder="Type your message..." 
                ${isRecording ? 'disabled' : ''}
              />
              <button 
                class="chat-widget-send-button" 
                aria-label="Send message"
                ${!document.querySelector('.chat-widget-input input')?.value?.trim() || isRecording ? 'disabled' : ''}
              >
                ${icons.send}
              </button>
            </div>
          </div>
          
          <div class="chat-widget-footer">
            Add AI chat to your site
          </div>
        ` : ''}
      `;
      
      // Add event listeners after rendering
      if (!isMinimized) {
        // Close button
        container.querySelector('.chat-widget-control-icon:last-child').addEventListener('click', closeWidget);
        
        // Input field
        const input = container.querySelector('.chat-widget-input input');
        if (input) {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const text = input.value.trim();
              if (text && !isRecording) {
                sendMessage(text);
                input.value = '';
              }
            }
          });
          
          // Update send button state on input change
          input.addEventListener('input', () => {
            const sendButton = container.querySelector('.chat-widget-send-button');
            if (sendButton) {
              sendButton.disabled = !input.value.trim() || isRecording;
              sendButton.style.color = input.value.trim() && !isRecording ? '#4caf50' : '#ababab';
            }
          });
        }
        
        // Send button
        const sendButton = container.querySelector('.chat-widget-send-button');
        if (sendButton) {
          sendButton.addEventListener('click', () => {
            const text = input.value.trim();
            if (text && !isRecording) {
              sendMessage(text);
              input.value = '';
              sendButton.disabled = true;
              sendButton.style.color = '#ababab';
            }
          });
        }
        
        // Mic button
        const micButton = container.querySelector('.chat-widget-mic-button');
        if (micButton) {
          micButton.addEventListener('click', () => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          });
        }
        
        // Scroll to bottom of messages
        const messagesContainer = container.querySelector('.chat-widget-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }
    
    function sendMessage(content) {
      // Add user message
      messages.push({
        content: content,
        isUser: true,
        timestamp: new Date()
      });
      
      renderWidget();
      
      // Send to n8n webhook
      fetch(n8nWebhookURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          type: 'text',
          timestamp: new Date().toISOString()
        }),
      })
      .then(response => {
        if (response.ok) {
          // In a real app, you would get a response from your n8n workflow
          // For now, we'll just add a placeholder response
          setTimeout(() => {
            messages.push({
              content: "Thank you for your message. I'm processing your request.",
              isUser: false,
              timestamp: new Date()
            });
            renderWidget();
          }, 500);
        }
      })
      .catch(error => {
        console.error('Error sending message:', error);
        
        messages.push({
          content: "Sorry, there was an error sending your message.",
          isUser: false,
          timestamp: new Date()
        });
        renderWidget();
      });
    }
    
    async function startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          // Convert audio chunks to blob
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          // Add a "processing" message
          const processingMessageIndex = messages.length;
          messages.push({
            content: "Processing your voice message...",
            isUser: false,
            timestamp: new Date()
          });
          renderWidget();
          
          try {
            // For this demo, we'll just convert to base64 and log it
            // In a real app, you would send this to your speech-to-text service
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result;
              
              // For demo purposes, we'll just send a placeholder message
              const transcription = "This is where your voice transcription would appear";
              
              // Remove the processing message
              messages.splice(processingMessageIndex, 1);
              
              // Add the transcribed message as a user message
              messages.push({
                content: transcription,
                isUser: true,
                timestamp: new Date()
              });
              renderWidget();
              
              // Send the transcribed message to n8n webhook
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
              })
              .then(() => {
                // Add a response from the bot
                setTimeout(() => {
                  messages.push({
                    content: "I've received your voice message and I'm processing it.",
                    isUser: false,
                    timestamp: new Date()
                  });
                  renderWidget();
                }, 500);
              })
              .catch(error => {
                console.error('Error sending audio:', error);
                messages.push({
                  content: "Sorry, there was an error processing your voice message.",
                  isUser: false,
                  timestamp: new Date()
                });
                renderWidget();
              });
            };
          } catch (error) {
            console.error('Error processing audio:', error);
            
            // Remove the processing message
            messages.splice(processingMessageIndex, 1);
            
            messages.push({
              content: "Sorry, there was an error processing your voice message.",
              isUser: false,
              timestamp: new Date()
            });
            renderWidget();
          }
          
          // Stop all audio tracks
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        isRecording = true;
        renderWidget();
      } catch (error) {
        console.error('Error accessing microphone:', error);
        
        messages.push({
          content: "Sorry, I couldn't access your microphone. Please check your browser permissions.",
          isUser: false,
          timestamp: new Date()
        });
        renderWidget();
      }
    }
    
    function stopRecording() {
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        renderWidget();
      }
    }
    
    widgetInitialized = true;
  }
  
  // Initialize widget with webhook URL
  window.initChatWidget = function(webhook) {
    if (webhook) {
      n8nWebhookURL = webhook;
    }
    createChatWidgetDOM();
  };
  
  // Auto initialize if the script is loaded directly
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(createChatWidgetDOM, 1);
  } else {
    document.addEventListener('DOMContentLoaded', createChatWidgetDOM);
  }
})();

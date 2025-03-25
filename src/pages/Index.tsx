
import React from 'react';
import ChatWidget from '@/components/ChatWidget';

const Index = () => {
  // This is a placeholder for the n8n webhook URL that you'll replace later
  const n8nWebhookURL = 'YOUR_N8N_WEBHOOK_URL';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Embeddable Chat Widget</h1>
      <p className="text-lg text-center max-w-2xl mb-8 text-gray-600">
        This is a demonstration of the chat widget embedded in a page. 
        The widget appears in the bottom-right corner.
      </p>
      
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">How to Embed This Widget</h2>
        <p className="text-gray-700 mb-4">
          To add this chat widget to your website, copy the following code snippet and paste it before the closing &lt;/body&gt; tag:
        </p>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm mb-4">
          {`<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  window.addEventListener('DOMContentLoaded', function() {
    initChatWidget('YOUR_N8N_WEBHOOK_URL');
  });
</script>`}
        </pre>
        <p className="text-gray-700">
          Replace <code className="bg-gray-100 px-2 py-1 rounded">YOUR_N8N_WEBHOOK_URL</code> with your actual n8n webhook URL.
        </p>
      </div>
      
      {/* Include the chat widget */}
      <ChatWidget n8nWebhookURL={n8nWebhookURL} />
    </div>
  );
};

export default Index;

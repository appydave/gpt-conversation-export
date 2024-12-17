document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const status = document.getElementById('status');

  extractBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      
      if (!tab.url.includes('chat.openai.com') && !tab.url.includes('chatgpt.com')) {
        throw new Error('Please open ChatGPT to extract conversations');
      }

      status.textContent = 'Extracting conversation...';
      status.className = 'status';

      const response = await chrome.tabs.sendMessage(tab.id, {action: 'extractConversation'});
      
      if (response.success) {
        status.textContent = 'Conversation copied to clipboard!';
        status.className = 'status success';
      } else {
        throw new Error(response.error || 'Failed to extract conversation');
      }
    } catch (error) {
      status.textContent = error.message;
      status.className = 'status error';
    }
  });
});

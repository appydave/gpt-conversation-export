chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractConversation') {
    try {
      const conversation = extractConversation();
      navigator.clipboard.writeText(conversation)
        .then(() => sendResponse({success: true}))
        .catch(error => sendResponse({success: false, error: 'Failed to copy to clipboard'}));
      return true; // Keep the message channel open for async response
    } catch (error) {
      sendResponse({success: false, error: error.message});
    }
  }
});

function extractConversation() {
  // Try chat.openai.com structure first
  let threadContainer = document.querySelector('main div.flex.flex-col.items-center');
  let messages = threadContainer ? Array.from(threadContainer.querySelectorAll('div.group.w-full')) : [];
  
  // If not found, try chatgpt.com structure
  if (!messages.length) {
    threadContainer = document.querySelector('.conversation-thread, .chat-message-list');
    messages = threadContainer ? Array.from(threadContainer.querySelectorAll('.message, .chat-message')) : [];
  }

  if (!messages.length) {
    throw new Error('No messages found in the conversation');
  }

  let conversationText = '';
  messages.forEach((message) => {
    // Try different selectors for user/assistant identification
    let isUser = message.querySelector('img[alt="User"]') !== null;
    if (!isUser) {
      isUser = message.classList.contains('user-message') || 
               message.querySelector('.user-bubble') !== null ||
               message.classList.contains('chat-message-user');
    }
    const role = isUser ? 'User' : 'Assistant';
    
    // Try different content selectors
    const contentSelectors = ['.text-base', '.message-content', '.bubble-content', '.chat-message-text', 'p'];
    let content;
    for (const selector of contentSelectors) {
      content = message.querySelector(selector);
      if (content) break;
    }

    if (content) {
      const text = content.textContent.trim();
      conversationText += `${role}: ${text}\n\n`;
    }
  });

  if (!conversationText) {
    throw new Error('Failed to extract conversation text');
  }

  return conversationText.trim();
}
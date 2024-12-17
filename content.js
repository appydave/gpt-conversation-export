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
  // Check if we're on a Cloudflare verification page
  if (document.querySelector('#challenge-running')) {
    throw new Error('Please complete the Cloudflare verification first');
  }

  // Try chat.openai.com structure first
  let threadContainer = document.querySelector('main div.flex.flex-col.items-center');
  let messages = threadContainer ? Array.from(threadContainer.querySelectorAll('div.group.w-full')) : [];
  
  // Log DOM structure for debugging
  console.log('Current page DOM structure:', document.body.innerHTML);
  
  // If not found, try chatgpt.com structure
  if (!messages.length) {
    console.log('Trying chatgpt.com selectors...');
    // Try multiple possible selectors for chatgpt.com
    const possibleContainers = [
      // Primary selectors based on the screenshot
      '[class*="conversation-content"]',
      '[class*="message-list"]',
      // General chat container selectors
      '[class*="conversation-thread"]',
      '[class*="chat-message-list"]',
      '[class*="chat-container"]',
      '[class*="message-container"]',
      '[class*="chat-content"]',
      '[class*="chat-messages"]',
      // Fallback selectors
      'main div[class*="overflow"]',
      'main div[class*="chat"]',
      // Direct parent selectors
      '.overflow-y-auto',
      'main > div > div'
    ];
    
    for (const selector of possibleContainers) {
      threadContainer = document.querySelector(selector);
      if (threadContainer) {
        messages = Array.from(threadContainer.querySelectorAll('.message, .chat-message, .chat-entry'));
        if (messages.length) break;
      }
    }
  }

  if (!messages.length) {
    console.error('No messages found. DOM structure:', document.body.innerHTML);
    throw new Error('No messages found. Make sure you are on a ChatGPT conversation page and it has loaded completely. If the issue persists, please try refreshing the page.');
  }
  
  console.log(`Found ${messages.length} messages to extract`);

  let conversationText = '';
  messages.forEach((message) => {
    // Try different selectors for user/assistant identification
    let isUser = message.querySelector('img[alt*="User" i]') !== null;
    if (!isUser) {
      isUser = message.classList.toString().toLowerCase().includes('user') || 
               message.querySelector('[class*="user" i]') !== null ||
               message.getAttribute('data-author') === 'user' ||
               message.getAttribute('data-role') === 'user';
    }
    const role = isUser ? 'User' : 'Assistant';
    
    // Try different content selectors with fallbacks
    const contentSelectors = [
      // Primary selectors for chatgpt.com
      '[class*="message-content"]',
      '[class*="message-text"]',
      '[class*="message-body"]',
      // General content selectors
      '[class*="text-base"]',
      '[class*="bubble-content"]',
      '[class*="chat-message-text"]',
      '[class*="markdown-content"]',
      '[class*="content"]',
      // Data attribute selectors
      '[data-message-content]',
      '[data-content]',
      '[data-testid*="message"]',
      // Fallback element selectors
      '.text-base',
      'pre',
      'p'
    ];
    
    console.log('Trying to extract content with selectors:', contentSelectors);
    
    let text = '';
    // Try to find content using selectors
    for (const selector of contentSelectors) {
      const content = message.querySelector(selector);
      if (content) {
        text = content.textContent.trim();
        break;
      }
    }
    
    // If no content found through selectors, try getting direct text content
    if (!text) {
      text = message.textContent.trim();
    }

    // Only add non-empty messages
    if (text) {
      conversationText += `${role}: ${text}\n\n`;
    }
  });

  if (!conversationText) {
    throw new Error('Failed to extract conversation text');
  }

  return conversationText.trim();
}
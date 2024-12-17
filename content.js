chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractConversation') {
    try {
      const conversation = extractConversation();
      if (!conversation) {
        throw new Error('No conversation content found');
      }
      
      // Use execCommand as fallback for clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = conversation;
      document.body.appendChild(textArea);
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (success) {
        sendResponse({success: true});
      } else {
        // Try clipboard API if execCommand fails
        navigator.clipboard.writeText(conversation)
          .then(() => sendResponse({success: true}))
          .catch(error => {
            console.error('Clipboard error:', error);
            sendResponse({success: false, error: 'Failed to copy: ' + error.message});
          });
      }
      return true;
    } catch (error) {
      console.error('Extraction error:', error);
      sendResponse({success: false, error: error.message});
    }
  }
});

function extractConversation() {
  // Check if we're on a Cloudflare verification page
  if (document.querySelector('#challenge-running')) {
    throw new Error('Please complete the Cloudflare verification first');
  }

  // Try current domain structure first
  console.log('Detecting ChatGPT interface version...');
// Add debug information about DOM structure
const debugInfo = {
  url: window.location.href,
  hostname: window.location.hostname,
  turns: document.querySelectorAll('div[data-testid="conversation-turn"]').length,
  messages: document.querySelectorAll('div[class*="message-content-"]').length,
  markdown: document.querySelectorAll('div[class*="markdown-content-"]').length
};
console.log('ChatGPT Interface Debug Info:', debugInfo);
  const isChatGPTCom = window.location.hostname.includes('chatgpt.com');
  console.log('Is ChatGPT.com:', isChatGPTCom);
  console.log('Current URL:', window.location.href);

  // Define selectors based on the interface version
  const containerSelectors = isChatGPTCom ? [
    // ChatGPT.com specific selectors for new interface
    'div[class*="conversation-turn-"]',
    'div[data-testid="conversation-turn"]',
    'div[class*="text-message-content-"]',
    'div[class*="markdown-content-"]',
    'div[data-message-author-role]',
    'div[data-message-id]',
    'div[role="presentation"]'
  ] : [
    // chat.openai.com selectors
    'main div.flex.flex-col.items-center',
    'div.group.w-full'
  ];

  console.log('Trying selectors:', containerSelectors);
  
  // Find the conversation container
  let threadContainer = null;
  let messages = [];
    
    // Try each container selector
    for (const selector of containerSelectors) {
      console.log('Trying selector:', selector);
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements with selector:`, selector);
        threadContainer = elements[0].closest('[class*="conversation"], [class*="chat"], main');
        if (threadContainer) {
          messages = Array.from(elements);
          break;
        }
      }
    }

    if (!messages.length) {
      // Additional debug information
      console.log('DOM structure for debugging:', {
        url: window.location.href,
        bodyClasses: document.body.className,
        mainContent: document.querySelector('main')?.innerHTML
      });
      throw new Error('No messages found. Please ensure you are on a ChatGPT conversation page and the content has loaded.');
    }

    console.log(`Successfully found ${messages.length} messages to extract`);

  let conversationText = '';
  messages.forEach((message) => {
    // Enhanced role detection for both interfaces
    let isUser = false;
    if (isChatGPTCom) {
      isUser = message.getAttribute('data-message-author-role') === 'user' ||
               message.querySelector('[data-message-author-role="user"]') !== null ||
               message.querySelector('[data-testid="user-message"]') !== null;
    } else {
      isUser = message.querySelector('img[alt*="User" i]') !== null ||
               message.classList.toString().toLowerCase().includes('user') ||
               message.getAttribute('data-author') === 'user' ||
               message.getAttribute('data-role') === 'user';
    }
    const role = isUser ? 'User' : 'Assistant';

    // Updated content selectors for both interfaces
    const contentSelectors = isChatGPTCom ? [
      // ChatGPT.com specific selectors for new interface
      'div[data-message-content="true"]',
      'div[class*="text-message-content-"]',
      'div[class*="prose"]',
      'div[role="presentation"]',
      'div[class*="markdown"]',
      'div[class*="content"]',
      'pre code',
      'p'
    ] : [
      // chat.openai.com selectors
      '[class*="message-content"]',
      '[class*="text-base"]',
      '[class*="markdown"]',
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
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
  const isChatGPTCom = window.location.hostname === 'chatgpt.com';
  console.log('Is ChatGPT.com:', isChatGPTCom);
  console.log('Current URL:', window.location.href);

  // Define selectors based on the interface version
  const containerSelectors = isChatGPTCom ? [
    // ChatGPT.com specific selectors for new interface
    'div[class*="conversation-turn"]',
    'div[data-testid="conversation-turn"]',
    'div[data-message-id]',
    // Remix route based selectors
    'div[class*="message-content-"]',
    'div[class*="text-message-content-"]',
    'div[class*="markdown-content-"]'
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
      'div[data-message-author-role] div[class*="text-message-content-"]',
      'div[class*="markdown-content-"]',
      'div[class*="message-content-"]',
      'div[class*="prose"]',
      'div[role="presentation"]',
      'pre code'
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
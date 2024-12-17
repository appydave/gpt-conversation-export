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
  const threadContainer = document.querySelector('main div.flex.flex-col.items-center');
  if (!threadContainer) {
    throw new Error('Could not find conversation thread');
  }

  const messages = Array.from(threadContainer.querySelectorAll('div.group.w-full'));
  if (!messages.length) {
    throw new Error('No messages found in the conversation');
  }

  let conversationText = '';
  messages.forEach((message, index) => {
    // Determine if message is from user or assistant
    const isUser = message.querySelector('img[alt="User"]') !== null;
    const role = isUser ? 'User' : 'Assistant';
    
    // Extract message content
    const content = message.querySelector('.text-base');
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

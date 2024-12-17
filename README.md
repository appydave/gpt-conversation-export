# ChatGPT Conversation Extractor

A Chrome extension that allows you to easily extract and copy text from ChatGPT conversations.

## Features

- One-click extraction of entire ChatGPT conversations
- Automatic copying to clipboard
- Clear visual feedback
- Simple and intuitive interface

## Installation

1. Download the extension:
   - Clone this repository or download it as a ZIP file
   - If downloaded as ZIP, extract it to a folder on your computer

2. Install in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle switch in top-right corner)
   - Click "Load unpacked"
   - Select the folder containing the extension files

## Usage

1. Navigate to [chat.openai.com](https://chat.openai.com) or [chatgpt.com](https://chatgpt.com)
2. Click the extension icon (green plus sign) in your Chrome toolbar
3. Click "Extract Conversation" to copy the current chat to your clipboard
4. The extension will show a success message when the conversation is copied

## Testing the Extension

1. Installation Verification:
   - After installation, check Chrome's extension page (chrome://extensions)
   - Verify the extension appears with the green plus icon
   - Ensure "Developer mode" is enabled

2. Basic Functionality Test:
   - Open ChatGPT in a new tab
   - Have a short conversation (at least 2-3 messages)
   - Click the extension icon
   - Press "Extract Conversation"
   - Verify the success message appears
   - Paste the copied text to verify the format

3. Error Handling Test:
   - Try using the extension on a non-ChatGPT page
   - Verify you receive an appropriate error message
   - Close and reopen ChatGPT to ensure persistence

## Technical Details

- Built with Chrome Extension Manifest V3
- Uses modern JavaScript features
- Implements clipboard API for text copying
- Contains proper error handling and user feedback

## Files

- `manifest.json` - Extension configuration
- `popup.html/css/js` - Extension popup interface
- `content.js` - Content script for ChatGPT page interaction
- `background.js` - Background service worker
- `icons/` - Extension icons in various sizes

## License

MIT License

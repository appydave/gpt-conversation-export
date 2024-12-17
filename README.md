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

1. Navigate to [chat.openai.com](https://chat.openai.com)
2. Click the extension icon (green plus sign) in your Chrome toolbar
3. Click "Extract Conversation" to copy the current chat to your clipboard
4. The extension will show a success message when the conversation is copied

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

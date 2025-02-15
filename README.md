# Slack Enchanter

Slack Enchanter is a Chrome extension that enhances your Slack messaging experience by adding customizable AI-powered message generation buttons to your Slack interface. Using the GROQ API, it helps you quickly transform and improve your messages.

## Features

- 🪄 Customizable AI-powered message enhancement buttons
- 🎨 Seamless integration with Slack's interface
- 🌓 Automatic dark/light mode detection
- ⚡ Real-time message generation
- 🔐 Secure API key storage

## Installation

1. Clone this repository or download the source code
2. Add your GROQ API key to the `slackEnchanter.js` file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top right corner
5. Click "Load unpacked" and select the extension directory

## Setup

1. Get your GROQ API key from [GROQ's website](https://groq.com)
2. Click the Slack Enchanter extension icon in your Chrome toolbar
3. Enter your GROQ API key in the extension settings
4. Configure your custom message enhancement buttons

## Configuration

You can customize your enhancement buttons through the extension settings. Each button requires:
- Button Text: The label that appears on the button
- Prompt: The system message that guides the AI in generating responses

Example button configurations:
- "Make Professional" - Transforms casual messages into professional communication
- "Make Friendly" - Adds a warm and approachable tone to your messages
- "Fix Grammar" - Corrects grammar and improves sentence structure

## Usage

1. Open Slack in your Chrome browser
2. Type your message in the message input field
3. Click any of your custom enhancement buttons
4. The AI will generate an enhanced version of your message
5. Review and send the enhanced message

## Technical Details

The extension uses:
- GROQ's Mixtral-8x7b-32768 model for text generation
- Chrome's Storage API for settings management
- MutationObserver for dynamic Slack interface updates
- SVG icons for visual integration

## Privacy & Security

- Your GROQ API key is stored securely in Chrome's sync storage
- Messages are processed directly through GROQ's API
- No message data is stored or logged by the extension

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
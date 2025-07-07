# Loading the Extension in Chrome

## Quick Start

1. **Build the Extension**:
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Use the Extension**:
   - Open some documentation tabs (MDN, Chrome docs, etc.)
   - Click the extension icon in the toolbar
   - Click "Group Tabs" to organize them automatically

## Development Mode

For development with auto-rebuild:
```bash
npm run dev
```

This will watch for file changes and automatically rebuild the extension. You'll need to refresh the extension in `chrome://extensions/` after changes.

## Testing

To run the test suite:
```bash
npm test
```

## Supported Sites

The extension automatically detects and groups tabs from:
- **Google Chrome**: developer.chrome.com (Web Store & Extensions docs)
- **JavaScript**: developer.mozilla.org, w3schools.com/js

## Features

- ✨ Beautiful React-based UI
- 🎯 Automatic tab detection and grouping
- 🚀 One-click tab organization
- 📱 Modern responsive design
- 🔍 Easy tab navigation

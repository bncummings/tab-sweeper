# Tab Manager for Dev Docs

A beautiful Chrome extension built with React.js for organizing and grouping documentation tabs automatically.

## Features

- 🎨 **Beautiful Modern UI**: Built with React and modern CSS for a sleek user experience
- 🚀 **Automatic Tab Grouping**: Automatically groups tabs by documentation type (Google Chrome docs, JavaScript docs, etc.)
- 📚 **Documentation Focus**: Specifically designed for developers who work with multiple documentation sites
- 🔍 **Visual Tab Management**: See all your documentation tabs organized in a clean, easy-to-navigate interface
- ⚡ **One-Click Grouping**: Group all your tabs with a single button click
- 🎯 **Smart Tab Switching**: Click any tab to instantly switch to it

## Supported Documentation Sites

- **Google Chrome**: Chrome Web Store docs, Chrome Extensions docs
- **JavaScript**: MDN JavaScript docs, W3Schools JavaScript tutorials, MDN Learning Center

## Development

This extension is built with modern web technologies:

- **React.js**: Modern component-based UI framework
- **Webpack**: Module bundler for optimized builds
- **Babel**: JavaScript compiler for browser compatibility
- **CSS3**: Modern styling with gradients, animations, and responsive design

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Development Mode

For development with auto-rebuild:
```bash
npm run dev
```

### Testing

Run the test suite:
```bash
npm test
```

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Load the `dist` folder as an unpacked extension in Chrome

## Usage

1. Open multiple documentation tabs in Chrome
2. Click the extension icon in the toolbar
3. Review your organized tabs in the beautiful popup interface
4. Click "Group Tabs" to automatically organize them into Chrome tab groups
5. Click any tab in the popup to switch to it instantly

## Permissions

This extension requires the following permissions:
- `tabs`: To access and manage your browser tabs
- `tabGroups`: To create and manage tab groups
- `host_permissions`: To identify documentation sites

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

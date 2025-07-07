# TikTok Scraper Desktop App

A simple and beautiful desktop app built with Electron and React for TikTok scraping.

## Features

- Modern, glassmorphism UI design
- Mac-native title bar styling
- Simple TikTok URL input interface
- Ready for integration with your existing scraping logic

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the DesktopApp directory:
   ```bash
   cd DesktopApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

#### Development Mode
Run the app in development mode with hot reload:
```bash
npm run electron-dev
```

#### Production Mode
Build and run the app in production mode:
```bash
npm run electron-build
```

#### Build Distribution
Create a distributable package:
```bash
npm run dist
```

## Project Structure

```
DesktopApp/
├── src/
│   ├── electron/
│   │   └── main.js          # Electron main process
│   ├── App.js               # Main React component
│   ├── App.css              # App styles
│   ├── index.js             # React entry point
│   └── index.css            # Global styles
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Customization

- **UI**: Edit `src/App.js` and `src/App.css` to customize the interface
- **Electron settings**: Modify `src/electron/main.js` for window settings
- **Scraping logic**: Add your TikTok scraping logic to the `handleScrape` function in `App.js`

## Integration with Main Script

You can integrate this desktop app with your existing `main.py` script by:
1. Using Node.js child processes to call Python scripts
2. Creating an API endpoint in your Python script
3. Using IPC (Inter-Process Communication) to communicate between Electron and Python

## License

This project is part of the TikTok Scraper project. 
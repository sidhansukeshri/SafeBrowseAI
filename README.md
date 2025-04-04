# CyberGuard: AI-Powered Content Filtering Browser Extension

CyberGuard is an AI-powered browser extension designed to detect, flag, and rephrase harmful, offensive, or highly negative content in real-time as users browse the web. The extension aims to create a safer and more positive online experience by filtering out misinformation, offensive speech, and toxic content from platforms like Reddit, Twitter, Facebook, and news sites.

## Project Overview

CyberGuard uses a combination of content detection algorithms, sentiment analysis, and AI-based rephrasing to transform negative online content into more neutral or positive alternatives. The extension offers users granular control over filtering sensitivity and features, allowing for a customized browsing experience.

### Key Features

- **Content Detection**: Identifies potentially harmful or offensive text on webpages
- **Sentiment Analysis**: Analyzes the emotional tone of content to detect negative or harmful sentiment
- **Content Rephrasing**: Uses AI to transform negative content into more neutral or positive alternatives
- **Real-Time Scraping**: Continuously monitors page content as users browse
- **Customizable Settings**: Allows users to adjust sensitivity levels and enable/disable specific features
- **Protected Website Management**: Users can specify which websites should have content protection applied
- **Analysis Results History**: Keeps track of detected and rephrased content for user review

## Technical Architecture

The CyberGuard extension is built using a client-server architecture:

- **Frontend**: React-based user interface with Chrome extension integration
- **Backend**: Express.js server with PostgreSQL database for data persistence
- **AI Models**: BERT-based model for sentiment analysis and BART-based model for content rephrasing

## Project Structure

### Client-Side Components

#### Chrome Extension Scripts

- **`client/public/background.js`**: Background script for the Chrome extension that initializes the extension, monitors navigation, and communicates with both the content script and the server API.
- **`client/public/content.js`**: Content script that runs in the context of web pages to analyze and modify page content. It contains functions for detecting offensive content, analyzing sentiment, and rephrasing content.
- **`client/public/manifest.json`**: Chrome extension manifest file defining permissions, scripts, and metadata.

#### React Application

- **`client/src/App.tsx`**: Main React component that handles routing and global state management.
- **`client/src/main.tsx`**: Entry point for the React application.
- **`client/src/index.css`**: Global CSS styles for the application.

#### Components

- **`client/src/components/ContentAnalysisCard.tsx`**: Component to display individual content analysis results.
- **`client/src/components/ContentAnalysisResults.tsx`**: Component that displays a list of all analysis results.
- **`client/src/components/CyberGuardPopup.tsx`**: Main popup component when users click the extension icon.
- **`client/src/components/FeatureToggles.tsx`**: Component for enabling/disabling different extension features.
- **`client/src/components/Footer.tsx`**: Footer component with links and information.
- **`client/src/components/Header.tsx`**: Header component with logo and navigation.
- **`client/src/components/SettingsModal.tsx`**: Modal component for adjusting extension settings.
- **`client/src/components/StatusOverview.tsx`**: Component that shows the current status of the extension.

#### Context and Hooks

- **`client/src/context/SettingsContext.tsx`**: React context provider for managing global settings state. Defines the settings interface, default values, and functions to update settings.
- **`client/src/hooks/use-mobile.tsx`**: Custom hook to detect mobile viewport.
- **`client/src/hooks/use-toast.ts`**: Custom hook for displaying toast notifications.

#### Utility Functions

- **`client/src/lib/chromeApi.ts`**: Functions for interacting with the Chrome extension API, including communication with background and content scripts.
- **`client/src/lib/contentAnalyzer.ts`**: Functions for analyzing webpage content, detecting offensive content, and rephrasing text.
- **`client/src/lib/queryClient.ts`**: Configuration for TanStack Query client and API request utilities.
- **`client/src/lib/utils.ts`**: General utility functions used throughout the application.

### Server-Side Components

#### API and Server Setup

- **`server/index.ts`**: Main server entry point that initializes Express, sets up middleware, initializes the database, and starts the server.
- **`server/routes.ts`**: Defines API routes for the server, handling requests for settings, websites, and analysis results.
- **`server/vite.ts`**: Configuration for serving the Vite-built frontend in development and production.

#### Database Management

- **`server/db.ts`**: Database connection setup using pg and Drizzle ORM.
- **`server/storage.ts`**: Database operations implementation, providing methods for CRUD operations on settings, websites, and analysis results.
- **`server/initDb.ts`**: Database initialization script that populates default data for user settings and protected websites.

#### AI Processing

- **`server/rephraser.ts`**: Content rephrasing service that transforms negative or harmful content to be more neutral or constructive.
- **`server/sentimentAnalysis.ts`**: Sentiment analysis service that evaluates the emotional tone of text.

### Shared Components

- **`shared/schema.ts`**: Shared schema definitions using Drizzle ORM and Zod for type validation. Defines database tables, validation schemas, and TypeScript types.

### Configuration Files

- **`drizzle.config.ts`**: Configuration for Drizzle ORM and database migrations.
- **`package.json`**: Project dependencies and npm scripts.
- **`postcss.config.js`**: PostCSS configuration for styling.
- **`tailwind.config.ts`**: Tailwind CSS configuration.
- **`theme.json`**: Theme configuration for the application.
- **`tsconfig.json`**: TypeScript configuration.
- **`vite.config.ts`**: Vite build tool configuration.

## Database Structure

CyberGuard uses a PostgreSQL database with the following tables:

1. **`user_settings`**: Stores user configuration preferences
   - Content detection, sentiment analysis, and rephrasing toggles
   - Sensitivity levels for content and sentiment analysis
   - Notification and analytics preferences

2. **`protected_websites`**: Manages websites where content protection is applied
   - Domain names and specific feature settings per website

3. **`analysis_results`**: Stores the history of detected and rephrased content
   - Original and rephrased content
   - URL and domain information
   - Timestamp and type of detection

## Contributing

Contributions to CyberGuard are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Submit a pull request with a clear description of your changes

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
## Installation and Setup

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database
- Google Chrome browser

### Desktop Setup Instructions

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/cyberguard.git
   cd cyberguard
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

3. Set up PostgreSQL database:
   - Install PostgreSQL if not already installed (https://www.postgresql.org/download/)
   - Create a new database named `cyberguard`:
     ```bash
     psql -U postgres
     CREATE DATABASE cyberguard;
     \q
     ```
   - Set up environment variables by creating a `.env` file in the project root:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/cyberguard
     ```
     Replace `username` and `password` with your PostgreSQL credentials

4. Push database schema to your PostgreSQL database:
   ```bash
   npm run db:push
   ```

5. Build the project:
   ```bash
   npm run build
   ```

6. Start the server in development mode:
   ```bash
   npm run dev
   ```
   This will start both the Express backend server (which handles API requests from the extension) and the Vite development server for the frontend.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click on "Load unpacked" button
4. Navigate to the project directory and select the `client/public` folder
5. The CyberGuard extension should now appear in your extensions list
6. Pin the extension to your Chrome toolbar by clicking the extensions menu (puzzle piece icon) and clicking the pin icon next to CyberGuard
   ```bash
   npm run build
   ```

6. Start the server in development mode:
   ```bash
   npm run dev
   ```
   This will start both the Express backend server (which handles API requests from the extension) and the Vite development server for the frontend.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top-right corner
3. Click on "Load unpacked" button
4. Navigate to the project directory and select the `client/public` folder
5. The CyberGuard extension should now appear in your extensions list
6. Pin the extension to your Chrome toolbar by clicking the extensions menu (puzzle piece icon) and clicking the pin icon next to CyberGuard

## Testing with Real Websites

### Enabling the Extension

1. Click on the CyberGuard icon in your browser toolbar to open the extension popup
2. Ensure that the following settings are enabled:
   - Content Detection
   - Sentiment Analysis
   - Content Rephrasing
   - Real-Time Scraping
3. Adjust sensitivity settings based on your preferences

### Testing Process

1. **Visit News Sites or Social Media**: Navigate to news websites or social media platforms that might contain negative content
   - Examples: Reddit, Twitter, news comment sections, forum discussions
   - Recommended test sites: news.ycombinator.com, reddit.com/r/politics, etc.

2. **Check Extension Badge**: The extension icon might change or display a badge with the number of detected content items

3. **View Analysis Results**: Click on the extension icon to see the list of detected content and how it was rephrased

4. **Testing Protected Websites**: You can add specific websites to your protected list to customize detection for those domains

5. **Testing with Different Sensitivity Levels**: 
   - Try adjusting the Content Sensitivity and Sentiment Sensitivity sliders in the Settings
   - Lower values will only catch very offensive content, while higher values will detect more subtle negative content

### Troubleshooting

If the extension isn't working as expected:

1. **Check Server Connection**:
   - Ensure the backend server is running
   - Check browser console for network errors (press F12, then go to Network tab)

2. **Extension Permissions**:
   - Make sure the extension has permissions to access website content
   - Click on "Details" for the CyberGuard extension in chrome://extensions/ and verify that "Site access" is set to "On all sites"

3. **Refresh Extension**:
   - If changes were made to the extension, click the refresh icon on the extension card in chrome://extensions/
   - You may need to reload web pages that were already open

4. **Reload Extension**:
   - In some cases, you might need to remove the extension and load it again:
     - Click "Remove" on the CyberGuard extension card
     - Click "Load unpacked" and select the client/public folder again
## Communication Between Extension and Backend

The CyberGuard extension communicates with the backend server in the following ways:

1. **Content Analysis**: When the extension detects potentially harmful content, it sends the text to the server for advanced sentiment analysis and rephrasing.

2. **Settings Synchronization**: User settings are stored in both the Chrome storage API and the PostgreSQL database for persistence across different devices.

3. **Protected Websites**: The list of protected websites and their specific protection settings are synchronized between the client and server.

4. **Analysis Results**: Results of content analysis are stored in the database and can be retrieved by the extension for display in the UI.

### API Endpoints

The server exposes the following main API endpoints:

- `POST /api/analyze/sentiment`: Analyzes the sentiment of provided text
- `POST /api/rephrase`: Rephrases negative content to be more positive or neutral
- Various endpoints for managing user settings, protected websites, and analysis results

### Testing the API

You can test the API endpoints using curl commands, for example:

```bash
# Test sentiment analysis
curl -X POST http://localhost:3000/api/analyze/sentiment \
  -H "Content-Type: application/json" \
  -d '{"text": "I hate this website, it's terrible and useless", "threshold": 0.5}'

# Test content rephrasing
curl -X POST http://localhost:3000/api/rephrase \
  -H "Content-Type: application/json" \
  -d '{"text": "This article is garbage and completely wrong", "type": "negative"}'
```

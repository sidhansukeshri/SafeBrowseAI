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

## Installation and Setup

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database

### Development Setup

1. Clone the repository
2. Install dependencies
3. Set up environment variables with PostgreSQL database connection
4. Push database schema
5. Start the development server
6. Load the extension in Chrome by enabling Developer mode and loading the unpacked extension

## Usage

1. Click on the CyberGuard icon in your browser toolbar to access the extension popup
2. Use the Settings panel to adjust sensitivity levels and enable/disable features
3. Browse websites with protection enabled - harmful content will be detected and rephrased automatically
4. View your analysis history to review previously detected content

## Technical Implementation Details

### Content Detection Flow

1. The content script analyzes text nodes on the page
2. Text is evaluated against offensive content patterns and sentiment analysis models
3. Detected harmful content is sent to the server for rephrasing
4. Rephrased content is displayed to the user and stored in the database
5. The user can view analysis history and adjust settings as needed

### Chrome API Integration

The extension uses multiple Chrome APIs:
- `chrome.storage` for saving user settings
- `chrome.tabs` for accessing the current tab information
- `chrome.runtime` for communication between scripts
- `chrome.notifications` for alerting users about detected content

### Error Handling

The application includes comprehensive error handling throughout:
- Graceful fallbacks when Chrome APIs are not available (in development mode)
- Database transaction error handling with rollbacks
- Frontend error boundaries to prevent UI crashes
- API request error handling with appropriate user feedback

## Future Enhancements

- Integration with more advanced AI models for improved content detection
- Support for additional languages beyond English
- Image recognition for detecting inappropriate visual content
- Browser support for Firefox and Safari
- Enhanced analytics dashboard for insights into filtered content

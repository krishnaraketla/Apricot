# Walnut - Study Assistant

Walnut is an AI-powered desktop application for efficient note-taking, flashcard creation, and quiz generation. Built with Electron, React, and TypeScript, it provides a seamless experience for students and learners.

## Features

- **Smart Note-Taking**: Create, edit, and organize your study notes in a clean interface
- **AI-Generated Flashcards**: Automatically generate flashcards from your notes using the Perplexity API
- **Interactive Quizzes**: Test your knowledge with AI-generated quizzes based on your notes
- **Content Organization**: Structure your notes with AI assistance for improved readability

## Demo

![Demo GIF](assets/walnut.gif)

## Development Setup

### Prerequisites
- Node.js 14+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/walnut.git
cd walnut
```

2. Run the setup script:
```bash
./setup.sh
```
This will install dependencies and create a template `.env` file.

3. Edit the `.env` file to add your Perplexity API key:
```
PERPLEXITY_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
./dev.sh
```
Or use npm directly:
```bash
npm run electron:dev
```

### Building the Application

To build the application for your platform, run:

```bash
./build.sh
```
Or use npm directly:
```bash
npm run electron:build
```

This will create distributable packages in the `release` directory.

## Folder Structure

```
walnut/
├── src/                   # Application source code
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Application pages
│   ├── services/          # API services
│   ├── styles/            # CSS styles
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main App component
│   └── index.tsx          # App entry point
├── main.js                # Electron main process
├── preload.js             # Electron preload script
├── setup.sh               # Setup script
├── dev.sh                 # Development script
├── build.sh               # Build script
└── package.json           # Project dependencies and scripts
```

## Technologies Used

- Electron
- React
- TypeScript
- Vite
- Perplexity API

## License

ISC 

# Apricot to Walnut Migration Tool

This is a simple tool to migrate your saved notes and other data from the Apricot app to the Walnut app.

## What Happened

When you renamed your app from "Apricot" to "Walnut", the localStorage keys used to store your data changed (e.g., from `apricot-notes` to `walnut-notes`). Your data is still in localStorage but under the old app name, which is why your notes appear to have disappeared.

## Migration Options

This project includes several tools to help you recover your data:

### Option 1: Browser Migration with the HTML UI

If you used the app in a web browser:

1. Open the `migrate.html` file in your web browser (run `open migrate.html` in the terminal)
2. Click the "Migrate Data" button
3. Check the logs to confirm the migration was successful
4. Reload your Walnut app to see your migrated notes

### Option 2: Data Inspector (Recommended for Troubleshooting)

If the standard migration doesn't work:

1. Open the `check-storage.html` file in your web browser (run `open check-storage.html` in the terminal)
2. Click the "Inspect LocalStorage" button
3. The tool will scan for any potential note data in your browser's localStorage
4. If it finds anything, it will provide instructions on how to migrate it

### Option 3: Electron App Migration

If you used the desktop Electron app:

1. From the terminal, run:
```bash
node electron-migrate.js
```
2. This script will look for data in the Electron app's storage and migrate it
3. It will display a summary of what it found and migrated

## What These Tools Migrate

The migration tools look for:
- Notes (`apricot-notes` → `walnut-notes`)
- Flashcards (`apricot-flashcards` → `walnut-flashcards`)
- Quiz questions (`apricot-quiz-questions` → `walnut-quiz-questions`)

They also attempt to find data stored with variant key names.

## Troubleshooting

If you encounter any issues:

1. **Make sure you're running the migration in the same browser** where you used the Apricot app
2. Use the `check-storage.html` tool to inspect all localStorage data
3. For the Electron app, check if data is stored in a custom location:
   ```bash
   node check-electron-store.js
   ```
4. The browser app uses localStorage as backup, so make sure to check both storage mechanisms

## Advanced: Custom Migration

If the tools found your data but with an unexpected key name:

1. Use the "Advanced Options" section in check-storage.html
2. Input the source key (where your data was found)
3. Input the destination key (should be `walnut-notes`)
4. Click "Copy Data" to migrate it

## Important Notes

- These migration tools do not delete any data. Your original Apricot data remains untouched.
- If you've already created new notes in Walnut, running the migration will overwrite them with your Apricot notes.
- localStorage is specific to each browser, so if you used Apricot in multiple browsers, you'll need to run the migration in each one. 
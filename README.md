# Apricot - Study Assistant

Apricot is an AI-powered desktop application for efficient note-taking, flashcard creation, and quiz generation. Built with Electron, React, and TypeScript, it provides a seamless experience for students and learners.

## Features

- **Smart Note-Taking**: Create, edit, and organize your study notes in a clean interface
- **AI-Generated Flashcards**: Automatically generate flashcards from your notes using the Perplexity API
- **Interactive Quizzes**: Test your knowledge with AI-generated quizzes based on your notes
- **Content Organization**: Structure your notes with AI assistance for improved readability

## Development Setup

### Prerequisites
- Node.js 14+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/apricot.git
cd apricot
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
apricot/
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
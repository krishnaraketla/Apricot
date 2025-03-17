#!/bin/bash

# Walnut development script
echo "Starting Walnut in development mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is required but not installed. Please install npm and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating a template .env file..."
    echo "PERPLEXITY_API_KEY=your_api_key_here" > .env
    echo "Please edit the .env file to add your Perplexity API key before running the app."
    echo "Press Ctrl+C to exit and edit the .env file, or press Enter to continue anyway."
    read -r
fi

# Start the development server
echo "Starting the development server..."
npm run electron:dev 
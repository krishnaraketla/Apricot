#!/bin/bash

# Apricot build script
echo "Building Apricot for distribution..."

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
    echo "Please edit the .env file to add your Perplexity API key before building."
    exit 1
fi

# Build the application
echo "Building the application..."
npm run electron:build

echo "Build complete! You can find the distributable packages in the 'release' directory." 
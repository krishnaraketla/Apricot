#!/bin/bash

# Apricot setup script
echo "Setting up Apricot development environment..."

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

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file template if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file template..."
    echo "PERPLEXITY_API_KEY=your_api_key_here" > .env
    echo ".env file created. Please edit it to add your Perplexity API key."
else
    echo ".env file already exists. Make sure it contains your Perplexity API key."
fi

echo "Setup complete! You can now run the app with 'npm run electron:dev'" 
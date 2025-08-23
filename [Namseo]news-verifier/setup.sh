#!/bin/bash
echo "🚀 Setting up News Verifier project..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Setup complete! Run 'npm run dev' to start development server"

#!/bin/bash

echo "🚀 Setting up Task Manager Service..."
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd front && npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Run both backend and frontend in development mode"
echo "  npm run dev:backend  - Run only backend"
echo "  npm run dev:front    - Run only frontend"
echo "  npm run build        - Build both projects"
echo "  npm run lint         - Lint both projects"
echo ""

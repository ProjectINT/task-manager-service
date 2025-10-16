# Task Manager Service

Simple task manager with NestJS backend and Nuxt.js frontend.

## 📁 Project Structure

This is a monorepo containing:
- **backend/** - NestJS REST API
- **front/** - Nuxt.js frontend application

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

Install all dependencies for both projects:
```bash
npm run install:all
```

### Development

Run both backend and frontend in development mode:
```bash
npm run dev
```

Or run them separately:
```bash
npm run dev:backend  # Backend only (NestJS on port 3001)
npm run dev:front    # Frontend only (Nuxt on port 3000)
```

### Build

Build both projects:
```bash
npm run build
```

Or build them separately:
```bash
npm run build:backend
npm run build:front
```

### Testing

Run backend tests:
```bash
npm run test:backend
npm run test:e2e:backend
```

### Linting

Run linters for both projects:
```bash
npm run lint
```

## 📚 Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./front/README.md)

## 🛠 Tech Stack

### Backend
- NestJS
- TypeScript
- Jest

### Frontend
- Nuxt 3
- Vue 3
- TypeScript
- Pinia (state management)

## 📝 License

MIT

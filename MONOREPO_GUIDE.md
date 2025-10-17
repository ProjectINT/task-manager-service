# Monorepo Setup - Quick Start

## ✅ What Has Been Done

1. **Monorepo Structure**
   - Created root `package.json` with workspace configuration
   - Moved Git files to the top level
   - Removed nested Git repositories from `backend/` and `front/`

2. **Common Configuration Files**
   - `.gitignore` - ignore rules for the entire monorepo
   - `.prettierrc` - common code formatting style
   - `.editorconfig` - editor settings
   - `.gitattributes` - Git file handling rules

3. **Npm scripts for project management**
   ```json
   "dev": "concurrently \"npm run dev:backend\" \"npm run dev:front\""
   "build": "npm run build:backend && npm run build:front"
   "lint": "npm run lint:backend && npm run lint:front"
   ```

## 🚀 How to Use

### First Run
```bash
# Option 1: Use the auto-install script
./setup.sh

# Option 2: Install manually
npm install              # Root dependencies
cd backend && npm install
cd ../front && npm install
```

### Development
```bash
# Run both servers simultaneously
npm run dev

# Or run separately
npm run dev:backend  # NestJS on http://localhost:3001
npm run dev:front    # Nuxt on http://localhost:3000
```

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Testing
```bash
npm run test:backend
npm run test:e2e:backend
```

## 📁 Project Structure

```
task-manager-service/
├── .git/                    # Root Git repository
├── .gitignore              # Common .gitignore
├── .prettierrc             # Common formatting rules
├── .editorconfig           # Editor settings
├── .gitattributes          # Git attributes
├── package.json            # Root package.json with workspaces
├── setup.sh                # Quick install script
├── README.md               # Documentation
├── validation/             # Shared validation constants (used by backend & front)
│   └── constants.ts
├── backend/                # NestJS API
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── ...
└── front/                  # Nuxt.js frontend
    ├── app/
    ├── components/
    ├── store/
    ├── package.json
    └── ...
```

## 🔄 Shared Code

### Validation Constants
Validation constants are stored at the root level in `/validation` folder and can be imported by both backend and front:

**Backend example:**
```typescript
import { TASK_VALIDATION } from '../../../../../validation/constants';
```

**Front example:**
```typescript
import { TASK_VALIDATION } from '../../validation/constants';
```

This ensures consistency across the entire application.

## 📝 Git Workflow

```bash
# All changes are now committed from the root directory
git add .
git commit -m "feat: add new feature"
git push

# Commit history
git log --oneline

# Current changes
git status
```

## 🔧 IDE Setup

### VS Code
Open the root folder `task-manager-service` in VS Code. Workspaces are configured automatically.

### Extensions (Recommended)
- ESLint
- Prettier
- Volar (for Vue)
- EditorConfig

## 💡 Useful Commands

```bash
# Update all dependencies
npm update && cd backend && npm update && cd ../front && npm update

# Check outdated packages
npm outdated

# Clean node_modules and reinstall
rm -rf node_modules backend/node_modules front/node_modules
npm run install:all
```

## 🎯 Next Steps

1. Configure environment variables (`.env` files)
2. Set up CI/CD pipeline
3. Add pre-commit hooks with Husky
4. Configure Docker for development and production

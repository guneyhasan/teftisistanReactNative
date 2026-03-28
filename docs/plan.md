# React Native Expo Boilerplate Project Setup

## Overview

Create a scalable, modular React Native Expo boilerplate with TypeScript that can be reused for multiple app projects. The structure follows a module-based architecture where each module is self-contained, plus shared resources in `src/`.

## Architecture

### Directory Structure

```
zikir-app/
├── app/                    # Expo Router screens (file-based routing)
├── modules/                # Feature modules (self-contained)
│   └── [module-name]/
│       ├── components/     # Module-specific components
│       ├── screens/        # Module screens
│       ├── hooks/          # Module-specific hooks
│       ├── utils/          # Module utilities
│       ├── types/          # Module TypeScript types
│       ├── services/       # Module-specific services
│       └── stores/         # Module Zustand stores (if needed)
├── src/                    # Shared/global resources
│   ├── components/         # Reusable global components
│   ├── configs/            # App configuration, theme, constants
│   ├── hooks/              # Global reusable hooks
│   ├── utils/              # Global utility functions
│   ├── types/              # Global TypeScript types
│   ├── services/           # Global API client, external services
│   └── stores/             # Global Zustand stores
├── assets/                 # Images, fonts, etc.
└── [config files]
```

## Implementation Steps

### 1. Initialize Expo Project

- Run `npx create-expo-app@latest` with TypeScript template
- Configure project name as "zikir-app"
- Set up basic Expo configuration

### 2. Create Module-Based Directory Structure

- Create `modules/` directory for feature modules
- Create `src/` directory with subdirectories:
  - `components/` - Global reusable components
  - `configs/` - App config, theme, constants
  - `hooks/` - Global hooks
  - `utils/` - Global utilities
  - `types/` - Global types
  - `services/` - API client setup
  - `stores/` - Global Zustand stores

### 3. Set Up Core Infrastructure

- **State Management**: Configure Zustand with store structure
- **API Client**: Create axios-based API client in `src/services/api/` (axios only, no fetch wrapper)
- **Theme System**: Set up theme configuration in `src/configs/theme.ts`
- **Type Definitions**: Create base types in `src/types/`

### 4. Create Example Module Structure

- Create a sample module in `modules/example/` to demonstrate the pattern
- Include example component, screen, hook, and store

### 5. Configuration Files

- Update `tsconfig.json` with strict TypeScript settings and path aliases
- Configure `app.json` for Expo app settings
- Set up `.gitignore` for React Native/Expo projects
- Add path aliases configuration for easier imports

### 6. Basic Starter Screen

- Create welcome screen in `app/index.tsx` using Expo Router
- Demonstrate module usage pattern
- Implement basic styling with StyleSheet

### 7. Dependencies & Setup

- Install Expo Router for navigation
- Install Zustand for state management
- Install axios for API client
- Configure TypeScript path aliases (@modules, @src)

## Files to Create/Modify

### Core Structure

- `app/index.tsx` - Main entry screen
- `app/_layout.tsx` - Root layout with Expo Router
- `src/configs/theme.ts` - Theme configuration
- `src/configs/constants.ts` - App constants
- `src/services/api/client.ts` - API client setup
- `src/services/api/types.ts` - API types
- `src/stores/` - Global Zustand stores structure
- `modules/example/` - Example module demonstrating pattern

### Configuration

- `tsconfig.json` - TypeScript with path aliases
- `app.json` - Expo configuration
- `.gitignore` - Git ignore rules
- `package.json` - Dependencies and scripts
- `babel.config.js` - Babel config with path aliases

## Module Pattern Example

Each module should follow this structure:

- Self-contained: All module-specific code lives within the module
- Importable: Modules can import from `src/` for shared resources
- Scalable: Easy to add/remove modules without affecting others

## Notes

- All code, comments, and documentation in English
- Follow React Native and TypeScript best practices
- Use functional components with hooks
- Implement proper TypeScript typing throughout
- Path aliases: `@modules/*` for modules, `@src/*` for src directory
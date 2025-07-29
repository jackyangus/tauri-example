# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend Development
```bash
npm run dev          # Start Vite dev server on port 1420
npm run build        # Build frontend (TypeScript compilation + Vite build)
npm run preview      # Preview production build
```

### Tauri Development
```bash
npm run tauri dev    # Start Tauri app in development mode
npm run tauri build  # Build Tauri app for production
npm run tauri        # Access Tauri CLI directly
```

### Package Manager
This project uses both npm and bun. The Tauri configuration references `bun run dev` and `bun run build`, but package.json scripts work with npm as well.

## Architecture Overview

### Hybrid Architecture
This is a **Tauri v2 application** combining:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust with Tauri framework
- **WebRTC**: Built for real-time communication with simple-peer library

### Key Technical Decisions

**Node.js Polyfills**: The project includes extensive Node.js polyfills (`buffer`, `events`, `process`, `util`) configured in vite.config.ts to support WebRTC libraries in the browser environment.

**CSP Configuration**: Custom Content Security Policy in tauri.conf.json allows WebSocket connections (`wss:`, `ws:`), media streams (`mediastream:`), and blob URLs for WebRTC functionality.

**macOS Private API**: Enabled in tauri.conf.json for enhanced native integration.

### Frontend Structure

**State Management**: React useState-based state management in App.tsx with derived state patterns:
- Connection state flows: disconnected → connecting → connected → error
- Media state derived from connection state (isConnected, isInRoom)

**Component Architecture**:
- `DevToolsContext`: Wrapper providing right-click devtools access and Cmd/Ctrl+Shift+I keyboard shortcut
- Connection components: Status display, controls, and statistics
- Custom hooks for media device management and screen sharing

**Styling**: Hybrid approach using both Tailwind CSS and Bootstrap with custom CSS for WebRTC-specific styles.

### Backend Structure

**Tauri Commands**: 
- `greet(name)`: Example command returning formatted greeting
- `open_devtools()`: Opens browser devtools in the webview

**Development Tools Integration**: Custom DevToolsContext component enables devtools access via right-click context menu and keyboard shortcuts, calling the `open_devtools` Rust command.

### WebRTC Integration

**Media Management**: 
- `useMediaDevices` hook handles camera/microphone enumeration, device switching, and stream management
- `useScreenSharing` hook manages screen capture functionality
- Error handling for common WebRTC scenarios (permissions, device availability, security errors)

**Connection Flow**:
1. Initialize media devices → 2. Connect to signaling server → 3. Join room → 4. Establish peer connections

### Development Considerations

**Port Configuration**: Frontend dev server runs on port 1420 (configured in both package.json and vite.config.ts). Tauri expects this port for the devUrl.

**File Aliases**: Vite configured with `@` alias pointing to `./src` directory.

**Hot Reload**: Vite watches exclude `src-tauri/**` to prevent unnecessary reloads when Rust code changes.

**Bundle Configuration**: Tauri builds target "all" platforms with macOS-specific entitlements and hardened runtime enabled.

### WebRTC Security Notes
- HTTPS/localhost requirement enforced for media access
- Comprehensive error messages for permission and device access issues
- CSP configured to allow necessary WebRTC domains and protocols
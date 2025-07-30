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
npm start            # Start Tauri app in development mode (alias for npm run tauri dev)
npm run tauri dev    # Start Tauri app in development mode
npm run tauri build  # Build Tauri app for production
npm run tauri        # Access Tauri CLI directly
```

### JWT Server Development
```bash
git clone https://github.com/zoom/videosdk-auth-endpoint-sample --depth 1
cd videosdk-auth-endpoint-sample
npm install
npm run start
```

### Package Manager
This project uses both npm and bun. The Tauri configuration references `bun run dev` and `bun run build`, but package.json scripts work with npm as well.

### Rust Development
```bash
cargo build               # Build Rust backend
cargo run                 # Run Rust application directly
```

### MCP Server Integration
This project is configured with **Serena MCP server** for enhanced coding capabilities:
- **Semantic code retrieval** and editing across the entire codebase
- **Symbol-level code comprehension** for Rust, TypeScript, and other languages
- **Advanced project analysis** with context-aware suggestions
- **Configuration**: Automatically configured in Claude Code with `ide-assistant` context
- **Project indexing**: For large projects, indexing accelerates tool performance

**Serena MCP Server Instructions**:
/mcp__serena__initial_instructions init
You are a professional coding agent focused on this specific codebase with access to semantic coding tools. 

**Key Operating Principles**:
- **Frugal and intelligent**: Only read/generate content needed for the task
- **Symbolic tools first**: Use overview and symbolic search tools to avoid reading entire files
- **Step-by-step information acquisition**: Read only necessary code symbols
- **Token efficiency**: Avoid reading entire files unless absolutely necessary

**Tool Usage Priority**:
1. `get_symbols_overview` - Get high-level understanding of code symbols in files/directories
2. `find_symbol` - Locate specific symbols by name path (e.g., `Foo/__init__`, `class/method`)
3. `find_referencing_symbols` - Understand relationships between symbols
4. `search_for_pattern` - Flexible pattern search when symbol names are unclear
5. Standard tools (`list_dir`, `find_file`) - Basic file system operations
6. `read_file` - **Last resort only** for non-code files or when symbol tools insufficient

**Symbol-Based Editing**:
- Use `replace_symbol_body` for entire symbol replacement
- Use `insert_after_symbol`/`insert_before_symbol` for adding code
- Use regex-based `replace_regex` for targeted line-level edits within symbols
- Always use wildcards in regex patterns to minimize tokens

**Context**: IDE assistant mode with internal file operations, basic edits, and shell commands
**Modes**: Interactive (ask for clarification) + Editing (modify codebase with precision)

## Architecture Overview

### Hybrid Architecture
This is a **Tauri v2 application** combining:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust with Tauri framework + Zoom Video SDK macOS 2.3.0
- **Video Conferencing**: Zoom Video SDK for professional-grade video sessions
- **Authentication**: JWT token-based authentication with local server

### Key Technical Decisions

**Zoom Video SDK Integration**: Native macOS Zoom Video SDK 2.3.0 integrated via Rust/Tauri with Objective-C bindings for professional video conferencing capabilities.

**JWT Authentication**: Local JWT server at `127.0.0.1:4000` provides session tokens with configurable parameters (role, expiration, geo regions, recording options).

**Browser Compatibility Layer**: `src/utils/tauri.ts` provides mock functions for browser development when Tauri APIs are unavailable.

**Node.js Polyfills**: Extensive Node.js polyfills (`buffer`, `events`, `process`, `util`) configured in vite.config.ts to support SDK libraries in browser environment.

**CSP Configuration**: Custom Content Security Policy allows WebSocket connections (`wss:`, `ws:`), media streams (`mediastream:`), and blob URLs for video functionality.

**macOS Private API**: Enabled in tauri.conf.json for enhanced native integration with Zoom SDK.

### Frontend Structure

**State Management**: React useState-based state management with Zoom SDK integration:
- `useZoomSDK` hook manages SDK lifecycle: initialization → JWT fetch → session join → session leave
- Connection states: disconnected → connecting (JWT fetch) → connecting (Zoom join) → connected → error
- Automatic session name generation for simplified user experience

**Component Architecture**:
- `DevToolsContext`: Cross-platform devtools access with browser/Tauri compatibility
- `JWTConfig`: Advanced JWT parameter configuration with toggle visibility
- `ConnectionControls`: Simplified interface (removed Room ID, auto-generates session names)
- `ConnectionStatus` and `ConnectionStats`: Real-time status and session information display

**Custom Hooks**:
- `useZoomSDK`: Complete Zoom SDK lifecycle management with JWT integration
- `useMediaDevices`: Camera/microphone enumeration and control (for future enhancement)
- `useScreenSharing`: Screen capture functionality (for future enhancement)

**Styling**: Hybrid approach using Tailwind CSS and Bootstrap with custom CSS for video conferencing UI.

### Backend Structure

**Zoom SDK Integration** (`src-tauri/src/zoom_sdk.rs`):
- Objective-C bindings to native Zoom Video SDK frameworks
- `ZoomSDKManager` struct managing SDK lifecycle and session state
- Thread-safe global SDK instance with mutex protection

**Tauri Commands**:
- `zoom_initialize(domain?)`: Initialize Zoom SDK with optional domain configuration
- `zoom_join_session(config)`: Join Zoom session with JWT token and session parameters
- `zoom_leave_session()`: Leave current Zoom session
- `zoom_cleanup()`: Clean up SDK resources
- `greet(name)`: Example command returning formatted greeting
- `open_devtools()`: Opens browser devtools in the webview

**Build Configuration** (`src-tauri/build.rs`):
- Links all required Zoom SDK frameworks and dynamic libraries
- Configures framework search paths for native SDK integration

**Development Tools Integration**: Cross-platform devtools access using `safeInvoke` wrapper for browser/Tauri compatibility.
- **Browser DevTools**: Right-click context menu shows styled console message instructing users to press F12
- **Tauri DevTools**: Native devtools integration via `open_devtools()` command

### Zoom Video SDK Integration

**JWT Token Flow** (`src/services/jwtService.ts`):
- `JWTService.requestJWTToken()`: POST request to `127.0.0.1:4000` with session parameters
- Configurable JWT parameters: role, session name, expiration, geo regions, recording options
- Real-time token fetching with comprehensive error handling and logging

**Session Flow**:
1. SDK initialization → 2. JWT token request → 3. Zoom session join → 4. Video conferencing → 5. Session leave

**SDK Configuration**:
- Session parameters: `session_name`, `user_name`, `jwt_token`, optional `session_password`
- Automatic session name generation: `"zoom-session-" + timestamp`
- Support for host/participant roles, cloud recording, and geo-region selection

### Development Considerations

**Port Configuration**: 
- Frontend dev server: port 1420 (Vite configuration)
- JWT server: port 4000 (local authentication server)

**Cross-Platform Development**:
- `safeInvoke` wrapper enables browser debugging with mock Tauri functions
- Environment detection (`isTauriEnvironment()`) switches between real/mock APIs
- Debug mode indicator shows when running in browser with mocked functionality

**File Aliases**: Vite configured with `@` alias pointing to `./src` directory.

**Hot Reload**: Vite watches exclude `src-tauri/**` to prevent unnecessary reloads when Rust code changes.

**Bundle Configuration**: Tauri builds target "all" platforms with macOS-specific entitlements and hardened runtime enabled.

### Security & Authentication

**JWT Token Security**:
- Local JWT server at `127.0.0.1:4000` for development/testing
- Configurable token expiration and session parameters
- Role-based access control (host vs participant)

**Zoom SDK Security**:
- Native macOS SDK integration with proper code signing
- Session-based authentication with JWT tokens
- Optional end-to-end encryption support

**Development Security**:
- CSP configured for video conferencing domains and protocols
- CORS handling for local JWT server development
- Comprehensive error handling without exposing sensitive information

## Recent Updates

### Compiler Warnings Resolution
- **Fixed**: `unexpected_cfgs` warnings in `src-tauri/src/zoom_sdk.rs` by adding `#![allow(unexpected_cfgs)]` attribute
- **Cause**: objc crate 0.2.7 uses deprecated cfg conditions in macro expansions
- **Impact**: Clean compilation without warnings while maintaining full functionality

### DevTools Enhancement
- **Enhanced**: Browser DevTools fallback with styled console messages
- **Improved**: Cross-platform DevTools access with clear user instructions
- **Added**: Visual feedback for right-click DevTools functionality

### MCP Integration
- **Added**: Serena MCP server integration for enhanced coding capabilities
- **Features**: Semantic code analysis, symbol-level comprehension, multi-language support
- **Configuration**: IDE assistant context with project-specific indexing
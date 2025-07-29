# Tauri Zoom Video SDK Example

A cross-platform desktop application built with Tauri v2, React, and the Zoom Video SDK for macOS. This example demonstrates how to integrate professional video conferencing capabilities into a Tauri application with JWT authentication.

## Features

- 🎥 **Professional Video Conferencing** - Native Zoom Video SDK integration
- 🔐 **JWT Authentication** - Secure session token management
- 🖥️ **Cross-Platform Development** - Browser debugging with Tauri production
- ⚡ **Modern Stack** - React 19, TypeScript, Tailwind CSS, Vite
- 🎛️ **Advanced Configuration** - Customizable JWT parameters and session settings
- 🔧 **Developer Tools** - Integrated devtools access and debugging utilities

## Architecture

### Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Rust + Tauri v2 + Zoom Video SDK macOS 2.3.0
- **Authentication**: JWT tokens with local development server
- **Development**: Cross-platform compatibility with browser mocking

### Project Structure

```
tauri-example/
├── src/                          # React frontend
│   ├── components/              # UI components
│   │   ├── ConnectionControls.tsx
│   │   ├── ConnectionStatus.tsx
│   │   ├── JWTConfig.tsx
│   │   └── DevToolsContext.tsx
│   ├── hooks/                   # Custom React hooks
│   │   └── useZoomSDK.ts       # Zoom SDK management
│   ├── services/               # API services
│   │   └── jwtService.ts       # JWT token management
│   ├── types/                  # TypeScript definitions
│   │   └── zoom.ts
│   └── utils/                  # Utility functions
│       └── tauri.ts           # Cross-platform compatibility
├── src-tauri/                  # Tauri backend
│   ├── src/
│   │   ├── main.rs            # Tauri commands
│   │   └── zoom_sdk.rs        # Zoom SDK integration
│   ├── libs/                  # Zoom SDK frameworks
│   └── build.rs               # Build configuration
├── zoom-video-sdk-macos-2.3.0/ # Zoom SDK
└── test-jwt-server.js          # Development JWT server
```

## Prerequisites

### System Requirements

- **macOS**: 10.14 or later (required for Zoom Video SDK)
- **Node.js**: 18.0 or later
- **Rust**: Latest stable version
- **Tauri CLI**: v2.0 or later

### Zoom Video SDK Setup

1. **Download Zoom Video SDK**:
   - Visit [Zoom Video SDK for macOS](https://developers.zoom.us/docs/video-sdk/macos/)
   - Download version 2.3.0 and extract to project root as `zoom-video-sdk-macos-2.3.0/`

2. **Zoom Developer Account**:
   - Create a [Zoom Developer Account](https://developers.zoom.us/)
   - Create a Video SDK app to get your SDK credentials

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tauri-example
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Tauri CLI (if not already installed)
npm install -g @tauri-apps/cli
```

### 3. Set Up Zoom Video SDK

```bash
# Extract Zoom SDK to project root (if not already done)
# Ensure the path is: ./zoom-video-sdk-macos-2.3.0/
```

### 4. Set Up JWT Authentication Server

For development, you can use either the test server or the official Zoom sample:

#### Option A: Test Server (Simple)
```bash
# Use the included test server
node test-jwt-server.js
```

#### Option B: Official Zoom Sample (Recommended)
```bash
# Clone and set up the official Zoom auth endpoint
git clone https://github.com/zoom/videosdk-auth-endpoint-sample --depth 1
cd videosdk-auth-endpoint-sample
npm install

# Configure with your Zoom SDK credentials
# Edit the configuration file with your SDK Key and Secret

npm run start
cd ..
```

## Development

### Running the Application

#### Browser Development (UI Testing)
```bash
# Start the development server
npm run dev

# Open http://localhost:1420 in your browser
# Note: Zoom SDK functions will be mocked in browser mode
```

#### Tauri Development (Full Functionality)
```bash
# Start the Tauri application
npm run tauri dev

# This provides full Zoom SDK integration
```

### JWT Server

Make sure your JWT server is running on port 4000:

```bash
# Terminal 1: Start JWT server
node test-jwt-server.js
# or
cd videosdk-auth-endpoint-sample && npm run start

# Terminal 2: Start the app
npm run tauri dev
```

## Usage

### Basic Workflow

1. **Initialize**: The app automatically initializes the Zoom SDK on startup
2. **Configure** (Optional): Click "Show Advanced JWT Configuration" to customize session parameters
3. **Join Session**: 
   - Enter your name
   - Click "Join Session"
   - The app will automatically fetch a JWT token and join the Zoom session
4. **Leave Session**: Click "Disconnect" to leave the session

### JWT Configuration

The app supports advanced JWT configuration:

- **Role**: Host (0) or Participant (1)
- **Session Duration**: Token expiration time
- **Geo Regions**: Geographic restrictions
- **Recording Options**: Cloud recording settings
- **Session Key**: Custom session identifier

### Debug Features

- **Browser Mode**: Visual indicator when running in browser with mocked functions
- **Console Logging**: Detailed JWT request/response logging
- **DevTools Access**: Right-click or Cmd/Ctrl+Shift+I to open developer tools

## Building for Production

### Prerequisites for Building

1. **Code Signing**: Configure macOS code signing for Zoom SDK frameworks
2. **Entitlements**: Ensure proper entitlements for camera/microphone access
3. **JWT Server**: Set up production JWT server with your Zoom SDK credentials

### Build Commands

```bash
# Build the frontend
npm run build

# Build the Tauri application
npm run tauri build

# The built application will be in src-tauri/target/release/
```

## Configuration

### Environment Variables

Create a `.env` file for local development:

```bash
# JWT Server Configuration
JWT_SERVER_URL=http://127.0.0.1:4000

# Zoom SDK Configuration (for production JWT server)
ZOOM_SDK_KEY=your_sdk_key_here
ZOOM_SDK_SECRET=your_sdk_secret_here
```

### Tauri Configuration

Key configuration files:
- `src-tauri/tauri.conf.json`: Tauri app configuration
- `src-tauri/Cargo.toml`: Rust dependencies and project metadata
- `src-tauri/build.rs`: Zoom SDK framework linking

## Troubleshooting

### Common Issues

#### "invoke can't work on browser debug"
- **Solution**: Use `npm run tauri dev` for full functionality, or the browser mock functions will handle this automatically

#### "JWT server not reachable"
- **Solution**: Ensure JWT server is running on port 4000
- Check firewall settings and CORS configuration

#### "Zoom SDK initialization failed"
- **Solution**: Verify Zoom SDK is properly extracted to `./zoom-video-sdk-macos-2.3.0/`
- Check macOS permissions for camera/microphone access

#### Build errors with Zoom SDK
- **Solution**: Ensure all Zoom SDK frameworks are properly linked in `build.rs`
- Verify code signing configuration for native frameworks

### Debug Mode

When running in browser mode (`npm run dev`), the app shows a debug banner and:
- Mocks all Tauri invoke calls
- Skips actual Zoom SDK operations
- Provides console logging for all operations

## API Reference

### Tauri Commands

- `zoom_initialize(domain?)`: Initialize the Zoom SDK
- `zoom_join_session(config)`: Join a Zoom session with JWT token
- `zoom_leave_session()`: Leave the current session
- `zoom_cleanup()`: Clean up SDK resources
- `open_devtools()`: Open developer tools

### React Hooks

- `useZoomSDK()`: Complete Zoom SDK state management
- `useMediaDevices()`: Camera/microphone control (for future enhancement)

### Services

- `JWTService.requestJWTToken(request)`: Fetch JWT token from server
- `safeInvoke(command, args)`: Cross-platform Tauri command wrapper

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Zoom Video SDK](https://developers.zoom.us/docs/video-sdk/) for professional video conferencing capabilities
- [Tauri](https://tauri.app/) for the cross-platform application framework
- [React](https://reactjs.org/) for the user interface framework

---

For more detailed technical information, see [CLAUDE.md](CLAUDE.md).
import { useState, useEffect } from "react";
import { DevToolsContext } from "@/components/DevToolsContext";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { ConnectionState, ConnectionStatus } from "./components/ConnectionStatus";
import { ConnectionControls } from "./components/ConnectionControls";
import { JWTConfig } from "./components/JWTConfig";
import { useZoomSDK } from "./hooks/useZoomSDK";
import { JWTTokenRequest } from "./services/jwtService";
import { isTauriEnvironment } from "./utils/tauri";
import "@/styles/index.css";

function App() {
  const [enableE2E, setEnableE2E] = useState(false);
  const [showJWTConfig, setShowJWTConfig] = useState(false);
  const [jwtConfig, setJwtConfig] = useState<Partial<JWTTokenRequest>>({});
  
  // Use Zoom SDK hook
  const {
    isInitialized,
    isInSession,
    isConnecting,
    isFetchingToken,
    error: zoomError,
    sessionName,
    initialize,
    joinSession,
    leaveSession,
  } = useZoomSDK();

  // Derived state for UI compatibility
  const connectionState: ConnectionState = (isConnecting || isFetchingToken)
    ? "connecting" 
    : isInSession 
    ? "connected" 
    : zoomError 
    ? "error" 
    : isInitialized
    ? "disconnected"
    : "disconnected";
  
  const connectionStatus = isFetchingToken
    ? "Fetching JWT token..."
    : isConnecting 
    ? "Connecting to Zoom session..." 
    : isInSession 
    ? `In session: ${sessionName}` 
    : zoomError 
    ? zoomError 
    : isInitialized 
    ? "Ready to join session" 
    : "Initializing Zoom SDK...";
  
  const isInRoom = isInSession;
  const isDebugMode = !isTauriEnvironment();
  
  // Initialize Zoom SDK on mount
  useEffect(() => {
    const initSDK = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error("Failed to initialize Zoom SDK:", error);
      }
    };
    
    initSDK();
  }, [initialize]);

  // Handle connection (initialize SDK)
  const handleConnect = async () => {
    if (!isInitialized) {
      try {
        await initialize();
      } catch (error) {
        console.error("Connection failed:", error);
      }
    }
  };

  // Handle joining room with automatic JWT token fetching
  const handleJoinRoom = async (name: string, room: string) => {
    try {
      console.log(jwtConfig)
      await joinSession(room, name, jwtConfig);
    } catch (error) {
      console.error("Failed to join room:", error);
      throw error;
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    try {
      await leaveSession();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  };

  // Media controls using hooks
  // const toggleAudio = () => {
    
  // };

  // const toggleVideo = () => {
   
  // };

  // const switchCamera = async () => {
    
  // };

  // Share screen using hook
  // const shareScreen = async () => {
  //   try {
      
  //   } catch (error) {
  //     console.error("Failed to share screen:", error);
  //   }
  // };



  


  return (
    <DevToolsContext>
      <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
        <Header />
        
        <div className="container-fluid">
          <div className="main-container container">
            <div className="p-4">
              
              {isDebugMode && (
                <div className="alert alert-info mb-4" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Debug Mode:</strong> Running in browser with mock Zoom SDK. JWT requests are skipped.
                </div>
              )}
              
              <ConnectionStatus status={connectionStatus} state={connectionState} />
              
              <JWTConfig
                onConfigChange={setJwtConfig}
                isVisible={showJWTConfig}
                onToggle={() => setShowJWTConfig(!showJWTConfig)}
              />
              
              <ConnectionControls
                onConnect={handleConnect}
                onJoinRoom={handleJoinRoom}
                onDisconnect={handleDisconnect}
                isConnected={true}
                isInRoom={isInRoom}
                enableE2E={enableE2E}
                onEnableE2EChange={setEnableE2E}
              />
              
            
              
            
             
            </div>
          </div>
        </div>
        
        
        
        <LoadingOverlay 
          isVisible={isConnecting || isFetchingToken} 
          text={isFetchingToken ? "Fetching JWT token..." : "Connecting to Zoom session..."} 
        />
      </div>
    </DevToolsContext>
  );
}

export default App;
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
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10">
          <Header />
          
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="glass-strong rounded-3xl shadow-2xl p-8 space-y-8 animate-float">
              
              {isDebugMode && (
                <div className="glass rounded-2xl p-4 flex items-center space-x-3 animate-pulse border-blue-400/30">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center animate-glow">
                    <i className="bi bi-info-circle text-white text-sm"></i>
                  </div>
                  <div>
                    <span className="text-blue-100 font-medium">Debug Mode Active</span>
                   </div>
                </div>
              )}
              
              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
                <ConnectionStatus status={connectionStatus} state={connectionState} />
              </div>
              
              <div className="glass rounded-2xl overflow-hidden transition-all duration-500 ease-in-out hover:scale-105">
                <JWTConfig
                  onConfigChange={setJwtConfig}
                  isVisible={showJWTConfig}
                  onToggle={() => setShowJWTConfig(!showJWTConfig)}
                />
              </div>
              
              <div className="glass rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
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
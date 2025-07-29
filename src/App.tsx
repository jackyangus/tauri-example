import { useState, useEffect } from "react";
import { DevToolsContext } from "@/components/DevToolsContext";
import { Header } from "@/components/Header";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { ConnectionState, ConnectionStatus } from "./components/ConnectionStatus";
import { ConnectionControls } from "./components/ConnectionControls";
import { useZoomSDK } from "./hooks/useZoomSDK";
import "@/styles/index.css";

function App() {
  const [enableE2E, setEnableE2E] = useState(false);
  const [jwtToken, setJwtToken] = useState("");
  const [sessionPassword, setSessionPassword] = useState("");
  
  // Use Zoom SDK hook
  const {
    isInitialized,
    isInSession,
    isConnecting,
    error: zoomError,
    sessionName,
    userName,
    initialize,
    joinSession,
    leaveSession,
    cleanup
  } = useZoomSDK();

  // Derived state for UI compatibility
  const connectionState: ConnectionState = isConnecting 
    ? "connecting" 
    : isInSession 
    ? "connected" 
    : zoomError 
    ? "error" 
    : "disconnected";
  
  const connectionStatus = isConnecting 
    ? "Connecting to Zoom session..." 
    : isInSession 
    ? `In session: ${sessionName}` 
    : zoomError 
    ? zoomError 
    : isInitialized 
    ? "Ready to join session" 
    : "Initializing Zoom SDK...";
  
  const isConnected = isInSession;
  const isInRoom = isInSession;
  
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

  // Handle joining room
  const handleJoinRoom = async (name: string, room: string) => {
    if (!jwtToken) {
      throw new Error("JWT token is required to join session");
    }

    try {
      await joinSession({
        session_name: room,
        user_name: name,
        session_password: sessionPassword || undefined,
        jwt_token: jwtToken,
      });
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
            
              
              <ConnectionStatus status={connectionStatus} state={connectionState} />
              
              <ConnectionControls
                onConnect={handleConnect}
                onJoinRoom={handleJoinRoom}
                onDisconnect={handleDisconnect}
                isConnected={isConnected}
                isInRoom={isInRoom}
                enableE2E={enableE2E}
                onEnableE2EChange={setEnableE2E}
              />
              
            
              
            
             
            </div>
          </div>
        </div>
        
        
        
        <LoadingOverlay isVisible={isConnecting} text="Connecting to Zoom session..." />
      </div>
    </DevToolsContext>
  );
}

export default App;
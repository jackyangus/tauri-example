import { useState } from "react";
import { DevToolsContext } from "@/components/DevToolsContext";
import { Header } from "@/components/Header";

import "@/styles/webrtc.css";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { ConnectionStats } from "./components/ConnectionStats";
import { ConnectionState, ConnectionStatus } from "./components/ConnectionStatus";
import { ConnectionControls } from "./components/ConnectionControls";

function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [connectionStatus, setConnectionStatus] = useState("Ready to connect");
  const [userName, setUserName] = useState("");
  const [enableE2E, setEnableE2E] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Connecting...");
  const [stats, setStats] = useState<any>(null);
  
  // Auto-detect WebSocket URL
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host || 'localhost:8080';
  const wsUrl = `${protocol}//${host}/ws`;


  // Handle connection
  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setLoadingText("Initializing camera and microphone...");
      setConnectionState("connecting");
      setConnectionStatus("Connecting...");
    
      setConnectionState("connected");
      setConnectionStatus("Connected - Ready to join room");
      
    } catch (error) {
      console.error("Connection failed:", error);
      setConnectionState("error");
      setConnectionStatus(error instanceof Error ? error.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle joining room
  const handleJoinRoom = async (name: string, room: string) => {
    try {
      setConnectionStatus("Joining room...");
      setUserName(name);
      
      // await joinRoom(room, name);
      setConnectionStatus("In room");
      
    } catch (error) {
      console.error("Failed to join room:", error);
      setConnectionState("error");
      setConnectionStatus(error instanceof Error ? error.message : "Failed to join room");
    }
  };

  // Handle disconnect
  const handleDisconnect = () => {
    
    setConnectionState("disconnected");
    setConnectionStatus("Disconnected");
    setUserName("");
  };

  // Media controls using hooks
  const toggleAudio = () => {
    
  };

  const toggleVideo = () => {
   
  };

  const switchCamera = async () => {
    
  };

  // Share screen using hook
  const shareScreen = async () => {
    try {
      
    } catch (error) {
      console.error("Failed to share screen:", error);
    }
  };



  


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
              
            
              
              <ConnectionStats stats={stats} />
              
             
            </div>
          </div>
        </div>
        
        
        
        <LoadingOverlay isVisible={isLoading} text={loadingText} />
      </div>
    </DevToolsContext>
  );
}

export default App;
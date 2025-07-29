import React, { useState, useEffect } from "react";

interface ConnectionControlsProps {
  onConnect: () => Promise<void>;
  onJoinRoom: (userName: string, sessionName: string) => Promise<void>;
  onDisconnect: () => void;
  isConnected: boolean;
  isInRoom: boolean;
  enableE2E: boolean;
  onEnableE2EChange: (enabled: boolean) => void;
}

export const ConnectionControls: React.FC<ConnectionControlsProps> = ({
  onConnect,
  onJoinRoom,
  onDisconnect,
  isConnected,
  isInRoom,
  enableE2E,
  onEnableE2EChange
}) => {
  const [userName, setUserName] = useState("");
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  
  // Generate a default session name
  const defaultSessionName = "zoom-session-jack"

  useEffect(() => {
    // Load URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get("username");
    
    if (username) setUserName(username);

    // Load media devices
    loadMediaDevices();
  }, []);

  const loadMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      const audioDevices = devices.filter(device => device.kind === "audioinput");
      
      setCameras(videoDevices);
      setMicrophones(audioDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      if (audioDevices.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(audioDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Failed to enumerate devices:", error);
    }
  };

  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleJoinRoom = async () => {
    try {
      await onJoinRoom(userName, defaultSessionName);
    } catch (error) {
      console.error("Failed to join session:", error);
    }
  };

  return (
    <div className="section-card p-4 mb-4">
      <h4 className="mb-3">
        <i className="bi bi-gear me-2" />
        Connection Controls
      </h4>

      <div className="row g-3 mb-4">
        <div className="col-md-12">
          <label htmlFor="userName" className="form-label">
            <i className="bi bi-person me-1" />
            User Name
          </label>
          <input
            type="text"
            className="form-control"
            id="userName"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isInRoom}
          />
          <div className="form-text">
            <i className="bi bi-info-circle me-1" />
            Session: {defaultSessionName}
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label htmlFor="cameraSelect" className="form-label">
            <i className="bi bi-camera-video me-1" />
            Camera
          </label>
          <select
            className="form-select"
            id="cameraSelect"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={isInRoom}
          >
            {cameras.map((camera) => (
              <option key={camera.deviceId} value={camera.deviceId}>
                {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="microphoneSelect" className="form-label">
            <i className="bi bi-mic me-1" />
            Microphone
          </label>
          <select
            className="form-select"
            id="microphoneSelect"
            value={selectedMicrophone}
            onChange={(e) => setSelectedMicrophone(e.target.value)}
            disabled={isInRoom}
          >
            {microphones.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-check mb-4">
        <input
          className="form-check-input"
          type="checkbox"
          id="enableE2E"
          checked={enableE2E}
          onChange={(e) => onEnableE2EChange(e.target.checked)}
          disabled={isConnected}
        />
        <label className="form-check-label" htmlFor="enableE2E">
          <i className="bi bi-shield-lock me-1" />
          Enable End-to-End Encryption
        </label>
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-center">
        <button
          className="btn btn-primary-custom btn-custom"
          onClick={handleConnect}
          disabled={isConnected}
        >
          <i className="bi bi-play-circle" />
          <span>Connect</span>
        </button>
        <button
          className="btn btn-success-custom btn-custom"
          onClick={handleJoinRoom}
          disabled={!isConnected || isInRoom || !userName}
        >
          <i className="bi bi-camera-video" />
          <span>Join Session</span>
        </button>
        {isInRoom && (
          <button
            className="btn btn-danger-custom btn-custom"
            onClick={onDisconnect}
          >
            <i className="bi bi-x-circle" />
            <span>Disconnect</span>
          </button>
        )}
      </div>
    </div>
  );
};
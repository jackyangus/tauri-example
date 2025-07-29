import { useState, useEffect, useCallback } from "react";

interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

interface MediaState {
  stream: MediaStream | null;
  devices: MediaDeviceInfo[];
  selectedVideoDevice: string;
  selectedAudioDevice: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  error: string | null;
}

export const useMediaDevices = () => {
  const [state, setState] = useState<MediaState>({
    stream: null,
    devices: [],
    selectedVideoDevice: "",
    selectedAudioDevice: "",
    isVideoEnabled: true,
    isAudioEnabled: true,
    error: null
  });

  // Enumerate available media devices
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const filteredDevices = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} ${device.deviceId.slice(0, 8)}`,
        kind: device.kind
      }));

      setState(prev => ({
        ...prev,
        devices: filteredDevices,
        error: null
      }));

      // Set default devices if not already set
      const videoDevices = filteredDevices.filter(d => d.kind === "videoinput");
      const audioDevices = filteredDevices.filter(d => d.kind === "audioinput");

      if (videoDevices.length > 0 && !state.selectedVideoDevice) {
        setState(prev => ({
          ...prev,
          selectedVideoDevice: videoDevices[0].deviceId
        }));
      }

      if (audioDevices.length > 0 && !state.selectedAudioDevice) {
        setState(prev => ({
          ...prev,
          selectedAudioDevice: audioDevices[0].deviceId
        }));
      }

      return filteredDevices;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to enumerate devices";
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      return [];
    }
  }, [state.selectedVideoDevice, state.selectedAudioDevice]);

  // Get user media with current settings
  const getUserMedia = useCallback(async (constraints?: MediaConstraints) => {
    try {
      const defaultConstraints: MediaConstraints = {
        video: state.selectedVideoDevice ? 
          { deviceId: { exact: state.selectedVideoDevice } } : 
          true,
        audio: state.selectedAudioDevice ? 
          { deviceId: { exact: state.selectedAudioDevice } } : 
          true
      };

      const finalConstraints = constraints || defaultConstraints;

      // Apply enabled/disabled state
      if (!state.isVideoEnabled) {
        finalConstraints.video = false;
      }
      if (!state.isAudioEnabled) {
        finalConstraints.audio = false;
      }

      const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);

      setState(prev => ({
        ...prev,
        stream,
        error: null
      }));

      return stream;
    } catch (error) {
      let errorMessage = "Failed to access media devices";
      
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Camera and microphone access denied. Please allow permissions and try again.";
            break;
          case "NotFoundError":
            errorMessage = "No camera or microphone found. Please connect a camera/microphone and try again.";
            break;
          case "SecurityError":
            errorMessage = "Security error: Media access requires HTTPS or localhost.";
            break;
          default:
            errorMessage = `Media access error: ${error.message}`;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        stream: null
      }));

      throw new Error(errorMessage);
    }
  }, [state.selectedVideoDevice, state.selectedAudioDevice, state.isVideoEnabled, state.isAudioEnabled]);

  // Switch camera device
  const switchCamera = useCallback(async () => {
    const videoDevices = state.devices.filter(d => d.kind === "videoinput");
    if (videoDevices.length <= 1) return;

    const currentIndex = videoDevices.findIndex(d => d.deviceId === state.selectedVideoDevice);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDevice = videoDevices[nextIndex];

    setState(prev => ({
      ...prev,
      selectedVideoDevice: nextDevice.deviceId
    }));

    // If we have an active stream, replace the video track
    if (state.stream) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: nextDevice.deviceId } },
          audio: false
        });

        const newVideoTrack = newStream.getVideoTracks()[0];
        const oldVideoTrack = state.stream.getVideoTracks()[0];

        if (oldVideoTrack) {
          state.stream.removeTrack(oldVideoTrack);
          oldVideoTrack.stop();
        }

        state.stream.addTrack(newVideoTrack);

        setState(prev => ({
          ...prev,
          stream: new MediaStream([...state.stream!.getTracks()])
        }));
      } catch (error) {
        console.error("Failed to switch camera:", error);
      }
    }
  }, [state.devices, state.selectedVideoDevice, state.stream]);

  // Toggle video enabled/disabled
  const toggleVideo = useCallback(() => {
    if (state.stream) {
      const videoTrack = state.stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({
          ...prev,
          isVideoEnabled: videoTrack.enabled
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isVideoEnabled: !prev.isVideoEnabled
      }));
    }
  }, [state.stream]);

  // Toggle audio enabled/disabled
  const toggleAudio = useCallback(() => {
    if (state.stream) {
      const audioTrack = state.stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({
          ...prev,
          isAudioEnabled: audioTrack.enabled
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        isAudioEnabled: !prev.isAudioEnabled
      }));
    }
  }, [state.stream]);

  // Stop all tracks
  const stopStream = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
      setState(prev => ({
        ...prev,
        stream: null
      }));
    }
  }, [state.stream]);

  // Set specific devices
  const setVideoDevice = useCallback((deviceId: string) => {
    setState(prev => ({
      ...prev,
      selectedVideoDevice: deviceId
    }));
  }, []);

  const setAudioDevice = useCallback((deviceId: string) => {
    setState(prev => ({
      ...prev,
      selectedAudioDevice: deviceId
    }));
  }, []);

  // Initialize devices on mount
  useEffect(() => {
    enumerateDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      stopStream();
    };
  }, [enumerateDevices, stopStream]);

  return {
    ...state,
    enumerateDevices,
    getUserMedia,
    switchCamera,
    toggleVideo,
    toggleAudio,
    stopStream,
    setVideoDevice,
    setAudioDevice
  };
};
import { useState, useCallback, useRef } from "react";

interface ScreenSharingOptions {
  video?: DisplayMediaStreamOptions['video'];
  audio?: boolean;
  preferCurrentTab?: boolean;
}

interface ScreenSharingState {
  isSharing: boolean;
  stream: MediaStream | null;
  error: string | null;
}

export const useScreenSharing = () => {
  const [state, setState] = useState<ScreenSharingState>({
    isSharing: false,
    stream: null,
    error: null
  });

  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  const startScreenSharing = useCallback(async (options: ScreenSharingOptions = {}) => {
    try {
      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: options.video || {
          frameRate: { ideal: 10, max: 15 },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: options.audio || false
      };

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      // Handle stream ending (user stops sharing via browser UI)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setState(prev => ({
            ...prev,
            isSharing: false,
            stream: null
          }));
        };
      }

      setState({
        isSharing: true,
        stream,
        error: null
      });

      return stream;
    } catch (error) {
      let errorMessage = "Failed to start screen sharing";
      
      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Screen sharing permission denied. Please allow screen sharing and try again.";
            break;
          case "NotFoundError":
            errorMessage = "No screen or window available for sharing.";
            break;
          case "AbortError":
            errorMessage = "Screen sharing was cancelled.";
            break;
          default:
            errorMessage = `Screen sharing error: ${error.message}`;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage
      }));

      throw new Error(errorMessage);
    }
  }, []);

  const stopScreenSharing = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach(track => track.stop());
    }

    setState({
      isSharing: false,
      stream: null,
      error: null
    });
  }, [state.stream]);

  const replaceVideoTrack = useCallback(async (
    localStream: MediaStream,
    onTrackReplaced?: (newStream: MediaStream) => void
  ) => {
    if (!state.stream || !localStream) return null;

    try {
      const screenVideoTrack = state.stream.getVideoTracks()[0];
      const currentVideoTrack = localStream.getVideoTracks()[0];

      if (screenVideoTrack && currentVideoTrack) {
        // Store original track for restoration
        originalVideoTrackRef.current = currentVideoTrack;

        // Replace video track in local stream
        localStream.removeTrack(currentVideoTrack);
        localStream.addTrack(screenVideoTrack);

        // Create new stream reference
        const newStream = new MediaStream([...localStream.getTracks()]);

        // Handle screen share ending
        screenVideoTrack.onended = () => {
          restoreVideoTrack(newStream, onTrackReplaced);
        };

        if (onTrackReplaced) {
          onTrackReplaced(newStream);
        }

        return newStream;
      }
    } catch (error) {
      console.error("Failed to replace video track:", error);
      return null;
    }

    return null;
  }, [state.stream]);

  const restoreVideoTrack = useCallback((
    localStream: MediaStream,
    onTrackRestored?: (newStream: MediaStream) => void
  ) => {
    if (!originalVideoTrackRef.current || !localStream) return null;

    try {
      const screenVideoTrack = localStream.getVideoTracks()[0];
      
      if (screenVideoTrack) {
        localStream.removeTrack(screenVideoTrack);
        screenVideoTrack.stop();
      }

      // Restore original video track
      localStream.addTrack(originalVideoTrackRef.current);

      // Create new stream reference
      const newStream = new MediaStream([...localStream.getTracks()]);

      if (onTrackRestored) {
        onTrackRestored(newStream);
      }

      // Clear the reference
      originalVideoTrackRef.current = null;

      setState(prev => ({
        ...prev,
        isSharing: false,
        stream: null
      }));

      return newStream;
    } catch (error) {
      console.error("Failed to restore video track:", error);
      return null;
    }
  }, []);

  // Check if screen sharing is supported
  const isSupported = useCallback(() => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  }, []);

  // Get screen sharing constraints for different quality levels
  const getConstraints = useCallback((quality: 'low' | 'medium' | 'high' = 'medium') => {
    const constraints: DisplayMediaStreamOptions = {
      video: true,
      audio: false
    };

    switch (quality) {
      case 'low':
        constraints.video = {
          frameRate: { ideal: 5, max: 10 },
          width: { ideal: 640, max: 1280 },
          height: { ideal: 360, max: 720 }
        };
        break;
      case 'medium':
        constraints.video = {
          frameRate: { ideal: 10, max: 15 },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        };
        break;
      case 'high':
        constraints.video = {
          frameRate: { ideal: 15, max: 30 },
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 }
        };
        break;
    }

    return constraints;
  }, []);

  return {
    ...state,
    startScreenSharing,
    stopScreenSharing,
    replaceVideoTrack,
    restoreVideoTrack,
    isSupported,
    getConstraints
  };
};
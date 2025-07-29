import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ZoomSessionConfig, ZoomSDKError } from '../types/zoom';

export interface ZoomSDKState {
  isInitialized: boolean;
  isInSession: boolean;
  isConnecting: boolean;
  error: string | null;
  sessionName: string | null;
  userName: string | null;
}

export const useZoomSDK = () => {
  const [state, setState] = useState<ZoomSDKState>({
    isInitialized: false,
    isInSession: false,
    isConnecting: false,
    error: null,
    sessionName: null,
    userName: null,
  });

  // Initialize the Zoom SDK
  const initialize = useCallback(async (domain?: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await invoke('zoom_initialize', { domain });
      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      const zoomError = error as ZoomSDKError;
      setState(prev => ({
        ...prev,
        error: `Initialization failed: ${zoomError.message}`,
        isInitialized: false,
      }));
      throw error;
    }
  }, []);

  // Join a Zoom session
  const joinSession = useCallback(async (config: ZoomSessionConfig) => {
    if (!state.isInitialized) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      setState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
      }));

      await invoke('zoom_join_session', { config });

      setState(prev => ({
        ...prev,
        isInSession: true,
        isConnecting: false,
        sessionName: config.session_name,
        userName: config.user_name,
      }));
    } catch (error) {
      const zoomError = error as ZoomSDKError;
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: `Failed to join session: ${zoomError.message}`,
      }));
      throw error;
    }
  }, [state.isInitialized]);

  // Leave the current session
  const leaveSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await invoke('zoom_leave_session');
      setState(prev => ({
        ...prev,
        isInSession: false,
        sessionName: null,
        userName: null,
      }));
    } catch (error) {
      const zoomError = error as ZoomSDKError;
      setState(prev => ({
        ...prev,
        error: `Failed to leave session: ${zoomError.message}`,
      }));
      throw error;
    }
  }, []);

  // Cleanup SDK resources
  const cleanup = useCallback(async () => {
    try {
      await invoke('zoom_cleanup');
      setState({
        isInitialized: false,
        isInSession: false,
        isConnecting: false,
        error: null,
        sessionName: null,
        userName: null,
      });
    } catch (error) {
      const zoomError = error as ZoomSDKError;
      setState(prev => ({
        ...prev,
        error: `Cleanup failed: ${zoomError.message}`,
      }));
    }
  }, []);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup when component unmounts
      cleanup().catch(console.error);
    };
  }, [cleanup]);

  return {
    ...state,
    initialize,
    joinSession,
    leaveSession,
    cleanup,
  };
};
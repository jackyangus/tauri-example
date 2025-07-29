import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ZoomSessionConfig, ZoomSDKError } from '../types/zoom';
import { JWTService, JWTTokenRequest } from '../services/jwtService';

export interface ZoomSDKState {
  isInitialized: boolean;
  isInSession: boolean;
  isConnecting: boolean;
  isFetchingToken: boolean;
  error: string | null;
  sessionName: string | null;
  userName: string | null;
}

export const useZoomSDK = () => {
  const [state, setState] = useState<ZoomSDKState>({
    isInitialized: false,
    isInSession: false,
    isConnecting: false,
    isFetchingToken: false,
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

  // Join a Zoom session with automatic JWT token fetching
  const joinSession = useCallback(async (sessionName: string, userName: string, jwtRequest?: Partial<JWTTokenRequest>) => {
    if (!state.isInitialized) {
      throw new Error('SDK not initialized. Call initialize() first.');
    }

    try {
      setState(prev => ({
        ...prev,
        isFetchingToken: true,
        error: null,
      }));

      // Create JWT request with defaults
      const fullJwtRequest = {
        ...JWTService.createDefaultRequest(sessionName, userName),
        ...jwtRequest,
        sessionName,
        userIdentity: userName,
      };

      // Fetch JWT token from local server
      const jwtToken = await JWTService.requestJWTToken(fullJwtRequest);

      setState(prev => ({
        ...prev,
        isFetchingToken: false,
        isConnecting: true,
      }));

      // Create Zoom session config
      const config: ZoomSessionConfig = {
        session_name: sessionName,
        user_name: userName,
        jwt_token: jwtToken,
        session_password: jwtRequest?.sessionKey !== sessionName ? jwtRequest?.sessionKey : undefined,
      };

      await invoke('zoom_join_session', { config });

      setState(prev => ({
        ...prev,
        isInSession: true,
        isConnecting: false,
        sessionName,
        userName,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isFetchingToken: false,
        error: `Failed to join session: ${errorMessage}`,
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
        isFetchingToken: false,
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
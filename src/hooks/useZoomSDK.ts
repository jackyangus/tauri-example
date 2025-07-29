import { useState, useCallback, useEffect } from 'react';
import { ZoomSessionConfig } from '../types/zoom';
import { JWTService, JWTTokenRequest } from '../services/jwtService';
import { safeInvoke, isTauriEnvironment } from '../utils/tauri';

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
      
      if (!isTauriEnvironment()) {
        console.log('[DEBUG] Running in browser mode - using mock Zoom SDK');
      }
      
      await safeInvoke('zoom_initialize', { domain });
      setState(prev => ({ ...prev, isInitialized: true }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: `Initialization failed: ${errorMessage}`,
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
      console.log('[DEBUG] Requesting JWT token from 127.0.0.1:4000...', fullJwtRequest);
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

      await safeInvoke('zoom_join_session', { config });

      setState(prev => ({
        ...prev,
        isInSession: true,
        isConnecting: false,
        sessionName,
        userName,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[ERROR] Join session failed:', error);
      
      let userFriendlyMessage = `Failed to join session: ${errorMessage}`;
      
      // Provide specific error messages for common issues
      if (errorMessage.includes('127.0.0.1:4000')) {
        userFriendlyMessage = 'JWT server not reachable at 127.0.0.1:4000. Please ensure your JWT server is running.';
      } else if (errorMessage.includes('JWT request failed')) {
        userFriendlyMessage = 'JWT token request failed. Check your JWT server configuration.';
      } else if (errorMessage.includes('Invalid JWT response')) {
        userFriendlyMessage = 'Invalid JWT token received from server. Check server response format.';
      }
      
      setState(prev => ({
        ...prev,
        isConnecting: false,
        isFetchingToken: false,
        error: userFriendlyMessage,
      }));
      throw error;
    }
  }, [state.isInitialized]);

  // Leave the current session
  const leaveSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await safeInvoke('zoom_leave_session');
      setState(prev => ({
        ...prev,
        isInSession: false,
        sessionName: null,
        userName: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: `Failed to leave session: ${errorMessage}`,
      }));
      throw error;
    }
  }, []);

  // Cleanup SDK resources
  const cleanup = useCallback(async () => {
    try {
      await safeInvoke('zoom_cleanup');
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        error: `Cleanup failed: ${errorMessage}`,
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
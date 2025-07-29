export interface ZoomSessionConfig {
  session_name: string;
  user_name: string;
  session_password?: string;
  jwt_token: string;
}

export interface ZoomSDKError {
  code: number;
  message: string;
}

export interface ZoomSDKCommands {
  zoom_initialize: (domain?: string) => Promise<void>;
  zoom_join_session: (config: ZoomSessionConfig) => Promise<void>;
  zoom_leave_session: () => Promise<void>;
  zoom_cleanup: () => Promise<void>;
}

// Extend the global Tauri API
declare global {
  interface Window {
    __TAURI__: {
      tauri: {
        invoke: <T = any>(cmd: keyof ZoomSDKCommands, args?: any) => Promise<T>;
      };
    };
  }
}
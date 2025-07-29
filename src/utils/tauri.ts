// Tauri compatibility utilities for browser debugging

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
};

// Mock Tauri invoke for browser development
export const mockTauriInvoke = async (cmd: string, args?: any): Promise<any> => {
  console.log(`[MOCK] Tauri invoke: ${cmd}`, args);
  
  switch (cmd) {
    case 'zoom_initialize':
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return;
      
    case 'zoom_join_session':
      // Simulate join session delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      return;
      
    case 'zoom_leave_session':
      // Simulate leave session delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
      
    case 'zoom_cleanup':
      // Simulate cleanup
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
      
    case 'open_devtools':
      // Open browser devtools
      if (window.location.hostname === 'localhost') {
        console.log('[MOCK] Opening browser devtools...');
      }
      return;
      
    case 'greet':
      return `Hello, ${args?.name || 'World'}! You've been greeted from Mock Tauri!`;
      
    default:
      throw new Error(`[MOCK] Unknown command: ${cmd}`);
  }
};

// Safe invoke that works in both Tauri and browser environments
export const safeInvoke = async (cmd: string, args?: any): Promise<any> => {
  if (isTauriEnvironment()) {
    // Use real Tauri invoke
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke(cmd, args);
  } else {
    // Use mock invoke for browser development
    return mockTauriInvoke(cmd, args);
  }
};
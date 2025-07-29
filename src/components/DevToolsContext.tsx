import { useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export function DevToolsContext({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleContextMenu = async (e: MouseEvent) => {
      e.preventDefault();
      
      // Create a simple context menu
      const contextMenu = document.createElement('div');
      contextMenu.style.position = 'fixed';
      contextMenu.style.left = `${e.clientX}px`;
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.backgroundColor = 'white';
      contextMenu.style.border = '1px solid #ccc';
      contextMenu.style.borderRadius = '4px';
      contextMenu.style.padding = '8px';
      contextMenu.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      contextMenu.style.zIndex = '10000';
      contextMenu.style.cursor = 'pointer';
      contextMenu.style.fontSize = '14px';
      contextMenu.innerHTML = '🔧 Open Developer Tools';
      
      // Handle click on context menu
      contextMenu.addEventListener('click', async () => {
        try {
          await invoke('open_devtools');
        } catch (error) {
          console.error('Failed to open devtools:', error);
          // Fallback for development
          if (window.location.hostname === 'localhost') {
            // In dev mode, try to open browser devtools
            if (typeof window !== 'undefined' && (window as any).__TAURI__) {
              console.log('Right-clicked! Devtools should open.');
            }
          }
        }
        document.body.removeChild(contextMenu);
      });
      
      // Remove context menu when clicking elsewhere
      const removeMenu = () => {
        if (document.body.contains(contextMenu)) {
          document.body.removeChild(contextMenu);
        }
        document.removeEventListener('click', removeMenu);
      };
      
      document.addEventListener('click', removeMenu);
      document.body.appendChild(contextMenu);
    };
    
    // Add keyboard shortcut for devtools (Cmd/Ctrl + Shift + I)
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        try {
          await invoke('open_devtools');
        } catch (error) {
          console.error('Failed to open devtools via keyboard:', error);
        }
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  return <>{children}</>;
}
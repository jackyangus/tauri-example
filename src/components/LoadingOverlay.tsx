import React from "react";

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  text = "Connecting..." 
}) => {
  if (!isVisible) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100" 
      style={{
        background: "rgba(0,0,0,0.5)",
        zIndex: 9999,
        backdropFilter: "blur(5px)"
      }}
    >
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="text-center text-white">
          <div 
            className="spinner-border mb-3" 
            role="status" 
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>{text}</h5>
        </div>
      </div>
    </div>
  );
};
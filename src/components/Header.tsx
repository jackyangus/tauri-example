import React from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "WebRTC Meeting System",
  subtitle = "Advanced Browser Compatibility Testing & Video Conferencing"
}) => {
  return (
    <div className="header-section">
      <h1>
        <i className="bi bi-camera-video header-icon" />
        {title}
      </h1>
      <p className="subtitle mb-0">{subtitle}</p>
    </div>
  );
};
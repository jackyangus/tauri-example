import React from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Tauri Video Conference",
  subtitle = "Professional video meetings powered by Zoom SDK"
}) => {
  return (
    <div className="text-center py-8 px-4">
      <div className="flex items-center justify-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
          <i className="bi bi-camera-video text-white text-2xl" />
        </div>
        <div className="text-left">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-blue-200/80 text-lg font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
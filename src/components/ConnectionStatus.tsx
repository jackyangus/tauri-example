import React from "react";

export type ConnectionState = "connecting" | "connected" | "disconnected" | "error";

interface ConnectionStatusProps {
  status: string;
  state: ConnectionState;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, state }) => {
  const getIcon = () => {
    switch (state) {
      case "connected":
        return "bi-check-circle-fill";
      case "connecting":
        return "bi-arrow-repeat";
      case "disconnected":
        return "bi-wifi-off";
      case "error":
        return "bi-exclamation-triangle-fill";
      default:
        return "bi-wifi";
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case "connected":
        return "text-green-400 bg-green-500/20 border-green-400/30";
      case "connecting":
        return "text-blue-400 bg-blue-500/20 border-blue-400/30";
      case "disconnected":
        return "text-gray-400 bg-gray-500/20 border-gray-400/30";
      case "error":
        return "text-red-400 bg-red-500/20 border-red-400/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-400/30";
    }
  };

  const getAnimation = () => {
    switch (state) {
      case "connecting":
        return "animate-spin";
      case "connected":
        return "animate-pulse";
      default:
        return "";
    }
  };

  return (
    <div className="text-center">
      <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-2xl backdrop-blur-sm border transition-all duration-300 ${getStatusColor()}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor().split(' ')[1]} ${getAnimation()}`}>
          <i className={`bi ${getIcon()} text-lg`} />
        </div>
        <div className="text-left">
          <div className="font-semibold text-lg">
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </div>
          <div className="text-sm opacity-80">{status}</div>
        </div>
      </div>
    </div>
  );
};
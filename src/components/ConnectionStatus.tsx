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
        return "bi-check-circle";
      case "connecting":
        return "bi-wifi pulse";
      case "disconnected":
        return "bi-wifi-off";
      case "error":
        return "bi-exclamation-circle";
      default:
        return "bi-wifi";
    }
  };

  const getStatusClass = () => {
    return `connection-indicator status-${state} d-inline-flex`;
  };

  return (
    <div className="text-center mb-4">
      <div className={getStatusClass()}>
        <i className={`bi ${getIcon()}`} />
        <span>{status}</span>
      </div>
    </div>
  );
};
import React from "react";

interface StatsData {
  video?: {
    bitrate: string;
    resolution: string;
    fps: string;
    codec: string;
  };
  audio?: {
    bitrate: string;
    codec: string;
  };
  network?: {
    rtt: string;
    jitter: string;
    packetLoss: string;
  };
}

interface ConnectionStatsProps {
  stats: StatsData | null;
}

export const ConnectionStats: React.FC<ConnectionStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="section-card p-4 mb-4">
        <h4 className="mb-3">
          <i className="bi bi-graph-up me-2" />
          Connection Statistics
        </h4>
        <div className="stats-panel p-3">
          <div className="text-muted text-center py-3">
            <i className="bi bi-activity fs-1 opacity-25" />
            <p className="mb-0 mt-2">Connection stats will appear here once connected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-card p-4 mb-4">
      <h4 className="mb-3">
        <i className="bi bi-graph-up me-2" />
        Connection Statistics
      </h4>
      <div className="stats-panel p-3">
        <div className="row">
          {stats.video && (
            <div className="col-md-4">
              <h6 className="text-primary">
                <i className="bi bi-camera-video me-1" />
                Video
              </h6>
              <div className="small">
                <div>Bitrate: {stats.video.bitrate}</div>
                <div>Resolution: {stats.video.resolution}</div>
                <div>FPS: {stats.video.fps}</div>
                <div>Codec: {stats.video.codec}</div>
              </div>
            </div>
          )}
          
          {stats.audio && (
            <div className="col-md-4">
              <h6 className="text-success">
                <i className="bi bi-mic me-1" />
                Audio
              </h6>
              <div className="small">
                <div>Bitrate: {stats.audio.bitrate}</div>
                <div>Codec: {stats.audio.codec}</div>
              </div>
            </div>
          )}
          
          {stats.network && (
            <div className="col-md-4">
              <h6 className="text-warning">
                <i className="bi bi-wifi me-1" />
                Network
              </h6>
              <div className="small">
                <div>RTT: {stats.network.rtt}</div>
                <div>Jitter: {stats.network.jitter}</div>
                <div>Packet Loss: {stats.network.packetLoss}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
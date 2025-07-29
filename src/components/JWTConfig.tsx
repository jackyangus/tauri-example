import { useState } from 'react';
import { JWTTokenRequest } from '../services/jwtService';

export interface JWTConfigProps {
  onConfigChange: (config: Partial<JWTTokenRequest>) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export function JWTConfig({ onConfigChange, isVisible, onToggle }: JWTConfigProps) {
  const [config, setConfig] = useState<Partial<JWTTokenRequest>>({
    role: '1', // Default to participant
    expirationSeconds: 3600,
    geoRegions: ['US'],
    cloudRecordingOption: 0,
    cloudRecordingElection: 0,
    videoWebRtcMode: 0,
    audioCompatibleMode: 0,
    audioWebRtcMode: 0,
  });

  const handleChange = (key: keyof JWTTokenRequest, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleArrayChange = (key: keyof JWTTokenRequest, value: string) => {
    const array = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleChange(key, array);
  };

  if (!isVisible) {
    return (
      <div className="mb-4">
        <button
          onClick={onToggle}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Show Advanced JWT Configuration
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">JWT Configuration</h3>
        <button
          onClick={onToggle}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Hide
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={config.role || '1'}
            onChange={(e) => handleChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="0">Host</option>
            <option value="1">Participant</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration (seconds)
          </label>
          <input
            type="number"
            value={config.expirationSeconds || 3600}
            onChange={(e) => handleChange('expirationSeconds', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Key (optional)
          </label>
          <input
            type="text"
            value={config.sessionKey || ''}
            onChange={(e) => handleChange('sessionKey', e.target.value)}
            placeholder="Leave empty to use session name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geo Regions (comma-separated)
          </label>
          <input
            type="text"
            value={(config.geoRegions || ['US']).join(', ')}
            onChange={(e) => handleArrayChange('geoRegions', e.target.value)}
            placeholder="US, EU, APAC"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cloud Recording Option
          </label>
          <select
            value={config.cloudRecordingOption || 0}
            onChange={(e) => handleChange('cloudRecordingOption', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>No Recording</option>
            <option value={1}>Enable Recording</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cloud Recording Election
          </label>
          <select
            value={config.cloudRecordingElection || 0}
            onChange={(e) => handleChange('cloudRecordingElection', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>No Election</option>
            <option value={1}>Enable Election</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telemetry Tracking ID
          </label>
          <input
            type="text"
            value={config.telemetryTrackingId || ''}
            onChange={(e) => handleChange('telemetryTrackingId', e.target.value)}
            placeholder="Auto-generated if empty"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video WebRTC Mode
          </label>
          <input
            type="number"
            value={config.videoWebRtcMode || 0}
            onChange={(e) => handleChange('videoWebRtcMode', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audio Compatible Mode
          </label>
          <input
            type="number"
            value={config.audioCompatibleMode || 0}
            onChange={(e) => handleChange('audioCompatibleMode', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audio WebRTC Mode
          </label>
          <input
            type="number"
            value={config.audioWebRtcMode || 0}
            onChange={(e) => handleChange('audioWebRtcMode', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings will be sent to your JWT server at 127.0.0.1:4000. 
          Make sure your server is running and configured to handle these parameters.
        </p>
      </div>
    </div>
  );
}
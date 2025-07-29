export interface JWTTokenRequest {
  role: string;
  sessionName: string;
  expirationSeconds: number;
  userIdentity: string;
  sessionKey: string;
  geoRegions: string[];
  cloudRecordingOption: number;
  cloudRecordingElection: number;
  telemetryTrackingId: string;
  videoWebRtcMode: number;
  audioCompatibleMode: number;
  audioWebRtcMode: number;
}

export interface JWTTokenResponse {
  signature: string;
  expires_in?: number;
}

export class JWTService {
  private static readonly JWT_ENDPOINT = 'http://127.0.0.1:4000';

  static async requestJWTToken(request: JWTTokenRequest): Promise<string> {
    console.log(`[JWT] Requesting token from ${this.JWT_ENDPOINT}`, request);
    
    try {
      const response = await fetch(this.JWT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log(`[JWT] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[JWT] Error response:`, errorText);
        throw new Error(`JWT request failed: ${response.status} ${response.statusText}`);
      }

      const data: JWTTokenResponse = await response.json();
      console.log(`[JWT] Response data:`, data);
      
      if (!data.signature) {
        throw new Error('Invalid JWT response: missing token');
      }

      console.log(`[JWT] Token received successfully`);
      return data.signature;
    } catch (error) {
      console.error(`[JWT] Request failed:`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to request JWT token: ${error.message}`);
      }
      throw new Error('Failed to request JWT token: Unknown error');
    }
  }

  static createDefaultRequest(sessionName: string, userIdentity: string): JWTTokenRequest {
    return {
      role: '1', // 0 = host, 1 = participant
      sessionName,
      expirationSeconds: 3600, // 1 hour
      userIdentity,
      sessionKey: sessionName, // Use session name as key by default
      geoRegions: ['US'], // Default to US region
      cloudRecordingOption: 0, // 0 = no recording
      cloudRecordingElection: 0, // 0 = no election
      telemetryTrackingId: `telemetry_${Date.now()}`,
      videoWebRtcMode: 0, // 0 = default
      audioCompatibleMode: 0, // 0 = default
      audioWebRtcMode: 0, // 0 = default
    };
  }
}
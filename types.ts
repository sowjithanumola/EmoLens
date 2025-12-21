
export interface EmotionAnalysis {
  isFaceDetected: boolean;
  primaryEmotion: string;
  secondaryEmotion?: string;
  intensity: number; // 1-10
  explanation: string;
  timestamp: number;
  id: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

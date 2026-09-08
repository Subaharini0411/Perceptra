export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DOMElement {
  id: string;
  type: string;
  label: string;
  text: string;
  role: string;
  placeholder: string;
  bbox: BoundingBox;
  visible: boolean;
  enabled: boolean;
  selector: string;
  ariaLabel?: string;
  inputType?: string;
  href?: string;
  sensitive?: boolean;
}

export interface VisualDetection {
  type: string;
  label: string;
  bbox: [number, number, number, number]; // x, y, w, h
  confidence: number;
}

export interface HybridMatch {
  target: string;
  element: DOMElement;
  visualDetection?: VisualDetection;
  visualScore: number;
  domScore: number;
  textScore: number;
  positionScore: number;
  semanticScore: number;
  hybridScore: number;
}

export interface TaskIntent {
  intent: string;
  target: string;
  value?: string;
  extra?: Record<string, any>;
}

export interface PlannedAction {
  action: string;
  target: string;
  value?: string;
  selector?: string;
  coordinates?: { x: number; y: number };
  confidence?: number;
  reason?: string;
}

export interface ActionResult {
  success: boolean;
  action: string;
  target: string;
  confidence: number;
  error?: string;
  timestamp: string;
  duration: number;
}

export interface VerificationResult {
  success: boolean;
  method: string;
  expected: string;
  actual?: string;
  confidence: number;
  message: string;
}

export interface PIIDetection {
  type: string;
  value: string;
  redacted: string;
  location: 'dom' | 'text' | 'visual';
  selector?: string;
}

export interface PrivacyReport {
  sensitiveDetected: number;
  redacted: number;
  rawSensitiveDataTransmitted: number;
  detections: PIIDetection[];
}

export interface ScreenshotInfo {
  path: string;
  width: number;
  height: number;
  timestamp: string;
  base64?: string;
}

export interface TaskRecord {
  id: string;
  task: string;
  status: 'SUCCESS' | 'FAILED' | 'STOPPED' | 'RUNNING';
  confidence: number;
  actions: number;
  retries: number;
  latency: number;
  privacyRedactions: number;
  timestamp: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  step: string;
  status: 'pending' | 'active' | 'done' | 'error';
  message: string;
  timestamp: string;
  data?: any;
}

export interface BenchmarkResult {
  perceptionLatency: number;
  domExtractionLatency: number;
  hybridMatchingLatency: number;
  plannerLatency: number;
  actionLatency: number;
  verificationLatency: number;
  endToEndLatency: number;
  p50: number;
  p95: number;
  taskSuccessRate: number;
  recoveryRate: number;
  averageConfidence: number;
  sampleSize: number;
  timestamp: string;
}

export interface AgentSettings {
  inferenceMode: 'CPU' | 'GPU';
  visionEngine: 'LocalDemoVisionEngine' | 'ONNXVisionEngine';
  confidenceThreshold: number;
  maxRetries: number;
  autoRetry: boolean;
  sensitiveActionConfirmation: boolean;
  offlineMode: boolean;
  cvOverlay: boolean;
}

export interface IntegrationTool {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon identifier or svg path
  category: 'google' | 'comms' | 'payment' | 'automation';
  authType: 'oauth' | 'api_key' | 'webhook';
  defaultSettings: Record<string, any>;
  tools: IntegrationTool[];
}

export interface IntegrationState {
  id: string;
  provider: string;
  status: 'disconnected' | 'connected' | 'error';
  accountEmail: string | null;
  maskedToken?: string;
  settings: Record<string, any>;
  allowedTools: string[];
  errorMessage: string | null;
  lastSyncAt: string | null;
}

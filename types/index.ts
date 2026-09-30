export type CampaignType =
  | 'Newsletter'
  | 'Promotion'
  | 'Product Update'
  | 'Event'
  | 'Transactional'
  | 'Other';

export type CampaignStatus = 'Active' | 'Completed';

export interface Campaign {
  id: string;
  name: string;
  subjectLine: string;
  type: CampaignType;
  audience: string;
  emailsSent: number;
  emailsDelivered: number;
  emailsOpened: number;
  emailsClicked: number;
  conversions: number;
  emailsBounced: number;
  date: string; // ISO date string YYYY-MM-DD
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignMetrics {
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  conversionRate: number;
  bounceRate: number;
}

export interface UserProfile {
  name: string;
  email: string;
  defaultAudience: string;
  preferredCampaignType: CampaignType;
}

export interface AppSettings {
  theme: 'light' | 'dark';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export type MetricThreshold = 'strong' | 'warning' | 'weak' | 'neutral';

export interface MetricEvaluation {
  label: string;
  value: number;
  formatted: string;
  threshold: MetricThreshold;
  description: string;
}

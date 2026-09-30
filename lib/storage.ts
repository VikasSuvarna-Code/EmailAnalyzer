import { Campaign, UserProfile, AppSettings } from '@/types';
import { MOCK_CAMPAIGNS, DEFAULT_PROFILE } from '@/data/mockCampaigns';

const CAMPAIGNS_KEY = 'eca_campaigns';
const PROFILE_KEY = 'eca_profile';
const SETTINGS_KEY = 'eca_settings';
const INITIALIZED_KEY = 'eca_initialized';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getCampaigns(): Campaign[] {
  if (!isBrowser()) return [];
  try {
    // Seed mock data on first run
    if (!localStorage.getItem(INITIALIZED_KEY)) {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(MOCK_CAMPAIGNS));
      localStorage.setItem(INITIALIZED_KEY, 'true');
    }
    const raw = localStorage.getItem(CAMPAIGNS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCampaigns(campaigns: Campaign[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(campaigns));
  } catch {
    // storage full or unavailable — silent fail
  }
}

export function getProfile(): UserProfile {
  if (!isBrowser()) return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {}
}

export function getSettings(): AppSettings {
  if (!isBrowser()) return { theme: 'light' };
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { theme: 'light' };
  } catch {
    return { theme: 'light' };
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

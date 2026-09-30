'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Campaign, UserProfile, AppSettings } from '@/types';
import {
  getCampaigns,
  saveCampaigns,
  getProfile,
  saveProfile,
  getSettings,
  saveSettings,
  generateId,
} from '@/lib/storage';

// ─── State ───────────────────────────────────────────────────────────────────

interface AppState {
  campaigns: Campaign[];
  profile: UserProfile;
  settings: AppSettings;
  hydrated: boolean;
}

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'ADD_CAMPAIGN'; payload: Campaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_SETTINGS'; payload: AppSettings };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.payload };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.filter(c => c.id !== action.payload),
      };
    case 'TOGGLE_COMPLETE':
      return {
        ...state,
        campaigns: state.campaigns.map(c =>
          c.id === action.payload
            ? { ...c, isCompleted: !c.isCompleted, updatedAt: new Date().toISOString() }
            : c
        ),
      };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  addCampaign: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCampaign: (campaign: Campaign) => void;
  deleteCampaign: (id: string) => void;
  toggleComplete: (id: string) => void;
  updateProfile: (profile: UserProfile) => void;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    campaigns: [],
    profile: { name: '', email: '', defaultAudience: '', preferredCampaignType: 'Newsletter' },
    settings: { theme: 'light' },
    hydrated: false,
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    dispatch({
      type: 'HYDRATE',
      payload: {
        campaigns: getCampaigns(),
        profile: getProfile(),
        settings: getSettings(),
        hydrated: true,
      },
    });
  }, []);

  // Persist campaigns whenever they change (after hydration)
  useEffect(() => {
    if (state.hydrated) saveCampaigns(state.campaigns);
  }, [state.campaigns, state.hydrated]);

  // Apply theme class to <html>
  useEffect(() => {
    if (!state.hydrated) return;
    const html = document.documentElement;
    if (state.settings.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    saveSettings(state.settings);
  }, [state.settings, state.hydrated]);

  const addCampaign = useCallback((data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const campaign: Campaign = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    dispatch({ type: 'ADD_CAMPAIGN', payload: campaign });
  }, []);

  const updateCampaign = useCallback((campaign: Campaign) => {
    dispatch({ type: 'UPDATE_CAMPAIGN', payload: { ...campaign, updatedAt: new Date().toISOString() } });
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CAMPAIGN', payload: id });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
  }, []);

  const updateProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    saveProfile(profile);
  }, []);

  const updateSettings = useCallback((settings: AppSettings) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  return (
    <AppContext.Provider value={{ state, addCampaign, updateCampaign, deleteCampaign, toggleComplete, updateProfile, updateSettings }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsState {
  emailNotifications: boolean;
  desktopAlerts: boolean;
  weeklyReports: boolean;
  smsUpdates: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
}

interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  saveSettings: () => Promise<void>;
  resetSettings: () => void;
}

const defaultSettings: SettingsState = {
  emailNotifications: true,
  desktopAlerts: true,
  weeklyReports: false,
  smsUpdates: false,
  theme: 'light',
  language: 'en'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('axisSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('axisSettings', JSON.stringify(settings));
      
      // In production, you would also save to API:
      // await axios.post('/api/settings', settings);
      
      console.log('Settings saved successfully:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('axisSettings');
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, saveSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}


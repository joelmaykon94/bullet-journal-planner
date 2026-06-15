import { createContext, useContext, ReactNode, useState } from 'react';
import { BujoItem, BujoSettings, Collection } from '../types';

export interface BujoContextType {
  items: BujoItem[];
  setItems: React.Dispatch<React.SetStateAction<BujoItem[]>>;
  settings: BujoSettings;
  setSettings: React.Dispatch<React.SetStateAction<BujoSettings>>;
  collections: any[];
  setCollections: React.Dispatch<React.SetStateAction<any[]>>;
  activeTab: 'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections';
  setActiveTab: React.Dispatch<React.SetStateAction<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections'>>;
}

const BujoContext = createContext<BujoContextType | undefined>(undefined);

export function BujoProvider({ children }: { children: ReactNode }) {
  // Skeleton state placeholders that will be fully implemented in subsequent phases
  const [items, setItems] = useState<BujoItem[]>([]);
  const [settings, setSettings] = useState<BujoSettings>({
    theme: 'dark',
    font: 'mono',
    highlightColor: '#E08E45',
    accentColor: '#4A7C6C',
    firstTime: true
  });
  const [collections, setCollections] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'indice' | 'daily_log' | 'weekly_log' | 'monthly_log' | 'daily_spread' | 'future_log' | 'brain_dump' | 'settings' | 'collections'>('indice');

  return (
    <BujoContext.Provider value={{
      items,
      setItems,
      settings,
      setSettings,
      collections,
      setCollections,
      activeTab,
      setActiveTab
    }}>
      {children}
    </BujoContext.Provider>
  );
}

export function useBujo() {
  const context = useContext(BujoContext);
  if (context === undefined) {
    throw new Error('useBujo must be used within a BujoProvider');
  }
  return context;
}

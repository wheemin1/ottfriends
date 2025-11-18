import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserConfig {
  persona: '다정한 친구' | '츤데레 친구';
  ottFilters: string[];
  seenListTmdbIds: number[];
  tasteProfileTitles: string[];
  isPremium: boolean;
  quotas: {
    recommendations: { used: number; total: number };
    chats: { used: number; total: number };
  };
}

interface UserConfigContextType {
  config: UserConfig;
  setPersona: (persona: UserConfig['persona']) => void;
  setOttFilters: (filters: string[]) => void;
  addSeenMovie: (tmdbId: number) => void;
  removeSeenMovie: (tmdbId: number) => void;
  addTasteProfile: (title: string) => void;
  updateQuotas: (quotas: UserConfig['quotas']) => void;
}

const defaultConfig: UserConfig = {
  persona: '다정한 친구',
  ottFilters: ['netflix', 'disney'],
  seenListTmdbIds: [],
  tasteProfileTitles: [],
  isPremium: false,
  quotas: {
    recommendations: { used: 0, total: 3 },
    chats: { used: 0, total: 50 },
  },
};

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export function UserConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<UserConfig>(() => {
    // localStorage에서 초기값 로드
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ottFriendConfig');
      if (saved) {
        try {
          return { ...defaultConfig, ...JSON.parse(saved) };
        } catch (e) {
          console.error('localStorage 파싱 오류:', e);
        }
      }
    }
    return defaultConfig;
  });

  // config 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ottFriendConfig', JSON.stringify(config));
    }
  }, [config]);

  const setPersona = (persona: UserConfig['persona']) => {
    setConfig(prev => ({ ...prev, persona }));
  };

  const setOttFilters = (filters: string[]) => {
    setConfig(prev => ({ ...prev, ottFilters: filters }));
  };

  const addSeenMovie = (tmdbId: number) => {
    setConfig(prev => ({
      ...prev,
      seenListTmdbIds: prev.seenListTmdbIds.includes(tmdbId) 
        ? prev.seenListTmdbIds 
        : [...prev.seenListTmdbIds, tmdbId],
    }));
  };

  const removeSeenMovie = (tmdbId: number) => {
    setConfig(prev => ({
      ...prev,
      seenListTmdbIds: prev.seenListTmdbIds.filter(id => id !== tmdbId),
    }));
  };

  const addTasteProfile = (title: string) => {
    setConfig(prev => ({
      ...prev,
      tasteProfileTitles: prev.tasteProfileTitles.includes(title)
        ? prev.tasteProfileTitles
        : [...prev.tasteProfileTitles, title],
    }));
  };

  const updateQuotas = (quotas: UserConfig['quotas']) => {
    setConfig(prev => ({ ...prev, quotas }));
  };

  return (
    <UserConfigContext.Provider
      value={{
        config,
        setPersona,
        setOttFilters,
        addSeenMovie,
        removeSeenMovie,
        addTasteProfile,
        updateQuotas,
      }}
    >
      {children}
    </UserConfigContext.Provider>
  );
}

export function useUserConfig() {
  const context = useContext(UserConfigContext);
  if (!context) {
    throw new Error('useUserConfig must be used within UserConfigProvider');
  }
  return context;
}

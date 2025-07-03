import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Application } from '../api/types';
import * as appApi from '../api/app';

interface AppContextType {
  applications: Application[];
  selectedApp: Application | null;
  selectApp: (app: Application | null) => void;
  refreshApplications: (newlyChangedId?: string) => Promise<void>;
  addApplication: (app: Application) => void;
  removeApplication: (appId: string) => void;
  // MODIFIED: Add a function to update a single application
  updateApplication: (app: Application) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshApplications = useCallback(async (newlyChangedId?: string) => {
    setLoading(true);
    try {
      const pageData = await appApi.searchApplications({ page: 1, pageSize: 100, newlyChangedId });
      setApplications(pageData.items);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshApplications();
  }, [refreshApplications]);
  
  const selectAppHandler = (app: Application | null) => {
    setSelectedApp(app);
  };
  
  const addApplication = (app: Application) => {
    setApplications(prevApps => [app, ...prevApps]);
  };

  const removeApplication = (appId: string) => {
    setApplications(prevApps => prevApps.filter(app => app.id !== appId));
  };
  
  // MODIFIED: Implement the function to update an application in the list
  const updateApplication = (updatedApp: Application) => {
    setApplications(prevApps => 
      prevApps.map(app => (app.id === updatedApp.id ? updatedApp : app))
    );
  };


  return (
    <AppContext.Provider value={{ 
      applications, 
      selectedApp, 
      selectApp: selectAppHandler, 
      refreshApplications, 
      addApplication, 
      removeApplication, 
      updateApplication,
      loading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApps = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApps must be used within an AppProvider');
  }
  return context;
};
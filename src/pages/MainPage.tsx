// src/pages/MainPage.tsx
import React from 'react';
import { AppProvider } from '../contexts/AppContext';
import { ApplicationSidebar } from '../components/ApplicationSidebar';
import { ChatInterface } from '../components/ChatInterface';

export const MainPage = () => {
  return (
    <AppProvider>
      <div className="main-layout">
        <ApplicationSidebar />
        <ChatInterface />
      </div>
    </AppProvider>
  );
};
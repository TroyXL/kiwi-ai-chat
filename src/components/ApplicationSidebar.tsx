import React, { useState } from 'react';
import { useApps } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import * as appApi from '../api/app';
import { Application } from '../api/types';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import { useTranslation } from 'react-i18next';

export const ApplicationSidebar = () => {
  const { t } = useTranslation();
  const { applications, selectedApp, selectApp, removeApplication, loading } = useApps();
  const { logout } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<Application | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, app: Application) => {
    e.stopPropagation(); 
    setAppToDelete(app);
    setIsModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!appToDelete) return;

    try {
      await appApi.deleteApplication(appToDelete.id);
      
      if (selectedApp?.id === appToDelete.id) {
        selectApp(null);
      }
      removeApplication(appToDelete.id);
    } catch (error: any) {
      console.error("Failed to delete application:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsModalOpen(false);
      setAppToDelete(null);
    }
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <button className="new-app-btn" onClick={() => selectApp(null)}>
            {t('sidebar.newApp')}
          </button>
        </div>
        <div className="app-list-container">
          {loading ? (
             <div style={{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}><Spinner /></div>
          ) : applications.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--gpt-text-secondary)'}}>{t('sidebar.noApps')}</p>
          ) : (
            <ul className="app-list">
              {applications.map(app => (
                <li
                  key={app.id}
                  className={`app-list-item ${selectedApp?.id === app.id ? 'selected' : ''}`}
                  onClick={() => selectApp(app)}
                >
                  <span>{app.name}</span>
                  <button 
                    className="delete-app-btn"
                    title={`Delete ${app.name}`}
                    onClick={(e) => handleDeleteClick(e, app)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">{t('sidebar.logout')}</button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title={t('sidebar.deleteTitle')}
        confirmButtonText={t('sidebar.deleteConfirmButton')}
        cancelButtonText={t('common.cancel')}
        confirmButtonClass="delete"
      >
        <p>
          {t('sidebar.deleteConfirmMessage', { appName: appToDelete?.name })}
        </p>
      </Modal>
    </>
  );
};
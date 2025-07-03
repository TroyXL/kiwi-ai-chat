import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Add a specific CSS style for the wrapper to maintain centering
const switchModeStyle: React.CSSProperties = {
  marginTop: '1.5rem',
  textAlign: 'center'
};

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login, register, isAuthenticated } = useAuth();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLoginMode && password !== confirmPassword) {
      setError(t('login.errorPasswordsDontMatch'));
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        await login(userName, password);
      } else {
        await register(userName, password);
        alert(t('login.registerSuccess'));
      }
    } catch (err: any) {
      setError(err.message || (isLoginMode ? t('login.error') : 'Failed to register'));
    } finally {
      setLoading(false);
    }
  };
  
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUserName('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isLoginMode ? t('login.title') : t('login.registerTitle')}</h2>
        
        <div className="form-group">
          <label htmlFor="username">{t('login.usernameLabel')}</label>
          <input
            id="username"
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{t('login.passwordLabel')}</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        {!isLoginMode && (
          <div className="form-group">
            <label htmlFor="confirm-password">{t('login.confirmPasswordLabel')}</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        
        {error && <p className="error-message" style={{color: '#ff8c8c', marginBottom: '1rem'}}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading 
            ? (isLoginMode ? t('login.buttonLoading') : t('login.registerButtonLoading'))
            : (isLoginMode ? t('login.button') : t('login.registerButton'))
          }
        </button>

        <div style={switchModeStyle}>
          <button type="button" onClick={toggleMode} className="link-button">
            {isLoginMode ? t('login.switch_to_register') : t('login.switch_to_login')}
          </button>
        </div>

      </form>
    </div>
  );
};
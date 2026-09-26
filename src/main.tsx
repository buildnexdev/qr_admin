import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import { logout } from './store/authSlice';
import { AppProviders } from '@/providers/AppProviders';
import '@/styles/globals.css';
import App from './App';
import axios from 'axios';

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')?.trim();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const sentBearer = Boolean(error.config?.headers?.Authorization);
    if (sentBearer) {
      store.dispatch(logout());
      const path = window.location.pathname;
      if (path !== '/' && !path.startsWith('/forgot-password')) {
        window.location.assign('/');
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AppProviders>
          <App />
        </AppProviders>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

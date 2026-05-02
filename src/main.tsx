import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import { logout } from './store/authSlice'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')?.trim();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

/** Invalid/expired JWT: server returns 401 with "Invalid token". Clear session if we sent Bearer auth. */
axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const sentBearer = Boolean(error.config?.headers?.Authorization);
    if (sentBearer) {
      store.dispatch(logout());
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)

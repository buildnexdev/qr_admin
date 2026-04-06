import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import { contentRouters } from './router/contentRouters';
import './App.css';
import './styles/common.scss';

function App() {
  const routes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    ...contentRouters,
    { path: '*', element: <Navigate to="/" replace /> }
  ];

  const element = useRoutes(routes);

  return <>{element}</>;
}

export default App;

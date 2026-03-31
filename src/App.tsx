import { useRoutes, Navigate, type RouteObject } from 'react-router-dom';
import Login from './pages/Login';
import { contentRouters } from './router/contentRouters';
import './App.css';

function App() {
  const routes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    ...contentRouters,
    { path: '*', element: <Navigate to="/" replace /> }
  ];

  const element = useRoutes(routes);

  return <>{element}</>;
}

export default App;

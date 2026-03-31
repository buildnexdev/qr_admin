import { type RouteObject } from 'react-router-dom';
import DefaultLayout from '../components/layout/DefaultLayout';

import Dashboard from '../pages/Dashboard';
import Staff from '../pages/Staff';
import Categories from '../pages/Categories';
import Menu from '../pages/Menu';
import Tables from '../pages/Tables';
import Kitchen from '../pages/Kitchen';
import Orders from '../pages/Orders';
import Bills from '../pages/Bills';
import Stocks from '../pages/Stocks';
import Reports from '../pages/Reports';

export const contentRouters: RouteObject[] = [
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'staff', element: <Staff /> },
      { path: 'categories', element: <Categories /> },
      { path: 'menu', element: <Menu /> },
      { path: 'tables', element: <Tables /> },
      { path: 'kitchen', element: <Kitchen /> },
      { path: 'orders', element: <Orders /> },
      { path: 'bills', element: <Bills /> },
      { path: 'stocks', element: <Stocks /> },
      { path: 'reports', element: <Reports /> }
    ]
  }
];

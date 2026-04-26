import { type RouteObject } from 'react-router-dom';
import DefaultLayout from '../components/layout/DefaultLayout';

import Dashboard from '../pages/Dashboard/Dashboard';
import Staff from '../pages/Staff/StaffDetailsPages';
import Branch from '../pages/Branch/Branch';
import Categories from '../pages/Categories/Categories';
import Menu from '../pages/Menu/Menu';
import Tables from '../pages/Tables/Tables';
import Kitchen from '../pages/Kitchen/Kitchen';
import Orders from '../pages/Orders/Orders';
import Bills from '../pages/Bill/Bills';
import Stocks from '../pages/Stocks/Stocks';
import Reports from '../pages/Reports/Reports';
import Profile from '../pages/Profile/Profile';

export const contentRouters: RouteObject[] = [
  {
    path: '/admin',
    element: <DefaultLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'staff', element: <Staff /> },
      { path: 'branch', element: <Branch /> },
      { path: 'categories', element: <Categories /> },
      { path: 'menu', element: <Menu /> },
      { path: 'tables', element: <Tables /> },
      { path: 'kitchen', element: <Kitchen /> },
      { path: 'orders', element: <Orders /> },
      { path: 'bills', element: <Bills /> },
      { path: 'stocks', element: <Stocks /> },
      { path: 'reports', element: <Reports /> },
      { path: 'profile', element: <Profile /> }
    ]
  }
];

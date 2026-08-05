import type { RouteObject } from 'react-router-dom';
import NammaQrFacitAside from '../pages/_layout/_asides/NammaQrFacitAside';

const asides: RouteObject[] = [
  { path: '/login', element: null },
  { path: '/register', element: null },
  { path: '/', element: null },
  { path: '*', element: <NammaQrFacitAside /> },
];

export default asides;

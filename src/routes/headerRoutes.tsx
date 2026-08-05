import type { RouteObject } from 'react-router-dom';
import NammaQrFacitHeader from '../pages/_layout/_headers/NammaQrFacitHeader';

const headers: RouteObject[] = [
  { path: '/login', element: null },
  { path: '/register', element: null },
  { path: '/', element: null },
  { path: '*', element: <NammaQrFacitHeader /> },
];

export default headers;

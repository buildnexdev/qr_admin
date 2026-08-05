import type { RouteObject } from 'react-router-dom';
import NammaQrFacitFooter from '../pages/_layout/_footers/NammaQrFacitFooter';

const footers: RouteObject[] = [
  { path: '/login', element: null },
  { path: '/register', element: null },
  { path: '/', element: null },
  { path: '*', element: <NammaQrFacitFooter /> },
];

export default footers;

import { createBrowserRouter } from 'react-router-dom';
import MiseEnPage from '../components/MiseEnPage';
import FicheStationPage from '../pages/FicheStationPage';
import NotFoundPage from '../pages/NotFoundPage';
import RecherchePage from '../pages/RecherchePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MiseEnPage />,
    children: [
      { index: true, element: <RecherchePage /> },
      { path: 'stations/:id', element: <FicheStationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
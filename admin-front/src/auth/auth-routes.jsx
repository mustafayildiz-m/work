import { BrandedLayout } from './layouts/branded';
import { SignInPage } from './pages/signin-page';

// Define the auth routes
export const authRoutes = [
  {
    path: '',
    element: <BrandedLayout />,
    children: [
      {
        path: 'signin',
        element: <SignInPage />,
      }
    ],
  }
];

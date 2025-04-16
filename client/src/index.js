import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home/Home';
import Account from './pages/Account/Account';
import Tree from './pages/Tree/Tree';
import Login from './pages/Login/Login';
import Family from './pages/Family/Family';
import ShareTree from './pages/Tree/ShareTree/ShareTree';
import ViewSharedTrees from './pages/Tree/ViewSharedTrees/ViewSharedTrees';
import Dashboard from './components/UserActivityDash';
import WebsiteSettings from './pages/WebsiteSettings/WebsiteSettings';

// creates pages for different paths - buttons should be links to the paths and then the components will populate
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/account',
    element: <Account />,
  },
  {
    path: '/account/:id',
    element: <Account />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/tree',
    element: <Tree />,
    children: [
      {
        path: 'viewsharedtrees',
        element: <ViewSharedTrees />
      },
      {
        path: 'sharetree',
        element: <ShareTree />
      }
    ]
  },
  {
    path: '/family',
    element: <Family />
  },
  {
    path: '/useractivitydash',
    element: <Dashboard />
  },
  {
    path: '/websitesettings',
    element: <WebsiteSettings />
  }
  
]) 


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
);





// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

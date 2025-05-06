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
import Dashboard from './components/UserActivityDashboard/UserActivityDash';
import WebsiteSettings from './pages/WebsiteSettings/WebsiteSettings';
import Register from './pages/Register/Register';
import { CurrentUserProvider } from './CurrentUserProvider';
import Help from './pages/Help/Help';
import Chat from './pages/Chat/Chat';
import ViewSharedTree from './pages/ViewSharedTree/ViewSharedTree';
import CreateAccount from './pages/CreateAccount/CreateAccount';

// creates pages for different paths - buttons should be links to the paths and then the components will populate
const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
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
    element: <CreateAccount />,
  },
  {
    path: '/tree',
    element: <Tree />,
    children: [
      {
        path: '/tree/viewsharedtrees',
        element: <ViewSharedTrees />
      },
      {
        path: '/tree/sharetree',
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
  },
  {
    path: '/help',
    element: <Help />
  },
  {
    path: '/chat',
    element: <Chat />
  },
  {
    path: '/sharedtree/:id',
    element: <ViewSharedTree />,
  },
  {
    path: '*',
    element: <Home />,
    loader: () => {
      window.location.pathname = '/';
      return null;
    },
  }
  
]) 


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <CurrentUserProvider>
  <React.StrictMode>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </React.StrictMode>
  </CurrentUserProvider>
);





// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

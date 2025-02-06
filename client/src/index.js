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
    path: '/login',
    element: <Login />,
  },
  {
    path: '/tree',
    element: <Tree />,
  },
  {
    path: '/sharetree',
    element: <ShareTree />
  },
  {
    path: '/viewsharedtrees',
    element: <ViewSharedTrees />
  },
  {
    path: '/family',
    element: <Family />
  },
  
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

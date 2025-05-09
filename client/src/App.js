import logo from './assets/kintreelogo-adobe.png';
import './App.css';
import NavBar from './components/NavBar/NavBar';
import Account from './pages/Account/Account';
import Family from './pages/Family/Family';
import Home from './pages/Home/Home';
import Tree from './pages/Tree/Tree';
import ShareTree from './pages/Tree/ShareTree/ShareTree';
import ViewSharedTrees from './pages/Tree/ViewSharedTrees/ViewSharedTrees';
import { Outlet } from 'react-router-dom';
//ToDo: Import a file for app settings, help, and chat page
//ToDo: Add routes for app settings, help, and chat page
import { CurrentUserProvider } from './CurrentUserProvider';

function App() {
  return (
    <CurrentUserProvider>
      <div className={"App font-face-alata"}>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {/* sample web page, doesn't show anymore bc of router */}
          <div className="Container">
            <p>
              Welcome to KinTree! This is the client side of the application. It's in progress.
            </p>
          </div>
          <a
            className="App-link"
            href="https://github.com/OwenAdams2023/SeniorProject_KinTree"
            target="_blank"
            rel="noopener noreferrer"
          >
            Github Repository
          </a>
        </header>
        <Outlet />
      </div>
    </CurrentUserProvider>
  );
}

export default App;

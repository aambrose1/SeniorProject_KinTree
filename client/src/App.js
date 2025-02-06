import logo from './assets/kintreelogo-adobe.png';
import './App.css';
import { Router, Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Account from './pages/Account/Account';
import Family from './pages/Family/Family';
import Home from './pages/Home/Home';
import Tree from './pages/Tree/Tree';
import ShareTree from './pages/Tree/ShareTree/ShareTree';
import ViewSharedTrees from './pages/Tree/ViewSharedTrees/ViewSharedTrees';
//ToDo: Import a file for app settings, help, and chat page
//ToDo: Add routes for app settings, help, and chat page

function App() {
  return (
    <div className={"App font-face-alata"}>
      <Router>
        <NavBar />
          <Routes>
            <Route path="/account" element={<Account />} />
            <Route path="/" element={<Home />} />
            <Route path="/family" element={<Family />} />
            <Route path="/tree" element={<Tree />}>
              <Route path="share_tree" element={<ShareTree />} />
              <Route path="view_shared_trees" element={<ViewSharedTrees />} />
            </Route>
          </Routes>
      </Router>
    </div>
  );
}

export default App;

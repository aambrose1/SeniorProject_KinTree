import logo from './assets/kintreelogo-adobe.png';
import './App.css';
import { Routes, Route, Outlet } from 'react-router-dom';
import NavBar from './components/NavBar/NavBar';
import Home from './pages/Home/Home';

function App() {
  return (
    <div className={"App font-face-alata"}>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
      </Routes>
      <Outlet />
    </div>
  );
}

export default App;

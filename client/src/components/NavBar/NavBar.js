import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';
//import * as styles from './styles';

function NavBar() {
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <NavLink to="/profile" className="profile-icon">
                        <img src=""></img>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" exact className="nav-item"> Home </NavLink>
                </li>
                <li>
                    <NavLink to="/family" className="nav-item"> Family </NavLink>
                </li>
                <li>
                    <NavLink to="/tree" className="nav-item"> Tree </NavLink>
                </li>
                <li>
                    <NavLink to="/chat" className="nav-item"> Chat </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai'; //this is for the settings icon and help icon
import './NavBar.css';
//import * as styles from './styles';

function NavBar() {
    return (
        <nav className="navbar">
            <ul className="nav-options-list">
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
            <AiOutlineSetting>
                <NavLink to="/account_settings"></NavLink>
            </AiOutlineSetting>
            <AiOutlineQuestion>
                <NavLink to="/help"></NavLink>
            </AiOutlineQuestion>
            

        </nav>
    );
};

export default NavBar;
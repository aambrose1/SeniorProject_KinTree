import React from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai'; //this is for the settings icon and help icon
import './NavBar.css';
//import * as styles from './styles';

//ToDo: Add mobile version of navbar (collapsible)
//ToDo: Figure out importing of user profile image
function NavBar() {
    return (
        <nav className="navbar">
            <ul className="nav-options-list">
                <li>
                    <NavLink to="/account" className="profile-icon">
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
                    <ul className="nested-nav-options-list">
                        <li>
                            <NavLink to="/tree/share_tree" className="nav-item-nested"> Share Tree </NavLink>
                        </li>
                        <li>
                            <NavLink to="/tree/view_shared_trees" className="nav-item-nested"> View Shared Trees </NavLink>
                        </li>
                    </ul>
                </li>
                <li>
                    <NavLink to="/chat" className="nav-item"> Chat </NavLink>
                </li>
                
            </ul>
            <AiOutlineSetting className="settings-icon">
                <NavLink to="/account_settings"></NavLink>
            </AiOutlineSetting>
            <AiOutlineQuestion className="help-icon">
                <NavLink to="/help"></NavLink>
            </AiOutlineQuestion>
            

        </nav>
    );
};

export default NavBar;
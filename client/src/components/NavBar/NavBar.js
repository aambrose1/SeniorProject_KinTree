import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai'; //this is for the settings icon and help icon
import './NavBar.css';
//import * as styles from './styles';

//ToDo: Add mobile version of navbar (collapsible)
//ToDo: Figure out importing of user profile image
function NavBar() {
//useState used here for showing nested nav within the tree option
    const [showNestedNav, setShowNestedNav] = useState(false);

    return (
        <nav className="navbar">
            <ul className="nav-options-list">
                
                <NavLink to="/account" className="nav-item"> Account </NavLink>
                <br></br>
                <NavLink to="/" exact className="nav-item"> Home </NavLink>
                <br></br>
                <NavLink to="/family" className="nav-item"> Family </NavLink>
                <br></br>
                {/* <NavLink to="/tree" className="nav-item"> Tree </NavLink> */}
                <div className="nav-item" onMouseEnter={() => setShowNestedNav(true)} onMouseLeave={() => setShowNestedNav(false)}>
                    <div className="tree-navlist">
                        <span className="tree-option">Tree</span>
                        {showNestedNav && (
                            <div className="nested-nav-options-list">
                                <NavLink to="/tree/sharetree" className="nav-item-nested"> Share Tree </NavLink>
                                <br></br>
                                <NavLink to="/tree/viewsharedtrees" className="nav-item-nested"> View Shared Trees </NavLink>
                            </div>
                        )}
                    </div>
                </div>
                <NavLink to="/chat" className="nav-item"> Chat </NavLink>
               
                
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
import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai'; //this is for the settings icon and help icon
import './NavBar.css';

//ToDO: import * as styles from './styles';
//ToDo: Add mobile version of navbar (collapsible)
//ToDo: Figure out importing of user profile image
function NavBar() {
//useState used here for showing nested nav within the tree option
    const [showNestedNav, setShowNestedNav] = useState(false);

    return (
        <nav className="navbar">
            <ul className="nav-options-list">
                
                <NavLink to="/account" exact 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Account 
                </NavLink>
                <br></br>
                <NavLink to="/" exact 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Home 
                </NavLink>
                <br></br>
                <NavLink to="/family" exact 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"}  
                    onClick={() => setShowNestedNav(false)}> 
                    Family 
                </NavLink>
                <br></br>
                {/* <NavLink to="/tree" className="nav-item"> Tree </NavLink> */}
                <NavLink to="/tree" exact 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"}
                    onMouseEnter={() => setShowNestedNav(true)} onMouseLeave={() => setShowNestedNav(false)}
                    onClick={() => setShowNestedNav(true)}>
                        Tree
                        {showNestedNav && (
                            <div className="nested-navbar">
                                    
                                <div>
                                    <NavLink to="/tree/sharetree" 
                                        className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                        onClick={() => setShowNestedNav(true)}> 
                                        Share Tree
                                    </NavLink>
                                    <br></br>
                                    <NavLink to="/tree/viewsharedtrees" 
                                        className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                        onClick={() => setShowNestedNav(true)}> 
                                        View Shared Trees 
                                    </NavLink>
                                </div>
                                
                            </div>
                        )}
                    
                    
                </NavLink>
                <br/>
                <NavLink to="/chat" className="nav-item"> Chat </NavLink>
                
            </ul>
            <div className="settings-and-help">
                <NavLink to="/websitesettings" >
                    <AiOutlineSetting className="settings-icon"></AiOutlineSetting>
                </NavLink>
                <NavLink to="/help">
                    <AiOutlineQuestion className="help-icon"></AiOutlineQuestion>
                </NavLink>
            </div>

        </nav>
    );
};

export default NavBar;
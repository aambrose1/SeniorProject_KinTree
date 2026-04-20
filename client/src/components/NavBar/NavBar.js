import React from 'react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai'; //this is for the settings icon and help icon
import './NavBar.css';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context
import logo from '../../assets/kintreelogo-adobe.png';

//ToDO: import * as styles from './styles';
//ToDo: Add mobile version of navbar (collapsible)
//ToDo: Figure out importing of user profile image
function NavBar() {
//useState used here for showing nested nav within the tree option
    const [showNestedNav, setShowNestedNav] = useState(false);
    const { currentAccountID } = useCurrentUser(); // get the current user ID from context
    const { id } = useParams();

    return (
        <nav className="navbar">
            <div className="nav-header">
                <img src={logo} className="nav-logo-img" alt="KinTree Logo" />
                <div className="nav-logo-text">KinTree</div>
            </div>
            
            <ul className="nav-options-list">
                <li>
                    <NavLink to="/account" 
                        className={({isActive}) => {
                            const isOwnAccount = !id || Number(id) === Number(currentAccountID);
                            return isActive && isOwnAccount ? "nav-item nav-item-active" : "nav-item";
                        }} 
                        onClick={() => setShowNestedNav(false)}> 
                        Account 
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" 
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"} 
                        onClick={() => setShowNestedNav(false)}> 
                        Home 
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/family" 
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"}  
                        onClick={() => setShowNestedNav(false)}> 
                        Family 
                    </NavLink>
                </li>
                <li 
                    className="nav-item-container"
                    onMouseEnter={() => setShowNestedNav(true)} 
                    onMouseLeave={() => setShowNestedNav(false)}
                >
                    <NavLink 
                        to="/tree" 
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"}
                        onClick={() => setShowNestedNav(true)}
                    >
                        Tree
                    </NavLink>
                    {showNestedNav && (
                        <div className="nested-navbar">
                            <div className="nested-inner">
                                <NavLink 
                                    to="/tree/sharetree" 
                                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                >
                                    Share Tree
                                </NavLink>
                                <NavLink 
                                    to="/tree/viewsharedtrees" 
                                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                >
                                    View Shared Trees
                                </NavLink>
                            </div>
                        </div>
                    )}
                </li>
                <li>
                    <NavLink to="/chat" 
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"} 
                        onClick={() => setShowNestedNav(false)}> 
                        Chat  
                    </NavLink>
                </li>
            </ul>

            <div className="settings-and-help">
                <NavLink to="/websitesettings" >
                    <AiOutlineSetting className="settings-icon" />
                </NavLink>
                <NavLink to="/help">
                    <AiOutlineQuestion className="help-icon" />
                </NavLink>
            </div>
        </nav>
    );
};

export default NavBar;
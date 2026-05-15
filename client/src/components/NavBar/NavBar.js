import React from 'react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
    AiOutlineSetting,
    AiOutlineQuestion,
    AiOutlineHome,
    AiOutlineUser,
    AiOutlineTeam,
    AiOutlineBranches,
    AiOutlineMessage,
    AiOutlineShareAlt,
    AiOutlineEye,
} from 'react-icons/ai';
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
                        aria-label="Account"
                        title="Account"
                        className={({isActive}) => {
                            const isOwnAccount = !id || Number(id) === Number(currentAccountID);
                            return isActive && isOwnAccount ? "nav-item nav-item-active" : "nav-item";
                        }} 
                        onClick={() => setShowNestedNav(false)}> 
                        <AiOutlineUser className="nav-item-icon" aria-hidden="true" />
                        <span className="nav-item-label">Account</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/" 
                        aria-label="Home"
                        title="Home"
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"} 
                        onClick={() => setShowNestedNav(false)}> 
                        <AiOutlineHome className="nav-item-icon" aria-hidden="true" />
                        <span className="nav-item-label">Home</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/family" 
                        aria-label="Family"
                        title="Family"
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"}  
                        onClick={() => setShowNestedNav(false)}> 
                        <AiOutlineTeam className="nav-item-icon" aria-hidden="true" />
                        <span className="nav-item-label">Family</span>
                    </NavLink>
                </li>
                <li 
                    className="nav-item-container"
                    onMouseEnter={() => setShowNestedNav(true)} 
                    onMouseLeave={() => setShowNestedNav(false)}
                >
                    <NavLink 
                        to="/tree" 
                        aria-label="Tree"
                        title="Tree"
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"}
                        onClick={() => setShowNestedNav(true)}
                    >
                        <AiOutlineBranches className="nav-item-icon" aria-hidden="true" />
                        <span className="nav-item-label">Tree</span>
                    </NavLink>
                    {showNestedNav && (
                        <div className="nested-navbar">
                            <div className="nested-inner">
                                <NavLink 
                                    to="/tree/sharetree" 
                                    aria-label="Share Tree"
                                    title="Share Tree"
                                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                >
                                    <AiOutlineShareAlt className="nav-item-nested-icon" aria-hidden="true" />
                                    <span className="nav-item-nested-label">Share Tree</span>
                                </NavLink>
                                <NavLink 
                                    to="/tree/viewsharedtrees" 
                                    aria-label="View Shared Trees"
                                    title="View Shared Trees"
                                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                                >
                                    <AiOutlineEye className="nav-item-nested-icon" aria-hidden="true" />
                                    <span className="nav-item-nested-label">View Shared Trees</span>
                                </NavLink>
                            </div>
                        </div>
                    )}
                </li>
                <li>
                    <NavLink to="/chat" 
                        aria-label="Chat"
                        title="Chat"
                        className={({isActive}) => isActive ? "nav-item nav-item-active" : "nav-item"} 
                        onClick={() => setShowNestedNav(false)}> 
                        <AiOutlineMessage className="nav-item-icon" aria-hidden="true" />
                        <span className="nav-item-label">Chat</span>
                    </NavLink>
                </li>
            </ul>

            <div className="settings-and-help">
                <NavLink to="/websitesettings" aria-label="Settings" title="Settings">
                    <AiOutlineSetting className="settings-icon" />
                </NavLink>
                <NavLink to="/help" aria-label="Help" title="Help">
                    <AiOutlineQuestion className="help-icon" />
                </NavLink>
            </div>
        </nav>
    );
};

export default NavBar;
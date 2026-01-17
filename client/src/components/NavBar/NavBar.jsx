import React from 'react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { AiOutlineSetting, AiOutlineQuestion } from 'react-icons/ai'; //this is for the settings icon and help icon
import './NavBar.css';
import { useCurrentUser } from '../../CurrentUserProvider'; // import the context

//ToDO: import * as styles from './styles';
//ToDo: Add mobile version of navbar (collapsible)
//ToDo: Figure out importing of user profile image
function NavBar() {
//useState used here for showing nested nav within the tree option
    const [showNestedNav, setShowNestedNav] = useState(false);
    const { currentAccountID } = useCurrentUser(); // get the current user ID from context
    const { id } = useParams();

    return (
        <nav className="navbar" data-testid="navbar">
            <ul className="nav-options-list">
                
                <NavLink to="/account" 
                    className={({isActive}) => 
                        isActive && Number(id) === Number(currentAccountID) ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Account 
                </NavLink>
                <br></br>
                <NavLink to="/" 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Home 
                </NavLink>
                <br></br>
                <NavLink to="/family" 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"}  
                    onClick={() => setShowNestedNav(false)}> 
                    Family 
                </NavLink>
                <br></br>
                {/* <NavLink to="/tree" className="nav-item"> Tree </NavLink> */}
                <li 
    className="nav-item"
    onMouseEnter={() => setShowNestedNav(true)} 
    onMouseLeave={() => setShowNestedNav(false)}
>
    <NavLink 
        to="/tree" 
        className={({isActive}) => isActive ? "nav-item-active" : "nav-item"}
        onClick={() => setShowNestedNav(true)}
    >
        Tree
    </NavLink>
    {showNestedNav && (
        <div className="nested-navbar">
            <div>
                <NavLink 
                    to="/tree/sharetree" 
                    className={({isActive}) => isActive ? "nav-item-nested-active" : "nav-item-nested"} 
                >
                    Share Tree
                </NavLink>
                <br />
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
                <br/>
                <NavLink to="/chat" 
                    className={({isActive}) => isActive ? "nav-item-active" : "nav-item"} 
                    onClick={() => setShowNestedNav(false)}> 
                    Chat  
                </NavLink>

                <div className="settings-and-help">
                    <NavLink to="/websitesettings" >
                        <AiOutlineSetting className="settings-icon"></AiOutlineSetting>
                    </NavLink>
                    <NavLink to="/help">
                        <AiOutlineQuestion className="help-icon"></AiOutlineQuestion>
                    </NavLink>
                </div>
                
            </ul>

        </nav>
    );
};

export default NavBar;
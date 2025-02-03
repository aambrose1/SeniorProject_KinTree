import React from 'react';
import { NavLink } from 'react-router-dom';
import * as styles from './styles';

function NavBar() {
    return (
        <nav style={styles.DefaultStyle}>
            <ul>
                <li>
                    <NavLink to="/" exact className="nav-item"> Home </NavLink>
                </li>
                <li>
                    <NavLink to="/family" className="nav-item"> Family </NavLink>
                </li>
                <li>
                    <NavLink to="/tree" className="nav-item"> Tree </NavLink>
                </li>
                
            </ul>
        </nav>
    );
};

export default NavBar;
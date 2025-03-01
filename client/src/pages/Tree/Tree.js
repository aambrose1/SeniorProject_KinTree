import React from 'react';
import * as styles from './styles';
import { Outlet } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';
//ToDo: Add Outlet tag for directing output for child routes

function Tree() {
    return (
        <>
        <NavBar />
        <div style={styles.DefaultStyle}>
            <Outlet />
            Trees here brethren.
        </div>
        </>
    )
}

export default Tree;
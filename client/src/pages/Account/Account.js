import React from 'react';
import * as styles from './styles';
import { Link, useParams } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';

function Account() {
    // takes id from url path
    const { id } = useParams();
    // then retrieve user info/logged in user's permission levels using API
    return (
        <div style={styles.DefaultStyle}>
            <NavBar />
            <Link to="/tree" >Back to Tree</Link>
        </div>
    )
}

export default Account;
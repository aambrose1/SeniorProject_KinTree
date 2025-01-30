import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';

// TODO: need to implement auth check for this page (and others), redirect to login if not authenticated
function Home() {
    return (
        <div style={styles.DefaultStyle}>
            <Link to="/tree" >View Tree Page</Link>
        </div>
    )
}

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './styles';

function Home() {
    return (
        <div style={styles.DefaultStyle}>
            <Link to="/tree" >Tree</Link>
        </div>
    )
}

export default Home;